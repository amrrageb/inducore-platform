import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export type ReportFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
export type ReportFormat = 'EXCEL' | 'PDF' | 'CSV';
export type ReportType = 'EXECUTIVE_SUMMARY' | 'PROCUREMENT_KPIS' | 'SUPPLIER_PERFORMANCE' | 'COST_SAVINGS' | 'SPEND_ANALYSIS';

export interface ScheduledReportProps {
  tenantId: string;
  name: string;
  description?: string;
  reportType: ReportType;
  frequency: ReportFrequency;
  format: ReportFormat;
  recipients: string[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdBy: string;
  createdAt: string;
}

export class ScheduledReportAggregate extends AggregateRoot<ScheduledReportProps> {
  private constructor(props: ScheduledReportProps, id?: string) {
    super(props, id);
  }

  public static create(props: ScheduledReportProps, id?: string): Result<ScheduledReportAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.reportType, argumentName: 'reportType' },
      { argument: props.frequency, argumentName: 'frequency' },
      { argument: props.format, argumentName: 'format' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<ScheduledReportAggregate>(nullGuard.error || 'Invalid Scheduled Report properties');
    }

    if (!props.recipients || props.recipients.length === 0) {
      return Result.fail<ScheduledReportAggregate>('Scheduled report must have at least one recipient email.');
    }

    return Result.ok<ScheduledReportAggregate>(new ScheduledReportAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get reportType(): ReportType { return this.props.reportType; }
  get frequency(): ReportFrequency { return this.props.frequency; }
  get format(): ReportFormat { return this.props.format; }
  get recipients(): string[] { return this.props.recipients; }
  get isActive(): boolean { return this.props.isActive; }
  get lastRunAt(): string | undefined { return this.props.lastRunAt; }
  get nextRunAt(): string { return this.props.nextRunAt; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): string { return this.props.createdAt; }

  public toggleActive(): void {
    this.props.isActive = !this.props.isActive;
  }

  public recordExecution(): void {
    this.props.lastRunAt = new Date().toISOString();
  }
}
