import { IDomainEvent } from '../../common/DomainEvent.js';

export class RFQCreatedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  public rfqId: string;
  public tenantId: string;

  constructor(rfqId: string, tenantId: string) {
    this.dateTimeOccurred = new Date();
    this.rfqId = rfqId;
    this.tenantId = tenantId;
  }

  public getAggregateId(): string {
    return this.rfqId;
  }
}
