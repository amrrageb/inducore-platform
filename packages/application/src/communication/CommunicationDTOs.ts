import { z } from 'zod';

export const NotificationChannelSchema = z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']);
export const NotificationCategorySchema = z.enum([
  'RFQ_UPDATE',
  'PO_STATUS',
  'CONTRACT_APPROVAL',
  'QUALITY_ALERT',
  'ANNOUNCEMENT',
  'DIRECT_MESSAGE',
]);

export const SendNotificationRequestSchema = z.object({
  recipientId: z.string().min(1),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  channel: NotificationChannelSchema,
  category: NotificationCategorySchema,
  subject: z.string().min(1),
  body: z.string().min(1),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  relatedEntityId: z.string().optional(),
  relatedEntityType: z.enum(['RFQ', 'PO', 'CONTRACT', 'SUPPLIER', 'ANNOUNCEMENT']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const SendRFQChatMessageSchema = z.object({
  rfqId: z.string().min(1),
  senderId: z.string().min(1),
  senderName: z.string().min(1),
  senderRole: z.enum(['BUYER', 'SUPPLIER', 'SYSTEM']),
  text: z.string().min(1),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileSizeMb: z.number(),
  })).optional(),
  quoteReferenceId: z.string().optional(),
  priceQuoted: z.number().optional(),
});

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.enum(['MAINTENANCE', 'QUALITY_MANDATE', 'AUDIT_NOTICE', 'PLATFORM_FEATURE', 'GENERAL']),
  targetRoles: z.array(z.enum(['BUYER', 'SUPPLIER', 'AUDITOR', 'ADMIN'])).min(1),
  isPinned: z.boolean().default(false),
  priority: z.enum(['NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
  expiresAt: z.string().optional(),
});

export const UpdateNotificationPreferencesSchema = z.object({
  rfqUpdates: z.object({ email: z.boolean(), sms: z.boolean(), push: z.boolean(), inApp: z.boolean() }).optional(),
  poStatus: z.object({ email: z.boolean(), sms: z.boolean(), push: z.boolean(), inApp: z.boolean() }).optional(),
  contractApprovals: z.object({ email: z.boolean(), sms: z.boolean(), push: z.boolean(), inApp: z.boolean() }).optional(),
  qualityAlerts: z.object({ email: z.boolean(), sms: z.boolean(), push: z.boolean(), inApp: z.boolean() }).optional(),
  announcements: z.object({ email: z.boolean(), sms: z.boolean(), push: z.boolean(), inApp: z.boolean() }).optional(),
  directMessages: z.object({ email: z.boolean(), sms: z.boolean(), push: z.boolean(), inApp: z.boolean() }).optional(),
  digestFrequency: z.enum(['INSTANT', 'DAILY_SUMMARY', 'WEEKLY_DIGEST']).optional(),
  doNotDisturb: z.boolean().optional(),
});

export type SendNotificationDTO = z.infer<typeof SendNotificationRequestSchema>;
export type SendRFQChatMessageDTO = z.infer<typeof SendRFQChatMessageSchema>;
export type CreateAnnouncementDTO = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateNotificationPreferencesDTO = z.infer<typeof UpdateNotificationPreferencesSchema>;
