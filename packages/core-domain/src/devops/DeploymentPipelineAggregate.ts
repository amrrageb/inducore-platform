import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export type PipelineStatus = 'QUEUED' | 'BUILDING' | 'TESTING' | 'SCANNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface PipelineStep {
  name: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED';
  durationSeconds: number;
  logSummary: string;
}

export interface SecurityVulnerability {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  packageName: string;
  installedVersion: string;
  fixedVersion: string;
  description: string;
}

export interface DeploymentPipelineProps {
  tenantId: string;
  pipelineName: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  triggeredBy: string;
  status: PipelineStatus;
  dockerImageTag: string;
  dockerImageSizeBytes: number;
  steps: PipelineStep[];
  vulnerabilities: SecurityVulnerability[];
  createdAt: string;
  completedAt?: string;
}

export class DeploymentPipelineAggregate extends AggregateRoot<DeploymentPipelineProps> {
  private constructor(props: DeploymentPipelineProps, id?: string) {
    super(props, id);
  }

  public static create(props: DeploymentPipelineProps, id?: string): Result<DeploymentPipelineAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.pipelineName, argumentName: 'pipelineName' },
      { argument: props.commitHash, argumentName: 'commitHash' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<DeploymentPipelineAggregate>(nullGuard.error || 'Invalid Deployment Pipeline properties');
    }

    return Result.ok<DeploymentPipelineAggregate>(new DeploymentPipelineAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get pipelineName(): string { return this.props.pipelineName; }
  get branch(): string { return this.props.branch; }
  get commitHash(): string { return this.props.commitHash; }
  get commitMessage(): string { return this.props.commitMessage; }
  get triggeredBy(): string { return this.props.triggeredBy; }
  get status(): PipelineStatus { return this.props.status; }
  get dockerImageTag(): string { return this.props.dockerImageTag; }
  get dockerImageSizeBytes(): number { return this.props.dockerImageSizeBytes; }
  get steps(): PipelineStep[] { return this.props.steps; }
  get vulnerabilities(): SecurityVulnerability[] { return this.props.vulnerabilities; }
  get createdAt(): string { return this.props.createdAt; }
  get completedAt(): string | undefined { return this.props.completedAt; }

  public completeStep(stepName: string, success: boolean, logSummary: string, durationSec: number): void {
    const step = this.props.steps.find(s => s.name === stepName);
    if (step) {
      step.status = success ? 'PASSED' : 'FAILED';
      step.logSummary = logSummary;
      step.durationSeconds = durationSec;
    }
  }

  public markCompleted(finalStatus: 'SUCCESS' | 'FAILED'): void {
    this.props.status = finalStatus;
    this.props.completedAt = new Date().toISOString();
  }
}
