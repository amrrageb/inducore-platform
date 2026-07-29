import { z } from 'zod';

export const QuotationLineItemSchema = z.object({
  rfqLineItemId: z.string().min(1),
  itemName: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  isIncluded: z.boolean().default(true),
  technicalNotes: z.string().optional(),
});

export const CreateQuotationSchema = z.object({
  rfqId: z.string().min(1, 'RFQ ID is required'),
  rfqTitle: z.string().min(1, 'RFQ Title is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierName: z.string().min(1, 'Supplier Name is required'),
  isAlternativeOffer: z.boolean().optional(),
  alternativeOfferDetails: z.string().optional(),
  isPartialQuotation: z.boolean().optional(),
  currency: z.string().min(3).max(3).default('USD'),
  taxVatRatePercentage: z.number().min(0).max(100).default(10),
  incoterms: z.string().min(1).default('FOB'),
  incotermsLocation: z.string().min(1).default('Port of Loading'),
  deliveryTimeDays: z.number().int().positive().default(30),
  paymentTerms: z.string().min(1).default('Net 30'),
  validityUntil: z.string().min(1),
  lineItems: z.array(QuotationLineItemSchema).min(1, 'At least one line item is required'),
  internalNotes: z.string().optional(),
  isDraft: z.boolean().optional(),
});

export const CreateQuotationRevisionSchema = z.object({
  notes: z.string().min(1, 'Revision notes are required'),
  incoterms: z.string().optional(),
  deliveryTimeDays: z.number().int().positive().optional(),
  paymentTerms: z.string().optional(),
  validityUntil: z.string().optional(),
  lineItems: z
    .array(
      QuotationLineItemSchema.extend({
        id: z.string(),
        totalPrice: z.number(),
      })
    )
    .optional(),
});

export const WithdrawQuotationSchema = z.object({
  reason: z.string().min(1, 'Withdrawal reason is required'),
});

export const AddBuyerCommentSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  comment: z.string().min(1, 'Comment text is required'),
});

export const AddQuotationAttachmentSchema = z.object({
  name: z.string().min(1, 'Attachment name is required'),
  url: z.string().min(1, 'Attachment URL is required'),
  type: z.enum(['TECHNICAL', 'COMMERCIAL']),
  sizeKb: z.number().positive(),
});
