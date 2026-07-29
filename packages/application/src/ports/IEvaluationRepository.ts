import { EvaluationAggregate } from '@inducore/core-domain';

export interface IEvaluationRepository {
  findById(id: string): Promise<EvaluationAggregate | null>;
  findByRfqId(rfqId: string): Promise<EvaluationAggregate | null>;
  findAll(): Promise<EvaluationAggregate[]>;
  save(evaluation: EvaluationAggregate): Promise<void>;
}
