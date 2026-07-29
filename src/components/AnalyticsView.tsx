import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Users,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ProcurementKPIs {
  totalSpendYTD: number;
  totalSavingsYTD: number;
  savingsPercentageYTD: number;
  activeContractsCount: number;
  contractComplianceRate: number;
  supplierOnTimeDeliveryRate: number;
  supplierQualityPassRate: number;
  avgProcurementLeadTimeDays: number;
}

interface RFQAnalyticsSummary {
  totalRFQsIssued: number;
  awardedCount: number;
  cancelledCount: number;
  avgBidsPerRFQ: number;
  avgCycleTimeDays: number;
  totalEstimatedValue: number;
  totalAwardedValue: number;
  bidYieldRate: number;
}

interface CategorySpend {
  category: string;
  actualSpend: number;
  budget: number;
  savings: number;
  percentageOfTotal: number;
}

interface SupplierSpend {
  supplierId: string;
  supplierName: string;
  spend: number;
  contractCount: number;
  onTimeDeliveryRate: number;
  qualityComplianceRate: number;
}

interface CostSavingsMonth {
  month: string;
  negotiatedSavings: number;
  volumeRebateSavings: number;
  processOptimizationSavings: number;
  totalSavings: number;
  targetSavings: number;
}

interface AnalyticsSnapshot {
  id: string;
  tenantId: string;
  snapshotDate: string;
  timeframe: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'YTD' | 'TRAILING_12M';
  kpis: ProcurementKPIs;
  rfqAnalytics: RFQAnalyticsSummary;
  categorySpends: CategorySpend[];
  topSupplierSpends: SupplierSpend[];
  costSavingsTrends: CostSavingsMonth[];
  updatedAt: string;
}

interface ScheduledReport {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  reportType: 'EXECUTIVE_SUMMARY' | 'PROCUREMENT_KPIS' | 'SUPPLIER_PERFORMANCE' | 'COST_SAVINGS' | 'SPEND_ANALYSIS';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  format: 'EXCEL' | 'PDF' | 'CSV';
  recipients: string[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdBy: string;
  createdAt: string;
}

const CATEGORY_COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'];

export const AnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'SPEND' | 'SAVINGS' | 'SUPPLIERS' | 'RFQ' | 'REPORTS'>('EXECUTIVE');
  const [timeframe, setTimeframe] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'YTD' | 'TRAILING_12M'>('YTD');
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal states for export & schedule
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'EXCEL' | 'PDF' | 'CSV'>('EXCEL');
  const [exportReportType, setExportReportType] = useState<ScheduledReport['reportType']>('EXECUTIVE_SUMMARY');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState<boolean>(false);
  const [newScheduleName, setNewScheduleName] = useState<string>('');
  const [newScheduleDesc, setNewScheduleDesc] = useState<string>('');
  const [newScheduleType, setNewScheduleType] = useState<ScheduledReport['reportType']>('EXECUTIVE_SUMMARY');
  const [newScheduleFreq, setNewScheduleFreq] = useState<ScheduledReport['frequency']>('WEEKLY');
  const [newScheduleFormat, setNewScheduleFormat] = useState<ScheduledReport['format']>('PDF');
  const [newScheduleRecipients, setNewScheduleRecipients] = useState<string>('cpo@inducore.com, finance@inducore.com');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState<boolean>(false);

