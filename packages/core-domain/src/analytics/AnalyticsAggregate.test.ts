import { describe, it, expect } from 'vitest';
import { AnalyticsSnapshotAggregate } from './AnalyticsSnapshotAggregate.js';
import { ScheduledReportAggregate } from './ScheduledReportAggregate.js';

describe('Analytics Core Domain Aggregates', () => {
  it('should create a valid AnalyticsSnapshotAggregate', () => {
    const res = AnalyticsSnapshotAggregate.create({
      tenantId: 'tenant-1',
      snapshotDate: '2026-07-29',
      timeframe: 'YTD',
      kpis: {
        totalSpendYTD: 14850000,
        totalSavingsYTD: 1850000,
        savingsPercentageYTD: 12.45,
        activeContractsCount: 42,
        contractComplianceRate: 98.2,
        supplierOnTimeDeliveryRate: 94.6,
        supplierQualityPassRate: 99.1,
        avgProcurementLeadTimeDays: 14.2,
      },
      rfqAnalytics: {
        totalRFQsIssued: 156,
        awardedCount: 128,
        cancelledCount: 8,
        avgBidsPerRFQ: 4.8,
        avgCycleTimeDays: 9.4,
        totalEstimatedValue: 18200000,
        totalAwardedValue: 16400000,
        bidYieldRate: 82.05,
      },
      categorySpends: [
        { category: 'Raw Materials', actualSpend: 5200000, budget: 5500000, savings: 650000, percentageOfTotal: 35.0 },
      ],
      topSupplierSpends: [
        { supplierId: 'sup-1', supplierName: 'Apex Steel', spend: 3100000, contractCount: 5, onTimeDeliveryRate: 96.5, qualityComplianceRate: 99.4 },
      ],
      costSavingsTrends: [
        { month: 'Jan 2026', negotiatedSavings: 150000, volumeRebateSavings: 45000, processOptimizationSavings: 30000, totalSavings: 225000, targetSavings: 200000 },
      ],
      updatedAt: '2026-07-29T00:00:00Z',
    });

    expect(res.isSuccess).toBe(true);
    const agg = res.getValue();
    expect(agg.kpis.savingsPercentageYTD).toBe(12.45);
    expect(agg.categorySpends.length).toBe(1);
  });

  it('should create and manage ScheduledReportAggregate', () => {
    const reportRes = ScheduledReportAggregate.create({
      tenantId: 'tenant-1',
      name: 'Executive Monthly Procurement Digest',
      reportType: 'EXECUTIVE_SUMMARY',
      frequency: 'MONTHLY',
      format: 'PDF',
      recipients: ['cpo@inducore.com', 'finance@inducore.com'],
      isActive: true,
      nextRunAt: '2026-08-01T08:00:00Z',
      createdBy: 'user-admin',
      createdAt: '2026-07-29T00:00:00Z',
    });

    expect(reportRes.isSuccess).toBe(true);
    const report = reportRes.getValue();
    expect(report.isActive).toBe(true);
    report.toggleActive();
    expect(report.isActive).toBe(false);

    report.recordExecution();
    expect(report.lastRunAt).toBeDefined();
  });

  it('should fail creating ScheduledReportAggregate without recipients', () => {
    const reportRes = ScheduledReportAggregate.create({
      tenantId: 'tenant-1',
      name: 'Invalid Report',
      reportType: 'SPEND_ANALYSIS',
      frequency: 'WEEKLY',
      format: 'EXCEL',
      recipients: [],
      isActive: true,
      nextRunAt: '2026-08-01T08:00:00Z',
      createdBy: 'user-admin',
      createdAt: '2026-07-29T00:00:00Z',
    });

    expect(reportRes.isFailure).toBe(true);
    expect(reportRes.error).toContain('recipient email');
  });
});
