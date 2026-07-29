import { z } from 'zod';

export const UpdateScoresSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  qualityScore: z.number().min(0).max(100).optional(),
  deliveryScore: z.number().min(0).max(100).optional(),
  costScore: z.number().min(0).max(100).optional(),
  responsivenessScore: z.number().min(0).max(100).optional(),
  evaluatedBy: z.string().optional(),
});

export const UpdateMetricsSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  metrics: z.object({
    defectPpm: z.number().min(0).optional(),
    onTimeDeliveryPct: z.number().min(0).max(100).optional(),
    costVariancePct: z.number().optional(),
    avgResponseHours: z.number().min(0).optional(),
    auditCompliancePct: z.number().min(0).max(100).optional(),
  }),
});

export const BlacklistSupplierSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  reason: z.string().min(3, 'Detailed reason for blacklisting is required'),
  blacklistedBy: z.string().min(1, 'Authorizing user is required'),
});

export const RemoveBlacklistSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  removedBy: z.string().min(1, 'Authorizing user is required'),
});

export const TogglePreferredSupplierSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  category: z.string().optional(),
  approvedBy: z.string().optional(),
});

export const UpdateRiskLevelSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export const RecordHistoricalTrendSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  period: z.string().min(2, 'Period e.g., Q1 2026 is required'),
  notes: z.string().optional(),
});
