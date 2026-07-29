import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export type BackupType = 'FULL_DATABASE_SNAPSHOT' | 'POINT_IN_TIME_LOGS' | 'KNOWLEDGE_BASE_VECTORS' | 'SYSTEM_CONFIG_DUMP';
export type BackupStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'FAILED';

export interface BackupSnapshotProps {
  tenantId: string;
  backupName: string;
  type: BackupType;
  status: BackupStatus;
  sizeBytes: number;
  checksumSha256: string;
  storageRegion: string;
  isEncrypted: boolean;
  retentionDays: number;
  rpoMinutesActual: number;
  rtoMinutesTarget: number;
  lastVerificationDate?: string;
  verificationPassed?: boolean;
  createdAt: string;
}

export class DisasterRecoveryAggregate extends AggregateRoot<BackupSnapshotProps> {
  private constructor(props: BackupSnapshotProps, id?: string) {
    super(props, id);
  }

  public static create(props: BackupSnapshotProps, id?: string): Result<DisasterRecoveryAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.backupName, argumentName: 'backupName' },
      { argument: props.checksumSha256, argumentName: 'checksumSha256' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<DisasterRecoveryAggregate>(nullGuard.error || 'Invalid Disaster Recovery properties');
    }

    return Result.ok<DisasterRecoveryAggregate>(new DisasterRecoveryAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get backupName(): string { return this.props.backupName; }
  get type(): BackupType { return this.props.type; }
  get status(): BackupStatus { return this.props.status; }
  get sizeBytes(): number { return this.props.sizeBytes; }
  get checksumSha256(): string { return this.props.checksumSha256; }
  get storageRegion(): string { return this.props.storageRegion; }
  get isEncrypted(): boolean { return this.props.isEncrypted; }
  get retentionDays(): number { return this.props.retentionDays; }
  get rpoMinutesActual(): number { return this.props.rpoMinutesActual; }
  get rtoMinutesTarget(): number { return this.props.rtoMinutesTarget; }
  get lastVerificationDate(): string | undefined { return this.props.lastVerificationDate; }
  get verificationPassed(): boolean | undefined { return this.props.verificationPassed; }

  public verifyRestoreDryRun(passed: boolean): void {
    this.props.lastVerificationDate = new Date().toISOString();
    this.props.verificationPassed = passed;
    if (passed) {
      this.props.status = 'VERIFIED';
    }
  }
}
