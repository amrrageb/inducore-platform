import React, { useState, useEffect } from 'react';
import { Button, Badge } from '@inducore/ui-kit';
import {
  FileCheck2,
  Plus,
  RotateCw,
  Search,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Truck,
  Paperclip,
  CheckCircle2,
  X,
  History,
  MessageSquare,
  AlertOctagon,
  ArrowRightLeft,
  Sparkles,
  Award,
  Layers,
  Scale,
} from 'lucide-react';

export interface QuotationLineItem {
  id: string;
  rfqLineItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  isIncluded: boolean;
  technicalNotes?: string;
}

export interface QuotationAttachment {
  id: string;
  name: string;
  url: string;
  type: 'TECHNICAL' | 'COMMERCIAL';
  sizeKb: number;
  uploadedAt: string;
}

export interface BuyerComment {
  id: string;
  author: string;
  comment: string;
  createdAt: string;
}

export interface QuotationRevision {
  version: number;
  totalPrice: number;
  currency: string;
  incoterms: string;
  deliveryTimeDays: number;
  submittedAt: string;
  notes: string;
}

export interface QuotationItem {
  id: string;
  rfqId: string;
  rfqTitle: string;
  supplierId: string;
  supplierName: string;
  version: number;
  status: 'DRAFT' | 'SUBMITTED' | 'REVISED' | 'WITHDRAWN' | 'ACCEPTED' | 'REJECTED';
  isAlternativeOffer: boolean;
  alternativeOfferDetails?: string;
  isPartialQuotation: boolean;
  currency: string;
  subtotalPrice: number;
  taxVatRatePercentage: number;
  taxVatAmount: number;
  totalPrice: number;
  incoterms: string;
  incotermsLocation: string;
  deliveryTimeDays: number;
  paymentTerms: string;
  validityUntil: string;
  lineItems: QuotationLineItem[];
  technicalAttachments: QuotationAttachment[];
  commercialAttachments: QuotationAttachment[];
  internalNotes: string;
  buyerComments: BuyerComment[];
  revisions: QuotationRevision[];
  withdrawalReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const QuotationManagementView: React.FC = () => {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQuote, setSelectedQuote] = useState<QuotationItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Filters & Views
  const [activeTab, setActiveTab] = useState<'LIST' | 'COMPARISON'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [comparisonRfqId, setComparisonRfqId] = useState<string>('rfq-001');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Submit/Create Form State
  const [createForm, setCreateForm] = useState({
    rfqId: 'rfq-001',
    rfqTitle: 'High Pressure Hydraulic Valve Cartridges - Line C',
    supplierId: 'sup-bosch-01',
    supplierName: 'Bosch Rexroth Hydraulics GmbH',
    isAlternativeOffer: false,
    alternativeOfferDetails: '',
    isPartialQuotation: false,
    currency: 'USD',
    taxVatRatePercentage: 10,
    incoterms: 'DDP',
    incotermsLocation: 'Apex Manufacturing Plant Site - Houston TX',
    deliveryTimeDays: 21,
    paymentTerms: 'Net 30 Days after Delivery',
    validityUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    lineItems: [
      {
        rfqLineItemId: 'item-1',
        itemName: 'High Pressure Valve Cartridge 350 Bar',
        quantity: 4,
        unit: 'units',
        unitPrice: 1200,
        isIncluded: true,
        technicalNotes: 'Viton high-temp seals',
      },
    ],
    internalNotes: '',
    isDraft: false,
  });

