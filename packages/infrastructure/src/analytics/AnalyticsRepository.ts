import {
  AnalyticsSnapshotAggregate,
  ScheduledReportAggregate,
} from '@inducore/core-domain';
import { IAnalyticsRepository } from '@inducore/application';

export class AnalyticsRepository implements IAnalyticsRepository {
  private scheduledReports: Map<string, ScheduledReportAggregate> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    const report1Res = ScheduledReportAggregate.create({
      tenantId: 'tenant-1',
      name: 'Weekly Procurement KPI Digest',
      description: 'Automated executive summary detailing procurement spend, active savings, and supplier quality metrics.',
      reportType: 'PROCUREMENT_KPIS',
      frequency: 'WEEKLY',
      format: 'PDF',
      recipients: ['exec-analytics@inducore.com', 'cpo@inducore.com'],
      isActive: true,
      lastRunAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      nextRunAt: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      createdBy: 'System Engine',
      createdAt: '2026-06-01T00:00:00Z',
    }, 'rpt-101');

    const report2Res = ScheduledReportAggregate.create({
      tenantId: 'tenant-1',
      name: 'Monthly Cost Savings & Volume Rebates',
      description: 'Breakdown of negotiated savings, process optimization gains, and vendor volume rebates.',
      reportType: 'COST_SAVINGS',
      frequency: 'MONTHLY',
      format: 'EXCEL',
      recipients: ['finance-lead@inducore.com'],
      isActive: true,
      lastRunAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      nextRunAt: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
      createdBy: 'user-admin',
      createdAt: '2026-06-15T00:00:00Z',
    }, 'rpt-102');

