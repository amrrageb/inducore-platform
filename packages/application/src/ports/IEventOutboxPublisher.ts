import { IDomainEvent } from '@inducore/core-domain';

export interface IEventOutboxPublisher {
  publish(events: IDomainEvent[], tenantId: string): Promise<void>;
}
