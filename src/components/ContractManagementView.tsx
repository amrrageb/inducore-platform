import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  History,
  TrendingUp,
  Download,
  Upload,
  PenTool,
  RefreshCw,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  Send,
  Eye,
  Filter,
} from 'lucide-react';
import {
  ContractType,
  ContractStatus,
  ContractAttachment,
  DigitalSignature,
  ContractKPIs,
  ContractVersionLog,
} from '@inducore/core-domain';

export interface ContractData {
  id: string;
  contractNumber: string;
  title: string;
  contractType: ContractType;
  supplierId: string;
  supplierName: string;
  awardId?: string;
  poId?: string;
  status: ContractStatus;
  version: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  noticePeriodDays: number;
  currency: string;
  totalValueCap: number;
  currentSpend: number;
  governingLaw: string;
  attachments: ContractAttachment[];
  signatures: DigitalSignature[];
  kpis: ContractKPIs;
  versionHistory: ContractVersionLog[];
  renewalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export const ContractManagementView: React.FC = () => {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedContract, setSelectedContract] = useState<ContractData | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'versions' | 'signatures' | 'attachments' | 'kpis'>('overview');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);

  // Form states
  const [newContractForm, setNewContractForm] = useState({
    contractNumber: '',
    title: '',
    contractType: 'FRAMEWORK_AGREEMENT' as ContractType,
    supplierId: 'sup-101',
    supplierName: 'Titanium Global Corp',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-12-31',
    autoRenew: true,
    noticePeriodDays: 60,
    currency: 'USD',
    totalValueCap: 2500000,
    governingLaw: 'Delaware, USA',
  });

  const [sigForm, setSigForm] = useState({
    signerName: '',
    signerEmail: '',
    role: 'SUPPLIER' as 'BUYER' | 'SUPPLIER' | 'LEGAL_WITNESS',
  });

  const [renewForm, setRenewForm] = useState({
    newEndDate: '2028-12-31',
    revisedValueCap: 3000000,
    changeSummary: 'Annual contract extension with volume expansion',
    modifiedBy: 'Procurement Director',
    renewalNotes: 'Agreed on 12-month extension with 5% volume discount.',
  });

  const [attachForm, setAttachForm] = useState({
    fileName: '',
    fileSizeKb: 1500,
    uploadedBy: 'Legal Operations',
    fileType: 'application/pdf',
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/v1/contracts');
      const json = await res.json();
      if (json.success && json.data) {
        setContracts(json.data);
        if (json.data.length > 0 && !selectedContract) {
          setSelectedContract(json.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContractForm),
      });
      const json = await res.json();
      if (json.success) {
        await fetchContracts();
        setSelectedContract(json.data);
        setShowCreateModal(false);
        setNewContractForm({
          contractNumber: '',
          title: '',
          contractType: 'FRAMEWORK_AGREEMENT',
          supplierId: 'sup-101',
          supplierName: 'Titanium Global Corp',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '2027-12-31',
          autoRenew: true,
          noticePeriodDays: 60,
          currency: 'USD',
          totalValueCap: 2500000,
          governingLaw: 'Delaware, USA',
        });
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error('Failed to create contract:', err);
    }
  };

  const handleRequestSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    try {
      const res = await fetch('/v1/contracts/signatures/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContract.id,
          ...sigForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedContract(json.data);
        await fetchContracts();
        setShowSignModal(false);
        setSigForm({ signerName: '', signerEmail: '', role: 'SUPPLIER' });
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error('Failed to request signature:', err);
    }
  };

  const handleSignContract = async (signatureId: string, signerName: string) => {
    if (!selectedContract) return;
    try {
      const res = await fetch('/v1/contracts/signatures/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContract.id,
          signatureId,
          signerName,
          ipAddress: '192.168.1.105',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedContract(json.data);
        await fetchContracts();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error('Failed to sign contract:', err);
    }
  };

  const handleInitiateRenewal = async () => {
    if (!selectedContract) return;
    try {
      const res = await fetch('/v1/contracts/renew/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContract.id,
          notes: renewForm.renewalNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedContract(json.data);
        await fetchContracts();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error('Failed to initiate renewal:', err);
    }
  };

  const handleExecuteRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    try {
      const res = await fetch('/v1/contracts/renew/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContract.id,
          newEndDate: renewForm.newEndDate,
          revisedValueCap: Number(renewForm.revisedValueCap),
          changeSummary: renewForm.changeSummary,
          modifiedBy: renewForm.modifiedBy,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedContract(json.data);
        await fetchContracts();
        setShowRenewModal(false);
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error('Failed to execute renewal:', err);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    try {
      const res = await fetch('/v1/contracts/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContract.id,
          fileName: attachForm.fileName,
          fileSizeKb: Number(attachForm.fileSizeKb),
          uploadedBy: attachForm.uploadedBy,
          fileType: attachForm.fileType,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedContract(json.data);
        await fetchContracts();
        setShowAttachModal(false);
        setAttachForm({
          fileName: '',
          fileSizeKb: 1500,
          uploadedBy: 'Legal Operations',
          fileType: 'application/pdf',
        });
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error('Failed to add attachment:', err);
    }
  };

  // Filtering
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || c.contractType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Expiring Soon
          </span>
        );
      case 'UNDER_RENEWAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <RefreshCw className="w-3 h-3" /> Under Renewal
          </span>
        );
      case 'PENDING_SIGNATURE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <PenTool className="w-3 h-3" /> Pending Signature
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3 h-3" /> Draft
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
            <Clock className="w-3 h-3" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: ContractType) => {
    switch (type) {
      case 'FRAMEWORK_AGREEMENT':
        return 'Framework Agreement';
      case 'SUPPLY_CONTRACT':
        return 'Supply Contract';
      case 'MASTER_SERVICES_AGREEMENT':
        return 'Master Services Agreement (MSA)';
      case 'NDA':
        return 'Non-Disclosure Agreement (NDA)';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-indigo-600" /> Contract Management Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Framework agreements, supply contracts, version control, digital signatures & KPI tracking.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Contract
        </button>
      </div>

      {/* Expiry Alerts Header Banner if any contract is expiring soon */}
      {contracts.some((c) => c.status === 'EXPIRING_SOON') && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Expiry Reminder Notice:</span> One or more active contracts are within their notice period and expiring soon. Please review renewal terms or issue extension agreements.
          </div>
        </div>
      )}

      {/* Main Grid: Left List (35%), Right Details (65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search, Filters & Contract Cards */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[820px]">
          {/* Search & Filters */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search contract #, title, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Contract Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="ALL">All Types</option>
                  <option value="FRAMEWORK_AGREEMENT">Framework Agreement</option>
                  <option value="SUPPLY_CONTRACT">Supply Contract</option>
                  <option value="MASTER_SERVICES_AGREEMENT">MSA</option>
                  <option value="NDA">NDA</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRING_SOON">Expiring Soon</option>
                  <option value="UNDER_RENEWAL">Under Renewal</option>
                  <option value="PENDING_SIGNATURE">Pending Signature</option>
                  <option value="DRAFT">Draft</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading contracts...</div>
            ) : filteredContracts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No contracts match criteria.</div>
            ) : (
              filteredContracts.map((contract) => {
                const isSelected = selectedContract?.id === contract.id;
                return (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedContract(contract)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono font-semibold text-indigo-600">
                          {contract.contractNumber}
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm mt-0.5 line-clamp-1">
                          {contract.title}
                        </h3>
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>

                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{contract.supplierName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {contract.startDate} to {contract.endDate}
                        </span>
                        <span className="font-mono text-slate-700 font-medium">
                          ${contract.totalValueCap.toLocaleString()} {contract.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Inspector View */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[820px]">
          {selectedContract ? (
            <div className="flex flex-col h-full">
              {/* Top Banner */}
              <div className="p-6 border-b border-slate-200 bg-slate-900 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
                      <span>{selectedContract.contractNumber}</span>
                      <span>•</span>
                      <span>v{selectedContract.version}.0</span>
                      <span>•</span>
                      <span>{getTypeLabel(selectedContract.contractType)}</span>
                    </div>
                    <h2 className="text-xl font-bold mt-1 text-white">{selectedContract.title}</h2>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium text-slate-100">{selectedContract.supplierName}</span>
                      <span className="text-slate-500">|</span>
                      <span>Governing Law: {selectedContract.governingLaw}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(selectedContract.status)}
                    <span className="text-xs text-slate-400">
                      Created: {new Date(selectedContract.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setShowSignModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5" /> Request Signature
                  </button>

                  {selectedContract.status !== 'UNDER_RENEWAL' && (
                    <button
                      onClick={handleInitiateRenewal}
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Initiate Renewal
                    </button>
                  )}

                  {selectedContract.status === 'UNDER_RENEWAL' && (
                    <button
                      onClick={() => setShowRenewModal(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Execute Renewal & Expand Cap
                    </button>
                  )}

                  <button
                    onClick={() => setShowAttachModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Document
                  </button>
                </div>
              </div>

              {/* Navigation Sub-Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-medium text-slate-600 gap-6">
                <button
                  onClick={() => setActiveSubTab('overview')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeSubTab === 'overview'
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Contract Overview
                </button>
                <button
                  onClick={() => setActiveSubTab('signatures')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeSubTab === 'signatures'
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Digital Signatures ({selectedContract.signatures.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('kpis')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeSubTab === 'kpis'
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> SLA & Contract KPIs
                </button>
                <button
                  onClick={() => setActiveSubTab('versions')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeSubTab === 'versions'
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5" /> Versions & History ({selectedContract.versionHistory.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('attachments')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeSubTab === 'attachments'
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Attachments ({selectedContract.attachments.length})
                </button>
              </div>

              {/* Sub-Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {activeSubTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-xs text-slate-500 font-medium">Contract Value Cap</div>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          ${selectedContract.totalValueCap.toLocaleString()} {selectedContract.currency}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Total Authorized Ceiling</div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-xs text-slate-500 font-medium">Current Cumulative Spend</div>
                        <div className="text-lg font-bold text-indigo-600 mt-1">
                          ${selectedContract.currentSpend.toLocaleString()} {selectedContract.currency}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {((selectedContract.currentSpend / selectedContract.totalValueCap) * 100).toFixed(1)}% of cap consumed
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-xs text-slate-500 font-medium">Notice Period & Renewal</div>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          {selectedContract.noticePeriodDays} Days
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Auto-renew: {selectedContract.autoRenew ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>

                    {/* Spend Progress Bar */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Spend Against Value Cap</span>
                        <span>
                          ${selectedContract.currentSpend.toLocaleString()} / ${selectedContract.totalValueCap.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (selectedContract.currentSpend / selectedContract.totalValueCap) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Renewal Notes if present */}
                    {selectedContract.renewalNotes && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <RefreshCw className="w-4 h-4 text-blue-600" /> Renewal Workflow Notes
                        </div>
                        <p>{selectedContract.renewalNotes}</p>
                      </div>
                    )}

                    {/* Metadata Specs */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
                      <h4 className="font-semibold text-slate-800 uppercase tracking-wider">Contract Terms & Details</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-slate-600">
                        <div>
                          <span className="font-medium text-slate-800">Effective Start Date:</span> {selectedContract.startDate}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Expiration Date:</span> {selectedContract.endDate}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Associated Award ID:</span> {selectedContract.awardId || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Associated Purchase Order:</span> {selectedContract.poId || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Governing Jurisdiction:</span> {selectedContract.governingLaw}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Current Revision:</span> v{selectedContract.version}.0
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'signatures' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" /> Digital Signatures & Audit Trail
                      </h3>
                      <button
                        onClick={() => setShowSignModal(true)}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Request New Signature
                      </button>
                    </div>

                    {selectedContract.signatures.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                        No signature requests registered.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedContract.signatures.map((sig) => (
                          <div
                            key={sig.id}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                {sig.signerName} ({sig.role})
                                {sig.status === 'SIGNED' ? (
                                  <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Signed
                                  </span>
                                ) : (
                                  <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Pending Signature
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500">{sig.signerEmail}</div>
                              {sig.status === 'SIGNED' && (
                                <div className="text-slate-400 font-mono text-[11px] pt-1">
                                  IP: {sig.ipAddress} | Signed: {new Date(sig.signedAt).toLocaleString()} | Hash: {sig.verificationHash}
                                </div>
                              )}
                            </div>

                            {sig.status === 'PENDING' && (
                              <button
                                onClick={() => handleSignContract(sig.id, sig.signerName)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                              >
                                <PenTool className="w-3.5 h-3.5" /> Execute Signature
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSubTab === 'kpis' && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" /> Contract Performance & SLA KPIs
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="text-xs text-slate-500">SLA Adherence Score</div>
                        <div className="text-2xl font-extrabold text-emerald-600">
                          {selectedContract.kpis.slaAdherenceScorePct}%
                        </div>
                        <div className="text-[11px] text-slate-400">Target SLA: &ge; 95.0%</div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="text-xs text-slate-500">Quality Inspection Pass Rate</div>
                        <div className="text-2xl font-extrabold text-indigo-600">
                          {selectedContract.kpis.qualityPassRatePct}%
                        </div>
                        <div className="text-[11px] text-slate-400">Target Quality: &ge; 98.0%</div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="text-xs text-slate-500">On-Time Delivery Rate</div>
                        <div className="text-2xl font-extrabold text-slate-800">
                          {selectedContract.kpis.onTimeDeliveryRatePct}%
                        </div>
                        <div className="text-[11px] text-slate-400">Target On-Time: &ge; 95.0%</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'versions' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-indigo-600" /> Contract Version & Audit History
                    </h3>

                    <div className="space-y-3">
                      {selectedContract.versionHistory.map((ver) => (
                        <div key={ver.version} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>Version {ver.version}.0</span>
                            <span className="text-slate-400 font-normal">
                              Effective: {ver.effectiveDate} ({new Date(ver.timestamp).toLocaleDateString()})
                            </span>
                          </div>
                          <p className="text-slate-600">{ver.changeSummary}</p>
                          <div className="text-[11px] text-slate-400 pt-1">Modified By: {ver.modifiedBy}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSubTab === 'attachments' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" /> Executed Contract Documents & Attachments
                      </h3>
                      <button
                        onClick={() => setShowAttachModal(true)}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload File
                      </button>
                    </div>

                    {selectedContract.attachments.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                        No contract documents uploaded.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedContract.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-indigo-600" />
                              <div>
                                <div className="font-semibold text-slate-800">{att.fileName}</div>
                                <div className="text-slate-400 text-[11px]">
                                  {att.fileSizeKb} KB • Uploaded by {att.uploadedBy} on {new Date(att.uploadedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => alert(`Simulating download of ${att.fileName}`)}
                              className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-200 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a contract from the list to view detailed specifications.</div>
          )}
        </div>
      </div>

      {/* Modal: Create Contract */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" /> Create New Contract
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contract Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FA-2026-9901"
                  value={newContractForm.contractNumber}
                  onChange={(e) => setNewContractForm({ ...newContractForm, contractNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contract Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Titanium Alloys Framework Agreement"
                  value={newContractForm.title}
                  onChange={(e) => setNewContractForm({ ...newContractForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contract Type</label>
                  <select
                    value={newContractForm.contractType}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contractType: e.target.value as ContractType })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="FRAMEWORK_AGREEMENT">Framework Agreement</option>
                    <option value="SUPPLY_CONTRACT">Supply Contract</option>
                    <option value="MASTER_SERVICES_AGREEMENT">Master Services Agreement</option>
                    <option value="NDA">NDA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={newContractForm.supplierName}
                    onChange={(e) => setNewContractForm({ ...newContractForm, supplierName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.startDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.endDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Value Cap ($)</label>
                  <input
                    type="number"
                    required
                    value={newContractForm.totalValueCap}
                    onChange={(e) => setNewContractForm({ ...newContractForm, totalValueCap: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notice Period (Days)</label>
                  <input
                    type="number"
                    required
                    value={newContractForm.noticePeriodDays}
                    onChange={(e) => setNewContractForm({ ...newContractForm, noticePeriodDays: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={newContractForm.autoRenew}
                  onChange={(e) => setNewContractForm({ ...newContractForm, autoRenew: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="autoRenew" className="font-medium text-slate-700">
                  Enable Automatic Contract Renewal
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Create Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Signature */}
      {showSignModal && selectedContract && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-400" /> Request Digital Signature
              </h3>
              <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSignature} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Signer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={sigForm.signerName}
                  onChange={(e) => setSigForm({ ...sigForm, signerName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Signer Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. erostova@vortexfluid.com"
                  value={sigForm.signerEmail}
                  onChange={(e) => setSigForm({ ...sigForm, signerEmail: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role / Party</label>
                <select
                  value={sigForm.role}
                  onChange={(e) => setSigForm({ ...sigForm, role: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="BUYER">Buyer Representative</option>
                  <option value="SUPPLIER">Supplier Representative</option>
                  <option value="LEGAL_WITNESS">Legal Witness</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Execute Renewal */}
      {showRenewModal && selectedContract && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-400" /> Execute Contract Renewal
              </h3>
              <button onClick={() => setShowRenewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteRenewal} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Expiration Date</label>
                <input
                  type="date"
                  required
                  value={renewForm.newEndDate}
                  onChange={(e) => setRenewForm({ ...renewForm, newEndDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Revised Value Cap ($)</label>
                <input
                  type="number"
                  required
                  value={renewForm.revisedValueCap}
                  onChange={(e) => setRenewForm({ ...renewForm, revisedValueCap: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Revision Change Summary</label>
                <input
                  type="text"
                  required
                  value={renewForm.changeSummary}
                  onChange={(e) => setRenewForm({ ...renewForm, changeSummary: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modified By</label>
                <input
                  type="text"
                  required
                  value={renewForm.modifiedBy}
                  onChange={(e) => setRenewForm({ ...renewForm, modifiedBy: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Execute Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Attachment */}
      {showAttachModal && selectedContract && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" /> Upload Document Attachment
              </h3>
              <button onClick={() => setShowAttachModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAttachment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amendment_1_Price_Adjustment.pdf"
                  value={attachForm.fileName}
                  onChange={(e) => setAttachForm({ ...attachForm, fileName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uploaded By</label>
                <input
                  type="text"
                  required
                  value={attachForm.uploadedBy}
                  onChange={(e) => setAttachForm({ ...attachForm, uploadedBy: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAttachModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
