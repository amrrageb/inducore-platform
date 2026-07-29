import { Router, Request, Response } from 'express';
import {
  ChatRequestSchema,
  RFQDraftRequestSchema,
  SupplierRecommendRequestSchema,
  SemanticSearchRequestSchema,
  DocumentQARequestSchema,
  KnowledgeIndexRequestSchema,
  PromptTemplateDTO,
} from '@inducore/application';
import {
  InMemoryKnowledgeVectorStore,
  GeminiAssistantService,
  AssistantSessionRepository,
} from '@inducore/infrastructure';
import { AIAssistantSessionAggregate } from '@inducore/core-domain';

const router = Router();
const vectorStore = new InMemoryKnowledgeVectorStore();
const assistantService = new GeminiAssistantService(vectorStore);
const sessionRepo = new AssistantSessionRepository();

// Built-in industrial prompt templates
const PROMPT_TEMPLATES: PromptTemplateDTO[] = [
  {
    id: 'tmpl-1',
    title: 'Draft Aerospace Fastener RFQ',
    category: 'RFQ',
    description: 'Generate complete RFQ for Ti-6Al-4V Grade 5 fasteners with AMS 4911 certification requirements.',
    prompt: 'Draft an RFQ for 2,500 units of Ti-6Al-4V Grade 5 aerospace structural fasteners with AMS 4911 standards and Net 60 payment terms.',
    targetMode: 'rfq_writer',
  },
  {
    id: 'tmpl-2',
    title: 'Evaluate Class A Supplier Audit',
    category: 'Supplier',
    description: 'Assess supplier audit credentials, OTD rate, defect PPM, and ISO 9001 compliance.',
    prompt: 'Evaluate Rheinmetall Industrial Fasteners GmbH based on recent audit score, defect rate (12 PPM), and ISO 9001 certification.',
    targetMode: 'supplier_matcher',
  },
  {
    id: 'tmpl-3',
    title: 'Hydraulic Pump Specification Search',
    category: 'Material',
    description: 'Search catalogue for 350 bar rated hydraulic piston pumps compatible with ISO 4401 flange.',
    prompt: 'Find high-pressure hydraulic pumps rated for 350 bar with ISO 4401 flange and 14 day lead time.',
    targetMode: 'product_search',
  },
  {
    id: 'tmpl-4',
    title: 'ISO 9001 Clause 8.4 Compliance Check',
    category: 'Compliance',
    description: 'Check procurement terms against ISO 9001 Clause 8.4 supplier evaluation guidelines.',
    prompt: 'How do our standard SLA clauses and liquidated damages align with ISO 9001 Clause 8.4 external provider control requirements?',
    targetMode: 'document_qa',
  },
  {
    id: 'tmpl-5',
    title: 'TCO & Payment Term Negotiation Strategy',
    category: 'Procurement',
    description: 'Formulate negotiation tactics for shifting vendor terms from Net 30 to Net 60 days.',
    prompt: 'Formulate a negotiation strategy for transitioning our primary steel supplier from Net 30 to Net 60 days without incurring price surcharges.',
    targetMode: 'procurement_advisor',
  },
];

// GET /v1/assistant/templates
router.get('/templates', (_req: Request, res: Response) => {
  return res.json({ status: 'success', data: PROMPT_TEMPLATES });
});

// GET /v1/assistant/sessions
router.get('/sessions', async (_req: Request, res: Response) => {
  const tenantId = (_req as any).tenantId || 'TENANT-001';
  const sessions = await sessionRepo.getAll(tenantId);
  return res.json({
    status: 'success',
    data: sessions.map(s => s.props),
  });
});

// POST /v1/assistant/sessions
router.post('/sessions', async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || 'TENANT-001';
  const { title = 'New Conversation', mode = 'general_chat' } = req.body;
  const result = AIAssistantSessionAggregate.create({
    tenantId,
    title,
    mode,
  });

  if (result.isFailure) {
    return res.status(400).json({ error: result.errorValue() });
  }

  const session = result.getValue();
  await sessionRepo.save(session);
  return res.json({ status: 'success', data: session.props });
});

