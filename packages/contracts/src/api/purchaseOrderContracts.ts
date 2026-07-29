import { z } from 'zod';

export const CreatePOSchema = z.object({
  poNumber: z.string().optional(),
  awardId: z.string().optional(),
  rfqId: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierName: z.string().min(1, 'Supplier Name is required'),
  currency: z.string().default('USD'),
  paymentTerms: z.string().default('NET 30'),
  incoterm: z.string().default('FOB Origin'),
  lineItems: z.array(
    z.object({
      id: z.string(),
      itemName: z.string(),
      orderedQuantity: z.number().positive(),
      unit: z.string(),
      unitPrice: z.number().nonnegative(),
      totalPrice: z.number().nonnegative(),
    })
  ).min(1, 'At least one line item is required'),
});

export const ApprovePOSchema = z.object({
  id: z.string().min(1),
  approverName: z.string().min(1),
  role: z.string().min(1),
  notes: z.string().default('Approved'),
});

export const AddDeliveryScheduleSchema = z.object({
  poId: z.string().min(1),
  lineItemId: z.string().min(1),
  itemName: z.string().min(1),
  expectedDate: z.string().min(1),
  quantity: z.number().positive(),
  destinationAddress: z.string().min(1),
});

export const AddShipmentSchema = z.object({
  poId: z.string().min(1),
  carrier: z.string().min(1),
  trackingNumber: z.string().min(1),
  dispatchedDate: z.string().min(1),
  estimatedArrival: z.string().min(1),
  notes: z.string().default(''),
});

export const RecordGoodsReceiptSchema = z.object({
  poId: z.string().min(1),
  receivedBy: z.string().min(1),
  overallNotes: z.string().default(''),
  items: z.array(
    z.object({
      lineItemId: z.string().min(1),
      quantityReceived: z.number().nonnegative(),
      discrepancyType: z.enum(['NONE', 'OVER', 'UNDER', 'DAMAGED']),
      conditionNotes: z.string().optional(),
    })
  ).min(1),
});

export const RevisePOSchema = z.object({
  poId: z.string().min(1),
  revisedBy: z.string().min(1),
  reason: z.string().min(1),
  updatedLineItems: z.array(
    z.object({
      id: z.string(),
      itemName: z.string(),
      orderedQuantity: z.number().positive(),
      receivedQuantity: z.number().nonnegative(),
      unit: z.string(),
      unitPrice: z.number().nonnegative(),
      totalPrice: z.number().nonnegative(),
      deliveryStatus: z.enum(['PENDING', 'PARTIAL', 'OVER_DELIVERED', 'UNDER_DELIVERED', 'COMPLETED']),
    })
  ).optional(),
});

export const ClosePOSchema = z.object({
  poId: z.string().min(1),
  reason: z.string().min(1),
});
