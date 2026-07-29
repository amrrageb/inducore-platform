import { Router, Request, Response } from 'express';
import { DevOpsUseCases, TriggerPipelineSchema, ScheduleBackupSchema, RunLoadTestSchema, TriggerSecurityScanSchema } from '@inducore/application';
import { DevOpsRepository } from '@inducore/infrastructure';

export const devopsRouter = Router();
const devopsRepository = new DevOpsRepository();
const devopsUseCases = new DevOpsUseCases(devopsRepository);

// GET /v1/devops/pipelines - List CI/CD deployment pipelines
devopsRouter.get('/pipelines', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const result = await devopsUseCases.listPipelines(tenantId);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    const dtos = result.getValue().map(p => ({
      id: p.id,
      tenantId: p.tenantId,
      pipelineName: p.pipelineName,
      branch: p.branch,
      commitHash: p.commitHash,
      commitMessage: p.commitMessage,
      triggeredBy: p.triggeredBy,
      status: p.status,
      dockerImageTag: p.dockerImageTag,
      dockerImageSizeBytes: p.dockerImageSizeBytes,
      steps: p.steps,
      vulnerabilities: p.vulnerabilities,
      createdAt: p.createdAt,
      completedAt: p.completedAt,
    }));
    return res.json(dtos);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/devops/pipelines/trigger - Trigger a new build & deployment pipeline run
devopsRouter.post('/pipelines/trigger', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const validation = TriggerPipelineSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const result = await devopsUseCases.triggerPipeline(tenantId, validation.data);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    const p = result.getValue();
    return res.status(201).json({
      id: p.id,
      tenantId: p.tenantId,
      pipelineName: p.pipelineName,
      branch: p.branch,
      commitHash: p.commitHash,
      status: p.status,
      dockerImageTag: p.dockerImageTag,
      steps: p.steps,
      createdAt: p.createdAt,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/devops/backups - List Disaster Recovery & Backup Snapshots
devopsRouter.get('/backups', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const result = await devopsUseCases.listBackups(tenantId);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    const dtos = result.getValue().map(b => ({
      id: b.id,
      tenantId: b.tenantId,
      backupName: b.backupName,
      type: b.type,
      status: b.status,
      sizeBytes: b.sizeBytes,
      checksumSha256: b.checksumSha256,
      storageRegion: b.storageRegion,
      isEncrypted: b.isEncrypted,
      retentionDays: b.retentionDays,
      rpoMinutesActual: b.rpoMinutesActual,
      rtoMinutesTarget: b.rtoMinutesTarget,
      lastVerificationDate: b.lastVerificationDate,
      verificationPassed: b.verificationPassed,
      createdAt: b.createdAt,
    }));
    return res.json(dtos);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/devops/backups/schedule - Schedule automated database / vector store backup
devopsRouter.post('/backups/schedule', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const validation = ScheduleBackupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const result = await devopsUseCases.scheduleBackup(tenantId, validation.data);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    const b = result.getValue();
    return res.status(201).json({
      id: b.id,
      backupName: b.backupName,
      status: b.status,
      checksumSha256: b.checksumSha256,
      createdAt: b.createdAt,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/devops/backups/:id/verify - Run dry-run restore verification test
devopsRouter.post('/backups/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await devopsUseCases.verifyRestoreDryRun(id);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    const b = result.getValue();
    return res.json({
      id: b.id,
      status: b.status,
      verificationPassed: b.verificationPassed,
      lastVerificationDate: b.lastVerificationDate,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/devops/load-tests - List performance load test runs
devopsRouter.get('/load-tests', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const result = await devopsUseCases.listLoadTests(tenantId);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/devops/load-tests/run - Trigger k6 load test execution
devopsRouter.post('/load-tests/run', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const validation = RunLoadTestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const result = await devopsUseCases.runLoadTest(tenantId, validation.data);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/devops/security/scan - Trigger container vulnerability security scan
devopsRouter.post('/security/scan', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const validation = TriggerSecurityScanSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const result = await devopsUseCases.triggerSecurityScan(tenantId, validation.data);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/devops/prometheus-metrics - Prometheus Metrics Scrape Endpoint
devopsRouter.get('/prometheus-metrics', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const result = await devopsUseCases.getPrometheusMetrics(tenantId);
    if (result.isFailure) {
      return res.status(400).json({ error: result.error });
    }
    const metrics = result.getValue();
    let prometheusText = '# HELP inducore_system Metrics exporter for InduCore Monorepo\n# TYPE inducore_system counter\n';
    metrics.forEach(m => {
      prometheusText += `# HELP ${m.metricName} ${m.description}\n# TYPE ${m.metricName} ${m.type.toLowerCase()}\n${m.metricName} ${m.value}\n\n`;
    });
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    return res.send(prometheusText);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
