import { z } from 'zod';

export const UpdateCompanySettingsSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  supportEmail: z.string().email('Valid support email required'),
  timezone: z.string().min(1, 'Timezone required'),
  defaultCurrency: z.string().min(3).max(3),
});

export type UpdateCompanySettingsDTO = z.infer<typeof UpdateCompanySettingsSchema>;

export const UpdateSecurityPolicySchema = z.object({
  enforceSSO: z.boolean(),
  requireMFA: z.boolean(),
  passwordPolicyDays: z.number().min(30).max(365),
});

export type UpdateSecurityPolicyDTO = z.infer<typeof UpdateSecurityPolicySchema>;

export const CreateApiKeySchema = z.object({
  name: z.string().min(3, 'Key name must be at least 3 characters'),
  scopes: z.array(z.string()).min(1, 'Select at least one scope'),
  expiresInDays: z.number().optional(),
});

export type CreateApiKeyDTO = z.infer<typeof CreateApiKeySchema>;

export const CreateWebhookSchema = z.object({
  name: z.string().min(3, 'Webhook name must be at least 3 characters'),
  targetUrl: z.string().url('Target URL must be a valid HTTP/HTTPS URL'),
  subscribedEvents: z.array(z.string()).min(1, 'Select at least one event'),
});

export type CreateWebhookDTO = z.infer<typeof CreateWebhookSchema>;

export const UpdateRolePermissionsSchema = z.object({
  roleId: z.string().min(1),
  permissions: z.array(z.string()),
});

export type UpdateRolePermissionsDTO = z.infer<typeof UpdateRolePermissionsSchema>;
