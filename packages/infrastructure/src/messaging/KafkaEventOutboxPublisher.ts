import { IEventOutboxPublisher } from '@inducore/application';
import { IDomainEvent } from '@inducore/core-domain';

export class KafkaEventOutboxPublisher implements IEventOutboxPublisher {
  public async publish(events: IDomainEvent[], tenantId: string): Promise<void> {
    for (const event of events) {
      console.log(`[Kafka Outbox Relayer] Tenant: ${tenantId} | Event: ${event.constructor.name} | Aggregate: ${event.getAggregateId()}`);
    }
  }
}