  // Forms
  const [revisionNotes, setRevisionNotes] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [newBuyerComment, setNewBuyerComment] = useState('');
  const [newAttachment, setNewAttachment] = useState({
    name: '',
    type: 'TECHNICAL' as 'TECHNICAL' | 'COMMERCIAL',
  });

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/v1/quotations');
      const data = await res.json();
      if (data.success) {
        setQuotations(data.data);
        if (selectedQuote) {
          const updated = data.data.find((q: QuotationItem) => q.id === selectedQuote.id);
          if (updated) setSelectedQuote(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch quotations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Quotation created for ${createForm.supplierName}`);
        setShowCreateModal(false);
        fetchQuotations();
      } else {
        alert(data.error || 'Failed to create quotation');
      }
    } catch (err) {
      console.error('Error creating quotation', err);
    }
  };

  const handleSubmitDraft = async (id: string) => {
    try {
      const res = await fetch(`/v1/quotations/${id}/submit`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('Draft quotation officially submitted');
        fetchQuotations();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error submitting draft quotation', err);
    }
  };

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    try {
      const res = await fetch(`/v1/quotations/${selectedQuote.id}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: revisionNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Quotation revision v${selectedQuote.version + 1} created`);
        setShowRevisionModal(false);
        setRevisionNotes('');
        fetchQuotations();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error creating revision', err);
    }
  };

  const handleWithdrawQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    try {
      const res = await fetch(`/v1/quotations/${selectedQuote.id}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: withdrawalReason }),
      });
      const data = await res.json();
      if (data.success) {
        notify('Quotation status marked as WITHDRAWN');
        setShowWithdrawModal(false);
        setWithdrawalReason('');
        fetchQuotations();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error withdrawing quotation', err);
    }
  };

  const handleAddComment = async (quoteId: string) => {
    if (!newBuyerComment) return;
    try {
      const res = await fetch(`/v1/quotations/${quoteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Senior Buyer (Apex Procurement)',
          comment: newBuyerComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify('Buyer comment posted');
        setNewBuyerComment('');
        fetchQuotations();
      }
    } catch (err) {
      console.error('Error adding buyer comment', err);
    }
  };

  const handleAddAttachment = async (quoteId: string) => {
    if (!newAttachment.name) return;
    try {
      const res = await fetch(`/v1/quotations/${quoteId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAttachment.name.endsWith('.pdf') ? newAttachment.name : `${newAttachment.name}.pdf`,
          url: `/docs/${newAttachment.name}`,
          type: newAttachment.type,
          sizeKb: Math.floor(600 + Math.random() * 1500),
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`${newAttachment.type} proposal attachment added`);
        setNewAttachment({ name: '', type: 'TECHNICAL' });
        fetchQuotations();
      }
    } catch (err) {
      console.error('Error adding attachment', err);
    }
  };

  const filteredQuotes = quotations.filter(q => {
    const matchesSearch =
      q.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.rfqTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    return true;
  });

  const comparisonQuotes = quotations.filter(q => q.rfqId === comparisonRfqId);

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
            <FileCheck2 className="w-6 h-6 text-indigo-600" />
            <span>Quotation Lifecycle & Commercial Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            End-to-End Quotations: Drafts, Revisions, Alternative Offers, Partial Quotations, Incoterms, Currency/Tax, Attachments & Side-by-Side Comparison.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchQuotations}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Submit Quotation Offer</span>
          </Button>
        </div>
      </div>

      {/* View Switcher Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-4 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 ${
              activeTab === 'LIST'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Quotations</span>
          </button>
          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-4 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 ${
              activeTab === 'COMPARISON'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Comparison Matrix</span>
          </button>
        </div>

        {activeTab === 'LIST' ? (
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search supplier, RFQ, quote ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="REVISED">REVISED</option>
              <option value="WITHDRAWN">WITHDRAWN</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600">Select RFQ to Compare:</span>
            <select
              value={comparisonRfqId}
              onChange={e => setComparisonRfqId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-indigo-600"
            >
              <option value="rfq-001">rfq-001: High Pressure Valve Cartridges</option>
              <option value="rfq-002">rfq-002: Rotary Valve Actuators</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Loading Quotations Domain...</p>
        </div>
      ) : activeTab === 'LIST' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map(quote => (
            <div
              key={quote.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-indigo-600 font-bold block">{quote.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{quote.supplierName}</h3>
                  </div>

                  <Badge
                    variant={
                      quote.status === 'SUBMITTED'
                        ? 'success'
                        : quote.status === 'WITHDRAWN'
                        ? 'neutral'
                        : 'warning'
                    }
                  >
                    {quote.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-1">{quote.rfqTitle}</p>

                {/* Badges for Special Offers */}
                <div className="flex flex-wrap gap-1">
                  {quote.isAlternativeOffer && (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Alternative Offer</span>
                    </span>
                  )}
                  {quote.isPartialQuotation && (
                    <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <ArrowRightLeft className="w-3 h-3 text-purple-600" />
                      <span>Partial Bid</span>
                    </span>
                  )}
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    v{quote.version}
                  </span>
                </div>

                {/* Pricing Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Subtotal:</span>
                    <span className="font-mono">
                      {quote.currency} ${quote.subtotalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">VAT ({quote.taxVatRatePercentage}%):</span>
                    <span className="font-mono">
                      {quote.currency} ${quote.taxVatAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Offer:</span>
                    <span className="font-mono text-indigo-600">
                      {quote.currency} ${quote.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Logistics & Terms */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Incoterms: {quote.incoterms}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lead: {quote.deliveryTimeDays} Days</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedQuote(quote);
                    setShowDetailModal(true);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Proposal</span>
                </button>

                {quote.status === 'DRAFT' && (
                  <Button size="sm" onClick={() => handleSubmitDraft(quote.id)} className="text-xs">
                    Submit Offer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* COMPARISON MATRIX VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span>Side-by-Side Sourcing Comparison Matrix</span>
              </h2>
              <p className="text-xs text-slate-500">
                Evaluating {comparisonQuotes.length} supplier proposals for RFQ reference <span className="font-mono text-indigo-600 font-bold">{comparisonRfqId}</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-bold w-48">Evaluation Metric</th>
                  {comparisonQuotes.map(q => (
                    <th key={q.id} className="p-3 font-bold min-w-[220px]">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{q.supplierName}</span>
                        <span className="font-mono text-[10px] text-indigo-600">{q.id} (v{q.version})</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {/* Total Price */}
                <tr className="bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900 flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Total Evaluated Price</span>
                  </td>
                  {comparisonQuotes.map(q => (
                    <td key={q.id} className="p-3 font-mono font-bold text-sm text-indigo-600">
                      {q.currency} ${q.totalPrice.toLocaleString()}
                    </td>
                  ))}
                </tr>

                {/* Subtotal & Taxes */}
                <tr>
                  <td className="p-3 font-semibold text-slate-600">Subtotal & VAT Rate</td>
                  {comparisonQuotes.map(q => (
                    <td key={q.id} className="p-3 font-mono">
                      {q.currency} ${q.subtotalPrice.toLocaleString()} + {q.taxVatRatePercentage}% VAT
                    </td>
                  ))}
                </tr>

                {/* Incoterms */}
                <tr>
                  <td className="p-3 font-semibold text-slate-600">Incoterms & Location</td>
                  {comparisonQuotes.map(q => (
                    <td key={q.id} className="p-3">
                      <span className="font-bold text-slate-900">{q.incoterms}</span> - {q.incotermsLocation}
                    </td>
                  ))}
                </tr>

                {/* Delivery Time */}
                <tr>
                  <td className="p-3 font-semibold text-slate-600">Delivery Lead Time</td>
                  {comparisonQuotes.map(q => (
                    <td key={q.id} className="p-3">
                      <span className="font-bold text-slate-900">{q.deliveryTimeDays} Days</span>
                    </td>
                  ))}
                </tr>

                {/* Payment Terms */}
                <tr>
                  <td className="p-3 font-semibold text-slate-600">Commercial Payment Terms</td>
                  {comparisonQuotes.map(q => (
                    <td key={q.id} className="p-3">{q.paymentTerms}</td>
                  ))}
                </tr>

                {/* Alternative / Partial Status */}
                <tr>
                  <td className="p-3 font-semibold text-slate-600">Special Offer Type</td>
                  {comparisonQuotes.map(q => (
                    <td key={q.id} className="p-3">
                      {q.isAlternativeOffer ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Alternative</span>
                      ) : q.isPartialQuotation ? (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">Partial Bid</span>
                      ) : (
                        <span className="text-slate-400">Standard Spec</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Proposal Attachments */}
                <tr>
                  <td className="p-3 font-semibold text-slate-600">Technical & Commercial Docs</td>
                  {comparisonQuotes.map(q => (
                    <td key={q.id} className="p-3">
                      <div className="space-y-1 text-[10px]">
                        <div>Tech: {q.technicalAttachments.length} Files</div>
                        <div>Commercial: {q.commercialAttachments.length} Files</div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Status */}
                <tr>
                  <td className="p-3 font-semibold text-slate-600">Quotation Status</td>
                  {comparisonQuotes.map(q => (
                    <td key={q.id} className="p-3">
                      <Badge variant={q.status === 'SUBMITTED' ? 'success' : 'warning'}>{q.status}</Badge>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proposal Detail & Vertical Slice Modal */}
      {showDetailModal && selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">{selectedQuote.id}</span>
                  <Badge variant={selectedQuote.status === 'SUBMITTED' ? 'success' : 'warning'}>
                    {selectedQuote.status}
                  </Badge>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    Version v{selectedQuote.version}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedQuote.supplierName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">RFQ: {selectedQuote.rfqTitle}</p>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Offer Amount</span>
                <p className="text-base font-bold font-mono text-indigo-600">
                  {selectedQuote.currency} ${selectedQuote.totalPrice.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRevisionModal(true)}
                  className="text-xs"
                >
                  <History className="w-3.5 h-3.5 mr-1" />
                  Submit Revision
                </Button>

                {selectedQuote.status !== 'WITHDRAWN' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowWithdrawModal(true)}
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                    Withdraw Offer
                  </Button>
                )}
              </div>
            </div>

            {/* Commercial Terms Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">INCOTERMS</span>
                <span className="font-bold text-slate-800">{selectedQuote.incoterms}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">DELIVERY LEAD</span>
                <span className="font-bold text-slate-800">{selectedQuote.deliveryTimeDays} Days</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">PAYMENT TERMS</span>
                <span className="font-bold text-slate-800">{selectedQuote.paymentTerms}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">VALIDITY UNTIL</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedQuote.validityUntil).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Line Item Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Quoted Line Items ({selectedQuote.lineItems.length})</span>
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Line Item</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Unit Price</th>
                      <th className="p-2.5">Total Price</th>
                      <th className="p-2.5">Tech Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedQuote.lineItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-900">{item.itemName}</td>
                        <td className="p-2.5 font-mono">{item.quantity} {item.unit}</td>
                        <td className="p-2.5 font-mono">{selectedQuote.currency} ${item.unitPrice.toLocaleString()}</td>
                        <td className="p-2.5 font-mono font-bold text-indigo-600">
                          {selectedQuote.currency} ${item.totalPrice.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-slate-500 italic">{item.technicalNotes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technical & Commercial Attachments */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span>Technical & Commercial Proposal Attachments</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...selectedQuote.technicalAttachments, ...selectedQuote.commercialAttachments].map(att => (
                  <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 truncate block">{att.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{att.type} PROPOSAL</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{att.sizeKb} KB</span>
                  </div>
                ))}
              </div>

              {/* Add Attachment Controls */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Doc name (e.g. Technical_Data_Sheet.pdf)..."
                  value={newAttachment.name}
                  onChange={e => setNewAttachment({ ...newAttachment, name: e.target.value })}
                  className="flex-1 text-xs border border-slate-300 rounded-lg p-2"
                />
                <select
                  value={newAttachment.type}
                  onChange={e =>
                    setNewAttachment({ ...newAttachment, type: e.target.value as 'TECHNICAL' | 'COMMERCIAL' })
                  }
                  className="text-xs border border-slate-300 rounded-lg p-2"
                >
                  <option value="TECHNICAL">TECHNICAL</option>
                  <option value="COMMERCIAL">COMMERCIAL</option>
                </select>
                <Button size="sm" onClick={() => handleAddAttachment(selectedQuote.id)}>
                  Upload
                </Button>
              </div>
            </div>

            {/* Buyer Comments & Feedback */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Buyer Negotiation & Feedback Thread ({selectedQuote.buyerComments.length})</span>
              </h3>

              <div className="space-y-2">
                {selectedQuote.buyerComments.map(c => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{c.author}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600">{c.comment}</p>
                  </div>
                ))}

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add buyer negotiation comment..."
                    value={newBuyerComment}
                    onChange={e => setNewBuyerComment(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded-lg p-2"
                  />
                  <Button size="sm" onClick={() => handleAddComment(selectedQuote.id)}>
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Version History Log */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Revision Audit Log</span>
              </h3>

              <div className="space-y-2">
                {selectedQuote.revisions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No prior revisions. Currently running version v1.</p>
                ) : (
                  selectedQuote.revisions.map(r => (
                    <div key={r.version} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-indigo-600">v{r.version}</span> - {r.notes}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Incoterms: {r.incoterms} • Delivery: {r.deliveryTimeDays} Days
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{r.currency} ${r.totalPrice.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Quotation Revision v{selectedQuote.version + 1}</h3>
            <form onSubmit={handleCreateRevision} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Revision Notes & Commercial Justification</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Updated pricing to include volume discounts and DDP terms..."
                  value={revisionNotes}
                  onChange={e => setRevisionNotes(e.target.value)}
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

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 text-red-600">Withdraw Quotation Offer</h3>
            <form onSubmit={handleWithdrawQuotation} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason for Withdrawal</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Raw material price spike or component supply chain delay..."
                  value={withdrawalReason}
                  onChange={e => setWithdrawalReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                  Confirm Withdrawal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <h3 className="text-lg font-bold text-slate-900">Submit New Quotation Offer</h3>
            <form onSubmit={handleCreateQuotation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.supplierName}
                    onChange={e => setCreateForm({ ...createForm, supplierName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Currency</label>
                  <select
                    value={createForm.currency}
                    onChange={e => setCreateForm({ ...createForm, currency: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (Dh)</option>
                    <option value="SAR">SAR (SR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Incoterms</label>
                  <select
                    value={createForm.incoterms}
                    onChange={e => setCreateForm({ ...createForm, incoterms: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="DDP">DDP - Delivered Duty Paid</option>
                    <option value="FOB">FOB - Free on Board</option>
                    <option value="CIF">CIF - Cost, Insurance & Freight</option>
                    <option value="EXW">EXW - Ex Works</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Delivery Lead Time (Days)</label>
                  <input
                    type="number"
                    required
                    value={createForm.deliveryTimeDays}
                    onChange={e => setCreateForm({ ...createForm, deliveryTimeDays: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createForm.isAlternativeOffer}
                    onChange={e => setCreateForm({ ...createForm, isAlternativeOffer: e.target.checked })}
                  />
                  <span className="font-semibold text-slate-700">Alternative Offer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createForm.isPartialQuotation}
                    onChange={e => setCreateForm({ ...createForm, isPartialQuotation: e.target.checked })}
                  />
                  <span className="font-semibold text-slate-700">Partial Quotation</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Quotation Offer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
