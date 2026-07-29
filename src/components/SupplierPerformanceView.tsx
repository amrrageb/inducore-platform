import React, { useState, useEffect } from 'react';
import {
  Award,
  AlertTriangle,
  Ban,
  Star,
  TrendingUp,
  Search,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Building2,
  Clock,
  ChevronRight,
  Plus,
  X,
  ShieldAlert,
  BarChart3,
  History,
} from 'lucide-react';

export interface PerformanceMetricsBreakdown {
  defectPpm: number;
  onTimeDeliveryPct: number;
  costVariancePct: number;
  avgResponseHours: number;
  auditCompliancePct: number;
}

export interface HistoricalTrendPoint {
  id: string;
  period: string;
  qualityScore: number;
  deliveryScore: number;
  costScore: number;
  responsivenessScore: number;
  overallScore: number;
  recordedAt: string;
  notes?: string;
}

export interface BlacklistRecord {
  isBlacklisted: boolean;
  reason?: string;
  blacklistedAt?: string;
  blacklistedBy?: string;
}

export interface PreferredStatusRecord {
  isPreferred: boolean;
  preferredSince?: string;
  preferredCategory?: string;
  approvedBy?: string;
}

export interface SupplierScorecard {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  qualityScore: number;
  deliveryScore: number;
  costScore: number;
  responsivenessScore: number;
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tier: 'PREFERRED' | 'STANDARD' | 'UNDER_REVIEW' | 'BLACKLISTED';
  metrics: PerformanceMetricsBreakdown;
  blacklist: BlacklistRecord;
  preferredStatus: PreferredStatusRecord;
  historicalTrends: HistoricalTrendPoint[];
  lastEvaluatedAt: string;
  evaluatedBy: string;
}

