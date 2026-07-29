import { ExampleAggregate } from '@inducore/core-domain';

export interface IExampleRepository {
  findById(id: string, tenantId: string): Promise<ExampleAggregate | null>;
  save(aggregate: ExampleAggregate, tenantId: string): Promise<void>;
}
