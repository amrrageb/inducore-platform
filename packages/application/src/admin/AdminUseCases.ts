import {
  Result,
  PlatformSettingsAggregate,
  RoleAndPermissionAggregate,
  ApiKeyAggregate,
  WebhookSubscriptionAggregate,
  BackgroundJobAggregate,
  SystemHealthAggregate,
} from '@inducore/core-domain';
import { IAdminRepository, AuditLogEntry } from './IAdminRepository.js';
import {
  UpdateCompanySettingsDTO,
  UpdateSecurityPolicyDTO,
  CreateApiKeyDTO,
  CreateWebhookDTO,
  UpdateRolePermissionsDTO,
} from './AdminDTOs.js';

export class AdminUseCases {
  constructor(private readonly adminRepository: IAdminRepository) {}

  public async getPlatformSettings(tenantId: string): Promise<Result<PlatformSettingsAggregate>> {
    const settings = await this.adminRepository.getPlatformSettings(tenantId);
    if (!settings) {
      return Result.fail<PlatformSettingsAggregate>('Platform settings not found');
    }
    return Result.ok<PlatformSettingsAggregate>(settings);
  }

  public async updateCompanySettings(
    tenantId: string,
    dto: UpdateCompanySettingsDTO
  ): Promise<Result<PlatformSettingsAggregate>> {
    const settings = await this.adminRepository.getPlatformSettings(tenantId);
    if (!settings) return Result.fail<PlatformSettingsAggregate>('Settings not found');

    settings.updateCompanyInfo(dto.companyName, dto.supportEmail, dto.timezone, dto.defaultCurrency);
    await this.adminRepository.savePlatformSettings(settings);
    return Result.ok<PlatformSettingsAggregate>(settings);
  }

  public async updateSecurityPolicy(
    tenantId: string,
    dto: UpdateSecurityPolicyDTO
  ): Promise<Result<PlatformSettingsAggregate>> {
    const settings = await this.adminRepository.getPlatformSettings(tenantId);
    if (!settings) return Result.fail<PlatformSettingsAggregate>('Settings not found');

    settings.updateSecurityPolicy(dto.enforceSSO, dto.requireMFA, dto.passwordPolicyDays);
    await this.adminRepository.savePlatformSettings(settings);
    return Result.ok<PlatformSettingsAggregate>(settings);
  }

  public async toggleFeatureFlag(tenantId: string, flagKey: string): Promise<Result<PlatformSettingsAggregate>> {
    const settings = await this.adminRepository.getPlatformSettings(tenantId);
    if (!settings) return Result.fail<PlatformSettingsAggregate>('Settings not found');

    settings.toggleFeatureFlag(flagKey);
    await this.adminRepository.savePlatformSettings(settings);
    return Result.ok<PlatformSettingsAggregate>(settings);
  }

  public async listRoles(tenantId: string): Promise<Result<RoleAndPermissionAggregate[]>> {
    const roles = await this.adminRepository.listRoles(tenantId);
    return Result.ok<RoleAndPermissionAggregate[]>(roles);
  }

  public async updateRolePermissions(
    _tenantId: string,
    dto: UpdateRolePermissionsDTO
  ): Promise<Result<RoleAndPermissionAggregate>> {
    const roles = await this.adminRepository.listRoles(_tenantId);
    const role = roles.find(r => r.id === dto.roleId);
    if (!role) return Result.fail<RoleAndPermissionAggregate>('Role not found');

    const updateRes = role.updatePermissions(dto.permissions);
    if (updateRes.isFailure) {
      return Result.fail<RoleAndPermissionAggregate>(updateRes.error || 'Failed to update permissions');
    }

    await this.adminRepository.saveRole(role);
    return Result.ok<RoleAndPermissionAggregate>(role);
  }

