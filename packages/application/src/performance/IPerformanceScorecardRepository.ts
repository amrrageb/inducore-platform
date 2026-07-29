import { PerformanceScorecardAggregate } from '@inducore/core-domain';

export interface IPerformanceScorecardRepository {
  findAll(): Promise<PerformanceScorecardAggregate[]>;
  findById(id: string): Promise<PerformanceScorecardAggregate | null>;
  findBySupplierId(supplierId: string): Promise<PerformanceScorecardAggregate | null>;
  save(scorecard: PerformanceScorecardAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}
