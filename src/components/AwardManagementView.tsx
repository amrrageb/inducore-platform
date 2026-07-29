import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Send,
  Building2,
  DollarSign,
  Layers,
  FileCheck2,
  ShoppingBag,
  RotateCcw,
  Ban,
  Clock,
  Plus,
  RotateCw,
  ShieldCheck,
  Check,
  X,
  Edit3,
} from 'lucide-react';

export interface AwardLineAllocation {
  id: string;
  rfqLineItemId: string;
  itemName: string;
  requestedQuantity: number;
  awardedQuantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  supplierId: string;
  supplierName: string;
}

export interface AwardApprovalLog {
  id: string;
  approverName: string;
  role: string;
  status: 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED';
  notes: string;
  timestamp: string;
}

export interface AwardRevisionLog {
  version: number;
  revisedBy: string;
  reason: string;
  previousTotalAmount: number;
  newTotalAmount: number;
  timestamp: string;
}

export interface AwardContractDraft {
  contractNumber: string;
  contractTitle: string;
  governingLaw: string;
  startDate: string;
  endDate: string;
  paymentTerms: string;
  preparedAt: string;
}

export interface AwardPurchaseRequest {
  prNumber: string;
  costCenter: string;
  totalPrAmount: number;
  currency: string;
  generatedBy: string;
  createdAt: string;
}

export interface AwardItem {
  id: string;
  rfqId: string;
  rfqTitle: string;
  awardType: 'FULL' | 'PARTIAL' | 'MULTI_SUPPLIER';
  status:
    | 'RECOMMENDED'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'AWARD_LETTER_SENT'
    | 'ACCEPTED_BY_SUPPLIER'
    | 'REJECTED_BY_SUPPLIER'
    | 'CONTRACT_PREPARED'
    | 'PURCHASE_REQUEST_GENERATED'
    | 'CANCELLED'
    | 'REVISED';
  version: number;
  primarySupplierId: string;
  primarySupplierName: string;
  totalAwardedAmount: number;
  currency: string;
  lineAllocations: AwardLineAllocation[];
  approvalWorkflow: AwardApprovalLog[];
  awardLetterText?: string;
  awardLetterSentAt?: string;
  supplierAcceptedAt?: string;
  supplierRejectionReason?: string;
  contractDraft?: AwardContractDraft;
  purchaseRequest?: AwardPurchaseRequest;
  cancellationReason?: string;
  revisionHistory: AwardRevisionLog[];
  createdAt: string;
  updatedAt: string;
}

