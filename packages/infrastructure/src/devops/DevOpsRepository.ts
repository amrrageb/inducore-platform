import { DeploymentPipelineAggregate, DisasterRecoveryAggregate } from '@inducore/core-domain';
import { IDevOpsRepository, PerformanceLoadTestResult, PrometheusMetricSample } from '@inducore/application';

export class DevOpsRepository implements IDevOpsRepository {
  private pipelines: Map<string, DeploymentPipelineAggregate> = new Map();
  private backups: Map<string, DisasterRecoveryAggregate> = new Map();
  private loadTests: PerformanceLoadTestResult[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    // 1. CI/CD Deployment Pipelines
    const p1 = DeploymentPipelineAggregate.create({
      tenantId: 'tenant-1',
      pipelineName: 'inducore-ci-cd-main',
      branch: 'main',
      commitHash: '9d4f1e2',
      commitMessage: 'feat(sprint-17): Production readiness, Docker, Prometheus & DR',
      triggeredBy: 'github-actions[bot]',
      status: 'SUCCESS',
      dockerImageTag: 'gcr.io/inducore-prod/api-gateway:v2.5.0-release',
      dockerImageSizeBytes: 148500000,
      steps: [
        { name: 'TypeScript Typecheck', status: 'PASSED', durationSeconds: 14, logSummary: 'pnpm typecheck exited with 0 errors across 4 packages' },
        { name: 'ESLint & Prettier Verification', status: 'PASSED', durationSeconds: 9, logSummary: '0 lint errors, zero loose any types' },
        { name: 'Vitest Unit & Integration Suite', status: 'PASSED', durationSeconds: 18, logSummary: '31/31 unit tests passed successfully' },
        { name: 'Multi-stage Docker Build Optimization', status: 'PASSED', durationSeconds: 42, logSummary: 'Compressed image layer cache hit (148.5MB alpine image)' },
        { name: 'Trivy Security Container Scan', status: 'PASSED', durationSeconds: 15, logSummary: '0 Critical, 0 High vulnerabilities detected' },
        { name: 'Cloud Run Production Automated Release', status: 'PASSED', durationSeconds: 28, logSummary: 'Deployed to europe-west2 Cloud Run cluster (traffic shifted 100%)' },
      ],
      vulnerabilities: [
        {
          id: 'CVE-2026-9011',
          severity: 'LOW',
          packageName: 'libcrypto3',
          installedVersion: '3.0.7',
          fixedVersion: '3.0.8',
          description: 'Minor non-critical advisory for esoteric RSA key sizes',
        },
      ],
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    }, 'pipe-101');

    const p2 = DeploymentPipelineAggregate.create({
      tenantId: 'tenant-1',
      pipelineName: 'inducore-hotfix-branch',
      branch: 'patch/inventory-lock-fix',
      commitHash: '3c8a911',
      commitMessage: 'fix(inventory): Optimistic locking concurrency check',
      triggeredBy: 'lead-dev@inducore.com',
      status: 'BUILDING',
      dockerImageTag: 'gcr.io/inducore-prod/api-gateway:v2.4.9-patch',
      dockerImageSizeBytes: 148200000,
      steps: [
        { name: 'TypeScript Typecheck', status: 'PASSED', durationSeconds: 12, logSummary: 'Clean type check' },
        { name: 'ESLint & Prettier Verification', status: 'PASSED', durationSeconds: 8, logSummary: 'Passed' },
        { name: 'Vitest Unit & Integration Suite', status: 'PASSED', durationSeconds: 16, logSummary: 'Passed' },
        { name: 'Multi-stage Docker Build Optimization', status: 'RUNNING', durationSeconds: 22, logSummary: 'Building production container image...' },
        { name: 'Trivy Security Container Scan', status: 'PENDING', durationSeconds: 0, logSummary: 'Queued' },
        { name: 'Cloud Run Production Automated Release', status: 'PENDING', durationSeconds: 0, logSummary: 'Queued' },
      ],
      vulnerabilities: [],
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    }, 'pipe-102');

    if (p1.isSuccess) this.pipelines.set(p1.getValue().id, p1.getValue());
    if (p2.isSuccess) this.pipelines.set(p2.getValue().id, p2.getValue());

    // 2. Disaster Recovery & Backup Snapshots
    const b1 = DisasterRecoveryAggregate.create({
      tenantId: 'tenant-1',
      backupName: 'daily-cloudsql-postgres-full-backup',
      type: 'FULL_DATABASE_SNAPSHOT',
      status: 'VERIFIED',
      sizeBytes: 8450000000,
      checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      storageRegion: 'europe-west2-dual-region',
      isEncrypted: true,
      retentionDays: 90,
      rpoMinutesActual: 2.5,
      rtoMinutesTarget: 15,
      lastVerificationDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      verificationPassed: true,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    }, 'bak-101');

    const b2 = DisasterRecoveryAggregate.create({
      tenantId: 'tenant-1',
      backupName: 'vector-kb-gemini-embedding-dump',
      type: 'KNOWLEDGE_BASE_VECTORS',
      status: 'VERIFIED',
      sizeBytes: 1200000000,
      checksumSha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      storageRegion: 'europe-west2-dual-region',
      isEncrypted: true,
      retentionDays: 30,
      rpoMinutesActual: 10,
      rtoMinutesTarget: 30,
      lastVerificationDate: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      verificationPassed: true,
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    }, 'bak-102');

    if (b1.isSuccess) this.backups.set(b1.getValue().id, b1.getValue());
    if (b2.isSuccess) this.backups.set(b2.getValue().id, b2.getValue());

    // 3. Performance & Load Test Executions (k6)
    this.loadTests = [
      {
        id: 'k6-run-881',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        targetEndpoint: 'https://api.inducore.com/v1/rfq',
        virtualUsers: 250,
        durationSeconds: 120,
        totalRequests: 48000,
        successfulRequests: 47940,
        failedRequests: 60,
        rps: 400,
        latencyP50Ms: 11.4,
        latencyP95Ms: 34.2,
        latencyP99Ms: 72.0,
        errorRatePercentage: 0.125,
      },
      {
        id: 'k6-run-880',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        targetEndpoint: 'https://api.inducore.com/v1/assistant/chat',
        virtualUsers: 100,
        durationSeconds: 60,
        totalRequests: 12000,
        successfulRequests: 11985,
        failedRequests: 15,
        rps: 200,
        latencyP50Ms: 145.0,
        latencyP95Ms: 310.0,
        latencyP99Ms: 480.0,
        errorRatePercentage: 0.125,
      },
    ];
  }

