import {
  UnitConversionRule,
  WarehouseLocation,
  InventoryPolicy,
  ErpIntegrationDetails,
} from '@inducore/core-domain';

export interface AdjustStockOnHandDTO {
  inventoryItemId: string;
  newOnHandQuantity: number;
  reason: string;
}

export interface ReserveStockDTO {
  inventoryItemId: string;
  quantity: number;
}

export interface ReleaseStockDTO {
  inventoryItemId: string;
  quantity: number;
}

export interface UpdateInventoryPolicyDTO {
  inventoryItemId: string;
  minLevel?: number;
  maxLevel?: number;
  reorderPoint?: number;
  suggestedReorderQty?: number;
  leadTimeDays?: number;
}

export interface ConvertQuantityDTO {
  inventoryItemId: string;
  quantity: number;
  targetUom: string;
}

export interface TriggerErpSyncDTO {
  inventoryItemId: string;
  erpSystem?: 'SAP_S4HANA' | 'ORACLE_NETSUITE' | 'MICROSOFT_DYNAMICS' | 'CUSTOM_ERP';
}

export interface InventoryItemResponseDTO {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  category: string;
  baseUom: string;
  unitConversions: UnitConversionRule[];
  warehouse: WarehouseLocation;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  policy: InventoryPolicy;
  isReorderNeeded: boolean;
  isStockoutRisk: boolean;
  erpIntegration: ErpIntegrationDetails;
  unitPrice: number;
  currency: string;
  totalStockValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryKPISummaryDTO {
  totalMaterialsCount: number;
  totalWarehousesCount: number;
  totalStockValuation: number; // Sum of (onHandQuantity * unitPrice)
  itemsBelowReorderPointCount: number;
  criticalStockoutRiskCount: number;
  totalReservedStockValuation: number;
  erpSyncStatusDistribution: {
    synchronized: number;
    pending: number;
    error: number;
  };
}

export interface ReorderSuggestionDTO {
  inventoryItemId: string;
  materialCode: string;
  materialName: string;
  category: string;
  warehouseName: string;
  currentAvailable: number;
  reorderPoint: number;
  suggestedReorderQty: number;
  leadTimeDays: number;
  unitPrice: number;
  currency: string;
  estimatedReorderCost: number;
  urgency: 'HIGH' | 'CRITICAL' | 'NORMAL';
}