export const AwardManagementView: React.FC = () => {
  const [awards, setAwards] = useState<AwardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAward, setSelectedAward] = useState<AwardItem | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [showLetterModal, setShowLetterModal] = useState<boolean>(false);
  const [showContractModal, setShowContractModal] = useState<boolean>(false);
  const [showPRModal, setShowPRModal] = useState<boolean>(false);
  const [showReviseModal, setShowReviseModal] = useState<boolean>(false);

  // Form states
  const [approvalNotes, setApprovalNotes] = useState<string>('Approved in accordance with procurement limits');
  const [letterBody, setLetterBody] = useState<string>('');
  const [contractForm, setContractForm] = useState({
    contractNumber: `CNT-${Date.now().toString().slice(-6)}`,
    contractTitle: 'Master Equipment Supply Agreement',
    governingLaw: 'Delaware / Commercial Law',
    startDate: '2026-09-01',
    endDate: '2027-09-01',
    paymentTerms: 'NET 60 Days',
  });
  const [prForm, setPrForm] = useState({
    costCenter: 'CC-MFG-9020',
    generatedBy: 'Marcus Vance (VP Procurement)',
  });
  const [revisionForm, setRevisionForm] = useState({
    revisedBy: 'Sourcing Director',
    reason: 'Updated quantities per engineering design revision',
  });

  // Create Award Form State
  const [newAwardForm, setNewAwardForm] = useState({
    rfqId: 'RFQ-2026-003',
    rfqTitle: 'Precision Steel Fasteners & Fittings',
    awardType: 'FULL' as 'FULL' | 'PARTIAL' | 'MULTI_SUPPLIER',
    primarySupplierId: 'sup-004',
    primarySupplierName: 'WÜRTH Industrial US',
    currency: 'USD',
    lineItemName: 'M12 Grade 10.9 Alloy Fasteners',
    requestedQty: 10000,
    awardedQty: 10000,
    unitPrice: 3.5,
  });

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/v1/awards');
      const data = await res.json();
      if (data.success && data.data) {
        setAwards(data.data);
        if (data.data.length > 0 && !selectedAward) {
          setSelectedAward(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch awards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  const handleCreateAward = async () => {
    try {
      const payload = {
        rfqId: newAwardForm.rfqId,
        rfqTitle: newAwardForm.rfqTitle,
        awardType: newAwardForm.awardType,
        primarySupplierId: newAwardForm.primarySupplierId,
        primarySupplierName: newAwardForm.primarySupplierName,
        currency: newAwardForm.currency,
        lineAllocations: [
          {
            id: `alloc-${Date.now()}`,
            rfqLineItemId: `item-${Date.now()}`,
            itemName: newAwardForm.lineItemName,
            requestedQuantity: Number(newAwardForm.requestedQty),
            awardedQuantity: Number(newAwardForm.awardedQty),
            unit: 'PCS',
            unitPrice: Number(newAwardForm.unitPrice),
            totalAmount: Number(newAwardForm.awardedQty) * Number(newAwardForm.unitPrice),
            supplierId: newAwardForm.primarySupplierId,
            supplierName: newAwardForm.primarySupplierName,
          },
        ],
      };

      const res = await fetch('/v1/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        await fetchAwards();
        setSelectedAward(data.data);
      }
    } catch (err) {
      console.error('Error creating award', err);
    }
  };

  const handleApproveAward = async () => {
    if (!selectedAward) return;
    try {
      const res = await fetch('/v1/awards/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId: selectedAward.id,
          approverName: 'Marcus Vance',
          role: 'VP Procurement',
          notes: approvalNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowApprovalModal(false);
        setSelectedAward(data.data);
        await fetchAwards();
      }
    } catch (err) {
      console.error('Error approving award', err);
    }
  };

  const handleDispatchLetter = async () => {
    if (!selectedAward) return;
    try {
      const res = await fetch('/v1/awards/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId: selectedAward.id,
          letterBody:
            letterBody ||
            `Official Award Notice: InduCore hereby confirms the award of ${selectedAward.rfqTitle} (${selectedAward.rfqId}) to ${selectedAward.primarySupplierName}. Total value: ${selectedAward.currency} ${selectedAward.totalAwardedAmount.toLocaleString()}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLetterModal(false);
        setSelectedAward(data.data);
        await fetchAwards();
      }
    } catch (err) {
      console.error('Error dispatching award letter', err);
    }
  };

  const handleSupplierAccept = async () => {
    if (!selectedAward) return;
    try {
      const res = await fetch(`/v1/awards/${selectedAward.id}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSelectedAward(data.data);
        await fetchAwards();
      }
    } catch (err) {
      console.error('Error recording supplier acceptance', err);
    }
  };

  const handlePrepareContract = async () => {
    if (!selectedAward) return;
    try {
      const res = await fetch('/v1/awards/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId: selectedAward.id,
          ...contractForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowContractModal(false);
        setSelectedAward(data.data);
        await fetchAwards();
      }
    } catch (err) {
      console.error('Error preparing contract', err);
    }
  };

  const handleGeneratePR = async () => {
    if (!selectedAward) return;
    try {
      const res = await fetch('/v1/awards/purchase-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId: selectedAward.id,
          ...prForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPRModal(false);
        setSelectedAward(data.data);
        await fetchAwards();
      }
    } catch (err) {
      console.error('Error generating PR', err);
    }
  };

  const handleReviseAward = async () => {
    if (!selectedAward) return;
    try {
      const res = await fetch('/v1/awards/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId: selectedAward.id,
          ...revisionForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReviseModal(false);
        setSelectedAward(data.data);
        await fetchAwards();
      }
    } catch (err) {
      console.error('Error revising award', err);
    }
  };

  const handleCancelAward = async () => {
    if (!selectedAward) return;
    if (!confirm('Are you sure you want to cancel this award decision?')) return;
    try {
      const res = await fetch('/v1/awards/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId: selectedAward.id,
          reason: 'Cancelled by procurement executive due to budget re-alignment.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedAward(data.data);
        await fetchAwards();
      }
    } catch (err) {
      console.error('Error cancelling award', err);
    }
  };

  const getStatusBadge = (status: AwardItem['status']) => {
    switch (status) {
      case 'RECOMMENDED':
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Recommendation</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Pending Approval</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case 'AWARD_LETTER_SENT':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Letter Dispatched</span>;
      case 'ACCEPTED_BY_SUPPLIER':
        return <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Accepted by Supplier</span>;
      case 'CONTRACT_PREPARED':
        return <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><FileCheck2 className="w-3.5 h-3.5" /> Contract Drafted</span>;
      case 'PURCHASE_REQUEST_GENERATED':
        return <span className="px-2.5 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> PR Generated</span>;
      case 'REVISED':
        return <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Revised (v{selectedAward?.version})</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  const getAwardTypeBadge = (type: AwardItem['awardType']) => {
    switch (type) {
      case 'FULL':
        return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold rounded">Full Award</span>;
      case 'PARTIAL':
        return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold rounded">Partial Award</span>;
      case 'MULTI_SUPPLIER':
        return <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold rounded">Multi-Supplier Split</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Award Management & Contract Pipeline</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Full, partial, & multi-supplier award recommendations, executive approval workflows, & purchase request generation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAwards}
            className="p-2 border border-slate-700 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Award Recommendation</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Award List & Selected Award Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Awards List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
            <span>Sourcing Award Decisions</span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">{awards.length}</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading awards...</div>
          ) : awards.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No award records found.</div>
          ) : (
            <div className="space-y-2">
              {awards.map(award => (
                <div
                  key={award.id}
                  onClick={() => setSelectedAward(award)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAward?.id === award.id
                      ? 'bg-slate-800 border-emerald-500/50 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{award.rfqId}</span>
                      <h3 className="text-sm font-semibold text-white line-clamp-1 mt-0.5">{award.rfqTitle}</h3>
                    </div>
                    {getAwardTypeBadge(award.awardType)}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[120px]">{award.primarySupplierName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">
                        {award.currency} {award.totalAwardedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {getStatusBadge(award.status)}
                    <span className="text-[10px] text-slate-500">v{award.version}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Award Details */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedAward ? (
            <>
              {/* Award Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-slate-800 pb-5 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                      {selectedAward.rfqId}
                    </span>
                    {getAwardTypeBadge(selectedAward.awardType)}
                    <span className="text-xs font-mono text-slate-400">Award ID: {selectedAward.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1.5">{selectedAward.rfqTitle}</h2>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-emerald-400" /> {selectedAward.primarySupplierName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-amber-400" /> Total: <strong className="text-white">{selectedAward.currency} {selectedAward.totalAwardedAmount.toLocaleString()}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(selectedAward.status)}
                  <span className="text-[11px] text-slate-500">Created: {new Date(selectedAward.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-2">
                {selectedAward.status === 'RECOMMENDED' && (
                  <button
                    onClick={() => {
                      setApprovalNotes('Approved for award dispatch');
                      setShowApprovalModal(true);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Executive Approval</span>
                  </button>
                )}

                {(selectedAward.status === 'APPROVED' || selectedAward.status === 'CONTRACT_PREPARED') && (
                  <button
                    onClick={() => {
                      setLetterBody(
                        `OFFICIAL AWARD NOTICE\n\nDate: ${new Date().toLocaleDateString()}\nTo: ${selectedAward.primarySupplierName}\n\nWe are pleased to inform you that your bid for RFQ ${selectedAward.rfqTitle} (${selectedAward.rfqId}) has been selected for award.\nTotal Value: ${selectedAward.currency} ${selectedAward.totalAwardedAmount.toLocaleString()}.\n\nPlease acknowledge receipt and acceptance.`
                      );
                      setShowLetterModal(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Award Letter</span>
                  </button>
                )}

                {selectedAward.status === 'AWARD_LETTER_SENT' && (
                  <button
                    onClick={handleSupplierAccept}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Record Supplier Acceptance</span>
                  </button>
                )}

                {(selectedAward.status === 'ACCEPTED_BY_SUPPLIER' || selectedAward.status === 'APPROVED') && (
                  <button
                    onClick={() => setShowContractModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Prepare Contract Draft</span>
                  </button>
                )}

                {selectedAward.status !== 'PURCHASE_REQUEST_GENERATED' && selectedAward.status !== 'CANCELLED' && (
                  <button
                    onClick={() => setShowPRModal(true)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Generate Purchase Request</span>
                  </button>
                )}

                {selectedAward.status !== 'CANCELLED' && (
                  <>
                    <button
                      onClick={() => setShowReviseModal(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Revise Award</span>
                    </button>
                    <button
                      onClick={handleCancelAward}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>

              {/* Line Allocation Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Awarded Line Item Allocations ({selectedAward.lineAllocations.length})</span>
                  </h3>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3 text-right">Req. Qty</th>
                        <th className="py-2.5 px-3 text-right">Awarded Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {selectedAward.lineAllocations.map(line => (
                        <tr key={line.id} className="hover:bg-slate-900/50">
                          <td className="py-3 px-3 font-medium text-white">{line.itemName}</td>
                          <td className="py-3 px-3 text-emerald-400 font-medium">{line.supplierName}</td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {line.requestedQuantity} {line.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-white">
                            {line.awardedQuantity} {line.unit}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300">
                            {selectedAward.currency} {line.unitPrice.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-400">
                            {selectedAward.currency} {line.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Generated Artifacts Section: Contract Draft & Purchase Request */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contract Draft Card */}
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-indigo-400" /> Contract Draft
                    </span>
                    {selectedAward.contractDraft ? (
                      <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                        {selectedAward.contractDraft.contractNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Not Prepared</span>
                    )}
                  </div>

                  {selectedAward.contractDraft ? (
                    <div className="text-xs space-y-1.5 text-slate-400 pt-1">
                      <p className="font-semibold text-white">{selectedAward.contractDraft.contractTitle}</p>
                      <div className="flex justify-between">
                        <span>Governing Law:</span>
                        <span className="text-slate-200">{selectedAward.contractDraft.governingLaw}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Terms:</span>
                        <span className="text-slate-200">{selectedAward.contractDraft.paymentTerms}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>Validity:</span>
                        <span>{selectedAward.contractDraft.startDate} to {selectedAward.contractDraft.endDate}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic pt-2">
                      Click 'Prepare Contract Draft' above to issue formal contract terms.
                    </p>
                  )}
                </div>

                {/* Purchase Request Card */}
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-teal-400" /> Purchase Request (PR)
                    </span>
                    {selectedAward.purchaseRequest ? (
                      <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                        {selectedAward.purchaseRequest.prNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Not Generated</span>
                    )}
                  </div>

                  {selectedAward.purchaseRequest ? (
                    <div className="text-xs space-y-1.5 text-slate-400 pt-1">
                      <div className="flex justify-between">
                        <span>Cost Center:</span>
                        <span className="text-slate-200 font-mono">{selectedAward.purchaseRequest.costCenter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PR Amount:</span>
                        <span className="text-teal-400 font-bold">
                          {selectedAward.purchaseRequest.currency} {selectedAward.purchaseRequest.totalPrAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>Generated By:</span>
                        <span>{selectedAward.purchaseRequest.generatedBy}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic pt-2">
                      Click 'Generate Purchase Request' above to create ERP requisitions.
                    </p>
                  )}
                </div>
              </div>

              {/* Executive Approval Audit Workflow */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Executive Approval History ({selectedAward.approvalWorkflow.length})</span>
                </h3>

                {selectedAward.approvalWorkflow.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No approval steps logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAward.approvalWorkflow.map(appr => (
                      <div key={appr.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Check className="w-3.5 h-3.5 text-purple-400" />
                          </div>
                          <div>
                            <span className="font-bold text-white">{appr.approverName}</span>
                            <span className="text-slate-400 ml-2">({appr.role})</span>
                            <p className="text-slate-400 text-[11px] mt-0.5">{appr.notes}</p>
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-500 font-mono">
                          {new Date(appr.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">Select an award record from the left list.</div>
          )}
        </div>
      </div>

      {/* Modal: Create Award Recommendation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>New Award Recommendation</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">RFQ Reference ID</label>
                  <input
                    type="text"
                    value={newAwardForm.rfqId}
                    onChange={e => setNewAwardForm({ ...newAwardForm, rfqId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Award Type</label>
                  <select
                    value={newAwardForm.awardType}
                    onChange={e => setNewAwardForm({ ...newAwardForm, awardType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="FULL">Full Award</option>
                    <option value="PARTIAL">Partial Award</option>
                    <option value="MULTI_SUPPLIER">Multi-Supplier Split</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">RFQ Title / Subject</label>
                <input
                  type="text"
                  value={newAwardForm.rfqTitle}
                  onChange={e => setNewAwardForm({ ...newAwardForm, rfqTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Primary Supplier Name</label>
                  <input
                    type="text"
                    value={newAwardForm.primarySupplierName}
                    onChange={e => setNewAwardForm({ ...newAwardForm, primarySupplierName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Currency</label>
                  <input
                    type="text"
                    value={newAwardForm.currency}
                    onChange={e => setNewAwardForm({ ...newAwardForm, currency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-3">
                <h4 className="font-bold text-slate-300">Initial Line Item Allocation</h4>
                <div>
                  <label className="block text-slate-400 mb-1">Item Description</label>
                  <input
                    type="text"
                    value={newAwardForm.lineItemName}
                    onChange={e => setNewAwardForm({ ...newAwardForm, lineItemName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Requested Qty</label>
                    <input
                      type="number"
                      value={newAwardForm.requestedQty}
                      onChange={e => setNewAwardForm({ ...newAwardForm, requestedQty: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Awarded Qty</label>
                    <input
                      type="number"
                      value={newAwardForm.awardedQty}
                      onChange={e => setNewAwardForm({ ...newAwardForm, awardedQty: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Unit Price ({newAwardForm.currency})</label>
                    <input
                      type="number"
                      value={newAwardForm.unitPrice}
                      onChange={e => setNewAwardForm({ ...newAwardForm, unitPrice: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAward}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30"
              >
                Submit Award Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Executive Approval */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span>Record Executive Approval</span>
            </h3>
            <p className="text-xs text-slate-400">
              Approve sourcing decision for {selectedAward?.rfqTitle} ({selectedAward?.currency} {selectedAward?.totalAwardedAmount.toLocaleString()})
            </p>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Approval Notes & Sign-off Remarks</label>
              <textarea
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div className="flex justify-end space-x-2 border-t border-slate-800 pt-3">
              <button onClick={() => setShowApprovalModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleApproveAward} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Confirm Executive Sign-Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Dispatch Award Letter */}
      {showLetterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              <span>Dispatch Official Award Letter</span>
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Award Notification Letter Text</label>
              <textarea
                value={letterBody}
                onChange={e => setLetterBody(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono"
              />
            </div>
            <div className="flex justify-end space-x-2 border-t border-slate-800 pt-3">
              <button onClick={() => setShowLetterModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleDispatchLetter} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">
                Send Award Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Prepare Contract */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              <span>Prepare Contract Draft</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Contract Number</label>
                <input
                  type="text"
                  value={contractForm.contractNumber}
                  onChange={e => setContractForm({ ...contractForm, contractNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Contract Title</label>
                <input
                  type="text"
                  value={contractForm.contractTitle}
                  onChange={e => setContractForm({ ...contractForm, contractTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Governing Law</label>
                  <input
                    type="text"
                    value={contractForm.governingLaw}
                    onChange={e => setContractForm({ ...contractForm, governingLaw: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={contractForm.paymentTerms}
                    onChange={e => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={contractForm.startDate}
                    onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={contractForm.endDate}
                    onChange={e => setContractForm({ ...contractForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 border-t border-slate-800 pt-3">
              <button onClick={() => setShowContractModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handlePrepareContract} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                Save Contract Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate Purchase Request */}
      {showPRModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-teal-400" />
              <span>Generate Purchase Request</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Cost Center Code</label>
                <input
                  type="text"
                  value={prForm.costCenter}
                  onChange={e => setPrForm({ ...prForm, costCenter: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Requested By</label>
                <input
                  type="text"
                  value={prForm.generatedBy}
                  onChange={e => setPrForm({ ...prForm, generatedBy: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 border-t border-slate-800 pt-3">
              <button onClick={() => setShowPRModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleGeneratePR} className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold">
                Generate PR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Revise Award */}
      {showReviseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span>Revise Award Recommendation</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Revised By</label>
                <input
                  type="text"
                  value={revisionForm.revisedBy}
                  onChange={e => setRevisionForm({ ...revisionForm, revisedBy: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Revision Reason</label>
                <textarea
                  value={revisionForm.reason}
                  onChange={e => setRevisionForm({ ...revisionForm, reason: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 border-t border-slate-800 pt-3">
              <button onClick={() => setShowReviseModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleReviseAward} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold">
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
