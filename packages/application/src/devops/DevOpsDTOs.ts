import { z } from 'zod';

export const TriggerPipelineSchema = z.object({
  branch: z.string().min(1, 'Branch is required'),
  commitMessage: z.string().min(3, 'Commit message required'),
  triggeredBy: z.string().min(1, 'Triggered by user/bot required'),
});

export type TriggerPipelineDTO = z.infer<typeof TriggerPipelineSchema>;

export const ScheduleBackupSchema = z.object({
  backupName: z.string().min(3, 'Backup name is required'),
  type: z.enum([
    'FULL_DATABASE_SNAPSHOT',
    'POINT_IN_TIME_LOGS',
    'KNOWLEDGE_BASE_VECTORS',
    'SYSTEM_CONFIG_DUMP',
  ]),
  retentionDays: z.number().min(1).max(365),
});

export type ScheduleBackupDTO = z.infer<typeof ScheduleBackupSchema>;

export const RunLoadTestSchema = z.object({
  targetEndpoint: z.string().url(),
  virtualUsers: z.number().min(5).max(1000),
  durationSeconds: z.number().min(10).max(600),
});

export type RunLoadTestDTO = z.infer<typeof RunLoadTestSchema>;

export const TriggerSecurityScanSchema = z.object({
  dockerImageTag: z.string().min(1),
  scanType: z.enum(['TRIVY_CONTAINER', 'DEPENDABOT_NPM', 'SECRET_DETECTION']),
});

export type TriggerSecurityScanDTO = z.infer<typeof TriggerSecurityScanSchema>;
