import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { TenantId } from '../common/TenantId.js';
import { RFQStatus } from './RFQStatus.js';
import { RFQLineItem } from './RFQLineItem.js';
import { SupplierBid } from './SupplierBid.js';
import { RFQCreatedEvent } from './events/RFQCreatedEvent.js';
import { BidSubmittedEvent } from './events/BidSubmittedEvent.js';

export interface RFQProps {
  tenantId: TenantId;
  title: string;
  description: string;
  status: RFQStatus;
  lineItems: RFQLineItem[];
  bids: SupplierBid[];
  createdAt: Date;
  updatedAt: Date;
}

export class RFQAggregate extends AggregateRoot<RFQProps> {
  get tenantId(): TenantId {
    return this.props.tenantId;
  }

  get title(): string {
    return this.props.title;
  }

  get status(): RFQStatus {
    return this.props.status;
  }

  get lineItems(): RFQLineItem[] {
    return this.props.lineItems;
  }

  get bids(): SupplierBid[] {
    return this.props.bids;
  }

  public submitBid(bid: SupplierBid): Result<void> {
    if (this.props.status !== RFQStatus.PUBLISHED) {
      return Result.fail<void>('Cannot submit bid to an RFQ that is not in PUBLISHED status');
    }

    this.props.bids.push(bid);
    this.props.updatedAt = new Date();
    this.addDomainEvent(new BidSubmittedEvent(this.id, bid.supplierId, bid.totalBidAmount.amount));
    return Result.ok<void>();
  }

  public publish(): Result<void> {
    if (this.props.lineItems.length === 0) {
      return Result.fail<void>('Cannot publish an RFQ without line items');
    }
    this.props.status = RFQStatus.PUBLISHED;
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  private constructor(props: RFQProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<RFQProps, 'status' | 'bids' | 'createdAt' | 'updatedAt'>, id?: string): Result<RFQAggregate> {
    if (!props.title || props.title.trim().length === 0) {
      return Result.fail<RFQAggregate>('RFQ Title is required');
    }

    const rfq = new RFQAggregate(
      {
        ...props,
        status: RFQStatus.DRAFT,
        bids: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );

    rfq.addDomainEvent(new RFQCreatedEvent(rfq.id, props.tenantId.value));
    return Result.ok<RFQAggregate>(rfq);
  }
}
