import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING';

export interface BackgroundJobProps {
  tenantId: string;
  queueName: string;
  jobName: string;
  status: JobStatus;
  progressPercentage: number;
  durationMs?: number;
  errorMessage?: string;
  attempts: number;
  maxAttempts: number;
  payloadSummary: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export class BackgroundJobAggregate extends AggregateRoot<BackgroundJobProps> {
  private constructor(props: BackgroundJobProps, id?: string) {
    super(props, id);
  }

  public static create(props: BackgroundJobProps, id?: string): Result<BackgroundJobAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.queueName, argumentName: 'queueName' },
      { argument: props.jobName, argumentName: 'jobName' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<BackgroundJobAggregate>(nullGuard.error || 'Invalid Background Job properties');
    }

    return Result.ok<BackgroundJobAggregate>(new BackgroundJobAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get queueName(): string { return this.props.queueName; }
  get jobName(): string { return this.props.jobName; }
  get status(): JobStatus { return this.props.status; }
  get progressPercentage(): number { return this.props.progressPercentage; }
  get durationMs(): number | undefined { return this.props.durationMs; }
  get errorMessage(): string | undefined { return this.props.errorMessage; }
  get attempts(): number { return this.props.attempts; }
  get maxAttempts(): number { return this.props.maxAttempts; }
  get payloadSummary(): string { return this.props.payloadSummary; }
  get createdAt(): string { return this.props.createdAt; }
  get startedAt(): string | undefined { return this.props.startedAt; }
  get completedAt(): string | undefined { return this.props.completedAt; }

  public triggerRetry(): Result<void> {
    if (this.props.status !== 'FAILED') {
      return Result.fail<void>('Can only retry failed background jobs');
    }
    if (this.props.attempts >= this.props.maxAttempts) {
      return Result.fail<void>('Max attempt limit reached for this job');
    }
    this.props.status = 'QUEUED';
    this.props.attempts += 1;
    this.props.errorMessage = undefined;
    return Result.ok<void>(undefined);
  }
}

export interface ServiceHealthMetric {
  serviceName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  uptimePercent: number;
  lastCheckedAt: string;
}

export interface SystemHealthSnapshotProps {
  tenantId: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  activeWorkers: number;
  queueBacklogCount: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  dbConnectionPoolActive: number;
  services: ServiceHealthMetric[];
  snapshotTimestamp: string;
}

export class SystemHealthAggregate extends AggregateRoot<SystemHealthSnapshotProps> {
  private constructor(props: SystemHealthSnapshotProps, id?: string) {
    super(props, id);
  }

  public static create(props: SystemHealthSnapshotProps, id?: string): Result<SystemHealthAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.overallStatus, argumentName: 'overallStatus' },
      { argument: props.snapshotTimestamp, argumentName: 'snapshotTimestamp' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<SystemHealthAggregate>(nullGuard.error || 'Invalid System Health properties');
    }

    return Result.ok<SystemHealthAggregate>(new SystemHealthAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get overallStatus(): 'HEALTHY' | 'DEGRADED' | 'DOWN' { return this.props.overallStatus; }
  get activeWorkers(): number { return this.props.activeWorkers; }
  get queueBacklogCount(): number { return this.props.queueBacklogCount; }
  get cpuUsagePercent(): number { return this.props.cpuUsagePercent; }
  get memoryUsagePercent(): number { return this.props.memoryUsagePercent; }
  get services(): ServiceHealthMetric[] { return this.props.services; }
}
