import {
  PlatformSettingsAggregate,
  RoleAndPermissionAggregate,
  ApiKeyAggregate,
  WebhookSubscriptionAggregate,
  BackgroundJobAggregate,
  SystemHealthAggregate,
} from '@inducore/core-domain';
import { IAdminRepository, AuditLogEntry } from '@inducore/application';

export class AdminRepository implements IAdminRepository {
  private platformSettings: Map<string, PlatformSettingsAggregate> = new Map();
  private roles: Map<string, RoleAndPermissionAggregate> = new Map();
  private apiKeys: Map<string, ApiKeyAggregate> = new Map();
  private webhooks: Map<string, WebhookSubscriptionAggregate> = new Map();
  private backgroundJobs: Map<string, BackgroundJobAggregate> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    // 1. Platform Settings & Feature Flags
    const settingsRes = PlatformSettingsAggregate.create({
      tenantId: 'tenant-1',
      companyName: 'InduCore Global Heavy Manufacturing',
      domainName: 'inducore-enterprise.com',
      supportEmail: 'support@inducore-enterprise.com',
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      enforceSSO: true,
      requireMFA: true,
      passwordPolicyDays: 90,
      subscription: {
        planType: 'ENTERPRISE_PREMIUM',
        maxUsers: 500,
        maxRFQsPerMonth: 10000,
        aiRAGQuotaPerMonth: 50000,
        customSLAEnabled: true,
        renewalDate: '2027-01-15T00:00:00Z',
        billingStatus: 'ACTIVE',
      },
      featureFlags: [
        { key: 'AI_RAG_ASSISTANT', name: 'Industrial AI Assistant (Gemini 2.5)', description: 'Enable contextual vector search RAG and AI evaluation assistant.', isEnabled: true, targetTenants: [] },
        { key: 'REALTIME_RFQ_CHAT', name: 'Real-Time RFQ B2B Chat', description: 'Enable WebSocket live streaming messaging threads with suppliers.', isEnabled: true, targetTenants: [] },
        { key: 'ADVANCED_TELEMETRY', name: 'IoT Telemetry Pipeline', description: 'Ingest live MQTT/OPC-UA equipment sensor data streams.', isEnabled: true, targetTenants: [] },
        { key: 'AUTO_AWARD_ENGINE', name: 'Automated RFQ Award Engine', description: 'Auto-recommend optimal suppliers based on weighted AI scorecards.', isEnabled: false, targetTenants: [] },
        { key: 'TRANSACTIONAL_OUTBOX_WORKER', name: 'Transactional Event Outbox Worker', description: 'Ensure reliable event publishing across aggregate boundaries.', isEnabled: true, targetTenants: [] },
      ],
      updatedAt: '2026-07-29T00:00:00Z',
    }, 'set-101');
    if (settingsRes.isSuccess) this.platformSettings.set('tenant-1', settingsRes.getValue());

    // 2. Roles & Permissions
    const roleAdmin = RoleAndPermissionAggregate.create({
      tenantId: 'tenant-1',
      name: 'Super Administrator',
      code: 'ROLE_SUPER_ADMIN',
      description: 'Unrestricted full platform administrative access and governance.',
      isSystemRole: true,
      permissions: ['rfq:all', 'contract:all', 'inventory:all', 'analytics:all', 'admin:all'],
      assignedUserCount: 4,
      createdAt: '2026-01-01T00:00:00Z',
    }, 'role-1');

    const roleProcurementMgr = RoleAndPermissionAggregate.create({
      tenantId: 'tenant-1',
      name: 'Procurement Director',
      code: 'ROLE_PROCUREMENT_DIRECTOR',
      description: 'Approve high-value RFQ awards, sign digital contracts, and view executive analytics.',
      isSystemRole: false,
      permissions: ['rfq:create', 'rfq:award', 'contract:sign', 'analytics:export'],
      assignedUserCount: 12,
      createdAt: '2026-02-15T00:00:00Z',
    }, 'role-2');

    const roleSupplierContact = RoleAndPermissionAggregate.create({
      tenantId: 'tenant-1',
      name: 'Supplier Portal Representative',
      code: 'ROLE_SUPPLIER_PORTAL',
      description: 'External vendor access to submit bids, send chat messages, and upload compliance certificates.',
      isSystemRole: true,
      permissions: ['rfq:bid', 'communication:chat'],
      assignedUserCount: 154,
      createdAt: '2026-02-20T00:00:00Z',
    }, 'role-3');

    if (roleAdmin.isSuccess) this.roles.set(roleAdmin.getValue().id, roleAdmin.getValue());
    if (roleProcurementMgr.isSuccess) this.roles.set(roleProcurementMgr.getValue().id, roleProcurementMgr.getValue());
    if (roleSupplierContact.isSuccess) this.roles.set(roleSupplierContact.getValue().id, roleSupplierContact.getValue());

