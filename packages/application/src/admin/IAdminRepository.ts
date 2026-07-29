import {
  PlatformSettingsAggregate,
  RoleAndPermissionAggregate,
  ApiKeyAggregate,
  WebhookSubscriptionAggregate,
  BackgroundJobAggregate,
  SystemHealthAggregate,
} from '@inducore/core-domain';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export interface IAdminRepository {
  getPlatformSettings(tenantId: string): Promise<PlatformSettingsAggregate | null>;
  savePlatformSettings(settings: PlatformSettingsAggregate): Promise<void>;
  listRoles(tenantId: string): Promise<RoleAndPermissionAggregate[]>;
  saveRole(role: RoleAndPermissionAggregate): Promise<void>;
  listApiKeys(tenantId: string): Promise<ApiKeyAggregate[]>;
  saveApiKey(key: ApiKeyAggregate): Promise<void>;
  deleteApiKey(id: string): Promise<void>;
  listWebhooks(tenantId: string): Promise<WebhookSubscriptionAggregate[]>;
  saveWebhook(webhook: WebhookSubscriptionAggregate): Promise<void>;
  deleteWebhook(id: string): Promise<void>;
  listBackgroundJobs(tenantId: string): Promise<BackgroundJobAggregate[]>;
  getJobById(id: string): Promise<BackgroundJobAggregate | null>;
  saveJob(job: BackgroundJobAggregate): Promise<void>;
  getSystemHealth(tenantId: string): Promise<SystemHealthAggregate | null>;
  listAuditLogs(tenantId: string): Promise<AuditLogEntry[]>;
}
