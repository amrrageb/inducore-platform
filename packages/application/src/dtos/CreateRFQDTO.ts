import { z } from 'zod';

export const CreateRFQDTOSchema = z.object({
  tenantId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().default(''),
  lineItems: z.array(
    z.object({
      sku: z.string().min(1),
      partName: z.string().min(1),
      quantity: z.number().int().positive(),
      targetPriceAmount: z.number().nonnegative().optional(),
      currency: z.string().length(3).default('USD')
    })
  ).min(1, 'At least one line item is required')
});

export type CreateRFQDTO = z.infer<typeof CreateRFQDTOSchema>;
