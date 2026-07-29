import { InventoryItemAggregate } from '@inducore/core-domain';

export interface IInventoryRepository {
  findAll(): Promise<InventoryItemAggregate[]>;
  findById(id: string): Promise<InventoryItemAggregate | null>;
  findByMaterialCode(materialCode: string): Promise<InventoryItemAggregate | null>;
  save(item: InventoryItemAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}
