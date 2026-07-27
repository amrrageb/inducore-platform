import { RFQAggregate } from '@inducore/core-domain';

export interface IRFQRepository {
  findById(id: string, tenantId: string): Promise<RFQAggregate | null>;
  save(rfq: RFQAggregate): Promise<void>;
  listByTenant(tenantId: string): Promise<RFQAggregate[]>;
}