  public async createApiKey(
    tenantId: string,
    createdBy: string,
    dto: CreateApiKeyDTO
  ): Promise<Result<{ apiKey: ApiKeyAggregate; rawSecret: string }>> {
    const prefix = 'ind_' + Math.random().toString(36).substring(2, 6);
    const secretPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const rawSecret = `${prefix}_${secretPart}`;

    let expiresAt: string | undefined = undefined;
    if (dto.expiresInDays) {
      const exp = new Date();
      exp.setDate(exp.getDate() + dto.expiresInDays);
      expiresAt = exp.toISOString();
    }

    const keyRes = ApiKeyAggregate.create({
      tenantId,
      name: dto.name,
      keyPrefix: prefix,
      hashedSecret: 'sha256_mock_hash_' + secretPart,
      scopes: dto.scopes,
      isActive: true,
      expiresAt,
      createdBy,
      createdAt: new Date().toISOString(),
    });

    if (keyRes.isFailure) {
      return Result.fail<{ apiKey: ApiKeyAggregate; rawSecret: string }>(keyRes.error || 'Failed to create API key');
    }

    const apiKey = keyRes.getValue();
    await this.adminRepository.saveApiKey(apiKey);
    return Result.ok({ apiKey, rawSecret });
  }

  public async listApiKeys(tenantId: string): Promise<Result<ApiKeyAggregate[]>> {
    const keys = await this.adminRepository.listApiKeys(tenantId);
    return Result.ok<ApiKeyAggregate[]>(keys);
  }

  public async deleteApiKey(id: string): Promise<Result<void>> {
    await this.adminRepository.deleteApiKey(id);
    return Result.ok(undefined);
  }

  public async createWebhook(
    tenantId: string,
    dto: CreateWebhookDTO
  ): Promise<Result<WebhookSubscriptionAggregate>> {
    const secretKey = 'whsec_' + Math.random().toString(36).substring(2, 12);
    const webhookRes = WebhookSubscriptionAggregate.create({
      tenantId,
      name: dto.name,
      targetUrl: dto.targetUrl,
      secretKey,
      subscribedEvents: dto.subscribedEvents,
      isActive: true,
      failedAttempts: 0,
      createdAt: new Date().toISOString(),
    });

    if (webhookRes.isFailure) {
      return Result.fail<WebhookSubscriptionAggregate>(webhookRes.error || 'Failed to create webhook');
    }

    const webhook = webhookRes.getValue();
    await this.adminRepository.saveWebhook(webhook);
    return Result.ok<WebhookSubscriptionAggregate>(webhook);
  }

  public async listWebhooks(tenantId: string): Promise<Result<WebhookSubscriptionAggregate[]>> {
    const hooks = await this.adminRepository.listWebhooks(tenantId);
    return Result.ok<WebhookSubscriptionAggregate[]>(hooks);
  }

  public async testTriggerWebhook(id: string): Promise<Result<WebhookSubscriptionAggregate>> {
    const hooks = await this.adminRepository.listWebhooks('tenant-1');
    const hook = hooks.find(h => h.id === id);
    if (!hook) return Result.fail<WebhookSubscriptionAggregate>('Webhook not found');

    hook.recordDeliveryResult(200);
    await this.adminRepository.saveWebhook(hook);
    return Result.ok<WebhookSubscriptionAggregate>(hook);
  }

  public async deleteWebhook(id: string): Promise<Result<void>> {
    await this.adminRepository.deleteWebhook(id);
    return Result.ok(undefined);
  }

  public async listBackgroundJobs(tenantId: string): Promise<Result<BackgroundJobAggregate[]>> {
    const jobs = await this.adminRepository.listBackgroundJobs(tenantId);
    return Result.ok<BackgroundJobAggregate[]>(jobs);
  }

  public async retryJob(id: string): Promise<Result<BackgroundJobAggregate>> {
    const job = await this.adminRepository.getJobById(id);
    if (!job) return Result.fail<BackgroundJobAggregate>('Job not found');

    const retryRes = job.triggerRetry();
    if (retryRes.isFailure) return Result.fail<BackgroundJobAggregate>(retryRes.error || 'Retry failed');

    await this.adminRepository.saveJob(job);
    return Result.ok<BackgroundJobAggregate>(job);
  }

  public async getSystemHealth(tenantId: string): Promise<Result<SystemHealthAggregate>> {
    const health = await this.adminRepository.getSystemHealth(tenantId);
    if (!health) return Result.fail<SystemHealthAggregate>('System health unavailable');
    return Result.ok<SystemHealthAggregate>(health);
  }

  public async listAuditLogs(tenantId: string): Promise<Result<AuditLogEntry[]>> {
    const logs = await this.adminRepository.listAuditLogs(tenantId);
    return Result.ok<AuditLogEntry[]>(logs);
  }
}
