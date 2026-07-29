import { InventoryItemAggregate } from '@inducore/core-domain';
import { IInventoryRepository } from '@inducore/application';

export class InMemoryInventoryRepository implements IInventoryRepository {
  private items: Map<string, InventoryItemAggregate> = new Map();

  constructor() {
    this.seedInitialData();
  }

  public async findAll(): Promise<InventoryItemAggregate[]> {
    return Array.from(this.items.values());
  }

  public async findById(id: string): Promise<InventoryItemAggregate | null> {
    const item = this.items.get(id);
    return item || null;
  }

  public async findByMaterialCode(materialCode: string): Promise<InventoryItemAggregate | null> {
    for (const item of this.items.values()) {
      if (item.props.materialCode.toLowerCase() === materialCode.toLowerCase()) {
        return item;
      }
    }
    return null;
  }

  public async save(item: InventoryItemAggregate): Promise<void> {
    this.items.set(item.id.toString(), item);
  }

  public async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  private seedInitialData(): void {
    const seeds = [
      {
        id: 'inv-item-001',
        materialId: 'mat-ti-64',
        materialCode: 'MAT-TITANIUM-64',
        materialName: 'Ti-6Al-4V Grade 5 Aerospace Titanium Plate (25mm)',
        category: 'RAW_METALS',
        baseUom: 'KG',
        unitConversions: [
          { fromUom: 'KG', toUom: 'TON', conversionFactor: 0.001 },
          { fromUom: 'KG', toUom: 'LB', conversionFactor: 2.20462 },
        ],
        warehouse: {
          warehouseId: 'wh-hamburg-01',
          warehouseCode: 'WH-HAMBURG-LOGISTICS',
          warehouseName: 'Hamburg Aerospace Logistics Hub',
          plantCode: 'PLANT-DE-02',
          storageBin: 'BIN-MET-A4-12',
          country: 'Germany',
        },
        onHandQuantity: 4500,
        reservedQuantity: 1200,
        policy: {
          minLevel: 1000,
          maxLevel: 10000,
          reorderPoint: 2000,
          suggestedReorderQty: 5000,
          leadTimeDays: 21,
        },
        erpIntegration: {
          erpSystem: 'SAP_S4HANA' as const,
          erpMaterialId: 'SAP-MAT-100293',
          erpPlantId: 'PL-1000-HAM',
          lastSyncTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          syncStatus: 'SYNCHRONIZED' as const,
        },
        unitPrice: 185.0,
        currency: 'EUR',
      },
      {
        id: 'inv-item-002',
        materialId: 'mat-cf-3000',
        materialCode: 'MAT-CARBON-FIBER',
        materialName: 'Toray T800H Prepreg Carbon Fiber Fabric Roll',
        category: 'COMPOSITES',
        baseUom: 'METER',
        unitConversions: [
          { fromUom: 'METER', toUom: 'YARD', conversionFactor: 1.09361 },
          { fromUom: 'METER', toUom: 'ROLL', conversionFactor: 0.02 }, // 50m per roll
        ],
        warehouse: {
          warehouseId: 'wh-toulouse-01',
          warehouseCode: 'WH-TOULOUSE-DEPOT',
          warehouseName: 'Toulouse Composite Assembly Hub',
          plantCode: 'PLANT-FR-01',
          storageBin: 'BIN-COMP-B2-04',
          country: 'France',
        },
        onHandQuantity: 850,
        reservedQuantity: 650,
        policy: {
          minLevel: 500,
          maxLevel: 3000,
          reorderPoint: 750, // Available 200 < 750 => REORDER NEEDED!
          suggestedReorderQty: 1500,
          leadTimeDays: 14,
        },
        erpIntegration: {
          erpSystem: 'SAP_S4HANA' as const,
          erpMaterialId: 'SAP-MAT-884920',
          erpPlantId: 'PL-2000-TLS',
          lastSyncTimestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          syncStatus: 'SYNCHRONIZED' as const,
        },
        unitPrice: 320.0,
        currency: 'EUR',
      },
      {
        id: 'inv-item-003',
        materialId: 'mat-fast-tit-88',
        materialCode: 'MAT-FASTENER-NAS6604',
        materialName: 'NAS6604-12 High Tensile Titanium Shear Bolts',
        category: 'FASTENERS',
        baseUom: 'PCS',
        unitConversions: [
          { fromUom: 'PCS', toUom: 'BOX', conversionFactor: 0.01 }, // 100 pcs per box
          { fromUom: 'PCS', toUom: 'THOUSAND', conversionFactor: 0.001 },
        ],
        warehouse: {
          warehouseId: 'wh-seattle-01',
          warehouseCode: 'WH-SEATTLE-MAIN',
          warehouseName: 'Seattle Central Structural Fastener Depot',
          plantCode: 'PLANT-US-04',
          storageBin: 'BIN-FAST-F9-88',
          country: 'USA',
        },
        onHandQuantity: 12500,
        reservedQuantity: 3000,
        policy: {
          minLevel: 2500,
          maxLevel: 25000,
          reorderPoint: 4000,
          suggestedReorderQty: 10000,
          leadTimeDays: 10,
        },
        erpIntegration: {
          erpSystem: 'ORACLE_NETSUITE' as const,
          erpMaterialId: 'NS-ITEM-99012',
          erpPlantId: 'PL-US-SEA',
          lastSyncTimestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
          syncStatus: 'SYNCHRONIZED' as const,
        },
        unitPrice: 14.75,
        currency: 'USD',
      },
      {
        id: 'inv-item-004',
        materialId: 'mat-hyd-valve-350',
        materialCode: 'MAT-HYD-VALVE-350',
        materialName: 'Servo-Hydraulic Servo Control Valve 350 BAR',
        category: 'AVIONICS_HYDRAULICS',
        baseUom: 'PCS',
        unitConversions: [],
        warehouse: {
          warehouseId: 'wh-hamburg-01',
          warehouseCode: 'WH-HAMBURG-LOGISTICS',
          warehouseName: 'Hamburg Aerospace Logistics Hub',
          plantCode: 'PLANT-DE-02',
          storageBin: 'BIN-AV-H1-02',
          country: 'Germany',
        },
        onHandQuantity: 35,
        reservedQuantity: 30, // Available = 5, MinLevel = 15 => CRITICAL STOCKOUT RISK!
        policy: {
          minLevel: 15,
          maxLevel: 100,
          reorderPoint: 25,
          suggestedReorderQty: 50,
          leadTimeDays: 30,
        },
        erpIntegration: {
          erpSystem: 'SAP_S4HANA' as const,
          erpMaterialId: 'SAP-VALVE-350',
          erpPlantId: 'PL-1000-HAM',
          lastSyncTimestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          syncStatus: 'SYNC_PENDING' as const,
        },
        unitPrice: 4250.0,
        currency: 'EUR',
      },
      {
        id: 'inv-item-005',
        materialId: 'mat-seal-pr1422',
        materialCode: 'MAT-SEALANT-PR1422',
        materialName: 'PPG Aerospace PR-1422 B2 Fuel Tank Sealant',
        category: 'CHEMICALS',
        baseUom: 'LITER',
        unitConversions: [
          { fromUom: 'LITER', toUom: 'GALLON', conversionFactor: 0.264172 },
          { fromUom: 'LITER', toUom: 'CART-6OZ', conversionFactor: 5.63 },
        ],
        warehouse: {
          warehouseId: 'wh-toulouse-01',
          warehouseCode: 'WH-TOULOUSE-DEPOT',
          warehouseName: 'Toulouse Composite Assembly Hub',
          plantCode: 'PLANT-FR-01',
          storageBin: 'BIN-CHEM-C4-01',
          country: 'France',
        },
        onHandQuantity: 600,
        reservedQuantity: 150,
        policy: {
          minLevel: 100,
          maxLevel: 1200,
          reorderPoint: 250,
          suggestedReorderQty: 500,
          leadTimeDays: 7,
        },
        erpIntegration: {
          erpSystem: 'MICROSOFT_DYNAMICS' as const,
          erpMaterialId: 'DYN-SEAL-1422',
          erpPlantId: 'PL-FR-01',
          lastSyncTimestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          syncStatus: 'SYNCHRONIZED' as const,
        },
        unitPrice: 112.0,
        currency: 'EUR',
      },
      {
        id: 'inv-item-006',
        materialId: 'mat-alum-7075',
        materialCode: 'MAT-ALU-7075-T6',
        materialName: 'Alloy 7075-T6 Bare Aluminum Sheet (3.2mm)',
        category: 'RAW_METALS',
        baseUom: 'KG',
        unitConversions: [
          { fromUom: 'KG', toUom: 'TON', conversionFactor: 0.001 },
          { fromUom: 'KG', toUom: 'SHEET', conversionFactor: 0.0384 }, // ~26kg per sheet
        ],
        warehouse: {
          warehouseId: 'wh-seattle-01',
          warehouseCode: 'WH-SEATTLE-MAIN',
          warehouseName: 'Seattle Central Structural Fastener Depot',
          plantCode: 'PLANT-US-04',
          storageBin: 'BIN-MET-S1-09',
          country: 'USA',
        },
        onHandQuantity: 8000,
        reservedQuantity: 1500,
        policy: {
          minLevel: 2000,
          maxLevel: 15000,
          reorderPoint: 3500,
          suggestedReorderQty: 6000,
          leadTimeDays: 14,
        },
        erpIntegration: {
          erpSystem: 'ORACLE_NETSUITE' as const,
          erpMaterialId: 'NS-ALU-7075',
          erpPlantId: 'PL-US-SEA',
          lastSyncTimestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          syncStatus: 'ERROR' as const,
          lastErrorMessage: 'ERP SKU Mismatch: Item unit mapping required in NetSuite',
        },
        unitPrice: 38.5,
        currency: 'USD',
      },
    ];

    for (const seed of seeds) {
      const aggRes = InventoryItemAggregate.create(seed, seed.id);
      if (aggRes.isSuccess) {
        this.items.set(seed.id, aggRes.getValue());
      }
    }
  }
}