    if (report1Res.isSuccess) this.scheduledReports.set(report1Res.getValue().id, report1Res.getValue());
    if (report2Res.isSuccess) this.scheduledReports.set(report2Res.getValue().id, report2Res.getValue());
  }

  public async getSnapshot(tenantId: string, timeframe: string): Promise<AnalyticsSnapshotAggregate | null> {
    // Generate calculated snapshot dynamically based on timeframe
    let multiplier = 1.0;
    if (timeframe === 'Q1') multiplier = 0.28;
    else if (timeframe === 'Q2') multiplier = 0.32;
    else if (timeframe === 'Q3') multiplier = 0.30;
    else if (timeframe === 'Q4') multiplier = 0.10;
    else if (timeframe === 'TRAILING_12M') multiplier = 1.15;

    const baseSpend = 14850000 * multiplier;
    const baseSavings = 1850000 * multiplier;

    const snapshotRes = AnalyticsSnapshotAggregate.create({
      tenantId,
      snapshotDate: new Date().toISOString().split('T')[0],
      timeframe: timeframe as any,
      kpis: {
        totalSpendYTD: Math.round(baseSpend),
        totalSavingsYTD: Math.round(baseSavings),
        savingsPercentageYTD: 12.45,
        activeContractsCount: 42,
        contractComplianceRate: 98.4,
        supplierOnTimeDeliveryRate: 95.2,
        supplierQualityPassRate: 99.3,
        avgProcurementLeadTimeDays: 13.5,
      },
      rfqAnalytics: {
        totalRFQsIssued: Math.round(156 * multiplier),
        awardedCount: Math.round(128 * multiplier),
        cancelledCount: Math.round(8 * multiplier),
        avgBidsPerRFQ: 4.8,
        avgCycleTimeDays: 9.4,
        totalEstimatedValue: Math.round(18200000 * multiplier),
        totalAwardedValue: Math.round(16400000 * multiplier),
        bidYieldRate: 82.05,
      },
      categorySpends: [
        { category: 'Raw Materials & Metals', actualSpend: Math.round(5200000 * multiplier), budget: Math.round(5500000 * multiplier), savings: Math.round(650000 * multiplier), percentageOfTotal: 35.0 },
        { category: 'Hydraulic Components', actualSpend: Math.round(3800000 * multiplier), budget: Math.round(4100000 * multiplier), savings: Math.round(480000 * multiplier), percentageOfTotal: 25.6 },
        { category: 'Electronics & Sensors', actualSpend: Math.round(2900000 * multiplier), budget: Math.round(3000000 * multiplier), savings: Math.round(350000 * multiplier), percentageOfTotal: 19.5 },
        { category: 'MRO & Industrial Tooling', actualSpend: Math.round(1850000 * multiplier), budget: Math.round(2000000 * multiplier), savings: Math.round(220000 * multiplier), percentageOfTotal: 12.5 },
        { category: 'Logistics & Freight', actualSpend: Math.round(1100000 * multiplier), budget: Math.round(1250000 * multiplier), savings: Math.round(150000 * multiplier), percentageOfTotal: 7.4 },
      ],
      topSupplierSpends: [
        { supplierId: 'sup-1', supplierName: 'Apex Industrial Steel Corp', spend: Math.round(3450000 * multiplier), contractCount: 6, onTimeDeliveryRate: 96.8, qualityComplianceRate: 99.5 },
        { supplierId: 'sup-2', supplierName: 'Precision Hydraulic Drives LLC', spend: Math.round(2850000 * multiplier), contractCount: 4, onTimeDeliveryRate: 94.2, qualityComplianceRate: 98.9 },
        { supplierId: 'sup-3', supplierName: 'OmniSensors Global Ltd', spend: Math.round(2100000 * multiplier), contractCount: 5, onTimeDeliveryRate: 97.5, qualityComplianceRate: 99.8 },
        { supplierId: 'sup-4', supplierName: 'Vanguard Machining Works', spend: Math.round(1650000 * multiplier), contractCount: 3, onTimeDeliveryRate: 92.0, qualityComplianceRate: 97.6 },
        { supplierId: 'sup-5', supplierName: 'EuroTooling Technologies', spend: Math.round(1200000 * multiplier), contractCount: 2, onTimeDeliveryRate: 95.0, qualityComplianceRate: 99.1 },
      ],
      costSavingsTrends: [
        { month: 'Jan', negotiatedSavings: 140000, volumeRebateSavings: 45000, processOptimizationSavings: 25000, totalSavings: 210000, targetSavings: 180000 },
        { month: 'Feb', negotiatedSavings: 165000, volumeRebateSavings: 50000, processOptimizationSavings: 30000, totalSavings: 245000, targetSavings: 200000 },
        { month: 'Mar', negotiatedSavings: 180000, volumeRebateSavings: 55000, processOptimizationSavings: 35000, totalSavings: 270000, targetSavings: 220000 },
        { month: 'Apr', negotiatedSavings: 195000, volumeRebateSavings: 60000, processOptimizationSavings: 40000, totalSavings: 295000, targetSavings: 240000 },
        { month: 'May', negotiatedSavings: 210000, volumeRebateSavings: 68000, processOptimizationSavings: 42000, totalSavings: 320000, targetSavings: 250000 },
        { month: 'Jun', negotiatedSavings: 225000, volumeRebateSavings: 72000, processOptimizationSavings: 45000, totalSavings: 342000, targetSavings: 260000 },
        { month: 'Jul', negotiatedSavings: 240000, volumeRebateSavings: 75000, processOptimizationSavings: 48000, totalSavings: 363000, targetSavings: 270000 },
      ],
      updatedAt: new Date().toISOString(),
    }, `snap-${tenantId}-${timeframe}`);

    return snapshotRes.isSuccess ? snapshotRes.getValue() : null;
  }

  public async saveScheduledReport(report: ScheduledReportAggregate): Promise<void> {
    this.scheduledReports.set(report.id, report);
  }

  public async getScheduledReportById(id: string): Promise<ScheduledReportAggregate | null> {
    return this.scheduledReports.get(id) || null;
  }

  public async listScheduledReports(_tenantId: string): Promise<ScheduledReportAggregate[]> {
    return Array.from(this.scheduledReports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async deleteScheduledReport(id: string): Promise<void> {
    this.scheduledReports.delete(id);
  }
}
