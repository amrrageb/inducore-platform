import { PurchaseOrderAggregate } from '@inducore/core-domain';

export interface IPurchaseOrderRepository {
  findById(id: string): Promise<PurchaseOrderAggregate | null>;
  findByPoNumber(poNumber: string): Promise<PurchaseOrderAggregate | null>;
  findAll(): Promise<PurchaseOrderAggregate[]>;
  save(po: PurchaseOrderAggregate): Promise<void>;
}
