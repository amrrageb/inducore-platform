import { z } from 'zod';

export const AdjustStockOnHandSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  newOnHandQuantity: z.number().min(0, 'On-hand quantity cannot be negative'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

export const ReserveStockSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
});

export const ReleaseStockSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
});

export const UpdateInventoryPolicySchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  minLevel: z.number().min(0).optional(),
  maxLevel: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  suggestedReorderQty: z.number().positive().optional(),
  leadTimeDays: z.number().positive().optional(),
});

export const ConvertQuantitySchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  targetUom: z.string().min(1, 'Target UOM is required'),
});

export const TriggerErpSyncSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  erpSystem: z
    .enum(['SAP_S4HANA', 'ORACLE_NETSUITE', 'MICROSOFT_DYNAMICS', 'CUSTOM_ERP'])
    .optional(),
});
