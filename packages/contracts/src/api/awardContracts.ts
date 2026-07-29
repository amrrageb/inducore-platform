import { z } from 'zod';

export const AwardTypeSchema = z.enum(['FULL', 'PARTIAL', 'MULTI_SUPPLIER']);

export const AwardStatusSchema = z.enum([
  'RECOMMENDED',
  'PENDING_APPROVAL',
  'APPROVED',
  'AWARD_LETTER_SENT',
  'ACCEPTED_BY_SUPPLIER',
  'REJECTED_BY_SUPPLIER',
  'CONTRACT_PREPARED',
  'PURCHASE_REQUEST_GENERATED',
  'CANCELLED',
  'REVISED',
]);

export const AwardLineAllocationSchema = z.object({
  id: z.string(),
  rfqLineItemId: z.string(),
  itemName: z.string(),
  requestedQuantity: z.number().positive(),
  awardedQuantity: z.number().nonnegative(),
  unit: z.string(),
  unitPrice: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  supplierId: z.string(),
  supplierName: z.string(),
});

export const CreateAwardRequestSchema = z.object({
  rfqId: z.string().min(1),
  rfqTitle: z.string().min(1),
  awardType: AwardTypeSchema,
  primarySupplierId: z.string().min(1),
  primarySupplierName: z.string().min(1),
  currency: z.string().default('USD'),
  lineAllocations: z.array(AwardLineAllocationSchema),
});

export const SubmitAwardApprovalRequestSchema = z.object({
  awardId: z.string().min(1),
  requestedBy: z.string().min(1),
  notes: z.string().default(''),
});

export const ApproveAwardRequestSchema = z.object({
  awardId: z.string().min(1),
  approverName: z.string().min(1),
  role: z.string().min(1),
  notes: z.string().default(''),
});

export const DispatchAwardLetterRequestSchema = z.object({
  awardId: z.string().min(1),
  letterBody: z.string().min(1),
});

export const PrepareContractRequestSchema = z.object({
  awardId: z.string().min(1),
  contractNumber: z.string().min(1),
  contractTitle: z.string().min(1),
  governingLaw: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  paymentTerms: z.string().min(1),
});

export const GeneratePurchaseRequestSchema = z.object({
  awardId: z.string().min(1),
  costCenter: z.string().min(1),
  generatedBy: z.string().min(1),
});

export const ReviseAwardRequestSchema = z.object({
  awardId: z.string().min(1),
  revisedBy: z.string().min(1),
  reason: z.string().min(1),
  updatedAllocations: z.array(AwardLineAllocationSchema).optional(),
});

export const CancelAwardRequestSchema = z.object({
  awardId: z.string().min(1),
  reason: z.string().min(1),
});
