import { z } from 'zod';

export const AnalyticsFilterSchema = z.object({
  timeframe: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'YTD', 'TRAILING_12M']).default('YTD'),
  category: z.string().optional(),
  supplierId: z.string().optional(),
});

export type AnalyticsFilterDTO = z.infer<typeof AnalyticsFilterSchema>;

export const CreateScheduledReportSchema = z.object({
  name: z.string().min(3, 'Report name must be at least 3 characters'),
  description: z.string().optional(),
  reportType: z.enum(['EXECUTIVE_SUMMARY', 'PROCUREMENT_KPIS', 'SUPPLIER_PERFORMANCE', 'COST_SAVINGS', 'SPEND_ANALYSIS']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
  format: z.enum(['EXCEL', 'PDF', 'CSV']),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient required'),
});

export type CreateScheduledReportDTO = z.infer<typeof CreateScheduledReportSchema>;

export const ExportReportSchema = z.object({
  reportType: z.enum(['EXECUTIVE_SUMMARY', 'PROCUREMENT_KPIS', 'SUPPLIER_PERFORMANCE', 'COST_SAVINGS', 'SPEND_ANALYSIS']),
  format: z.enum(['EXCEL', 'PDF', 'CSV']),
  timeframe: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'YTD', 'TRAILING_12M']).default('YTD'),
});

export type ExportReportDTO = z.infer<typeof ExportReportSchema>;
