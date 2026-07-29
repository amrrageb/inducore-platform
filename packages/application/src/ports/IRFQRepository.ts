import { RFQAggregate } from '@inducore/core-domain';

export interface IRFQRepository {
  findById(id: string): Promise<RFQAggregate | null>;
  findAll(filter?: { status?: string; visibility?: string }): Promise<RFQAggregate[]>;
  save(rfq: RFQAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}