  public async listPipelines(_tenantId: string): Promise<DeploymentPipelineAggregate[]> {
    return Array.from(this.pipelines.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getPipelineById(id: string): Promise<DeploymentPipelineAggregate | null> {
    return this.pipelines.get(id) || null;
  }

  public async savePipeline(pipeline: DeploymentPipelineAggregate): Promise<void> {
    this.pipelines.set(pipeline.id, pipeline);
  }

  public async listBackups(_tenantId: string): Promise<DisasterRecoveryAggregate[]> {
    return Array.from(this.backups.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getBackupById(id: string): Promise<DisasterRecoveryAggregate | null> {
    return this.backups.get(id) || null;
  }

  public async saveBackup(backup: DisasterRecoveryAggregate): Promise<void> {
    this.backups.set(backup.id, backup);
  }

  public async listLoadTests(_tenantId: string): Promise<PerformanceLoadTestResult[]> {
    return this.loadTests;
  }

  public async saveLoadTest(testResult: PerformanceLoadTestResult): Promise<void> {
    this.loadTests.unshift(testResult);
  }

  public async getPrometheusMetrics(_tenantId: string): Promise<PrometheusMetricSample[]> {
    return [
      { metricName: 'inducore_http_requests_total', type: 'COUNTER', value: 142850, unit: 'req', description: 'Total HTTP requests served across API Gateway endpoints' },
      { metricName: 'inducore_http_request_duration_seconds', type: 'HISTOGRAM', value: 0.016, unit: 'seconds', description: 'p95 API response duration' },
      { metricName: 'inducore_active_websocket_connections', type: 'GAUGE', value: 342, unit: 'connections', description: 'Current active real-time RFQ chat sockets' },
      { metricName: 'inducore_transactional_outbox_lag', type: 'GAUGE', value: 0, unit: 'messages', description: 'Kafka outbox publisher pending event lag' },
      { metricName: 'inducore_gemini_rag_tokens_consumed', type: 'COUNTER', value: 384500, unit: 'tokens', description: 'Total Gemini 2.5 LLM tokens utilized for contextual AI RAG queries' },
      { metricName: 'inducore_db_pool_active_connections', type: 'GAUGE', value: 14, unit: 'connections', description: 'Active PostgreSQL Cloud SQL connections' },
    ];
  }
}
