import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type ErpSyncStatus = 'SYNCHRONIZED' | 'SYNC_PENDING' | 'ERROR' | 'OUT_OF_SYNC';

export interface UnitConversionRule {
  fromUom: string;
  toUom: string;
  conversionFactor: number; // e.g. 1 TON = 1000 KG => factor = 1000
}

export interface WarehouseLocation {
  warehouseId: string;
  warehouseCode: string; // e.g., 'WH-HAMBURG-01'
  warehouseName: string; // e.g., 'Hamburg Aerospace Logistics Hub'
  plantCode: string; // e.g., 'PLANT-DE-02'
  storageBin: string; // e.g., 'BIN-A4-12'
  country: string;
}

export interface InventoryPolicy {
  minLevel: number; // Minimum safety stock
  maxLevel: number; // Maximum bin capacity
  reorderPoint: number; // Threshold trigger for replenishment
  suggestedReorderQty: number; // Default replenishment order size
  leadTimeDays: number;
}

export interface ErpIntegrationDetails {
  erpSystem: 'SAP_S4HANA' | 'ORACLE_NETSUITE' | 'MICROSOFT_DYNAMICS' | 'CUSTOM_ERP';
  erpMaterialId: string;
  erpPlantId: string;
  lastSyncTimestamp: string;
  syncStatus: ErpSyncStatus;
  lastErrorMessage?: string;
}

export interface InventoryItemProps {
  materialId: string;
  materialCode: string; // e.g., 'MAT-TITANIUM-001'
  materialName: string; // e.g., 'Ti-6Al-4V Aerospace Grade Titanium Sheet'
  category: string; // e.g., 'RAW_METALS', 'FASTENERS', 'CHEMICALS', 'AVIONICS'
  baseUom: string; // Standard base unit of measure (e.g. 'KG', 'PCS', 'METER', 'LITER')
  unitConversions: UnitConversionRule[];
  warehouse: WarehouseLocation;
  onHandQuantity: number;
  reservedQuantity: number;
  policy: InventoryPolicy;
  erpIntegration: ErpIntegrationDetails;
  unitPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export class InventoryItemAggregate extends AggregateRoot<InventoryItemProps> {
  private constructor(props: InventoryItemProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: Omit<InventoryItemProps, 'createdAt' | 'updatedAt'> & {
      createdAt?: string;
      updatedAt?: string;
    },
    id?: string
  ): Result<InventoryItemAggregate> {
    if (!props.materialCode || props.materialCode.trim().length === 0) {
      return Result.fail<InventoryItemAggregate>('Material code is required');
    }
    if (!props.materialName || props.materialName.trim().length === 0) {
      return Result.fail<InventoryItemAggregate>('Material name is required');
    }
    if (props.onHandQuantity < 0) {
      return Result.fail<InventoryItemAggregate>('On-hand quantity cannot be negative');
    }
    if (props.reservedQuantity < 0) {
      return Result.fail<InventoryItemAggregate>('Reserved quantity cannot be negative');
    }

    const itemProps: InventoryItemProps = {
      ...props,
      createdAt: props.createdAt || new Date().toISOString(),
      updatedAt: props.updatedAt || new Date().toISOString(),
    };

    return Result.ok<InventoryItemAggregate>(new InventoryItemAggregate(itemProps, id));
  }

  public get availableQuantity(): number {
    return Math.max(0, this.props.onHandQuantity - this.props.reservedQuantity);
  }

  public get isReorderNeeded(): boolean {
    return this.availableQuantity <= this.props.policy.reorderPoint;
  }

  public get isStockoutRisk(): boolean {
    return this.availableQuantity <= this.props.policy.minLevel;
  }

  public reserveStock(quantity: number): Result<number> {
    if (quantity <= 0) {
      return Result.fail<number>('Reservation quantity must be greater than zero');
    }
    if (quantity > this.availableQuantity) {
      return Result.fail<number>(
        `Insufficient available stock. Requested: ${quantity}, Available: ${this.availableQuantity}`
      );
    }

    this.props.reservedQuantity += quantity;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<number>(this.props.reservedQuantity);
  }

  public releaseReservedStock(quantity: number): Result<number> {
    if (quantity <= 0) {
      return Result.fail<number>('Release quantity must be greater than zero');
    }
    if (quantity > this.props.reservedQuantity) {
      return Result.fail<number>(
        `Cannot release more than currently reserved (${this.props.reservedQuantity})`
      );
    }

    this.props.reservedQuantity -= quantity;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<number>(this.props.reservedQuantity);
  }

  public adjustOnHandStock(newOnHandQuantity: number, _reason: string): Result<number> {
    if (newOnHandQuantity < 0) {
      return Result.fail<number>('On-hand stock cannot be negative');
    }
    if (newOnHandQuantity < this.props.reservedQuantity) {
      return Result.fail<number>(
        `On-hand stock (${newOnHandQuantity}) cannot be lower than existing reserved stock (${this.props.reservedQuantity})`
      );
    }

    this.props.onHandQuantity = newOnHandQuantity;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<number>(this.props.onHandQuantity);
  }

  public updatePolicy(policyUpdates: Partial<InventoryPolicy>): Result<void> {
    this.props.policy = {
      ...this.props.policy,
      ...policyUpdates,
    };

    if (this.props.policy.minLevel > this.props.policy.maxLevel) {
      return Result.fail<void>('Min level cannot exceed Max level');
    }

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public convertQuantity(quantity: number, targetUom: string): Result<{ convertedQty: number; uom: string }> {
    if (targetUom.toUpperCase() === this.props.baseUom.toUpperCase()) {
      return Result.ok({ convertedQty: quantity, uom: this.props.baseUom });
    }

    const conversion = this.props.unitConversions.find(
      (c) =>
        (c.fromUom.toUpperCase() === this.props.baseUom.toUpperCase() &&
          c.toUom.toUpperCase() === targetUom.toUpperCase()) ||
        (c.fromUom.toUpperCase() === targetUom.toUpperCase() &&
          c.toUom.toUpperCase() === this.props.baseUom.toUpperCase())
    );

    if (!conversion) {
      return Result.fail<{ convertedQty: number; uom: string }>(
        `No conversion rule found between ${this.props.baseUom} and ${targetUom}`
      );
    }

    if (conversion.fromUom.toUpperCase() === this.props.baseUom.toUpperCase()) {
      const converted = quantity * conversion.conversionFactor;
      return Result.ok({ convertedQty: Number(converted.toFixed(4)), uom: targetUom.toUpperCase() });
    } else {
      const converted = quantity / conversion.conversionFactor;
      return Result.ok({ convertedQty: Number(converted.toFixed(4)), uom: targetUom.toUpperCase() });
    }
  }

  public triggerErpSync(status: ErpSyncStatus = 'SYNCHRONIZED', errorMessage?: string): void {
    this.props.erpIntegration = {
      ...this.props.erpIntegration,
      syncStatus: status,
      lastSyncTimestamp: new Date().toISOString(),
      lastErrorMessage: errorMessage,
    };
    this.props.updatedAt = new Date().toISOString();
  }
}
