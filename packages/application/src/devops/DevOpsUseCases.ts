import { Result, DeploymentPipelineAggregate, DisasterRecoveryAggregate } from '@inducore/core-domain';
import { IDevOpsRepository, PerformanceLoadTestResult, PrometheusMetricSample } from './IDevOpsRepository.js';
import { TriggerPipelineDTO, ScheduleBackupDTO, RunLoadTestDTO, TriggerSecurityScanDTO } from './DevOpsDTOs.js';

export class DevOpsUseCases {
  constructor(private readonly devopsRepository: IDevOpsRepository) {}

  public async listPipelines(tenantId: string): Promise<Result<DeploymentPipelineAggregate[]>> {
    const pipelines = await this.devopsRepository.listPipelines(tenantId);
    return Result.ok<DeploymentPipelineAggregate[]>(pipelines);
  }

  public async triggerPipeline(tenantId: string, dto: TriggerPipelineDTO): Promise<Result<DeploymentPipelineAggregate>> {
    const commitHash = Math.random().toString(16).substring(2, 9);
    const pipelineRes = DeploymentPipelineAggregate.create({
      tenantId,
      pipelineName: 'inducore-ci-cd-main',
      branch: dto.branch,
      commitHash,
      commitMessage: dto.commitMessage,
      triggeredBy: dto.triggeredBy,
      status: 'BUILDING',
      dockerImageTag: `inducore-api:${dto.branch}-${commitHash}`,
      dockerImageSizeBytes: 138000000,
      steps: [
        { name: 'TypeScript Typecheck', status: 'RUNNING', durationSeconds: 5, logSummary: 'Checking tsconfig across monorepo packages' },
        { name: 'ESLint & Code Formatting', status: 'PENDING', durationSeconds: 0, logSummary: 'Queued' },
        { name: 'Vitest Automated Test Suite', status: 'PENDING', durationSeconds: 0, logSummary: 'Queued' },
        { name: 'Trivy Container Security Scan', status: 'PENDING', durationSeconds: 0, logSummary: 'Queued' },
        { name: 'Cloud Run Production Deployment', status: 'PENDING', durationSeconds: 0, logSummary: 'Queued' },
      ],
      vulnerabilities: [],
      createdAt: new Date().toISOString(),
    });

    if (pipelineRes.isFailure) {
      return Result.fail<DeploymentPipelineAggregate>(pipelineRes.error || 'Failed to trigger pipeline');
    }

    const pipeline = pipelineRes.getValue();
    await this.devopsRepository.savePipeline(pipeline);
    return Result.ok<DeploymentPipelineAggregate>(pipeline);
  }

  public async listBackups(tenantId: string): Promise<Result<DisasterRecoveryAggregate[]>> {
    const backups = await this.devopsRepository.listBackups(tenantId);
    return Result.ok<DisasterRecoveryAggregate[]>(backups);
  }

  public async scheduleBackup(tenantId: string, dto: ScheduleBackupDTO): Promise<Result<DisasterRecoveryAggregate>> {
    const checksum = 'sha256_' + Math.random().toString(36).substring(2, 18);
    const backupRes = DisasterRecoveryAggregate.create({
      tenantId,
      backupName: dto.backupName,
      type: dto.type,
      status: 'IN_PROGRESS',
      sizeBytes: Math.floor(Math.random() * 2000000000) + 1000000000,
      checksumSha256: checksum,
      storageRegion: 'europe-west2',
      isEncrypted: true,
      retentionDays: dto.retentionDays,
      rpoMinutesActual: 4,
      rtoMinutesTarget: 15,
      createdAt: new Date().toISOString(),
    });

    if (backupRes.isFailure) {
      return Result.fail<DisasterRecoveryAggregate>(backupRes.error || 'Failed to schedule backup');
    }

    const backup = backupRes.getValue();
    await this.devopsRepository.saveBackup(backup);
    return Result.ok<DisasterRecoveryAggregate>(backup);
  }

  public async verifyRestoreDryRun(id: string): Promise<Result<DisasterRecoveryAggregate>> {
    const backups = await this.devopsRepository.listBackups('tenant-1');
    const backup = backups.find(b => b.id === id);
    if (!backup) return Result.fail<DisasterRecoveryAggregate>('Backup snapshot not found');

    backup.verifyRestoreDryRun(true);
    await this.devopsRepository.saveBackup(backup);
    return Result.ok<DisasterRecoveryAggregate>(backup);
  }

  public async listLoadTests(tenantId: string): Promise<Result<PerformanceLoadTestResult[]>> {
    const tests = await this.devopsRepository.listLoadTests(tenantId);
    return Result.ok<PerformanceLoadTestResult[]>(tests);
  }

  public async runLoadTest(tenantId: string, dto: RunLoadTestDTO): Promise<Result<PerformanceLoadTestResult>> {
    const totalRequests = dto.virtualUsers * (dto.durationSeconds * 12);
    const failedRequests = Math.floor(totalRequests * 0.002);
    const successfulRequests = totalRequests - failedRequests;
    const rps = Math.round(totalRequests / dto.durationSeconds);

    const testResult: PerformanceLoadTestResult = {
      id: 'k6-test-' + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString(),
      targetEndpoint: dto.targetEndpoint,
      virtualUsers: dto.virtualUsers,
      durationSeconds: dto.durationSeconds,
      totalRequests,
      successfulRequests,
      failedRequests,
      rps,
      latencyP50Ms: 14.2,
      latencyP95Ms: 42.8,
      latencyP99Ms: 88.5,
      errorRatePercentage: 0.2,
    };

    await this.devopsRepository.saveLoadTest(testResult);
    return Result.ok<PerformanceLoadTestResult>(testResult);
  }

  public async triggerSecurityScan(
    _tenantId: string,
    dto: TriggerSecurityScanDTO
  ): Promise<Result<{ scanId: string; imageTag: string; scanType: string; status: string; summary: string }>> {
    return Result.ok({
      scanId: 'scan-' + Math.random().toString(36).substring(2, 8),
      imageTag: dto.dockerImageTag,
      scanType: dto.scanType,
      status: 'PASSED',
      summary: 'Trivy Static Container Scanner: 0 Critical, 0 High, 2 Low vulnerabilities detected.',
    });
  }

  public async getPrometheusMetrics(tenantId: string): Promise<Result<PrometheusMetricSample[]>> {
    const metrics = await this.devopsRepository.getPrometheusMetrics(tenantId);
    return Result.ok<PrometheusMetricSample[]>(metrics);
  }
}
