import { IExampleRepository } from '@inducore/application';
import { ExampleAggregate } from '@inducore/core-domain';

export class ExampleRepositoryAdapter implements IExampleRepository {
  private readonly storage: Map<string, ExampleAggregate> = new Map();

  public async findById(id: string, _tenantId: string): Promise<ExampleAggregate | null> {
    return this.storage.get(id) || null;
  }

  public async save(aggregate: ExampleAggregate, _tenantId: string): Promise<void> {
    this.storage.set(aggregate.id, aggregate);
  }
}