  const fetchSnapshot = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/v1/analytics/snapshot?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.status === 'success') {
        setSnapshot(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics snapshot:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchScheduledReports = async () => {
    try {
      const res = await fetch('/v1/analytics/scheduled-reports');
      const json = await res.json();
      if (json.status === 'success') {
        setScheduledReports(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch scheduled reports:', err);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, [timeframe]);

  useEffect(() => {
    fetchScheduledReports();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccessMsg(null);
    try {
      const res = await fetch('/v1/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: exportReportType,
          format: exportFormat,
          timeframe,
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        // Trigger browser file download
        const blob = new Blob([json.data.data], { type: json.data.contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = json.data.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setExportSuccessMsg(`Successfully generated and downloaded ${json.data.fileName}`);
        setTimeout(() => setShowExportModal(false), 1500);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSchedule(true);
    try {
      const recipientsArray = newScheduleRecipients
        .split(',')
        .map(e => e.trim())
        .filter(Boolean);

      const res = await fetch('/v1/analytics/scheduled-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newScheduleName,
          description: newScheduleDesc,
          reportType: newScheduleType,
          frequency: newScheduleFreq,
          format: newScheduleFormat,
          recipients: recipientsArray,
        }),
      });

      const json = await res.json();
      if (json.status === 'success') {
        fetchScheduledReports();
        setShowCreateScheduleModal(false);
        setNewScheduleName('');
        setNewScheduleDesc('');
      }
    } catch (err) {
      console.error('Failed to create scheduled report:', err);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleToggleSchedule = async (id: string) => {
    try {
      const res = await fetch(`/v1/analytics/scheduled-reports/${id}/toggle`, { method: 'PATCH' });
      const json = await res.json();
      if (json.status === 'success') {
        fetchScheduledReports();
      }
    } catch (err) {
      console.error('Toggle schedule error:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`/v1/analytics/scheduled-reports/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status === 'success') {
        fetchScheduledReports();
      }
    } catch (err) {
      console.error('Delete schedule error:', err);
    }
  };

  const kpis = snapshot?.kpis;
  const rfqData = snapshot?.rfqAnalytics;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Executive Analytics & Intelligence</h1>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full border border-indigo-500/30 font-medium">
              Sprint 15 Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time procurement performance, spend analysis, cost savings trajectory, and automated executive reporting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
            {(['Q1', 'Q2', 'Q3', 'Q4', 'YTD', 'TRAILING_12M'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={fetchSnapshot}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        {[
          { id: 'EXECUTIVE', label: 'Executive Dashboard', icon: TrendingUp },
          { id: 'SPEND', label: 'Spend Analysis', icon: PieChartIcon },
          { id: 'SAVINGS', label: 'Cost Savings', icon: DollarSign },
          { id: 'SUPPLIERS', label: 'Supplier KPIs', icon: Users },
          { id: 'RFQ', label: 'RFQ Analytics', icon: Award },
          { id: 'REPORTS', label: 'Scheduled Reports', icon: Calendar },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition ${
                active
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.id === 'REPORTS' && scheduledReports.length > 0 && (
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                  {scheduledReports.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-24 flex items-center justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mr-3" />
          <span>Loading analytics intelligence workspace...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'EXECUTIVE' && snapshot && (
            <div className="space-y-6">
              {/* Executive KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Procurement Spend</span>
                    <DollarSign className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${(kpis?.totalSpendYTD || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-emerald-400 font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    <span>On budget ({timeframe})</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Cost Savings Realized</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ${(kpis?.totalSavingsYTD || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-slate-300">
                    <span className="font-semibold text-emerald-300 mr-1.5">{kpis?.savingsPercentageYTD}%</span>
                    <span>of total spend</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Supplier Delivery & Quality</span>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {kpis?.supplierOnTimeDeliveryRate}% <span className="text-xs text-slate-400 font-normal">OTD</span>
                  </div>
                  <div className="flex items-center text-xs text-cyan-400 font-medium">
                    <span>{kpis?.supplierQualityPassRate}% Quality Compliance</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>RFQ Cycle Efficiency</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {rfqData?.avgCycleTimeDays} <span className="text-xs text-slate-400 font-normal">Days Avg</span>
                  </div>
                  <div className="flex items-center text-xs text-amber-300 font-medium">
                    <span>{rfqData?.bidYieldRate}% Award Yield Rate</span>
                  </div>
                </div>
              </div>

              {/* Two Column Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Savings Trajectory */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">Cost Savings Trajectory</h3>
                      <p className="text-xs text-slate-400">Monthly breakdown vs target savings</p>
                    </div>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                      +14.2% over target
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={snapshot.costSavingsTrends}>
                        <defs>
                          <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={v => `$${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderColor: '#475569', color: '#F8FAFC' }}
                          formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                        <Area type="monotone" dataKey="totalSavings" name="Actual Savings" stroke="#10B981" fillOpacity={1} fill="url(#savingsGrad)" strokeWidth={2} />
                        <Area type="monotone" dataKey="targetSavings" name="Target Savings" stroke="#6366F1" strokeDasharray="4 4" fill="none" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Spend Distribution by Category */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">Spend by Category</h3>
                      <p className="text-xs text-slate-400">Procurement budget allocation</p>
                    </div>
                    <span className="text-xs text-slate-400">Total ${((snapshot.kpis.totalSpendYTD) / 1000000).toFixed(2)}M</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={snapshot.categorySpends}
                          dataKey="actualSpend"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {snapshot.categorySpends.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderColor: '#475569', color: '#F8FAFC' }}
                          formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Spend']}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPEND ANALYSIS */}
          {activeTab === 'SPEND' && snapshot && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Spend Breakdown by Category</h3>
                    <p className="text-xs text-slate-400">Actual Spend vs Allocated Budget & Cost Savings</p>
                  </div>
                  <button
                    onClick={() => {
                      setExportReportType('SPEND_ANALYSIS');
                      setShowExportModal(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg bg-indigo-500/10"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export Spend Report
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Actual Spend</th>
                        <th className="py-3 px-4">Allocated Budget</th>
                        <th className="py-3 px-4">Variance Savings</th>
                        <th className="py-3 px-4">% of Total</th>
                        <th className="py-3 px-4">Budget Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {snapshot.categorySpends.map((cs, idx) => {
                        const utilization = Math.round((cs.actualSpend / cs.budget) * 100);
                        return (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                              />
                              {cs.category}
                            </td>
                            <td className="py-3 px-4 font-semibold text-white">${cs.actualSpend.toLocaleString()}</td>
                            <td className="py-3 px-4 text-slate-400">${cs.budget.toLocaleString()}</td>
                            <td className="py-3 px-4 text-emerald-400 font-medium">+${cs.savings.toLocaleString()}</td>
                            <td className="py-3 px-4 text-slate-300">{cs.percentageOfTotal}%</td>
                            <td className="py-3 px-4">
                              <div className="w-32 bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${utilization > 100 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                  style={{ width: `${Math.min(utilization, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400 mt-0.5 inline-block">{utilization}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COST SAVINGS */}
          {activeTab === 'SAVINGS' && snapshot && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Cost Savings Drivers & Breakdown</h3>
                    <p className="text-xs text-slate-400">Negotiations, Volume Rebates, and Process Optimization</p>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snapshot.costSavingsTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" tickFormatter={v => `$${v / 1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#475569', color: '#F8FAFC' }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Bar dataKey="negotiatedSavings" name="Negotiated Discount" stackId="a" fill="#4F46E5" />
                      <Bar dataKey="volumeRebateSavings" name="Volume Rebate" stackId="a" fill="#06B6D4" />
                      <Bar dataKey="processOptimizationSavings" name="Process Optimization" stackId="a" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPPLIER KPIS */}
          {activeTab === 'SUPPLIERS' && snapshot && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
                <h3 className="text-lg font-semibold text-white">Top Supplier Analytics & Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="py-3 px-4">Supplier Name</th>
                        <th className="py-3 px-4">Spend ({timeframe})</th>
                        <th className="py-3 px-4">Active Contracts</th>
                        <th className="py-3 px-4">On-Time Delivery (OTD)</th>
                        <th className="py-3 px-4">Quality Pass Rate</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {snapshot.topSupplierSpends.map(sup => (
                        <tr key={sup.supplierId} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-semibold text-white">{sup.supplierName}</td>
                          <td className="py-3 px-4 font-medium text-emerald-400">${sup.spend.toLocaleString()}</td>
                          <td className="py-3 px-4">{sup.contractCount}</td>
                          <td className="py-3 px-4">
                            <span className={sup.onTimeDeliveryRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}>
                              {sup.onTimeDeliveryRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={sup.qualityComplianceRate >= 99 ? 'text-emerald-400' : 'text-cyan-400'}>
                              {sup.qualityComplianceRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
                              Preferred Tier 1
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RFQ ANALYTICS */}
          {activeTab === 'RFQ' && snapshot && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Total RFQs Issued</div>
                  <div className="text-3xl font-bold text-white mt-1">{rfqData?.totalRFQsIssued}</div>
                  <div className="text-xs text-slate-400 mt-1">{rfqData?.awardedCount} Awarded / {rfqData?.cancelledCount} Cancelled</div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Average Bids Per RFQ</div>
                  <div className="text-3xl font-bold text-indigo-400 mt-1">{rfqData?.avgBidsPerRFQ}</div>
                  <div className="text-xs text-indigo-300 mt-1">Strong supplier participation</div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
                  <div className="text-xs text-slate-400">RFQ Award Conversion Rate</div>
                  <div className="text-3xl font-bold text-emerald-400 mt-1">{rfqData?.bidYieldRate}%</div>
                  <div className="text-xs text-slate-400 mt-1">${((rfqData?.totalAwardedValue || 0) / 1000000).toFixed(2)}M Awarded Value</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SCHEDULED REPORTS */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Automated Executive Scheduled Reports</h3>
                  <p className="text-xs text-slate-400">Configure recurring email broadcasts and snapshot exports</p>
                </div>
                <button
                  onClick={() => setShowCreateScheduleModal(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  New Report Schedule
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledReports.map(rpt => (
                  <div key={rpt.id} className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{rpt.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{rpt.description || 'No description provided.'}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        rpt.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {rpt.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500">Frequency:</span> <span className="font-medium text-white">{rpt.frequency}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Format:</span> <span className="font-medium text-white">{rpt.format}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Report Type:</span> <span className="font-medium text-indigo-300">{rpt.reportType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Recipients:</span> <span className="font-medium text-white">{rpt.recipients.length} Email(s)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 text-xs">
                      <div className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Next: {new Date(rpt.nextRunAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSchedule(rpt.id)}
                          className="text-xs text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded transition"
                        >
                          {rpt.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(rpt.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 p-1 rounded transition"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" />
                Export Analytics Report
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Report Dataset</label>
                <select
                  value={exportReportType}
                  onChange={e => setExportReportType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="EXECUTIVE_SUMMARY">Executive Dashboard Summary</option>
                  <option value="PROCUREMENT_KPIS">Procurement KPIs</option>
                  <option value="SPEND_ANALYSIS">Spend Analysis & Category Breakdown</option>
                  <option value="COST_SAVINGS">Cost Savings Trajectory</option>
                  <option value="SUPPLIER_PERFORMANCE">Supplier Performance Ratings</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EXCEL', 'PDF', 'CSV'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`py-2 text-center rounded-lg font-medium border transition ${
                        exportFormat === fmt
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {exportSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {exportSuccessMsg}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg flex items-center gap-1.5"
              >
                {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Generate & Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SCHEDULED REPORT MODAL */}
      {showCreateScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateSchedule} className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Schedule Automated Executive Report
              </h3>
              <button type="button" onClick={() => setShowCreateScheduleModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Report Schedule Name</label>
              <input
                type="text"
                required
                value={newScheduleName}
                onChange={e => setNewScheduleName(e.target.value)}
                placeholder="e.g., Weekly CPO Spend Digest"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description</label>
              <input
                type="text"
                value={newScheduleDesc}
                onChange={e => setNewScheduleDesc(e.target.value)}
                placeholder="Optional description..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Report Dataset</label>
                <select
                  value={newScheduleType}
                  onChange={e => setNewScheduleType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="EXECUTIVE_SUMMARY">Executive Summary</option>
                  <option value="PROCUREMENT_KPIS">Procurement KPIs</option>
                  <option value="SPEND_ANALYSIS">Spend Analysis</option>
                  <option value="COST_SAVINGS">Cost Savings</option>
                  <option value="SUPPLIER_PERFORMANCE">Supplier Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Frequency</label>
                <select
                  value={newScheduleFreq}
                  onChange={e => setNewScheduleFreq(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Format</label>
                <select
                  value={newScheduleFormat}
                  onChange={e => setNewScheduleFormat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="EXCEL">Excel Sheet</option>
                  <option value="CSV">CSV Data</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Recipient Emails (comma separated)</label>
              <input
                type="text"
                required
                value={newScheduleRecipients}
                onChange={e => setNewScheduleRecipients(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateScheduleModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingSchedule}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg"
              >
                {isSubmittingSchedule ? 'Scheduling...' : 'Create Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default AnalyticsView;