// GET /v1/assistant/sessions/:id
router.get('/sessions/:id', async (req: Request, res: Response) => {
  const session = await sessionRepo.getById(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return res.json({ status: 'success', data: session.props });
});

// DELETE /v1/assistant/sessions/:id
router.delete('/sessions/:id', async (req: Request, res: Response) => {
  const success = await sessionRepo.delete(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return res.json({ status: 'success', message: 'Session archived successfully' });
});

// POST /v1/assistant/chat
router.post('/chat', async (req: Request, res: Response) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { sessionId, message, mode, includeGrounding } = parsed.data;
  const tenantId = (req as any).tenantId || 'TENANT-001';

  let session: AIAssistantSessionAggregate | null = null;
  if (sessionId) {
    session = await sessionRepo.getById(sessionId);
  }

  if (!session) {
    const sessionRes = AIAssistantSessionAggregate.create({
      tenantId,
      title: message.slice(0, 35) + '...',
      mode,
    });
    if (sessionRes.isSuccess) {
      session = sessionRes.getValue();
    }
  }

  if (session) {
    session.addMessage({ role: 'user', content: message, mode });
  }

  const history = session
    ? session.props.messages.map(m => ({ role: m.role, content: m.content }))
    : [];

  const { responseText, citations, tokensUsed } = await assistantService.generateChatResponse(
    message,
    mode,
    history,
    includeGrounding
  );

  if (session) {
    session.addMessage({
      role: 'assistant',
      content: responseText,
      mode,
      citations,
      tokensUsed,
    });
    await sessionRepo.save(session);
  }

  return res.json({
    status: 'success',
    data: {
      sessionId: session?.id,
      response: responseText,
      citations,
      tokensUsed,
      session: session?.props,
    },
  });
});

// POST /v1/assistant/rfq-writer
router.post('/rfq-writer', async (req: Request, res: Response) => {
  const parsed = RFQDraftRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const result = await assistantService.generateRFQSpecification(parsed.data);
  return res.json({
    status: 'success',
    data: result,
  });
});

// POST /v1/assistant/supplier-recommendations
router.post('/supplier-recommendations', async (req: Request, res: Response) => {
  const parsed = SupplierRecommendRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { category, minPerformanceScore, requiredCertifications, urgencyLevel } = parsed.data;

  // Search Knowledge Vector Store for matching supplier profiles
  const searchTerms = `supplier ${category} ${requiredCertifications.join(' ')} ${urgencyLevel}`;
  const citations = vectorStore.search(searchTerms, 5, 'supplier_profile');

  const recommendations = [
    {
      supplierId: 'SUPP-001',
      supplierName: 'Rheinmetall Industrial Fasteners GmbH',
      country: 'Germany',
      city: 'Düsseldorf',
      performanceScore: 94.5,
      auditGrade: 'Class A (Certified)',
      certifications: ['ISO 9001:2015', 'IATF 16949', 'AS9100D'],
      onTimeDeliveryRate: 98.4,
      defectPpm: 12,
      riskTier: 'LOW',
      matchScore: 0.96,
      aiRecommendationReason:
        'Highest quality audit score (94/100) and strict AS9100D compliance for critical aerospace structural fasteners.',
    },
    {
      supplierId: 'SUPP-002',
      supplierName: 'Nordic Metalworks AB',
      country: 'Sweden',
      city: 'Gothenburg',
      performanceScore: 89.2,
      auditGrade: 'Class A',
      certifications: ['ISO 9001:2015', 'ISO 14001'],
      onTimeDeliveryRate: 96.1,
      defectPpm: 24,
      riskTier: 'LOW',
      matchScore: 0.88,
      aiRecommendationReason:
        'Excellent lead time responsiveness and specialized vacuum arc remelting for titanium alloys.',
    },
    {
      supplierId: 'SUPP-003',
      supplierName: 'Boschert Precision Hydraulics B.V.',
      country: 'Netherlands',
      city: 'Rotterdam',
      performanceScore: 84.0,
      auditGrade: 'Class B+',
      certifications: ['ISO 9001:2015'],
      onTimeDeliveryRate: 94.0,
      defectPpm: 45,
      riskTier: 'MEDIUM',
      matchScore: 0.81,
      aiRecommendationReason:
        'Specialized in 350+ bar high-pressure hydraulic pumps with ISO 4401 mounting standards.',
    },
  ].filter(s => s.performanceScore >= minPerformanceScore);

  return res.json({
    status: 'success',
    data: {
      queryCriteria: parsed.data,
      totalMatches: recommendations.length,
      recommendations,
      groundingCitations: citations,
    },
  });
});

// POST /v1/assistant/semantic-search
router.post('/semantic-search', async (req: Request, res: Response) => {
  const parsed = SemanticSearchRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { query, topK, categories } = parsed.data;
  const categoryFilter = categories && categories.length > 0 ? categories[0] : undefined;
  const results = vectorStore.search(query, topK, categoryFilter);

  return res.json({
    status: 'success',
    data: {
      query,
      resultsCount: results.length,
      results,
    },
  });
});

// POST /v1/assistant/document-qa
router.post('/document-qa', async (req: Request, res: Response) => {
  const parsed = DocumentQARequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { question } = parsed.data;
  const { responseText, citations, tokensUsed } = await assistantService.generateChatResponse(
    question,
    'document_qa',
    [],
    true
  );

  return res.json({
    status: 'success',
    data: {
      question,
      answer: responseText,
      citations,
      tokensUsed,
    },
  });
});

// GET /v1/assistant/knowledge
router.get('/knowledge', (_req: Request, res: Response) => {
  const stats = vectorStore.getStats();
  const chunks = vectorStore.getAllChunks();
  return res.json({
    status: 'success',
    data: {
      stats,
      chunks,
    },
  });
});

// POST /v1/assistant/knowledge/index
router.post('/knowledge/index', async (req: Request, res: Response) => {
  const parsed = KnowledgeIndexRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { title, category, content, sourceUrlOrName, tags } = parsed.data;
  const docId = `DOC-USER-${Date.now().toString().slice(-6)}`;

  vectorStore.indexDocument({
    id: docId,
    title,
    category,
    source: sourceUrlOrName,
    content,
    tags,
  });

  return res.json({
    status: 'success',
    message: `Document "${title}" successfully indexed into RAG Vector Store`,
    data: {
      documentId: docId,
      stats: vectorStore.getStats(),
    },
  });
});

export default router;
