import { IDomainEvent } from '../../common/DomainEvent.js';

export class BidSubmittedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  public rfqId: string;
  public supplierId: string;
  public bidAmount: number;

  constructor(rfqId: string, supplierId: string, bidAmount: number) {
    this.dateTimeOccurred = new Date();
    this.rfqId = rfqId;
    this.supplierId = supplierId;
    this.bidAmount = bidAmount;
  }

  public getAggregateId(): string {
    return this.rfqId;
  }
}