    // 3. API Keys
    const key1 = ApiKeyAggregate.create({
      tenantId: 'tenant-1',
      name: 'SAP S/4HANA ERP Synchronization Service',
      keyPrefix: 'ind_sap',
      hashedSecret: 'sha256_hash_988a71',
      scopes: ['inventory:read', 'inventory:write', 'po:read'],
      isActive: true,
      lastUsedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      expiresAt: '2027-07-29T00:00:00Z',
      createdBy: 'System Integration Admin',
      createdAt: '2026-03-10T00:00:00Z',
    }, 'key-101');

    const key2 = ApiKeyAggregate.create({
      tenantId: 'tenant-1',
      name: 'PowerBI Executive Reporting Pipeline',
      keyPrefix: 'ind_pbi',
      hashedSecret: 'sha256_hash_321b55',
      scopes: ['analytics:read', 'rfq:read'],
      isActive: true,
      lastUsedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      expiresAt: '2026-12-31T00:00:00Z',
      createdBy: 'Finance Analytics Team',
      createdAt: '2026-04-01T00:00:00Z',
    }, 'key-102');

    if (key1.isSuccess) this.apiKeys.set(key1.getValue().id, key1.getValue());
    if (key2.isSuccess) this.apiKeys.set(key2.getValue().id, key2.getValue());

    // 4. Webhook Subscriptions
    const hook1 = WebhookSubscriptionAggregate.create({
      tenantId: 'tenant-1',
      name: 'Slack Procurement Alerts Hook',
      targetUrl: 'https://hooks.slack.com/services/T00/B00/XXXXXX',
      secretKey: 'whsec_slack_8899',
      subscribedEvents: ['rfq.awarded', 'po.issued', 'contract.signed'],
      isActive: true,
      failedAttempts: 0,
      lastTriggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      lastResponseCode: 200,
      createdAt: '2026-05-01T00:00:00Z',
    }, 'hook-101');

    const hook2 = WebhookSubscriptionAggregate.create({
      tenantId: 'tenant-1',
      name: 'ERP Outbox Event Listener',
      targetUrl: 'https://erp.inducore-enterprise.com/events/listener',
      secretKey: 'whsec_erp_7722',
      subscribedEvents: ['inventory.adjusted', 'supplier.evaluated'],
      isActive: true,
      failedAttempts: 1,
      lastTriggeredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      lastResponseCode: 200,
      createdAt: '2026-05-15T00:00:00Z',
    }, 'hook-102');

    if (hook1.isSuccess) this.webhooks.set(hook1.getValue().id, hook1.getValue());
    if (hook2.isSuccess) this.webhooks.set(hook2.getValue().id, hook2.getValue());

    // 5. Background Jobs
    const job1 = BackgroundJobAggregate.create({
      tenantId: 'tenant-1',
      queueName: 'outbox-delivery',
      jobName: 'Publish RFQ Award Events to Kafka',
      status: 'COMPLETED',
      progressPercentage: 100,
      durationMs: 420,
      attempts: 1,
      maxAttempts: 3,
      payloadSummary: 'RFQ #RFQ-2026-088 awarded to Apex Steel',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
    }, 'job-101');

    const job2 = BackgroundJobAggregate.create({
      tenantId: 'tenant-1',
      queueName: 'ai-rag-indexing',
      jobName: 'Re-index Knowledge Base Vectors',
      status: 'RUNNING',
      progressPercentage: 72,
      attempts: 1,
      maxAttempts: 3,
      payloadSummary: 'Processing 45 ISO compliance PDFs & supplier contracts',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    }, 'job-102');

    const job3 = BackgroundJobAggregate.create({
      tenantId: 'tenant-1',
      queueName: 'scheduled-reports',
      jobName: 'Generate Weekly CPO PDF Digest',
      status: 'FAILED',
      progressPercentage: 40,
      durationMs: 3400,
      errorMessage: 'Font asset failure during headless PDF rendering',
      attempts: 2,
      maxAttempts: 3,
      payloadSummary: 'Weekly Executive Summary PDF for cpo@inducore.com',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    }, 'job-103');

    if (job1.isSuccess) this.backgroundJobs.set(job1.getValue().id, job1.getValue());
    if (job2.isSuccess) this.backgroundJobs.set(job2.getValue().id, job2.getValue());
    if (job3.isSuccess) this.backgroundJobs.set(job3.getValue().id, job3.getValue());

