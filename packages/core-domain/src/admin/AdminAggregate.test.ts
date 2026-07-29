import { describe, it, expect } from 'vitest';
import { PlatformSettingsAggregate } from './PlatformSettingsAggregate.js';
import { RoleAndPermissionAggregate } from './RoleAndPermissionAggregate.js';
import { WebhookSubscriptionAggregate } from './ApiKeyAndWebhookAggregate.js';
import { BackgroundJobAggregate } from './SystemHealthAndJobsAggregate.js';

describe('Administration Domain Aggregates', () => {
  it('should create and update PlatformSettingsAggregate', () => {
    const res = PlatformSettingsAggregate.create({
      tenantId: 'tenant-1',
      companyName: 'InduCore Global Heavy Engineering',
      domainName: 'inducore.com',
      supportEmail: 'admin@inducore.com',
      defaultCurrency: 'USD',
      timezone: 'UTC',
      enforceSSO: true,
      requireMFA: true,
      passwordPolicyDays: 90,
      subscription: {
        planType: 'ENTERPRISE_PREMIUM',
        maxUsers: 500,
        maxRFQsPerMonth: 10000,
        aiRAGQuotaPerMonth: 50000,
        customSLAEnabled: true,
        renewalDate: '2027-01-01',
        billingStatus: 'ACTIVE',
      },
      featureFlags: [
        { key: 'AI_RAG_ASSISTANT', name: 'Industrial AI Assistant', description: 'Enable Gemini RAG', isEnabled: true, targetTenants: [] },
      ],
      updatedAt: '2026-07-29T00:00:00Z',
    });

    expect(res.isSuccess).toBe(true);
    const agg = res.getValue();
    expect(agg.companyName).toBe('InduCore Global Heavy Engineering');

    agg.toggleFeatureFlag('AI_RAG_ASSISTANT');
    expect(agg.featureFlags[0].isEnabled).toBe(false);
  });

  it('should handle RoleAndPermissionAggregate and prevent modifying Super Admin system role', () => {
    const roleRes = RoleAndPermissionAggregate.create({
      tenantId: 'tenant-1',
      name: 'Super Administrator',
      code: 'ROLE_SUPER_ADMIN',
      description: 'Full system privileges',
      isSystemRole: true,
      permissions: ['rfq:all', 'admin:all'],
      assignedUserCount: 3,
      createdAt: '2026-01-01T00:00:00Z',
    });

    expect(roleRes.isSuccess).toBe(true);
    const role = roleRes.getValue();
    const updateRes = role.updatePermissions(['rfq:read']);
    expect(updateRes.isFailure).toBe(true);
    expect(updateRes.error).toContain('Super Admin');
  });

  it('should validate Webhook URL prefix and handle delivery results', () => {
    const invalidWebhook = WebhookSubscriptionAggregate.create({
      tenantId: 'tenant-1',
      name: 'Invalid Endpoint',
      targetUrl: 'ftp://invalid-url.com',
      secretKey: 'sec_123',
      subscribedEvents: ['rfq.created'],
      isActive: true,
      failedAttempts: 0,
      createdAt: '2026-07-29T00:00:00Z',
    });
    expect(invalidWebhook.isFailure).toBe(true);

    const validWebhookRes = WebhookSubscriptionAggregate.create({
      tenantId: 'tenant-1',
      name: 'ERP Outbox Integration',
      targetUrl: 'https://erp.inducore.com/api/v1/webhooks',
      secretKey: 'sec_888',
      subscribedEvents: ['rfq.created', 'po.issued'],
      isActive: true,
      failedAttempts: 4,
      createdAt: '2026-07-29T00:00:00Z',
    });
    expect(validWebhookRes.isSuccess).toBe(true);
    const webhook = validWebhookRes.getValue();

    // Record failure attempt that triggers auto-deactivation after 5 failures
    webhook.recordDeliveryResult(500);
    expect(webhook.failedAttempts).toBe(5);
    expect(webhook.isActive).toBe(false);
  });

  it('should manage BackgroundJobAggregate retries', () => {
    const jobRes = BackgroundJobAggregate.create({
      tenantId: 'tenant-1',
      queueName: 'outbox-delivery',
      jobName: 'Sync SAP Inventory Items',
      status: 'FAILED',
      progressPercentage: 45,
      attempts: 1,
      maxAttempts: 3,
      payloadSummary: 'Sync 1,200 SKU stock changes',
      errorMessage: 'Timeout connecting to SAP RFC interface',
      createdAt: '2026-07-29T00:00:00Z',
    });

    expect(jobRes.isSuccess).toBe(true);
    const job = jobRes.getValue();
    const retryRes = job.triggerRetry();
    expect(retryRes.isSuccess).toBe(true);
    expect(job.status).toBe('QUEUED');
    expect(job.attempts).toBe(2);
  });
});
