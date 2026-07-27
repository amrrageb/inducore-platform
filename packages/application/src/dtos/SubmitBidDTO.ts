import { z } from 'zod';

export const SubmitBidDTOSchema = z.object({
  rfqId: z.string().uuid(),
  tenantId: z.string().uuid(),
  supplierId: z.string().min(1),
  supplierName: z.string().min(1),
  totalBidAmount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  leadTimeDays: z.number().int().positive()
});

export type SubmitBidDTO = z.infer<typeof SubmitBidDTOSchema>;