export interface KPIDashboardSummary {
  totalSuppliersCount: number;
  preferredSuppliersCount: number;
  blacklistedSuppliersCount: number;
  underReviewSuppliersCount: number;
  avgQualityScore: number;
  avgDeliveryScore: number;
  avgCostScore: number;
  avgResponsivenessScore: number;
  avgOverallScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export const SupplierPerformanceView: React.FC = () => {
  const [scorecards, setScorecards] = useState<SupplierScorecard[]>([]);
  const [kpiSummary, setKpiSummary] = useState<KPIDashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const [selectedScorecard, setSelectedScorecard] = useState<SupplierScorecard | null>(null);
  const [showBlacklistModal, setShowBlacklistModal] = useState<boolean>(false);
  const [blacklistReason, setBlacklistReason] = useState<string>('');
  const [blacklistedBy, setBlacklistedBy] = useState<string>('Quality Assurance Board');

  const [showUpdateScoresModal, setShowUpdateScoresModal] = useState<boolean>(false);
  const [editQuality, setEditQuality] = useState<number>(90);
  const [editDelivery, setEditDelivery] = useState<number>(90);
  const [editCost, setEditCost] = useState<number>(90);
  const [editResponsiveness, setEditResponsiveness] = useState<number>(90);
  const [evaluatorName, setEvaluatorName] = useState<string>('Lead Supplier Quality Engineer');

  const [showAddTrendModal, setShowAddTrendModal] = useState<boolean>(false);
  const [trendPeriod, setTrendPeriod] = useState<string>('Q2 2026');
  const [trendNotes, setTrendNotes] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'SCORECARDS' | 'KPIS' | 'TRENDS'>('SCORECARDS');

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const [scorecardsRes, kpiRes] = await Promise.all([
        fetch('/v1/performance'),
        fetch('/v1/performance/kpi-summary'),
      ]);

      const scorecardsData = await scorecardsRes.json();
      const kpiData = await kpiRes.json();

      if (scorecardsData.success) {
        setScorecards(scorecardsData.data);
      }
      if (kpiData.success) {
        setKpiSummary(kpiData.data);
      }
    } catch (err) {
      console.error('Failed to load supplier performance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const handleTogglePreferred = async (supplierId: string) => {
    try {
      const res = await fetch('/v1/performance/preferred/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          category: 'Strategic Partner',
          approvedBy: 'Procurement Steering Committee',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPerformanceData();
        if (selectedScorecard?.supplierId === supplierId) {
          setSelectedScorecard(data.data);
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to toggle preferred supplier status', err);
    }
  };

  const handleBlacklistSubmit = async () => {
    if (!selectedScorecard || !blacklistReason.trim()) return;
    try {
      const res = await fetch('/v1/performance/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedScorecard.supplierId,
          reason: blacklistReason,
          blacklistedBy: blacklistedBy || 'Quality Assurance Board',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowBlacklistModal(false);
        setBlacklistReason('');
        await fetchPerformanceData();
        setSelectedScorecard(data.data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to blacklist supplier', err);
    }
  };

  const handleRemoveBlacklist = async (supplierId: string) => {
    if (!confirm('Are you sure you want to reinstate this supplier from the blacklist?')) return;
    try {
      const res = await fetch('/v1/performance/blacklist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          removedBy: 'Executive Quality Committee',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPerformanceData();
        if (selectedScorecard?.supplierId === supplierId) {
          setSelectedScorecard(data.data);
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to remove blacklist', err);
    }
  };

  const handleUpdateScoresSubmit = async () => {
    if (!selectedScorecard) return;
    try {
      const res = await fetch('/v1/performance/scores/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedScorecard.supplierId,
          qualityScore: editQuality,
          deliveryScore: editDelivery,
          costScore: editCost,
          responsivenessScore: editResponsiveness,
          evaluatedBy: evaluatorName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowUpdateScoresModal(false);
        await fetchPerformanceData();
        setSelectedScorecard(data.data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to update scores', err);
    }
  };

  const handleRecordTrendSubmit = async () => {
    if (!selectedScorecard || !trendPeriod.trim()) return;
    try {
      const res = await fetch('/v1/performance/trends/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedScorecard.supplierId,
          period: trendPeriod,
          notes: trendNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddTrendModal(false);
        setTrendNotes('');
        await fetchPerformanceData();
        setSelectedScorecard(data.data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to record historical trend', err);
    }
  };

  const filteredScorecards = scorecards.filter((s) => {
    const matchesSearch =
      s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supplierCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
    const matchesRisk = riskFilter === 'ALL' || s.riskLevel === riskFilter;
    return matchesSearch && matchesTier && matchesRisk;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'PREFERRED':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'STANDARD':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'UNDER_REVIEW':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'BLACKLISTED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-semibold';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-sky-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                Supplier Performance Engine
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  Sprint 11
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Automated scorecards, quality & delivery tracking, risk categorization, and preferred supplier governance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPerformanceData}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      {kpiSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Suppliers</span>
              <Building2 className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{kpiSummary.totalSuppliersCount}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-amber-400 font-medium">{kpiSummary.preferredSuppliersCount} Preferred</span>
              <span>•</span>
              <span className="text-rose-400 font-medium">{kpiSummary.blacklistedSuppliersCount} Blacklisted</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Quality Score</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">{kpiSummary.avgQualityScore} <span className="text-sm text-slate-500 font-normal">/ 100</span></div>
            <div className="text-xs text-slate-400 mt-1">Defect PPM & Audit compliance</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Delivery Score</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-400 mt-2">{kpiSummary.avgDeliveryScore} <span className="text-sm text-slate-500 font-normal">/ 100</span></div>
            <div className="text-xs text-slate-400 mt-1">On-Time Delivery adherence</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Cost & Responsiveness</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-2">{kpiSummary.avgCostScore} <span className="text-sm text-slate-500 font-normal">Cost</span></div>
            <div className="text-xs text-slate-400 mt-1">{kpiSummary.avgResponsivenessScore} Avg Responsiveness</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Composite</span>
              <BarChart3 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-2">{kpiSummary.avgOverallScore} <span className="text-sm text-slate-500 font-normal">Avg</span></div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{kpiSummary.riskDistribution.low} Low Risk</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('SCORECARDS')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'SCORECARDS'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Supplier Scorecards ({scorecards.length})
        </button>

        <button
          onClick={() => setActiveTab('KPIS')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'KPIS'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          KPI Analytics Dashboard
        </button>

        <button
          onClick={() => setActiveTab('TRENDS')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'TRENDS'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Historical Trends
        </button>
      </div>

      {/* SCORECARDS TAB */}
      {activeTab === 'SCORECARDS' && (
        <div className="space-y-4">
          {/* Controls & Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search supplier name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">Tier:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="PREFERRED">Preferred</option>
                  <option value="STANDARD">Standard</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="BLACKLISTED">Blacklisted</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Risk:</span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="LOW">Low Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="CRITICAL">Critical Risk</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supplier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScorecards.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedScorecard(s)}
                className={`bg-slate-900/90 border rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer relative group ${
                  s.blacklist.isBlacklisted
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : s.preferredStatus.isPreferred
                    ? 'border-amber-500/30 bg-amber-950/10'
                    : 'border-slate-800/80'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-base group-hover:text-amber-300 transition-colors">
                        {s.supplierName}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{s.supplierCode}</span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${getTierBadge(s.tier)}`}>
                      {s.tier.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getRiskBadge(s.riskLevel)}`}>
                      {s.riskLevel} RISK
                    </span>
                  </div>
                </div>

                {/* Score Summary Grid */}
                <div className="grid grid-cols-4 gap-2 my-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800/60 text-center">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-medium">Quality</div>
                    <div className={`text-sm font-bold ${getScoreColor(s.qualityScore)}`}>{s.qualityScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-medium">Delivery</div>
                    <div className={`text-sm font-bold ${getScoreColor(s.deliveryScore)}`}>{s.deliveryScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-medium">Cost</div>
                    <div className={`text-sm font-bold ${getScoreColor(s.costScore)}`}>{s.costScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-medium">Resp</div>
                    <div className={`text-sm font-bold ${getScoreColor(s.responsivenessScore)}`}>{s.responsivenessScore}</div>
                  </div>
                </div>

                {/* Overall Score Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Composite Overall Score</span>
                    <span className="font-bold text-amber-400">{s.overallScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        s.overallScore >= 90
                          ? 'bg-emerald-500'
                          : s.overallScore >= 80
                          ? 'bg-sky-500'
                          : s.overallScore >= 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${s.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePreferred(s.supplierId);
                    }}
                    disabled={s.blacklist.isBlacklisted}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
                      s.preferredStatus.isPreferred
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    } ${s.blacklist.isBlacklisted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Star className={`w-3.5 h-3.5 ${s.preferredStatus.isPreferred ? 'fill-amber-300 text-amber-300' : ''}`} />
                    {s.preferredStatus.isPreferred ? 'Preferred Supplier' : 'Set Preferred'}
                  </button>

                  <div className="flex items-center gap-2">
                    {s.blacklist.isBlacklisted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBlacklist(s.supplierId);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-medium"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Blacklisted
                      </button>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI DASHBOARD TAB */}
      {activeTab === 'KPIS' && kpiSummary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Distribution Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Performance Category Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Average score evaluation across quality, delivery, cost competitiveness, and inquiry responsiveness.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Quality Score (Defects & Audits)</span>
                    <span className="font-bold text-emerald-400">{kpiSummary.avgQualityScore}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full" style={{ width: `${kpiSummary.avgQualityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Delivery Score (On-Time Delivery)</span>
                    <span className="font-bold text-sky-400">{kpiSummary.avgDeliveryScore}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-sky-500 h-full" style={{ width: `${kpiSummary.avgDeliveryScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Cost Score (Benchmark Competitiveness)</span>
                    <span className="font-bold text-purple-400">{kpiSummary.avgCostScore}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-purple-500 h-full" style={{ width: `${kpiSummary.avgCostScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Responsiveness Score (RFQ Turnaround)</span>
                    <span className="font-bold text-amber-400">{kpiSummary.avgResponsivenessScore}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-amber-500 h-full" style={{ width: `${kpiSummary.avgResponsivenessScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Distribution Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Supplier Risk Categorization
              </h3>
              <p className="text-xs text-slate-400">
                Risk assessment categorization based on overall operational reliability and audit findings.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20">
                  <div className="text-xs text-emerald-400 font-medium">Low Risk</div>
                  <div className="text-2xl font-bold text-white mt-1">{kpiSummary.riskDistribution.low}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Overall score &gt; 90</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/20">
                  <div className="text-xs text-blue-400 font-medium">Medium Risk</div>
                  <div className="text-2xl font-bold text-white mt-1">{kpiSummary.riskDistribution.medium}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Overall score 75 - 89</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20">
                  <div className="text-xs text-amber-400 font-medium">High Risk</div>
                  <div className="text-2xl font-bold text-white mt-1">{kpiSummary.riskDistribution.high}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Overall score 60 - 74</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/20">
                  <div className="text-xs text-rose-400 font-medium">Critical Risk</div>
                  <div className="text-2xl font-bold text-white mt-1">{kpiSummary.riskDistribution.critical}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Blacklisted / Score &lt; 60</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL TRENDS TAB */}
      {activeTab === 'TRENDS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              Historical Performance Snapshots Across Suppliers
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Quarterly performance evolutions recorded across supplier evaluations.
            </p>
          </div>

          <div className="space-y-4">
            {scorecards.map((s) => (
              <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{s.supplierName}</span>
                    <span className="text-xs font-mono text-slate-500">({s.supplierCode})</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getTierBadge(s.tier)}`}>
                    {s.tier}
                  </span>
                </div>

                {s.historicalTrends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {s.historicalTrends.map((t) => (
                      <div key={t.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-amber-300 font-medium">{t.period}</span>
                          <span className="font-bold text-white">Overall: {t.overallScore}%</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-400 text-center bg-slate-950/60 py-1 rounded">
                          <div>Q: <span className="text-emerald-400 font-semibold">{t.qualityScore}</span></div>
                          <div>D: <span className="text-sky-400 font-semibold">{t.deliveryScore}</span></div>
                          <div>C: <span className="text-purple-400 font-semibold">{t.costScore}</span></div>
                          <div>R: <span className="text-amber-400 font-semibold">{t.responsivenessScore}</span></div>
                        </div>
                        {t.notes && <p className="text-[11px] text-slate-400 italic line-clamp-2">{t.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">No historical snapshots recorded yet.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCORECARD DRAWER / DETAILS MODAL */}
      {selectedScorecard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Supplier Scorecard</span>
                <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                  {selectedScorecard.supplierName}
                  {selectedScorecard.preferredStatus.isPreferred && (
                    <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  )}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="font-mono text-slate-300">{selectedScorecard.supplierCode}</span>
                  <span>•</span>
                  <span>Evaluated by: {selectedScorecard.evaluatedBy}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedScorecard(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Blacklist Warning Banner if applicable */}
            {selectedScorecard.blacklist.isBlacklisted && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 space-y-2 text-rose-200">
                <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
                  <Ban className="w-4 h-4" />
                  Supplier is Blacklisted
                </div>
                <p className="text-xs text-rose-300/90">{selectedScorecard.blacklist.reason}</p>
                <div className="text-[10px] font-mono text-rose-400/70 pt-1">
                  Enforced on: {selectedScorecard.blacklist.blacklistedAt} by {selectedScorecard.blacklist.blacklistedBy}
                </div>
              </div>
            )}

            {/* Overall Composite Card */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Composite Scorecard Index</div>
                  <div className="text-3xl font-bold text-amber-300 mt-1">{selectedScorecard.overallScore} <span className="text-sm font-normal text-slate-500">/ 100</span></div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border ${getTierBadge(selectedScorecard.tier)}`}>
                    {selectedScorecard.tier}
                  </span>
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border ${getRiskBadge(selectedScorecard.riskLevel)}`}>
                    {selectedScorecard.riskLevel} RISK
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setEditQuality(selectedScorecard.qualityScore);
                    setEditDelivery(selectedScorecard.deliveryScore);
                    setEditCost(selectedScorecard.costScore);
                    setEditResponsiveness(selectedScorecard.responsivenessScore);
                    setShowUpdateScoresModal(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Update Evaluation Scores
                </button>

                <button
                  onClick={() => setShowAddTrendModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record Trend Snapshot
                </button>
              </div>
            </div>

            {/* Score Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Quality Score</span>
                  <span className="font-bold text-emerald-400">{selectedScorecard.qualityScore}</span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  Defect PPM: <span className="font-bold text-white">{selectedScorecard.metrics.defectPpm}</span>
                </div>
                <div className="text-[11px] text-slate-400">Audit Compliance: {selectedScorecard.metrics.auditCompliancePct}%</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Delivery Score</span>
                  <span className="font-bold text-sky-400">{selectedScorecard.deliveryScore}</span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  On-Time Delivery: <span className="font-bold text-white">{selectedScorecard.metrics.onTimeDeliveryPct}%</span>
                </div>
                <div className="text-[11px] text-slate-400">Logistics reliability</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Cost Score</span>
                  <span className="font-bold text-purple-400">{selectedScorecard.costScore}</span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  Variance vs Benchmark: <span className="font-bold text-white">{selectedScorecard.metrics.costVariancePct}%</span>
                </div>
                <div className="text-[11px] text-slate-400">Competitive pricing</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Responsiveness</span>
                  <span className="font-bold text-amber-400">{selectedScorecard.responsivenessScore}</span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  Avg RFQ Response: <span className="font-bold text-white">{selectedScorecard.metrics.avgResponseHours} hrs</span>
                </div>
                <div className="text-[11px] text-slate-400">Commercial communication</div>
              </div>
            </div>

            {/* Historical Trend Timeline for selected supplier */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Historical Trend Timeline ({selectedScorecard.historicalTrends.length})
              </h4>

              <div className="space-y-2">
                {selectedScorecard.historicalTrends.map((t) => (
                  <div key={t.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-300">{t.period}</div>
                      {t.notes && <div className="text-[11px] text-slate-400 mt-0.5">{t.notes}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{t.overallScore} / 100</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Q:{t.qualityScore} D:{t.deliveryScore} C:{t.costScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {selectedScorecard.blacklist.isBlacklisted ? (
                <button
                  onClick={() => handleRemoveBlacklist(selectedScorecard.supplierId)}
                  className="px-4 py-2 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg hover:bg-rose-500/30 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Reinstate from Blacklist
                </button>
              ) : (
                <button
                  onClick={() => setShowBlacklistModal(true)}
                  className="px-4 py-2 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Blacklist Supplier
                </button>
              )}

              <button
                onClick={() => handleTogglePreferred(selectedScorecard.supplierId)}
                disabled={selectedScorecard.blacklist.isBlacklisted}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border flex items-center gap-2 ${
                  selectedScorecard.preferredStatus.isPreferred
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Star className={`w-4 h-4 ${selectedScorecard.preferredStatus.isPreferred ? 'fill-amber-300 text-amber-300' : ''}`} />
                {selectedScorecard.preferredStatus.isPreferred ? 'Remove Preferred Status' : 'Grant Preferred Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLACKLIST MODAL */}
      {showBlacklistModal && selectedScorecard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Blacklist Supplier: {selectedScorecard.supplierName}
              </h3>
              <button onClick={() => setShowBlacklistModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Blacklisting will freeze RFQ participation, halt award grants, and flag this supplier as CRITICAL risk across all procurement portals.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Reason for Blacklisting</label>
                <textarea
                  rows={3}
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  placeholder="e.g. Failure to comply with ISO safety specs or repeated critical defect rate..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Authorizing Body / Auditor</label>
                <input
                  type="text"
                  value={blacklistedBy}
                  onChange={(e) => setBlacklistedBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBlacklistSubmit}
                disabled={!blacklistReason.trim()}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg disabled:opacity-50"
              >
                Confirm Blacklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE SCORES MODAL */}
      {showUpdateScoresModal && selectedScorecard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Update Scorecard Scores: {selectedScorecard.supplierName}
              </h3>
              <button onClick={() => setShowUpdateScoresModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Quality Score: {editQuality}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editQuality}
                  onChange={(e) => setEditQuality(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Delivery Score: {editDelivery}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editDelivery}
                  onChange={(e) => setEditDelivery(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Cost Score: {editCost}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editCost}
                  onChange={(e) => setEditCost(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Responsiveness Score: {editResponsiveness}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editResponsiveness}
                  onChange={(e) => setEditResponsiveness(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Evaluator Name</label>
                <input
                  type="text"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowUpdateScoresModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateScoresSubmit}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
              >
                Save Evaluation Scores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD TREND MODAL */}
      {showAddTrendModal && selectedScorecard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Record Historical Snapshot: {selectedScorecard.supplierName}
              </h3>
              <button onClick={() => setShowAddTrendModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Evaluation Period</label>
                <input
                  type="text"
                  value={trendPeriod}
                  onChange={(e) => setTrendPeriod(e.target.value)}
                  placeholder="e.g. Q2 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Auditor Notes</label>
                <textarea
                  rows={3}
                  value={trendNotes}
                  onChange={(e) => setTrendNotes(e.target.value)}
                  placeholder="Key observations during this review period..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddTrendModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordTrendSubmit}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
