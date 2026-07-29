import { Result, InventoryItemAggregate } from '@inducore/core-domain';
import { IInventoryRepository } from './IInventoryRepository.js';
import {
  AdjustStockOnHandDTO,
  ReserveStockDTO,
  ReleaseStockDTO,
  UpdateInventoryPolicyDTO,
  ConvertQuantityDTO,
  TriggerErpSyncDTO,
  InventoryItemResponseDTO,
  InventoryKPISummaryDTO,
  ReorderSuggestionDTO,
} from './InventoryDTOs.js';

export class InventoryUseCases {
  constructor(private inventoryRepo: IInventoryRepository) {}

  public async getAllInventoryItems(): Promise<Result<InventoryItemResponseDTO[]>> {
    try {
      const items = await this.inventoryRepo.findAll();
      return Result.ok<InventoryItemResponseDTO[]>(items.map((i) => this.toDTO(i)));
    } catch (err: any) {
      return Result.fail<InventoryItemResponseDTO[]>(
        err.message || 'Failed to fetch inventory items'
      );
    }
  }

  public async getInventoryById(id: string): Promise<Result<InventoryItemResponseDTO>> {
    try {
      const item = await this.inventoryRepo.findById(id);
      if (!item) {
        return Result.fail<InventoryItemResponseDTO>(`Inventory item ${id} not found`);
      }
      return Result.ok<InventoryItemResponseDTO>(this.toDTO(item));
    } catch (err: any) {
      return Result.fail<InventoryItemResponseDTO>(err.message || 'Failed to fetch inventory item');
    }
  }

  public async adjustStockOnHand(
    dto: AdjustStockOnHandDTO
  ): Promise<Result<InventoryItemResponseDTO>> {
    try {
      const item = await this.inventoryRepo.findById(dto.inventoryItemId);
      if (!item) {
        return Result.fail<InventoryItemResponseDTO>('Inventory item not found');
      }

      const adjRes = item.adjustOnHandStock(dto.newOnHandQuantity, dto.reason);
      if (adjRes.isFailure) {
        return Result.fail<InventoryItemResponseDTO>(adjRes.errorValue());
      }

      await this.inventoryRepo.save(item);
      return Result.ok<InventoryItemResponseDTO>(this.toDTO(item));
    } catch (err: any) {
      return Result.fail<InventoryItemResponseDTO>(err.message || 'Failed to adjust stock');
    }
  }

  public async reserveStock(
    dto: ReserveStockDTO
  ): Promise<Result<InventoryItemResponseDTO>> {
    try {
      const item = await this.inventoryRepo.findById(dto.inventoryItemId);
      if (!item) {
        return Result.fail<InventoryItemResponseDTO>('Inventory item not found');
      }

      const resRes = item.reserveStock(dto.quantity);
      if (resRes.isFailure) {
        return Result.fail<InventoryItemResponseDTO>(resRes.errorValue());
      }

      await this.inventoryRepo.save(item);
      return Result.ok<InventoryItemResponseDTO>(this.toDTO(item));
    } catch (err: any) {
      return Result.fail<InventoryItemResponseDTO>(err.message || 'Failed to reserve stock');
    }
  }

  public async releaseStock(
    dto: ReleaseStockDTO
  ): Promise<Result<InventoryItemResponseDTO>> {
    try {
      const item = await this.inventoryRepo.findById(dto.inventoryItemId);
      if (!item) {
        return Result.fail<InventoryItemResponseDTO>('Inventory item not found');
      }

      const relRes = item.releaseReservedStock(dto.quantity);
      if (relRes.isFailure) {
        return Result.fail<InventoryItemResponseDTO>(relRes.errorValue());
      }

      await this.inventoryRepo.save(item);
      return Result.ok<InventoryItemResponseDTO>(this.toDTO(item));
    } catch (err: any) {
      return Result.fail<InventoryItemResponseDTO>(err.message || 'Failed to release stock');
    }
  }

  public async updateInventoryPolicy(
    dto: UpdateInventoryPolicyDTO
  ): Promise<Result<InventoryItemResponseDTO>> {
    try {
      const item = await this.inventoryRepo.findById(dto.inventoryItemId);
      if (!item) {
        return Result.fail<InventoryItemResponseDTO>('Inventory item not found');
      }

      const polRes = item.updatePolicy({
        minLevel: dto.minLevel,
        maxLevel: dto.maxLevel,
        reorderPoint: dto.reorderPoint,
        suggestedReorderQty: dto.suggestedReorderQty,
        leadTimeDays: dto.leadTimeDays,
      });

      if (polRes.isFailure) {
        return Result.fail<InventoryItemResponseDTO>(polRes.errorValue());
      }

      await this.inventoryRepo.save(item);
      return Result.ok<InventoryItemResponseDTO>(this.toDTO(item));
    } catch (err: any) {
      return Result.fail<InventoryItemResponseDTO>(err.message || 'Failed to update policy');
    }
  }

