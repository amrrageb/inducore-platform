import { Router, Request, Response } from 'express';
import {
  UpdateCompanySettingsSchema,
  UpdateSecurityPolicySchema,
  CreateApiKeySchema,
  CreateWebhookSchema,
  UpdateRolePermissionsSchema,
  AdminUseCases,
} from '@inducore/application';
import { AdminRepository } from '@inducore/infrastructure';

const router: Router = Router();
const adminRepo = new AdminRepository();
const useCases = new AdminUseCases(adminRepo);

// GET /v1/admin/settings - Get platform & company settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-1';
    const result = await useCases.getPlatformSettings(tenantId);
    if (result.isFailure) {
      return res.status(404).json({ status: 'error', message: result.error });
    }
    const s = result.getValue();
    res.json({
      status: 'success',
      data: {
        tenantId: s.tenantId,
        companyName: s.companyName,
        domainName: s.domainName,
        supportEmail: s.supportEmail,
        defaultCurrency: s.defaultCurrency,
        timezone: s.timezone,
        enforceSSO: s.enforceSSO,
        requireMFA: s.requireMFA,
        passwordPolicyDays: s.passwordPolicyDays,
        subscription: s.subscription,
        featureFlags: s.featureFlags,
        updatedAt: s.props.updatedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT /v1/admin/company-settings - Update company info
router.put('/company-settings', async (req: Request, res: Response) => {
  try {
    const parseRes = UpdateCompanySettingsSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ status: 'error', errors: parseRes.error.flatten() });
    }
    const tenantId = (req.body.tenantId as string) || 'tenant-1';
    const result = await useCases.updateCompanySettings(tenantId, parseRes.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.json({ status: 'success', message: 'Company settings updated' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT /v1/admin/security-policy - Update security policy
router.put('/security-policy', async (req: Request, res: Response) => {
  try {
    const parseRes = UpdateSecurityPolicySchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ status: 'error', errors: parseRes.error.flatten() });
    }
    const tenantId = (req.body.tenantId as string) || 'tenant-1';
    const result = await useCases.updateSecurityPolicy(tenantId, parseRes.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.json({ status: 'success', message: 'Security policy updated' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PATCH /v1/admin/feature-flags/:key/toggle - Toggle feature flag
router.patch('/feature-flags/:key/toggle', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.body.tenantId as string) || 'tenant-1';
    const result = await useCases.toggleFeatureFlag(tenantId, req.params.key);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.json({ status: 'success', message: `Feature flag ${req.params.key} toggled` });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /v1/admin/roles - List roles & permissions
router.get('/roles', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-1';
    const result = await useCases.listRoles(tenantId);
    res.json({
      status: 'success',
      data: result.getValue().map(r => ({
        id: r.id,
        tenantId: r.tenantId,
        name: r.name,
        code: r.code,
        description: r.description,
        isSystemRole: r.isSystemRole,
        permissions: r.permissions,
        assignedUserCount: r.assignedUserCount,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT /v1/admin/roles/permissions - Update permissions for role
router.put('/roles/permissions', async (req: Request, res: Response) => {
  try {
    const parseRes = UpdateRolePermissionsSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ status: 'error', errors: parseRes.error.flatten() });
    }
    const tenantId = (req.body.tenantId as string) || 'tenant-1';
    const result = await useCases.updateRolePermissions(tenantId, parseRes.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.json({ status: 'success', message: 'Role permissions updated' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /v1/admin/api-keys - List API keys
router.get('/api-keys', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-1';
    const result = await useCases.listApiKeys(tenantId);
    res.json({
      status: 'success',
      data: result.getValue().map(k => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        scopes: k.scopes,
        isActive: k.isActive,
        lastUsedAt: k.lastUsedAt,
        expiresAt: k.expiresAt,
        createdBy: k.createdBy,
        createdAt: k.createdAt,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /v1/admin/api-keys - Create API key
router.post('/api-keys', async (req: Request, res: Response) => {
  try {
    const parseRes = CreateApiKeySchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ status: 'error', errors: parseRes.error.flatten() });
    }
    const tenantId = (req.body.tenantId as string) || 'tenant-1';
    const createdBy = (req.body.createdBy as string) || 'Admin User';
    const result = await useCases.createApiKey(tenantId, createdBy, parseRes.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    const { apiKey, rawSecret } = result.getValue();
    res.status(201).json({
      status: 'success',
      data: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        scopes: apiKey.scopes,
        rawSecret,
      },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /v1/admin/api-keys/:id - Delete API key
router.delete('/api-keys/:id', async (req: Request, res: Response) => {
  try {
    await useCases.deleteApiKey(req.params.id);
    res.json({ status: 'success', message: 'API key revoked and deleted' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /v1/admin/webhooks - List webhooks
router.get('/webhooks', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-1';
    const result = await useCases.listWebhooks(tenantId);
    res.json({
      status: 'success',
      data: result.getValue().map(w => ({
        id: w.id,
        name: w.name,
        targetUrl: w.targetUrl,
        secretKey: w.secretKey,
        subscribedEvents: w.subscribedEvents,
        isActive: w.isActive,
        failedAttempts: w.failedAttempts,
        lastTriggeredAt: w.lastTriggeredAt,
        lastResponseCode: w.lastResponseCode,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /v1/admin/webhooks - Create webhook
router.post('/webhooks', async (req: Request, res: Response) => {
  try {
    const parseRes = CreateWebhookSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ status: 'error', errors: parseRes.error.flatten() });
    }
    const tenantId = (req.body.tenantId as string) || 'tenant-1';
    const result = await useCases.createWebhook(tenantId, parseRes.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    const w = result.getValue();
    res.status(201).json({
      status: 'success',
      data: { id: w.id, name: w.name, targetUrl: w.targetUrl, secretKey: w.secretKey },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /v1/admin/webhooks/:id/test - Test trigger webhook
router.post('/webhooks/:id/test', async (req: Request, res: Response) => {
  try {
    const result = await useCases.testTriggerWebhook(req.params.id);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.json({ status: 'success', message: 'Test webhook event triggered successfully (HTTP 200 OK)' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /v1/admin/webhooks/:id - Delete webhook
router.delete('/webhooks/:id', async (req: Request, res: Response) => {
  try {
    await useCases.deleteWebhook(req.params.id);
    res.json({ status: 'success', message: 'Webhook subscription deleted' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /v1/admin/background-jobs - List background jobs
router.get('/background-jobs', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-1';
    const result = await useCases.listBackgroundJobs(tenantId);
    res.json({
      status: 'success',
      data: result.getValue().map(j => ({
        id: j.id,
        queueName: j.queueName,
        jobName: j.jobName,
        status: j.status,
        progressPercentage: j.progressPercentage,
        durationMs: j.durationMs,
        errorMessage: j.errorMessage,
        attempts: j.attempts,
        maxAttempts: j.maxAttempts,
        payloadSummary: j.payloadSummary,
        createdAt: j.createdAt,
        startedAt: j.startedAt,
        completedAt: j.completedAt,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /v1/admin/background-jobs/:id/retry - Retry failed job
router.post('/background-jobs/:id/retry', async (req: Request, res: Response) => {
  try {
    const result = await useCases.retryJob(req.params.id);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }
    res.json({ status: 'success', message: 'Background job requeued for execution' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /v1/admin/health - Get system health & telemetry
router.get('/health', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-1';
    const result = await useCases.getSystemHealth(tenantId);
    if (result.isFailure) {
      return res.status(404).json({ status: 'error', message: result.error });
    }
    const h = result.getValue();
    res.json({
      status: 'success',
      data: {
        tenantId: h.tenantId,
        overallStatus: h.overallStatus,
        activeWorkers: h.activeWorkers,
        queueBacklogCount: h.queueBacklogCount,
        cpuUsagePercent: h.cpuUsagePercent,
        memoryUsagePercent: h.memoryUsagePercent,
        services: h.services,
        snapshotTimestamp: h.props.snapshotTimestamp,
      },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /v1/admin/audit-logs - List system audit logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-1';
    const result = await useCases.listAuditLogs(tenantId);
    res.json({
      status: 'success',
      data: result.getValue(),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
