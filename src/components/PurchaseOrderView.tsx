import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  Truck,
  PackageCheck,
  Building2,
  Calendar,
  RotateCcw,
  X,
  Send,
  Lock,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import { PurchaseOrderDTO } from '@inducore/application';

export const PurchaseOrderView: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderDTO | null>(null);

  // Modals state
  const [showManualModal, setShowManualModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Forms state
  const [manualForm, setManualForm] = useState({
    poNumber: '',
    supplierId: 'sup-001',
    supplierName: '',
    currency: 'USD',
    paymentTerms: 'NET 30',
    incoterm: 'FCA Plant',
    itemName: '',
    orderedQuantity: 100,
    unit: 'EA',
    unitPrice: 250,
  });

  const [approveForm, setApproveForm] = useState({
    approverName: 'Jane Doe',
    role: 'Procurement Director',
    notes: 'Approved after budget verification',
  });

  const [scheduleForm, setScheduleForm] = useState({
    lineItemId: '',
    itemName: '',
    expectedDate: '',
    quantity: 10,
    destinationAddress: 'Plant Yard 1',
  });

  const [shipmentForm, setShipmentForm] = useState({
    carrier: 'DHL Express',
    trackingNumber: 'TRK-9901824',
    dispatchedDate: new Date().toISOString().split('T')[0],
    estimatedArrival: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: 'In transit via main highway hub',
  });

  const [grnForm, setGrnForm] = useState({
    receivedBy: 'Warehouse Manager Mark',
    overallNotes: 'Inspected upon arrival',
    lineItemId: '',
    quantityReceived: 0,
    discrepancyType: 'NONE' as 'NONE' | 'OVER' | 'UNDER' | 'DAMAGED',
    conditionNotes: 'Good condition',
  });

  const [revisionForm, setRevisionForm] = useState({
    revisedBy: 'Senior Buyer',
    reason: 'Updated item specifications and quantity adjustment',
    newQuantity: 0,
    newUnitPrice: 0,
  });

  const [closeReason, setCloseReason] = useState('Order fulfilled and closed by procurement');

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/v1/purchase-orders');
      const data = await res.json();
      if (data.data) {
        setPos(data.data);
        if (data.data.length > 0 && !selectedPO) {
          setSelectedPO(data.data[0]);
        } else if (selectedPO) {
          const updated = data.data.find((p: PurchaseOrderDTO) => p.id === selectedPO.id);
          if (updated) setSelectedPO(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualPO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        poNumber: manualForm.poNumber || undefined,
        supplierId: manualForm.supplierId,
        supplierName: manualForm.supplierName || 'Global Industrial Supplies Ltd.',
        currency: manualForm.currency,
        paymentTerms: manualForm.paymentTerms,
        incoterm: manualForm.incoterm,
        lineItems: [
          {
            id: `line-${Date.now()}`,
            itemName: manualForm.itemName || 'Custom Machined Components',
            orderedQuantity: Number(manualForm.orderedQuantity),
            unit: manualForm.unit,
            unitPrice: Number(manualForm.unitPrice),
            totalPrice: Number(manualForm.orderedQuantity) * Number(manualForm.unitPrice),
          },
        ],
      };

      const res = await fetch('/v1/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowManualModal(false);
        fetchPOs();
      }
    } catch (err) {
      console.error('Error creating manual PO:', err);
    }
  };

  const handleSubmitForApproval = async (poId: string) => {
    try {
      const res = await fetch(`/v1/purchase-orders/${poId}/submit`, { method: 'POST' });
      if (res.ok) fetchPOs();
    } catch (err) {
      console.error('Error submitting PO:', err);
    }
  };

  const handleApprovePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const res = await fetch('/v1/purchase-orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPO.id,
          approverName: approveForm.approverName,
          role: approveForm.role,
          notes: approveForm.notes,
        }),
      });
      if (res.ok) {
        setShowApproveModal(false);
        fetchPOs();
      }
    } catch (err) {
      console.error('Error approving PO:', err);
    }
  };

  const handleIssuePO = async (poId: string) => {
    try {
      const res = await fetch(`/v1/purchase-orders/${poId}/issue`, { method: 'POST' });
      if (res.ok) fetchPOs();
    } catch (err) {
      console.error('Error issuing PO:', err);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const targetLine = selectedPO.lineItems[0];
      const res = await fetch('/v1/purchase-orders/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId: selectedPO.id,
          lineItemId: scheduleForm.lineItemId || (targetLine ? targetLine.id : 'line-1'),
          itemName: scheduleForm.itemName || (targetLine ? targetLine.itemName : 'General Line Item'),
          expectedDate: scheduleForm.expectedDate || '2026-08-30',
          quantity: Number(scheduleForm.quantity),
          destinationAddress: scheduleForm.destinationAddress,
        }),
      });
      if (res.ok) {
        setShowScheduleModal(false);
        fetchPOs();
      }
    } catch (err) {
      console.error('Error adding schedule:', err);
    }
  };

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const res = await fetch('/v1/purchase-orders/shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId: selectedPO.id,
          carrier: shipmentForm.carrier,
          trackingNumber: shipmentForm.trackingNumber,
          dispatchedDate: shipmentForm.dispatchedDate,
          estimatedArrival: shipmentForm.estimatedArrival,
          notes: shipmentForm.notes,
        }),
      });
      if (res.ok) {
        setShowShipmentModal(false);
        fetchPOs();
      }
    } catch (err) {
      console.error('Error adding shipment:', err);
    }
  };

  const handleRecordGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    const targetLine = selectedPO.lineItems.find(l => l.id === grnForm.lineItemId) || selectedPO.lineItems[0];
    if (!targetLine) return;

    try {
      const res = await fetch('/v1/purchase-orders/goods-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId: selectedPO.id,
          receivedBy: grnForm.receivedBy,
          overallNotes: grnForm.overallNotes,
          items: [
            {
              lineItemId: targetLine.id,
              quantityReceived: Number(grnForm.quantityReceived),
              discrepancyType: grnForm.discrepancyType,
              conditionNotes: grnForm.conditionNotes,
            },
          ],
        }),
      });
      if (res.ok) {
        setShowGRNModal(false);
        fetchPOs();
      }
    } catch (err) {
      console.error('Error recording GRN:', err);
    }
  };

  const handleRevisePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const updatedLineItems = selectedPO.lineItems.map(l => {
        const qty = revisionForm.newQuantity > 0 ? Number(revisionForm.newQuantity) : l.orderedQuantity;
        const price = revisionForm.newUnitPrice > 0 ? Number(revisionForm.newUnitPrice) : l.unitPrice;
        return {
          ...l,
          orderedQuantity: qty,
          unitPrice: price,
          totalPrice: qty * price,
        };
      });

      const res = await fetch('/v1/purchase-orders/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId: selectedPO.id,
          revisedBy: revisionForm.revisedBy,
          reason: revisionForm.reason,
          updatedLineItems,
        }),
      });
      if (res.ok) {
        setShowRevisionModal(false);
        fetchPOs();
      }
    } catch (err) {
      console.error('Error revising PO:', err);
    }
  };

  const handleClosePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      const res = await fetch('/v1/purchase-orders/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId: selectedPO.id,
          reason: closeReason,
        }),
      });
      if (res.ok) {
        setShowCloseModal(false);
        fetchPOs();
      }
    } catch (err) {
      console.error('Error closing PO:', err);
    }
  };

  const filteredPOs = pos.filter(po => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.awardId && po.awardId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold border border-slate-700">DRAFT</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-semibold border border-amber-500/30">PENDING APPROVAL</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">APPROVED</span>;
      case 'ISSUED':
        return <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/30">ISSUED</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-semibold border border-purple-500/30">IN TRANSIT</span>;
      case 'PARTIALLY_RECEIVED':
        return <span className="px-2.5 py-1 bg-teal-500/10 text-teal-400 rounded-full text-xs font-semibold border border-teal-500/30">PARTIAL RECEIPT</span>;
      case 'FULLY_RECEIVED':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30 font-mono">FULLY RECEIVED</span>;
      case 'REVISED':
        return <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded-full text-xs font-semibold border border-sky-500/30">REVISED (v2+)</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-semibold border border-slate-600">CLOSED</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Purchase Order Management</h1>
              <p className="text-xs text-slate-400">
                Generate POs from sourcing awards or manually, track delivery schedules, shipments, and GRN discrepancies.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual PO</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search PO #, supplier, or award ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ISSUED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CLOSED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PO Master List (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Purchase Orders ({filteredPOs.length})</h2>
            <span className="text-xs text-slate-500">Live DB Stream</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading Purchase Orders...</div>
          ) : filteredPOs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No purchase orders found.</div>
          ) : (
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredPOs.map(po => {
                const isSelected = selectedPO?.id === po.id;
                return (
                  <div
                    key={po.id}
                    onClick={() => setSelectedPO(po)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/80 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-bold text-white">{po.poNumber}</span>
                          <span className="text-xs text-slate-500 font-mono">v{po.version}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-medium text-slate-300">{po.supplierName}</span>
                        </div>
                      </div>
                      <div>{getStatusBadge(po.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Total Value</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {po.currency} {po.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Line Items</span>
                        <span className="text-slate-300 font-medium">{po.lineItems.length} items</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected PO Details Workspace (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedPO ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Header & Quick Action Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-bold text-white font-mono">{selectedPO.poNumber}</h2>
                    {getStatusBadge(selectedPO.status)}
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">v{selectedPO.version}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Created on {new Date(selectedPO.createdAt).toLocaleDateString()} &bull; Award: {selectedPO.awardId || 'Manual Direct'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedPO.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmitForApproval(selectedPO.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Approval</span>
                    </button>
                  )}

                  {selectedPO.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => setShowApproveModal(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve PO</span>
                    </button>
                  )}

                  {selectedPO.status === 'APPROVED' && (
                    <button
                      onClick={() => handleIssuePO(selectedPO.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Issue to Supplier</span>
                    </button>
                  )}

                  {(selectedPO.status === 'ISSUED' || selectedPO.status === 'IN_TRANSIT' || selectedPO.status === 'PARTIALLY_RECEIVED') && (
                    <>
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>Schedule</span>
                      </button>

                      <button
                        onClick={() => setShowShipmentModal(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5"
                      >
                        <Truck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Shipment</span>
                      </button>

                      <button
                        onClick={() => {
                          setGrnForm({ ...grnForm, lineItemId: selectedPO.lineItems[0]?.id || '' });
                          setShowGRNModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Goods Receipt (GRN)</span>
                      </button>
                    </>
                  )}

                  {selectedPO.status !== 'CLOSED' && selectedPO.status !== 'CANCELLED' && (
                    <button
                      onClick={() => setShowRevisionModal(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Revise</span>
                    </button>
                  )}

                  {selectedPO.status !== 'CLOSED' && (
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-lg text-xs font-medium flex items-center space-x-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Close PO</span>
                    </button>
                  )}
                </div>
              </div>

              {/* General Order Information Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">Supplier</span>
                  <span className="text-white font-medium">{selectedPO.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Terms</span>
                  <span className="text-slate-300 font-mono">{selectedPO.paymentTerms}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Incoterm</span>
                  <span className="text-slate-300">{selectedPO.incoterm}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Amount</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {selectedPO.currency} {selectedPO.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4 text-emerald-400" />
                  <span>Line Items & Fulfillment Status</span>
                </h3>
                <div className="border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Item Name</th>
                        <th className="p-3">Ordered</th>
                        <th className="p-3">Received</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
                      {selectedPO.lineItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-sans font-medium text-white">{item.itemName}</td>
                          <td className="p-3">
                            {item.orderedQuantity} {item.unit}
                          </td>
                          <td className="p-3">
                            {item.receivedQuantity} {item.unit}
                          </td>
                          <td className="p-3">{selectedPO.currency} {item.unitPrice.toLocaleString()}</td>
                          <td className="p-3 text-emerald-400 font-bold">{selectedPO.currency} {item.totalPrice.toLocaleString()}</td>
                          <td className="p-3 font-sans">
                            {item.deliveryStatus === 'COMPLETED' && <span className="text-emerald-400 font-semibold">Completed</span>}
                            {item.deliveryStatus === 'PARTIAL' && <span className="text-teal-400 font-semibold">Partial ({item.receivedQuantity}/{item.orderedQuantity})</span>}
                            {item.deliveryStatus === 'OVER_DELIVERED' && <span className="text-purple-400 font-semibold">Over-delivered (+{item.receivedQuantity - item.orderedQuantity})</span>}
                            {item.deliveryStatus === 'UNDER_DELIVERED' && <span className="text-amber-400 font-semibold">Under-delivered</span>}
                            {item.deliveryStatus === 'PENDING' && <span className="text-slate-500">Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Schedules Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Delivery Schedules ({selectedPO.deliverySchedules.length})</span>
                </h3>
                {selectedPO.deliverySchedules.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs text-slate-500 italic">
                    No delivery schedules logged yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedPO.deliverySchedules.map(sched => (
                      <div key={sched.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-white block">{sched.itemName}</span>
                          <span className="text-slate-400 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{sched.destinationAddress}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-blue-400 font-mono font-semibold block">{sched.quantity} units</span>
                          <span className="text-slate-500 text-[10px]">Expected: {sched.expectedDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shipment Tracking Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-purple-400" />
                  <span>Shipment Tracking & Transit Log ({selectedPO.shipments.length})</span>
                </h3>
                {selectedPO.shipments.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs text-slate-500 italic">
                    No shipments dispatched yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedPO.shipments.map(ship => (
                      <div key={ship.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white flex items-center space-x-2">
                            <span>{ship.carrier}</span>
                            <span className="text-slate-400 font-mono text-[11px]">({ship.trackingNumber})</span>
                          </span>
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded text-[10px] font-semibold">
                            {ship.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{ship.notes}</p>
                        <div className="text-slate-500 text-[10px] flex space-x-4 pt-1 font-mono">
                          <span>Dispatched: {ship.dispatchedDate}</span>
                          <span>ETA: {ship.estimatedArrival}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Goods Receipts (GRN) Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  <span>Goods Receipts / GRN Audits ({selectedPO.goodsReceipts.length})</span>
                </h3>
                {selectedPO.goodsReceipts.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs text-slate-500 italic">
                    No goods receipts recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedPO.goodsReceipts.map(grn => (
                      <div key={grn.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-emerald-400">{grn.grnNumber}</span>
                          <span className="text-slate-400 text-[10px]">{new Date(grn.receivedDate).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{grn.overallNotes}</p>
                        <div className="border-t border-slate-800/80 pt-2 space-y-1">
                          {grn.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] font-mono text-slate-400">
                              <span>Received Qty: {it.quantityReceived}</span>
                              <span className={it.discrepancyType === 'OVER' ? 'text-purple-400' : it.discrepancyType === 'UNDER' ? 'text-amber-400' : 'text-slate-300'}>
                                Discrepancy: {it.discrepancyType}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Revision History Section */}
              {selectedPO.revisionHistory.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                    <span>Revision History ({selectedPO.revisionHistory.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedPO.revisionHistory.map((rev, i) => (
                      <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1 font-mono">
                        <div className="flex justify-between text-sky-400 font-bold">
                          <span>Version {rev.version}</span>
                          <span className="text-slate-500 text-[10px]">{new Date(rev.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 font-sans">{rev.reason}</p>
                        <div className="text-[10px] text-slate-400 flex space-x-3">
                          <span>Revised by: {rev.revisedBy}</span>
                          <span>Amount: {selectedPO.currency} {rev.previousAmount.toLocaleString()} &rarr; {rev.newAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
              Select a purchase order from the list to view full fulfillment details.
            </div>
          )}
        </div>
      </div>

      {/* Manual PO Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create Manual Purchase Order</span>
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualPO} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">PO Number (Optional auto-gen)</label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-9001"
                  value={manualForm.poNumber}
                  onChange={e => setManualForm({ ...manualForm, poNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Supplier legal entity"
                    value={manualForm.supplierName}
                    onChange={e => setManualForm({ ...manualForm, supplierName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Currency</label>
                  <select
                    value={manualForm.currency}
                    onChange={e => setManualForm({ ...manualForm, currency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={manualForm.paymentTerms}
                    onChange={e => setManualForm({ ...manualForm, paymentTerms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Incoterms</label>
                  <input
                    type="text"
                    value={manualForm.incoterm}
                    onChange={e => setManualForm({ ...manualForm, incoterm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <span className="text-slate-300 font-semibold block">Primary Line Item</span>
                <div>
                  <label className="text-slate-400 block mb-1">Item Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stainless Steel Fasteners"
                    value={manualForm.itemName}
                    onChange={e => setManualForm({ ...manualForm, itemName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      value={manualForm.orderedQuantity}
                      onChange={e => setManualForm({ ...manualForm, orderedQuantity: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Unit</label>
                    <input
                      type="text"
                      value={manualForm.unit}
                      onChange={e => setManualForm({ ...manualForm, unit: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Unit Price</label>
                    <input
                      type="number"
                      required
                      value={manualForm.unitPrice}
                      onChange={e => setManualForm({ ...manualForm, unitPrice: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve PO Modal */}
      {showApproveModal && selectedPO && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Approve Purchase Order ({selectedPO.poNumber})</span>
              </h3>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApprovePO} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Approver Name</label>
                <input
                  type="text"
                  required
                  value={approveForm.approverName}
                  onChange={e => setApproveForm({ ...approveForm, approverName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Role / Authority Level</label>
                <input
                  type="text"
                  required
                  value={approveForm.role}
                  onChange={e => setApproveForm({ ...approveForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Approval Notes</label>
                <textarea
                  rows={3}
                  value={approveForm.notes}
                  onChange={e => setApproveForm({ ...approveForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg">
                  Confirm Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Schedule Modal */}
      {showScheduleModal && selectedPO && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Add Delivery Schedule</span>
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  required
                  value={scheduleForm.expectedDate}
                  onChange={e => setScheduleForm({ ...scheduleForm, expectedDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Quantity Scheduled</label>
                <input
                  type="number"
                  required
                  value={scheduleForm.quantity}
                  onChange={e => setScheduleForm({ ...scheduleForm, quantity: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Destination Address / Plant Dock</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.destinationAddress}
                  onChange={e => setScheduleForm({ ...scheduleForm, destinationAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg">
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Modal */}
      {showShipmentModal && selectedPO && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Log Shipment & Carrier Info</span>
              </h3>
              <button onClick={() => setShowShipmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddShipment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Carrier Name</label>
                <input
                  type="text"
                  required
                  value={shipmentForm.carrier}
                  onChange={e => setShipmentForm({ ...shipmentForm, carrier: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tracking Number / Bill of Lading</label>
                <input
                  type="text"
                  required
                  value={shipmentForm.trackingNumber}
                  onChange={e => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Dispatched Date</label>
                  <input
                    type="date"
                    value={shipmentForm.dispatchedDate}
                    onChange={e => setShipmentForm({ ...shipmentForm, dispatchedDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estimated Arrival</label>
                  <input
                    type="date"
                    value={shipmentForm.estimatedArrival}
                    onChange={e => setShipmentForm({ ...shipmentForm, estimatedArrival: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Notes</label>
                <input
                  type="text"
                  value={shipmentForm.notes}
                  onChange={e => setShipmentForm({ ...shipmentForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg">
                  Save Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goods Receipt (GRN) Modal */}
      {showGRNModal && selectedPO && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>Record Goods Receipt (GRN)</span>
              </h3>
              <button onClick={() => setShowGRNModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordGRN} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Received By (Inspector / Manager)</label>
                <input
                  type="text"
                  required
                  value={grnForm.receivedBy}
                  onChange={e => setGrnForm({ ...grnForm, receivedBy: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Line Item</label>
                <select
                  value={grnForm.lineItemId}
                  onChange={e => setGrnForm({ ...grnForm, lineItemId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                >
                  {selectedPO.lineItems.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.itemName} (Ordered: {l.orderedQuantity}, Received: {l.receivedQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Quantity Received</label>
                  <input
                    type="number"
                    required
                    value={grnForm.quantityReceived}
                    onChange={e => setGrnForm({ ...grnForm, quantityReceived: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Discrepancy Category</label>
                  <select
                    value={grnForm.discrepancyType}
                    onChange={e => setGrnForm({ ...grnForm, discrepancyType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="NONE">NONE (Standard)</option>
                    <option value="OVER">OVER DELIVERY</option>
                    <option value="UNDER">UNDER DELIVERY</option>
                    <option value="DAMAGED">DAMAGED ITEMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Overall Inspection Notes</label>
                <textarea
                  rows={2}
                  value={grnForm.overallNotes}
                  onChange={e => setGrnForm({ ...grnForm, overallNotes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGRNModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg">
                  Submit Goods Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedPO && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <span>Issue Formal PO Revision</span>
              </h3>
              <button onClick={() => setShowRevisionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRevisePO} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Revised By</label>
                <input
                  type="text"
                  required
                  value={revisionForm.revisedBy}
                  onChange={e => setRevisionForm({ ...revisionForm, revisedBy: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Revision Justification Reason</label>
                <textarea
                  rows={2}
                  required
                  value={revisionForm.reason}
                  onChange={e => setRevisionForm({ ...revisionForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg">
                  Confirm Revision (v{selectedPO.version + 1})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close PO Modal */}
      {showCloseModal && selectedPO && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Close Purchase Order</span>
              </h3>
              <button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleClosePO} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Closure Reason</label>
                <textarea
                  rows={3}
                  required
                  value={closeReason}
                  onChange={e => setCloseReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg">
                  Confirm PO Closure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
