import { IRFQRepository, IRFQRepository as _IRFQRepo } from '@inducore/application';
import { RFQAggregate, TenantId, RFQLineItem, SupplierBid, Money } from '@inducore/core-domain';

export class PostgresRFQRepository implements IRFQRepository {
  private inMemoryStore: Map<string, RFQAggregate> = new Map();

  public async findById(id: string, tenantId: string): Promise<RFQAggregate | null> {
    const rfq = this.inMemoryStore.get(id);
    if (!rfq) return null;
    if (rfq.tenantId.value !== tenantId) return null;
    return rfq;
  }

  public async save(rfq: RFQAggregate): Promise<void> {
    this.inMemoryStore.set(rfq.id, rfq);
  }

  public async listByTenant(tenantId: string): Promise<RFQAggregate[]> {
    const list: RFQAggregate[] = [];
    for (const rfq of this.inMemoryStore.values()) {
      if (rfq.tenantId.value === tenantId) {
        list.push(rfq);
      }
    }
    return list;
  }
}