  public async convertUnitQuantity(
    dto: ConvertQuantityDTO
  ): Promise<Result<{ convertedQuantity: number; uom: string }>> {
    try {
      const item = await this.inventoryRepo.findById(dto.inventoryItemId);
      if (!item) {
        return Result.fail<{ convertedQuantity: number; uom: string }>('Inventory item not found');
      }

      const convRes = item.convertQuantity(dto.quantity, dto.targetUom);
      if (convRes.isFailure) {
        return Result.fail<{ convertedQuantity: number; uom: string }>(convRes.errorValue());
      }

      const val = convRes.getValue();
      return Result.ok({ convertedQuantity: val.convertedQty, uom: val.uom });
    } catch (err: any) {
      return Result.fail<{ convertedQuantity: number; uom: string }>(
        err.message || 'Failed unit conversion'
      );
    }
  }

  public async triggerErpSync(
    dto: TriggerErpSyncDTO
  ): Promise<Result<InventoryItemResponseDTO>> {
    try {
      const item = await this.inventoryRepo.findById(dto.inventoryItemId);
      if (!item) {
        return Result.fail<InventoryItemResponseDTO>('Inventory item not found');
      }

      item.triggerErpSync('SYNCHRONIZED');
      await this.inventoryRepo.save(item);
      return Result.ok<InventoryItemResponseDTO>(this.toDTO(item));
    } catch (err: any) {
      return Result.fail<InventoryItemResponseDTO>(err.message || 'Failed to sync with ERP');
    }
  }

  public async getReorderSuggestions(): Promise<Result<ReorderSuggestionDTO[]>> {
    try {
      const items = await this.inventoryRepo.findAll();
      const reorderItems = items.filter((i) => i.isReorderNeeded);

      const suggestions: ReorderSuggestionDTO[] = reorderItems.map((item) => {
        const estCost = item.props.policy.suggestedReorderQty * item.props.unitPrice;
        const urgency = item.isStockoutRisk ? 'CRITICAL' : 'HIGH';

        return {
          inventoryItemId: item.id.toString(),
          materialCode: item.props.materialCode,
          materialName: item.props.materialName,
          category: item.props.category,
          warehouseName: item.props.warehouse.warehouseName,
          currentAvailable: item.availableQuantity,
          reorderPoint: item.props.policy.reorderPoint,
          suggestedReorderQty: item.props.policy.suggestedReorderQty,
          leadTimeDays: item.props.policy.leadTimeDays,
          unitPrice: item.props.unitPrice,
          currency: item.props.currency,
          estimatedReorderCost: Number(estCost.toFixed(2)),
          urgency,
        };
      });

      return Result.ok<ReorderSuggestionDTO[]>(suggestions);
    } catch (err: any) {
      return Result.fail<ReorderSuggestionDTO[]>(
        err.message || 'Failed to get reorder suggestions'
      );
    }
  }

  public async getKPIDashboardSummary(): Promise<Result<InventoryKPISummaryDTO>> {
    try {
      const items = await this.inventoryRepo.findAll();
      const warehouseSet = new Set<string>();
      let totalValuation = 0;
      let totalReservedValuation = 0;
      let belowReorderCount = 0;
      let stockoutRiskCount = 0;
      const erpDist = { synchronized: 0, pending: 0, error: 0 };

      items.forEach((item) => {
        warehouseSet.add(item.props.warehouse.warehouseId);
        const itemValuation = item.props.onHandQuantity * item.props.unitPrice;
        totalValuation += itemValuation;
        totalReservedValuation += item.props.reservedQuantity * item.props.unitPrice;

        if (item.isReorderNeeded) belowReorderCount++;
        if (item.isStockoutRisk) stockoutRiskCount++;

        const status = item.props.erpIntegration.syncStatus;
        if (status === 'SYNCHRONIZED') erpDist.synchronized++;
        else if (status === 'SYNC_PENDING') erpDist.pending++;
        else erpDist.error++;
      });

      return Result.ok<InventoryKPISummaryDTO>({
        totalMaterialsCount: items.length,
        totalWarehousesCount: warehouseSet.size,
        totalStockValuation: Number(totalValuation.toFixed(2)),
        itemsBelowReorderPointCount: belowReorderCount,
        criticalStockoutRiskCount: stockoutRiskCount,
        totalReservedStockValuation: Number(totalReservedValuation.toFixed(2)),
        erpSyncStatusDistribution: erpDist,
      });
    } catch (err: any) {
      return Result.fail<InventoryKPISummaryDTO>(
        err.message || 'Failed to calculate inventory KPI summary'
      );
    }
  }

  private toDTO(item: InventoryItemAggregate): InventoryItemResponseDTO {
    const totalValuation = item.props.onHandQuantity * item.props.unitPrice;
    return {
      id: item.id.toString(),
      materialId: item.props.materialId,
      materialCode: item.props.materialCode,
      materialName: item.props.materialName,
      category: item.props.category,
      baseUom: item.props.baseUom,
      unitConversions: item.props.unitConversions,
      warehouse: item.props.warehouse,
      onHandQuantity: item.props.onHandQuantity,
      reservedQuantity: item.props.reservedQuantity,
      availableQuantity: item.availableQuantity,
      policy: item.props.policy,
      isReorderNeeded: item.isReorderNeeded,
      isStockoutRisk: item.isStockoutRisk,
      erpIntegration: item.props.erpIntegration,
      unitPrice: item.props.unitPrice,
      currency: item.props.currency,
      totalStockValue: Number(totalValuation.toFixed(2)),
      createdAt: item.props.createdAt,
      updatedAt: item.props.updatedAt,
    };
  }
}
