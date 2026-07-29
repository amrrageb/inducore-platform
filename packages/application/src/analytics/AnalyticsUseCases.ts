import { Result, AnalyticsSnapshotAggregate, ScheduledReportAggregate } from '@inducore/core-domain';
import { IAnalyticsRepository } from './IAnalyticsRepository.js';
import { CreateScheduledReportDTO, ExportReportDTO } from './AnalyticsDTOs.js';

export class AnalyticsUseCases {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  public async getAnalyticsSnapshot(
    tenantId: string,
    timeframe: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'YTD' | 'TRAILING_12M' = 'YTD'
  ): Promise<Result<AnalyticsSnapshotAggregate>> {
    const snapshot = await this.analyticsRepository.getSnapshot(tenantId, timeframe);
    if (!snapshot) {
      return Result.fail<AnalyticsSnapshotAggregate>(`Analytics snapshot not found for timeframe ${timeframe}`);
    }
    return Result.ok<AnalyticsSnapshotAggregate>(snapshot);
  }

  public async createScheduledReport(
    tenantId: string,
    createdBy: string,
    dto: CreateScheduledReportDTO
  ): Promise<Result<ScheduledReportAggregate>> {
    const nextRun = new Date();
    if (dto.frequency === 'DAILY') nextRun.setDate(nextRun.getDate() + 1);
    else if (dto.frequency === 'WEEKLY') nextRun.setDate(nextRun.getDate() + 7);
    else if (dto.frequency === 'MONTHLY') nextRun.setMonth(nextRun.getMonth() + 1);
    else if (dto.frequency === 'QUARTERLY') nextRun.setMonth(nextRun.getMonth() + 3);

    const reportResult = ScheduledReportAggregate.create({
      tenantId,
      name: dto.name,
      description: dto.description,
      reportType: dto.reportType,
      frequency: dto.frequency,
      format: dto.format,
      recipients: dto.recipients,
      isActive: true,
      nextRunAt: nextRun.toISOString(),
      createdBy,
      createdAt: new Date().toISOString(),
    });

    if (reportResult.isFailure) {
      return Result.fail<ScheduledReportAggregate>(reportResult.error || 'Failed to create scheduled report');
    }

    const report = reportResult.getValue();
    await this.analyticsRepository.saveScheduledReport(report);
    return Result.ok<ScheduledReportAggregate>(report);
  }

  public async listScheduledReports(tenantId: string): Promise<Result<ScheduledReportAggregate[]>> {
    const reports = await this.analyticsRepository.listScheduledReports(tenantId);
    return Result.ok<ScheduledReportAggregate[]>(reports);
  }

  public async toggleScheduledReportStatus(id: string): Promise<Result<ScheduledReportAggregate>> {
    const report = await this.analyticsRepository.getScheduledReportById(id);
    if (!report) {
      return Result.fail<ScheduledReportAggregate>('Scheduled report not found');
    }
    report.toggleActive();
    await this.analyticsRepository.saveScheduledReport(report);
    return Result.ok<ScheduledReportAggregate>(report);
  }

  public async deleteScheduledReport(id: string): Promise<Result<void>> {
    const report = await this.analyticsRepository.getScheduledReportById(id);
    if (!report) {
      return Result.fail<void>('Scheduled report not found');
    }
    await this.analyticsRepository.deleteScheduledReport(id);
    return Result.ok<void>(undefined);
  }

  public async exportReportData(
    tenantId: string,
    dto: ExportReportDTO
  ): Promise<Result<{ fileName: string; contentType: string; data: string }>> {
    const snapshot = await this.analyticsRepository.getSnapshot(tenantId, dto.timeframe);
    if (!snapshot) {
      return Result.fail('Analytics snapshot unavailable for export');
    }

    const ext = dto.format.toLowerCase();
    const fileName = `InduCore_${dto.reportType}_${dto.timeframe}_${new Date().toISOString().split('T')[0]}.${ext}`;
    
    let contentType = 'text/csv';
    if (dto.format === 'EXCEL') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (dto.format === 'PDF') contentType = 'application/pdf';

    // Simulated structured export stream string (CSV / JSON data payload ready for client download)
    const dataLines: string[] = [
      `# InduCore Analytics Export - ${dto.reportType}`,
      `# Timeframe: ${dto.timeframe} | Generated: ${new Date().toISOString()}`,
      `# Tenant: ${tenantId}`,
      ``,
    ];

    if (dto.reportType === 'EXECUTIVE_SUMMARY' || dto.reportType === 'PROCUREMENT_KPIS') {
      const k = snapshot.kpis;
      dataLines.push(`Metric,Value`);
      dataLines.push(`Total Spend YTD,$${k.totalSpendYTD.toLocaleString()}`);
      dataLines.push(`Total Savings YTD,$${k.totalSavingsYTD.toLocaleString()}`);
      dataLines.push(`Savings Percentage,${k.savingsPercentageYTD}%`);
      dataLines.push(`Active Contracts,${k.activeContractsCount}`);
      dataLines.push(`Supplier OTD Rate,${k.supplierOnTimeDeliveryRate}%`);
      dataLines.push(`Quality Compliance,${k.supplierQualityPassRate}%`);
    } else if (dto.reportType === 'SPEND_ANALYSIS') {
      dataLines.push(`Category,Actual Spend,Budget,Savings,Percentage`);
      snapshot.categorySpends.forEach(cs => {
        dataLines.push(`"${cs.category}",${cs.actualSpend},${cs.budget},${cs.savings},${cs.percentageOfTotal}%`);
      });
    } else if (dto.reportType === 'SUPPLIER_PERFORMANCE') {
      dataLines.push(`Supplier Name,Spend,Contracts,OTD Rate,Quality Rate`);
      snapshot.topSupplierSpends.forEach(ss => {
        dataLines.push(`"${ss.supplierName}",${ss.spend},${ss.contractCount},${ss.onTimeDeliveryRate}%,${ss.qualityComplianceRate}%`);
      });
    } else if (dto.reportType === 'COST_SAVINGS') {
      dataLines.push(`Month,Negotiated,Volume Rebate,Process Opt,Total Savings,Target`);
      snapshot.costSavingsTrends.forEach(st => {
        dataLines.push(`"${st.month}",${st.negotiatedSavings},${st.volumeRebateSavings},${st.processOptimizationSavings},${st.totalSavings},${st.targetSavings}`);
      });
    }

    return Result.ok({
      fileName,
      contentType,
      data: dataLines.join('\n'),
    });
  }
}
