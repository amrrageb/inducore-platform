import { describe, it, expect } from 'vitest';
import { InventoryItemAggregate } from './InventoryItemAggregate.js';

describe('InventoryItemAggregate', () => {
  it('should create a valid inventory item aggregate', () => {
    const res = InventoryItemAggregate.create({
      materialId: 'mat-101',
      materialCode: 'MAT-TITANIUM-001',
      materialName: 'Ti-6Al-4V Sheet Metal',
      category: 'RAW_METALS',
      baseUom: 'KG',
      unitConversions: [{ fromUom: 'KG', toUom: 'TON', conversionFactor: 0.001 }],
      warehouse: {
        warehouseId: 'wh-01',
        warehouseCode: 'WH-HAMBURG-01',
        warehouseName: 'Hamburg Aerospace Logistics Hub',
        plantCode: 'PLANT-DE-02',
        storageBin: 'BIN-A4-12',
        country: 'Germany',
      },
      onHandQuantity: 5000,
      reservedQuantity: 1200,
      policy: {
        minLevel: 1000,
        maxLevel: 10000,
        reorderPoint: 2000,
        suggestedReorderQty: 4000,
        leadTimeDays: 14,
      },
      erpIntegration: {
        erpSystem: 'SAP_S4HANA',
        erpMaterialId: 'SAP-MAT-99823',
        erpPlantId: 'PLANT-1000',
        lastSyncTimestamp: new Date().toISOString(),
        syncStatus: 'SYNCHRONIZED',
      },
      unitPrice: 145.5,
      currency: 'EUR',
    });

    expect(res.isSuccess).toBe(true);
    const item = res.getValue();
    expect(item.availableQuantity).toBe(3800);
    expect(item.isReorderNeeded).toBe(false);
  });

  it('should handle stock reservation and release correctly', () => {
    const item = InventoryItemAggregate.create({
      materialId: 'mat-102',
      materialCode: 'MAT-FASTENER-44',
      materialName: 'Titanium Lock Nuts',
      category: 'FASTENERS',
      baseUom: 'PCS',
      unitConversions: [],
      warehouse: {
        warehouseId: 'wh-02',
        warehouseCode: 'WH-TOULOUSE-01',
        warehouseName: 'Toulouse Assembly Depot',
        plantCode: 'PLANT-FR-01',
        storageBin: 'BIN-B1-05',
        country: 'France',
      },
      onHandQuantity: 500,
      reservedQuantity: 100,
      policy: {
        minLevel: 200,
        maxLevel: 2000,
        reorderPoint: 350,
        suggestedReorderQty: 1000,
        leadTimeDays: 7,
      },
      erpIntegration: {
        erpSystem: 'ORACLE_NETSUITE',
        erpMaterialId: 'NET-FAST-12',
        erpPlantId: 'PLANT-FR',
        lastSyncTimestamp: new Date().toISOString(),
        syncStatus: 'SYNCHRONIZED',
      },
      unitPrice: 12.5,
      currency: 'EUR',
    }).getValue();

    // Available is 400
    const resReserve = item.reserveStock(200);
    expect(resReserve.isSuccess).toBe(true);
    expect(item.availableQuantity).toBe(200);

    // Now available is 200, reorderPoint is 350 -> reorder needed!
    expect(item.isReorderNeeded).toBe(true);

    // Release stock
    const resRelease = item.releaseReservedStock(100);
    expect(resRelease.isSuccess).toBe(true);
    expect(item.availableQuantity).toBe(300);
  });

  it('should perform unit conversion correctly', () => {
    const item = InventoryItemAggregate.create({
      materialId: 'mat-103',
      materialCode: 'MAT-SEALANT-09',
      materialName: 'High-Temp Fuel Tank Sealant',
      category: 'CHEMICALS',
      baseUom: 'LITER',
      unitConversions: [{ fromUom: 'LITER', toUom: 'GALLON', conversionFactor: 0.264172 }],
      warehouse: {
        warehouseId: 'wh-01',
        warehouseCode: 'WH-HAMBURG-01',
        warehouseName: 'Hamburg Hub',
        plantCode: 'PLANT-DE-01',
        storageBin: 'BIN-C2-01',
        country: 'Germany',
      },
      onHandQuantity: 1000,
      reservedQuantity: 0,
      policy: {
        minLevel: 100,
        maxLevel: 2000,
        reorderPoint: 300,
        suggestedReorderQty: 500,
        leadTimeDays: 10,
      },
      erpIntegration: {
        erpSystem: 'SAP_S4HANA',
        erpMaterialId: 'SAP-SEAL-09',
        erpPlantId: 'PLANT-DE',
        lastSyncTimestamp: new Date().toISOString(),
        syncStatus: 'SYNCHRONIZED',
      },
      unitPrice: 85.0,
      currency: 'EUR',
    }).getValue();

    const convRes = item.convertQuantity(100, 'GALLON');
    expect(convRes.isSuccess).toBe(true);
    expect(convRes.getValue().convertedQty).toBeCloseTo(26.4172, 3);
  });
});
