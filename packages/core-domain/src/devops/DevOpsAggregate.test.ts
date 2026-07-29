import { describe, it, expect } from 'vitest';
import { DeploymentPipelineAggregate } from './DeploymentPipelineAggregate.js';
import { DisasterRecoveryAggregate } from './DisasterRecoveryAggregate.js';

describe('DevOps & Production Readiness Domain Aggregates', () => {
  it('should create and update DeploymentPipelineAggregate', () => {
    const res = DeploymentPipelineAggregate.create({
      tenantId: 'tenant-1',
      pipelineName: 'main-ci-cd-release',
      branch: 'main',
      commitHash: '7a8b9c0',
      commitMessage: 'feat(sprint-17): Production Readiness release automation',
      triggeredBy: 'github-actions[bot]',
      status: 'BUILDING',
      dockerImageTag: 'inducore-api:v2.5.0-prod',
      dockerImageSizeBytes: 142000000,
      steps: [
        { name: 'TypeScript Typecheck', status: 'PASSED', durationSeconds: 12, logSummary: '0 errors found' },
        { name: 'ESLint & Prettier', status: 'PASSED', durationSeconds: 8, logSummary: 'Linting clean' },
        { name: 'Vitest Unit & Integration Suite', status: 'PASSED', durationSeconds: 15, logSummary: '31 tests passed' },
        { name: 'Trivy Security Vulnerability Scan', status: 'RUNNING', durationSeconds: 0, logSummary: 'Scanning container image layers...' },
      ],
      vulnerabilities: [
        {
          id: 'CVE-2026-10492',
          severity: 'LOW',
          packageName: 'libssl3',
          installedVersion: '3.0.2',
          fixedVersion: '3.0.3',
          description: 'Minor non-exploitable memory alignment warning',
        },
      ],
      createdAt: new Date().toISOString(),
    });

    expect(res.isSuccess).toBe(true);
    const pipeline = res.getValue();
    expect(pipeline.branch).toBe('main');
    expect(pipeline.vulnerabilities.length).toBe(1);

    pipeline.completeStep('Trivy Security Vulnerability Scan', true, '0 Critical vulnerabilities', 10);
    pipeline.markCompleted('SUCCESS');
    expect(pipeline.status).toBe('SUCCESS');
    expect(pipeline.completedAt).toBeDefined();
  });

  it('should create and verify DisasterRecoveryAggregate', () => {
    const res = DisasterRecoveryAggregate.create({
      tenantId: 'tenant-1',
      backupName: 'daily-postgres-cloudsql-snapshot',
      type: 'FULL_DATABASE_SNAPSHOT',
      status: 'COMPLETED',
      sizeBytes: 4500000000,
      checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      storageRegion: 'us-central1',
      isEncrypted: true,
      retentionDays: 30,
      rpoMinutesActual: 5,
      rtoMinutesTarget: 15,
      createdAt: new Date().toISOString(),
    });

    expect(res.isSuccess).toBe(true);
    const backup = res.getValue();
    expect(backup.isEncrypted).toBe(true);
    expect(backup.rpoMinutesActual).toBe(5);

    backup.verifyRestoreDryRun(true);
    expect(backup.status).toBe('VERIFIED');
    expect(backup.verificationPassed).toBe(true);
  });
});
