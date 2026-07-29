import { AwardAggregate } from '@inducore/core-domain';

export interface IAwardRepository {
  findAll(): Promise<AwardAggregate[]>;
  findById(id: string): Promise<AwardAggregate | null>;
  findByRfqId(rfqId: string): Promise<AwardAggregate[]>;
  save(award: AwardAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}
