import { AnalyticsSnapshotAggregate, ScheduledReportAggregate } from '@inducore/core-domain';

export interface IAnalyticsRepository {
  getSnapshot(tenantId: string, timeframe: string): Promise<AnalyticsSnapshotAggregate | null>;
  saveScheduledReport(report: ScheduledReportAggregate): Promise<void>;
  getScheduledReportById(id: string): Promise<ScheduledReportAggregate | null>;
  listScheduledReports(tenantId: string): Promise<ScheduledReportAggregate[]>;
  deleteScheduledReport(id: string): Promise<void>;
}
