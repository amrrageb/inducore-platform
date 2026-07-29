import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  FileText,
  Building2,
  Search,
  Database,
  BookOpen,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface GroundingCitation {
  sourceTitle: string;
  sourceType: 'doc' | 'supplier' | 'product' | 'rfq' | 'contract';
  snippet: string;
  confidenceScore: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: string;
  citations?: GroundingCitation[];
  tokensUsed?: number;
}

interface AssistantSession {
  id: string;
  tenantId: string;
  title: string;
  mode: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  targetMode: string;
}

interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  country: string;
  city: string;
  performanceScore: number;
  auditGrade: string;
  certifications: string[];
  onTimeDeliveryRate: number;
  defectPpm: number;
  riskTier: string;
  matchScore: number;
  aiRecommendationReason: string;
}

interface KnowledgeChunk {
  chunkId: string;
  documentId: string;
  title: string;
  category: string;
  sourceUrlOrName: string;
  content: string;
  tags: string[];
  tokenCount: number;
}

export const IndustrialAIAssistantView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'rfq_writer' | 'supplier_recommend' | 'semantic_search' | 'document_qa' | 'templates' | 'knowledge'
  >('chat');

  // Chat State
  const [sessions, setSessions] = useState<AssistantSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState<string>('procurement_advisor');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // RFQ Writer State
  const [rfqTitle, setRfqTitle] = useState('Ti-6Al-4V Grade 5 Titanium Fasteners');
  const [rfqCategory, setRfqCategory] = useState('RAW_METALS');
  const [rfqMaterial, setRfqMaterial] = useState('Ti-6Al-4V Grade 5 Aerospace Titanium Sheet');
  const [rfqQty, setRfqQty] = useState<number>(2500);
  const [rfqUom, setRfqUom] = useState('PCS');
  const [rfqDelivery, setRfqDelivery] = useState('2026-09-15');
  const [rfqPlant, setRfqPlant] = useState('Plant DE-01 (Stuttgart)');
  const [rfqStandards, setRfqStandards] = useState('ISO 9001:2015, AS9100D, AMS 4911');
  const [rfqNotes, setRfqNotes] = useState('Require EN 10204 3.1 chemical & mechanical mill test certificates.');
  const [rfqOutput, setRfqOutput] = useState<string | null>(null);
  const [isGeneratingRfq, setIsGeneratingRfq] = useState(false);

  // Supplier Recommendation State
  const [suppCategory, setSuppCategory] = useState('Fasteners & Hardware');
  const [minScore, setMinScore] = useState<number>(80);
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [recommendations, setRecommendations] = useState<SupplierRecommendation[]>([]);
  const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);

  // Semantic Search State
  const [searchQuery, setSearchQuery] = useState('high pressure hydraulic pump 350 bar ISO 4401');
  const [searchResults, setSearchResults] = useState<GroundingCitation[]>([]);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);

  // Document Q&A State
  const [qaQuestion, setQaQuestion] = useState('What are the payment terms and late delivery penalties under standard SLA clauses?');
  const [qaAnswer, setQaAnswer] = useState<{ answer: string; citations: GroundingCitation[] } | null>(null);
  const [isAnsweringQa, setIsAnsweringQa] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);

  // Knowledge Indexing State
  const [knowledgeStats, setKnowledgeStats] = useState<{
    totalDocuments: number;
    totalChunks: number;
    totalTokensIndexed: number;
    categories: string[];
  } | null>(null);
  const [knowledgeChunks, setKnowledgeChunks] = useState<KnowledgeChunk[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'technical_spec' | 'sds_sheet' | 'iso_standard' | 'supplier_profile' | 'contract_terms' | 'mro_catalogue'>('technical_spec');
  const [newDocContent, setNewDocContent] = useState('');
  const [isIndexingDoc, setIsIndexingDoc] = useState(false);
  const [indexingSuccessMsg, setIndexingSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchTemplates();
    fetchKnowledge();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/v1/assistant/sessions');
      const data = await res.json();
      if (data.status === 'success') {
        setSessions(data.data);
        if (data.data.length > 0 && !activeSessionId) {
          setActiveSessionId(data.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/v1/assistant/templates');
      const data = await res.json();
      if (data.status === 'success') {
        setTemplates(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch templates:', e);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const res = await fetch('/v1/assistant/knowledge');
      const data = await res.json();
      if (data.status === 'success') {
        setKnowledgeStats(data.data.stats);
        setKnowledgeChunks(data.data.chunks);
      }
    } catch (e) {
      console.error('Failed to fetch knowledge:', e);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      const res = await fetch('/v1/assistant/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Conversation',
          mode: chatMode,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSessions([data.data, ...sessions]);
        setActiveSessionId(data.data.id);
      }
    } catch (e) {
      console.error('Failed to create session:', e);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || chatInput;
    if (!promptToSend.trim() || isLoadingChat) return;

    setIsLoadingChat(true);
    setChatInput('');

    try {
      const res = await fetch('/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId || undefined,
          message: promptToSend,
          mode: chatMode,
          includeGrounding: true,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        if (data.data.sessionId) {
          setActiveSessionId(data.data.sessionId);
        }
        await fetchSessions();
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleGenerateRfq = async () => {
    setIsGeneratingRfq(true);
    try {
      const res = await fetch('/v1/assistant/rfq-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rfqTitle,
          category: rfqCategory,
          targetMaterial: rfqMaterial,
          estimatedQuantity: rfqQty,
          unitOfMeasure: rfqUom,
          requiredDeliveryDate: rfqDelivery,
          targetPlantLocation: rfqPlant,
          complianceStandards: rfqStandards.split(',').map(s => s.trim()),
          additionalNotes: rfqNotes,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRfqOutput(data.data.rfqDocumentText);
      }
    } catch (e) {
      console.error('Failed to generate RFQ:', e);
    } finally {
      setIsGeneratingRfq(false);
    }
  };

  const handleSearchSuppliers = async () => {
    setIsSearchingSuppliers(true);
    try {
      const res = await fetch('/v1/assistant/supplier-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: suppCategory,
          minPerformanceScore: minScore,
          urgencyLevel: urgency,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRecommendations(data.data.recommendations);
      }
    } catch (e) {
      console.error('Failed to get supplier recommendations:', e);
    } finally {
      setIsSearchingSuppliers(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingSemantic(true);
    try {
      const res = await fetch('/v1/assistant/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          topK: 6,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSearchResults(data.data.results);
      }
    } catch (e) {
      console.error('Failed semantic search:', e);
    } finally {
      setIsSearchingSemantic(false);
    }
  };

  const handleDocumentQA = async () => {
    if (!qaQuestion.trim()) return;
    setIsAnsweringQa(true);
    try {
      const res = await fetch('/v1/assistant/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qaQuestion,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setQaAnswer({
          answer: data.data.answer,
          citations: data.data.citations,
        });
      }
    } catch (e) {
      console.error('Failed Document Q&A:', e);
    } finally {
      setIsAnsweringQa(false);
    }
  };

  const handleIndexDocument = async () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    setIsIndexingDoc(true);
    setIndexingSuccessMsg(null);
    try {
      const res = await fetch('/v1/assistant/knowledge/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle,
          category: newDocCategory,
          content: newDocContent,
          sourceUrlOrName: 'custom_upload.pdf',
          tags: ['custom', 'user_indexed', newDocCategory],
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIndexingSuccessMsg(`Document "${newDocTitle}" successfully indexed!`);
        setNewDocTitle('');
        setNewDocContent('');
        await fetchKnowledge();
      }
    } catch (e) {
      console.error('Failed to index document:', e);
    } finally {
      setIsIndexingDoc(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Industrial AI Assistant</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Gemini RAG Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Enterprise Industrial Intelligence • RFQ Engineering • Supplier Matching • Document Grounding & Vector Search
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateNewSession}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-t border-indigo-900/50 pt-4 overflow-x-auto">
          {[
            { id: 'chat', label: 'AI Chat Advisor', icon: Bot },
            { id: 'rfq_writer', label: 'RFQ Writing Assistant', icon: FileText },
            { id: 'supplier_recommend', label: 'Supplier Matcher', icon: Building2 },
            { id: 'semantic_search', label: 'Semantic Search', icon: Search },
            { id: 'document_qa', label: 'Document Q&A', icon: BookOpen },
            { id: 'templates', label: 'Prompt Library', icon: Zap },
            { id: 'knowledge', label: 'Knowledge Base & RAG', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AI Chat & Procurement Assistant */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* History Sidebar */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col h-[650px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Chat History</span>
              </span>
              <button
                onClick={handleCreateNewSession}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                title="Create New Session"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
              {sessions.map(s => {
                const isSel = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`p-3 rounded-xl cursor-pointer text-xs transition-all border ${
                      isSel
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="font-medium truncate">{s.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span className="capitalize">{s.mode.replace('_', ' ')}</span>
                      <span>{s.messages.length} msgs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Header / Mode Picker */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{activeSession?.title || 'Industrial Chat'}</h2>
                  <p className="text-[11px] text-slate-500">Mode: {chatMode.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={chatMode}
                  onChange={e => setChatMode(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="procurement_advisor">Procurement Advisor</option>
                  <option value="rfq_writer">RFQ Writer Mode</option>
                  <option value="supplier_matcher">Supplier Matcher</option>
                  <option value="product_search">Product & MRO Search</option>
                  <option value="document_qa">Document Q&A</option>
                  <option value="general_chat">General Industrial AI</option>
                </select>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(!activeSession || activeSession.messages.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Sparkles className="w-10 h-10 text-indigo-400/40 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-700">Ask InduCore Industrial AI</h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Ask questions regarding RFQ drafting, supplier evaluations, ISO 9001 compliance, alloy specifications, or MRO equipment.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-left max-w-lg">
                    {[
                      'What are the ASTM specs for Ti-6Al-4V Grade 5?',
                      'Draft an RFQ for 500 hydraulic valves.',
                      'Recommend top audited supplier for structural fasteners.',
                      'What is Clause 8.4 in ISO 9001 quality standards?',
                    ].map((promptText, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(promptText)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-600 text-left transition"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSession?.messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isUser ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-indigo-300'
                      }`}
                    >
                      {isUser ? <span className="text-xs font-bold">U</span> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 ${
                      isUser
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                      {/* Grounding Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                          <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider block">
                            Grounding Citations ({msg.citations.length})
                          </span>
                          <div className="space-y-1">
                            {msg.citations.map((cite, cIdx) => (
                              <div
                                key={cIdx}
                                className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 shadow-2xs"
                              >
                                <div className="font-semibold text-slate-900 flex items-center justify-between">
                                  <span>{cite.sourceTitle}</span>
                                  <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">
                                    {Math.round(cite.confidenceScore * 100)}% Match
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{cite.snippet}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`flex items-center justify-between text-[10px] ${isUser ? 'text-indigo-200' : 'text-slate-400'} pt-1`}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!isUser && (
                          <button
                            onClick={() => handleCopyText(msg.content, msg.id)}
                            className="hover:text-slate-600 flex items-center space-x-1"
                          >
                            {copiedIndex === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedIndex === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoadingChat && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-indigo-300 flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    <span>Analyzing RAG knowledge base & generating response...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask Industrial AI regarding specs, RFQs, suppliers, or SLA terms..."
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isLoadingChat}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium shadow transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RFQ Writing Assistant */}
      {activeTab === 'rfq_writer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">RFQ Specification Generator</h2>
                <p className="text-xs text-slate-500">Draft ISO-compliant industrial tender specifications</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">RFQ Document Title</label>
                <input
                  type="text"
                  value={rfqTitle}
                  onChange={e => setRfqTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={rfqCategory}
                    onChange={e => setRfqCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="RAW_METALS">Raw Metals & Alloys</option>
                    <option value="FASTENERS">Fasteners & Hardware</option>
                    <option value="HYDRAULICS">Hydraulics & Valves</option>
                    <option value="ELECTRONICS">Avionics & Sensors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Delivery Date</label>
                  <input
                    type="date"
                    value={rfqDelivery}
                    onChange={e => setRfqDelivery(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Plant Location</label>
                <input
                  type="text"
                  value={rfqPlant}
                  onChange={e => setRfqPlant(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Material Specification</label>
                <input
                  type="text"
                  value={rfqMaterial}
                  onChange={e => setRfqMaterial(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Required Quantity</label>
                  <input
                    type="number"
                    value={rfqQty}
                    onChange={e => setRfqQty(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={rfqUom}
                    onChange={e => setRfqUom(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Required Standards & Certifications</label>
                <input
                  type="text"
                  value={rfqStandards}
                  onChange={e => setRfqStandards(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Additional Requirements</label>
                <textarea
                  rows={3}
                  value={rfqNotes}
                  onChange={e => setRfqNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleGenerateRfq}
                disabled={isGeneratingRfq}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow transition flex items-center justify-center space-x-2"
              >
                {isGeneratingRfq ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingRfq ? 'Generating RFQ Specification...' : 'Generate RFQ Document'}</span>
              </button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[650px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Generated RFQ Output</span>
              {rfqOutput && (
                <button
                  onClick={() => handleCopyText(rfqOutput, 'rfq-out')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1"
                >
                  {copiedIndex === 'rfq-out' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'rfq-out' ? 'Copied' : 'Copy Spec'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {rfqOutput || (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                  <FileText className="w-12 h-12 text-slate-300 mb-2" />
                  <p>Fill out parameters and click "Generate RFQ Document"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Supplier Recommendation */}
      {activeTab === 'supplier_recommend' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>AI Supplier Matcher & Risk Evaluator</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Product Category</label>
                <input
                  type="text"
                  value={suppCategory}
                  onChange={e => setSuppCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Min Performance Score</label>
                <input
                  type="number"
                  value={minScore}
                  onChange={e => setMinScore(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearchSuppliers}
                  disabled={isSearchingSuppliers}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow transition flex items-center justify-center space-x-2"
                >
                  {isSearchingSuppliers ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Match Suppliers</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map(supp => (
              <div key={supp.supplierId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-300 transition space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{supp.supplierName}</h3>
                    <p className="text-xs text-slate-500">{supp.city}, {supp.country}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {Math.round(supp.matchScore * 100)}% Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">Performance</span>
                    <span className="font-bold text-slate-800">{supp.performanceScore}/100</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Audit Grade</span>
                    <span className="font-bold text-slate-800">{supp.auditGrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">On-Time Delivery</span>
                    <span className="font-bold text-slate-800">{supp.onTimeDeliveryRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Defect Rate</span>
                    <span className="font-bold text-slate-800">{supp.defectPpm} PPM</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <span className="font-semibold text-indigo-900 block mb-1">AI Recommendation Rationale:</span>
                  <p>{supp.aiRecommendationReason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Semantic Search */}
      {activeTab === 'semantic_search' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-sm font-bold text-slate-900 text-center">Vector & Semantic Search Engine</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search across product catalogues, SDS sheets, contracts..."
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleSemanticSearch}
                disabled={isSearchingSemantic}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
              >
                Search
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {searchResults.map((res, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{res.sourceTitle}</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {Math.round(res.confidenceScore * 100)}% Similarity
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{res.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Document Q&A */}
      {activeTab === 'document_qa' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Document Question & Answering (RAG)</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={qaQuestion}
                onChange={e => setQaQuestion(e.target.value)}
                placeholder="Ask any technical or SLA question..."
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleDocumentQA}
                disabled={isAnsweringQa}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
              >
                Answer Question
              </button>
            </div>
          </div>

          {qaAnswer && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-xs">AI Grounded Response:</h3>
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{qaAnswer.answer}</div>

              <div className="border-t border-slate-200 pt-3">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-2">Citations:</span>
                <div className="space-y-2">
                  {qaAnswer.citations.map((c, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900">{c.sourceTitle}</div>
                      <p className="text-slate-600 text-[11px] mt-1">{c.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Prompt Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded-full">
                  {tmpl.category}
                </span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs">{tmpl.title}</h3>
              <p className="text-xs text-slate-500">{tmpl.description}</p>
              <button
                onClick={() => {
                  setChatMode(tmpl.targetMode);
                  setActiveTab('chat');
                  handleSendMessage(tmpl.prompt);
                }}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
              >
                <span>Execute Template</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: Knowledge Base & RAG Indexing */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block">Indexed Documents</span>
              <span className="text-xl font-bold text-slate-900">{knowledgeStats?.totalDocuments || 0}</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block">Vector Chunks</span>
              <span className="text-xl font-bold text-slate-900">{knowledgeStats?.totalChunks || 0}</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block">Total Tokens</span>
              <span className="text-xl font-bold text-slate-900">{knowledgeStats?.totalTokensIndexed.toLocaleString() || 0}</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block">Index Status</span>
              <span className="text-sm font-bold text-emerald-600 flex items-center space-x-1 mt-1">
                <Check className="w-4 h-4" />
                <span>ONLINE & INDEXED</span>
              </span>
            </div>
          </div>

          {/* Index New Document Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Index New Technical Document into RAG Vector Store</h2>
            {indexingSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                {indexingSuccessMsg}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Document Title</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Pump Maintenance Specs ISO 4401"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Category</label>
                <select
                  value={newDocCategory}
                  onChange={e => setNewDocCategory(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="technical_spec">Technical Spec</option>
                  <option value="sds_sheet">Safety Data Sheet (SDS)</option>
                  <option value="iso_standard">ISO Standard</option>
                  <option value="supplier_profile">Supplier Profile</option>
                  <option value="contract_terms">Contract Terms</option>
                  <option value="mro_catalogue">MRO Catalogue</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-medium mb-1">Document Content</label>
              <textarea
                rows={4}
                value={newDocContent}
                onChange={e => setNewDocContent(e.target.value)}
                placeholder="Paste document text..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>
            <button
              onClick={handleIndexDocument}
              disabled={isIndexingDoc || !newDocTitle.trim() || !newDocContent.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow flex items-center space-x-2"
            >
              {isIndexingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>{isIndexingDoc ? 'Indexing Document...' : 'Index Document into RAG Store'}</span>
            </button>
          </div>

          {/* Indexed Chunks Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Indexed Knowledge Vector Chunks ({knowledgeChunks.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-800 font-bold">
                    <th className="p-3">Chunk ID</th>
                    <th className="p-3">Document Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Tokens</th>
                    <th className="p-3">Content Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {knowledgeChunks.map(chk => (
                    <tr key={chk.chunkId} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[10px] text-indigo-700">{chk.chunkId}</td>
                      <td className="p-3 font-semibold text-slate-900">{chk.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-medium capitalize">
                          {chk.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">{chk.tokenCount}</td>
                      <td className="p-3 text-[11px] text-slate-500 max-w-md truncate">{chk.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