    // 6. Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        actor: 'user-admin@inducore.com',
        action: 'UPDATE_SECURITY_POLICY',
        target: 'PlatformSettings',
        ipAddress: '192.168.1.104',
        status: 'SUCCESS',
        details: 'Enforced MFA requirement and updated password policy to 90 days.',
      },
      {
        id: 'aud-2',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        actor: 'cpo@inducore.com',
        action: 'TOGGLE_FEATURE_FLAG',
        target: 'FeatureFlag:AI_RAG_ASSISTANT',
        ipAddress: '10.0.4.12',
        status: 'SUCCESS',
        details: 'Enabled Gemini 2.5 Industrial RAG Assistant for Enterprise workspace.',
      },
      {
        id: 'aud-3',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        actor: 'system-service',
        action: 'API_KEY_AUTHENTICATION',
        target: 'ApiKey:ind_sap',
        ipAddress: '172.16.0.45',
        status: 'SUCCESS',
        details: 'API Key authenticated successfully for inventory SKU sync.',
      },
      {
        id: 'aud-4',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        actor: 'unknown-client',
        action: 'WEBHOOK_DELIVERY',
        target: 'Webhook:Slack Procurement Alerts',
        ipAddress: '54.210.12.8',
        status: 'SUCCESS',
        details: 'Webhook payload HTTP 200 OK delivered in 184ms.',
      },
      {
        id: 'aud-5',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        actor: 'user-admin@inducore.com',
        action: 'CREATE_API_KEY',
        target: 'ApiKey:ind_pbi',
        ipAddress: '192.168.1.104',
        status: 'SUCCESS',
        details: 'Generated new API key for PowerBI integration with read scopes.',
      },
    ];
  }

  public async getPlatformSettings(tenantId: string): Promise<PlatformSettingsAggregate | null> {
    return this.platformSettings.get(tenantId) || this.platformSettings.get('tenant-1') || null;
  }

  public async savePlatformSettings(settings: PlatformSettingsAggregate): Promise<void> {
    this.platformSettings.set(settings.tenantId, settings);
  }

  public async listRoles(_tenantId: string): Promise<RoleAndPermissionAggregate[]> {
    return Array.from(this.roles.values());
  }

  public async saveRole(role: RoleAndPermissionAggregate): Promise<void> {
    this.roles.set(role.id, role);
  }

  public async listApiKeys(_tenantId: string): Promise<ApiKeyAggregate[]> {
    return Array.from(this.apiKeys.values());
  }

  public async saveApiKey(key: ApiKeyAggregate): Promise<void> {
    this.apiKeys.set(key.id, key);
  }

  public async deleteApiKey(id: string): Promise<void> {
    this.apiKeys.delete(id);
  }

  public async listWebhooks(_tenantId: string): Promise<WebhookSubscriptionAggregate[]> {
    return Array.from(this.webhooks.values());
  }

  public async saveWebhook(webhook: WebhookSubscriptionAggregate): Promise<void> {
    this.webhooks.set(webhook.id, webhook);
  }

  public async deleteWebhook(id: string): Promise<void> {
    this.webhooks.delete(id);
  }

  public async listBackgroundJobs(_tenantId: string): Promise<BackgroundJobAggregate[]> {
    return Array.from(this.backgroundJobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getJobById(id: string): Promise<BackgroundJobAggregate | null> {
    return this.backgroundJobs.get(id) || null;
  }

  public async saveJob(job: BackgroundJobAggregate): Promise<void> {
    this.backgroundJobs.set(job.id, job);
  }

  public async getSystemHealth(tenantId: string): Promise<SystemHealthAggregate | null> {
    const healthRes = SystemHealthAggregate.create({
      tenantId,
      overallStatus: 'HEALTHY',
      activeWorkers: 8,
      queueBacklogCount: 3,
      cpuUsagePercent: 24.5,
      memoryUsagePercent: 41.2,
      dbConnectionPoolActive: 14,
      services: [
        { serviceName: 'API Gateway & Express Routes', status: 'HEALTHY', latencyMs: 12, uptimePercent: 99.98, lastCheckedAt: new Date().toISOString() },
        { serviceName: 'PostgreSQL Cloud Database / Pool', status: 'HEALTHY', latencyMs: 4, uptimePercent: 99.99, lastCheckedAt: new Date().toISOString() },
        { serviceName: 'Gemini 2.5 AI RAG Engine', status: 'HEALTHY', latencyMs: 145, uptimePercent: 99.90, lastCheckedAt: new Date().toISOString() },
        { serviceName: 'Transactional Outbox Kafka Worker', status: 'HEALTHY', latencyMs: 18, uptimePercent: 99.95, lastCheckedAt: new Date().toISOString() },
        { serviceName: 'WebSocket RFQ Real-Time Engine', status: 'HEALTHY', latencyMs: 8, uptimePercent: 99.97, lastCheckedAt: new Date().toISOString() },
      ],
      snapshotTimestamp: new Date().toISOString(),
    }, 'health-101');

    return healthRes.isSuccess ? healthRes.getValue() : null;
  }

  public async listAuditLogs(_tenantId: string): Promise<AuditLogEntry[]> {
    return this.auditLogs;
  }
}
