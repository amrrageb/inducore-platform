import { z } from 'zod';
import { AssistantMode } from '@inducore/core-domain';

export const ChatRequestSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, 'Message content is required.'),
  mode: z.enum([
    'general_chat',
    'procurement_advisor',
    'rfq_writer',
    'supplier_matcher',
    'product_search',
    'document_qa',
    'knowledge_indexer',
  ]).default('general_chat'),
  promptTemplateId: z.string().optional(),
  includeGrounding: z.boolean().default(true),
});

export type ChatRequestDTO = z.infer<typeof ChatRequestSchema>;

export const RFQDraftRequestSchema = z.object({
  title: z.string().min(1, 'RFQ Title is required'),
  category: z.string().min(1, 'Category is required'),
  targetMaterial: z.string().min(1, 'Material or Item specification is required'),
  estimatedQuantity: z.number().positive('Quantity must be positive'),
  unitOfMeasure: z.string().default('PCS'),
  requiredDeliveryDate: z.string().min(1, 'Delivery date is required'),
  targetPlantLocation: z.string().default('Plant DE-01'),
  complianceStandards: z.array(z.string()).default(['ISO 9001:2015']),
  additionalNotes: z.string().optional(),
});

export type RFQDraftRequestDTO = z.infer<typeof RFQDraftRequestSchema>;

export const SupplierRecommendRequestSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  requiredCertifications: z.array(z.string()).default([]),
  minPerformanceScore: z.number().min(0).max(100).default(70),
  preferredRegion: z.string().optional(),
  maxLeadTimeDays: z.number().optional(),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

export type SupplierRecommendRequestDTO = z.infer<typeof SupplierRecommendRequestSchema>;

export const SemanticSearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  categories: z.array(z.string()).optional(),
  topK: z.number().min(1).max(20).default(5),
});

export type SemanticSearchRequestDTO = z.infer<typeof SemanticSearchRequestSchema>;

export const DocumentQARequestSchema = z.object({
  documentId: z.string().optional(),
  question: z.string().min(1, 'Question is required'),
  category: z.string().optional(),
});

export type DocumentQARequestDTO = z.infer<typeof DocumentQARequestSchema>;

export const KnowledgeIndexRequestSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  category: z.enum([
    'technical_spec',
    'sds_sheet',
    'iso_standard',
    'supplier_profile',
    'contract_terms',
    'mro_catalogue',
  ] as const),
  content: z.string().min(10, 'Document content must be at least 10 characters'),
  sourceUrlOrName: z.string().default('manual_upload'),
  tags: z.array(z.string()).default([]),
});

export type KnowledgeIndexRequestDTO = z.infer<typeof KnowledgeIndexRequestSchema>;

export interface PromptTemplateDTO {
  id: string;
  title: string;
  category: 'Procurement' | 'RFQ' | 'Supplier' | 'Material' | 'Compliance';
  description: string;
  prompt: string;
  targetMode: AssistantMode;
}
