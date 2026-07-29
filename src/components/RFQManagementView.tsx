import React, { useState, useEffect } from 'react';
import { Button, Badge } from '@inducore/ui-kit';
import {
  Plus,
  Sparkles,
  FileText,
  Clock,
  Lock,
  Globe,
  Paperclip,
  HelpCircle,
  History,
  Users,
  CheckCircle2,
  RotateCw,
  Search,
  Eye,
  Trash2,
  X,
  FileCheck,
} from 'lucide-react';

export interface RFQAttachment {
  id: string;
  name: string;
  url: string;
  sizeKb: number;
  uploadedAt: string;
}

export interface RFQClarification {
  id: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer?: string;
  answeredAt?: string;
}

export interface RFQRevision {
  version: number;
  title: string;
  description: string;
  deadline: string;
  revisedAt: string;
  revisionNotes: string;
}

export interface RFQLineItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
}

export interface RFQItem {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'EVALUATING' | 'CLOSED' | 'CANCELLED' | 'AWARDED';
  visibility: 'PUBLIC' | 'PRIVATE';
  invitedSupplierIds: string[];
  deadline: string;
  attachments: RFQAttachment[];
  clarifications: RFQClarification[];
  revisions: RFQRevision[];
  version: number;
  lineItems: RFQLineItem[];
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RFQManagementViewProps {
  onOpenAIEvaluation: (rfqId: string) => void;
}

export const RFQManagementView: React.FC<RFQManagementViewProps> = ({ onOpenAIEvaluation }) => {
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRfq, setSelectedRfq] = useState<RFQItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED'>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    lineItems: [{ name: 'High Pressure Valve Cartridge', quantity: 4, unit: 'units', targetPrice: 1200 }],
    invitedSupplierIds: [] as string[],
  });

  // Clarification / Q&A Form
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringMap, setAnsweringMap] = useState<{ [key: string]: string }>({});

  // Revision / Deadline Extension Form
  const [revisionForm, setRevisionForm] = useState({
    title: '',
    description: '',
    deadline: '',
    revisionNotes: '',
  });

  // Invite Form
  const [inviteInput, setInviteInput] = useState('');

  // Attachment upload mock state
  const [newAttachmentName, setNewAttachmentName] = useState('');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/v1/rfqs');
      const data = await res.json();
      if (data.success) {
        setRfqs(data.data);
        if (selectedRfq) {
          const updated = data.data.find((r: RFQItem) => r.id === selectedRfq.id);
          if (updated) setSelectedRfq(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch RFQs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          deadline: new Date(createForm.deadline).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Draft RFQ "${createForm.title}" created successfully`);
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          visibility: 'PUBLIC',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          lineItems: [{ name: '', quantity: 1, unit: 'units' }],
          invitedSupplierIds: [],
        });
        fetchRFQs();
      } else {
        alert(data.error || 'Failed to create RFQ');
      }
    } catch (err) {
      console.error('Error creating RFQ', err);
    }
  };

  const handlePublishRfq = async (id: string) => {
    try {
      const res = await fetch(`/v1/rfqs/${id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('RFQ published to supplier market');
        fetchRFQs();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error publishing RFQ', err);
    }
  };

  const handleCloseRfq = async (id: string) => {
    try {
      const res = await fetch(`/v1/rfqs/${id}/close`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('RFQ closed to new bids');
        fetchRFQs();
      }
    } catch (err) {
      console.error('Error closing RFQ', err);
    }
  };

  const handleAddAttachment = async (rfqId: string) => {
    if (!newAttachmentName) return;
    try {
      const res = await fetch(`/v1/rfqs/${rfqId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAttachmentName.endsWith('.pdf') ? newAttachmentName : `${newAttachmentName}.pdf`,
          url: `/docs/${newAttachmentName}`,
          sizeKb: Math.floor(500 + Math.random() * 2000),
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Attachment "${newAttachmentName}" uploaded`);
        setNewAttachmentName('');
        fetchRFQs();
      }
    } catch (err) {
      console.error('Error adding attachment', err);
    }
  };

  const handleRemoveAttachment = async (rfqId: string, attId: string) => {
    try {
      const res = await fetch(`/v1/rfqs/${rfqId}/attachments/${attId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Attachment removed');
        fetchRFQs();
      }
    } catch (err) {
      console.error('Error removing attachment', err);
    }
  };

  const handleAskClarification = async (rfqId: string) => {
    if (!newQuestion) return;
    try {
      const res = await fetch(`/v1/rfqs/${rfqId}/clarifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          askedBy: 'Apex Senior Procurement Officer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify('Clarification question submitted');
        setNewQuestion('');
        fetchRFQs();
      }
    } catch (err) {
      console.error('Error asking clarification', err);
    }
  };

  const handleAnswerClarification = async (rfqId: string, clarificationId: string) => {
    const answer = answeringMap[clarificationId];
    if (!answer) return;
    try {
      const res = await fetch(`/v1/rfqs/${rfqId}/clarifications/${clarificationId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      if (data.success) {
        notify('Clarification answer posted');
        setAnsweringMap(prev => ({ ...prev, [clarificationId]: '' }));
        fetchRFQs();
      }
    } catch (err) {
      console.error('Error answering clarification', err);
    }
  };

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    try {
      const res = await fetch(`/v1/rfqs/${selectedRfq.id}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: revisionForm.title || undefined,
          description: revisionForm.description || undefined,
          deadline: revisionForm.deadline ? new Date(revisionForm.deadline).toISOString() : undefined,
          revisionNotes: revisionForm.revisionNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Revision v${selectedRfq.version + 1} issued`);
        setShowRevisionModal(false);
        setRevisionForm({ title: '', description: '', deadline: '', revisionNotes: '' });
        fetchRFQs();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error creating revision', err);
    }
  };

  const handleInviteSupplier = async (rfqId: string) => {
    if (!inviteInput) return;
    try {
      const res = await fetch(`/v1/rfqs/${rfqId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierIds: [inviteInput] }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Supplier "${inviteInput}" invited to RFQ`);
        setInviteInput('');
        setShowInviteModal(false);
        fetchRFQs();
      }
    } catch (err) {
      console.error('Error inviting supplier', err);
    }
  };

  const filteredRfqs = rfqs.filter(r => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-indigo-500/30 flex items-center space-x-2 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>RFQ Lifecycle & Sourcing Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete RFQ workflow: Drafts, Publishing, Public/Private Sourcing, Attachments, Q&A Clarifications, Deadlines & Versioned Revisions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRFQs}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New RFQ Sourcing Request</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title or RFQ ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none"
          />
        </div>

        <div className="flex space-x-1">
          {(['ALL', 'DRAFT', 'PUBLISHED', 'CLOSED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg font-semibold ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Fetching RFQs from Core Domain...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRfqs.map(rfq => (
            <div
              key={rfq.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-indigo-600 font-bold block">{rfq.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{rfq.title}</h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Badge variant={rfq.status === 'PUBLISHED' ? 'success' : rfq.status === 'DRAFT' ? 'warning' : 'neutral'}>
                      {rfq.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{rfq.description}</p>

                {/* Metrics / Attributes */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    {rfq.visibility === 'PUBLIC' ? (
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="font-medium">{rfq.visibility} RFQ</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {new Date(rfq.deadline).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>{rfq.attachments.length} Attachments</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Version v{rfq.version}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedRfq(rfq);
                    setShowDetailModal(true);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Manage Slice & Specs</span>
                </button>

                <div className="flex items-center space-x-2">
                  {rfq.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      onClick={() => handlePublishRfq(rfq.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2.5"
                    >
                      Publish RFQ
                    </Button>
                  )}

                  {rfq.status === 'PUBLISHED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenAIEvaluation(rfq.id)}
                      className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AI Bids</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail & Vertical Slice Modal */}
      {showDetailModal && selectedRfq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">{selectedRfq.id}</span>
                  <Badge variant={selectedRfq.status === 'PUBLISHED' ? 'success' : 'warning'}>
                    {selectedRfq.status}
                  </Badge>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    v{selectedRfq.version}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedRfq.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRfq.description}</p>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Controls */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Deadline & Visibility</span>
                <p className="font-medium text-slate-800">
                  Due: {new Date(selectedRfq.deadline).toLocaleString()} • {selectedRfq.visibility} Mode
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {selectedRfq.status === 'DRAFT' && (
                  <Button size="sm" onClick={() => handlePublishRfq(selectedRfq.id)}>
                    Publish to Market
                  </Button>
                )}

                {selectedRfq.status === 'PUBLISHED' && (
                  <Button size="sm" variant="outline" onClick={() => handleCloseRfq(selectedRfq.id)}>
                    Close RFQ
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRevisionForm({
                      title: selectedRfq.title,
                      description: selectedRfq.description,
                      deadline: new Date(selectedRfq.deadline).toISOString().slice(0, 16),
                      revisionNotes: '',
                    });
                    setShowRevisionModal(true);
                  }}
                  className="text-xs"
                >
                  <History className="w-3.5 h-3.5 mr-1" />
                  Issue Revision
                </Button>
              </div>
            </div>

            {/* Section 1: Line Items */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>Line Item Specifications</span>
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5">Unit</th>
                      <th className="p-2.5">Target Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRfq.lineItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-900">{item.name}</td>
                        <td className="p-2.5 font-mono">{item.quantity}</td>
                        <td className="p-2.5">{item.unit}</td>
                        <td className="p-2.5 font-mono text-emerald-600">
                          {item.targetPrice ? `$${item.targetPrice.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Invited Suppliers (Public vs Private) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Invited Suppliers ({selectedRfq.invitedSupplierIds.length})</span>
                </h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  + Invite Supplier
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {selectedRfq.invitedSupplierIds.length === 0 ? (
                  <span className="text-slate-400 italic">No direct invites (Open to Public Sourcing)</span>
                ) : (
                  selectedRfq.invitedSupplierIds.map(supId => (
                    <span
                      key={supId}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg font-mono font-medium"
                    >
                      {supId}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Section 3: Attachments */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span>Technical Attachments & CAD Drawings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRfq.attachments.map(att => (
                  <div
                    key={att.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{att.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <span className="text-[10px] font-mono">{att.sizeKb} KB</span>
                      <button
                        onClick={() => handleRemoveAttachment(selectedRfq.id, att.id)}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Doc name (e.g. Pump_Flange_Spec.pdf)..."
                  value={newAttachmentName}
                  onChange={e => setNewAttachmentName(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-lg p-2"
                />
                <Button size="sm" onClick={() => handleAddAttachment(selectedRfq.id)}>
                  Upload Doc
                </Button>
              </div>
            </div>

            {/* Section 4: Clarifications Q&A Thread */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Supplier Clarification Board ({selectedRfq.clarifications.length})</span>
              </h3>

              <div className="space-y-3">
                {selectedRfq.clarifications.map(clr => (
                  <div key={clr.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{clr.askedBy}</span>
                        <p className="text-slate-700 mt-0.5 font-medium">Q: {clr.question}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(clr.askedAt).toLocaleDateString()}</span>
                    </div>

                    {clr.answer ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-medium">
                        <span className="font-bold text-emerald-800">A (Buyer Response):</span> {clr.answer}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="text"
                          placeholder="Post official buyer clarification answer..."
                          value={answeringMap[clr.id] || ''}
                          onChange={e =>
                            setAnsweringMap({ ...answeringMap, [clr.id]: e.target.value })
                          }
                          className="flex-1 text-xs border border-slate-300 rounded-lg p-1.5"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAnswerClarification(selectedRfq.id, clr.id)}
                        >
                          Answer
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Ask Question Box */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Ask technical clarification question..."
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded-lg p-2"
                  />
                  <Button size="sm" onClick={() => handleAskClarification(selectedRfq.id)}>
                    Submit Q
                  </Button>
                </div>
              </div>
            </div>

            {/* Section 5: Revision History */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Revision Audit Log</span>
              </h3>

              <div className="space-y-2">
                {selectedRfq.revisions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No prior revisions. Currently running initial version v1.</p>
                ) : (
                  selectedRfq.revisions.map(rev => (
                    <div
                      key={rev.version}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-indigo-600">v{rev.version}</span>
                          <span className="font-semibold text-slate-900">{rev.title}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{rev.revisionNotes}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(rev.revisedAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedRfq && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Issue Revision v{selectedRfq.version + 1}</h3>
            <form onSubmit={handleCreateRevision} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Updated Title</label>
                <input
                  type="text"
                  value={revisionForm.title}
                  onChange={e => setRevisionForm({ ...revisionForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Updated Deadline</label>
                <input
                  type="datetime-local"
                  value={revisionForm.deadline}
                  onChange={e => setRevisionForm({ ...revisionForm, deadline: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Revision Notes (Required)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Extended deadline due to Kalrez O-ring spec clarification..."
                  value={revisionForm.revisionNotes}
                  onChange={e => setRevisionForm({ ...revisionForm, revisionNotes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setShowRevisionModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Issue Revision</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Supplier Modal */}
      {showInviteModal && selectedRfq && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Invite Supplier to RFQ</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Supplier Code or Name</label>
                <input
                  type="text"
                  placeholder="e.g. sup-bosch-03 or Siemens"
                  value={inviteInput}
                  onChange={e => setInviteInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleInviteSupplier(selectedRfq.id)}>Send Invitation</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create RFQ Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900">Create New RFQ Sourcing Request</h3>
            <form onSubmit={handleCreateRfq} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">RFQ Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Line C Centrifugal Valve Actuators"
                  value={createForm.title}
                  onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description & Requirements</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Specify pressure ratings, temperature limits, required certifications..."
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sourcing Visibility</label>
                  <select
                    value={createForm.visibility}
                    onChange={e =>
                      setCreateForm({
                        ...createForm,
                        visibility: e.target.value as 'PUBLIC' | 'PRIVATE',
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="PUBLIC">Public (Open Sourcing)</option>
                    <option value="PRIVATE">Private (Invite Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Deadline Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.deadline}
                    onChange={e => setCreateForm({ ...createForm, deadline: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Draft RFQ</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
