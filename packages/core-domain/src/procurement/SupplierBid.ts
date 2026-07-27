import { Entity } from '../common/Entity.js';
import { Money } from '../common/Money.js';
import { Result } from '../common/Result.js';

export interface SupplierBidProps {
  supplierId: string;
  supplierName: string;
  totalBidAmount: Money;
  leadTimeDays: number;
  bidScore?: number;
  submittedAt: Date;
}

export class SupplierBid extends Entity<SupplierBidProps> {
  get supplierId(): string {
    return this.props.supplierId;
  }

  get supplierName(): string {
    return this.props.supplierName;
  }

  get totalBidAmount(): Money {
    return this.props.totalBidAmount;
  }

  get leadTimeDays(): number {
    return this.props.leadTimeDays;
  }

  get bidScore(): number | undefined {
    return this.props.bidScore;
  }

  public assignScore(score: number): void {
    this.props.bidScore = score;
  }

  private constructor(props: SupplierBidProps, id?: string) {
    super(props, id);
  }

  public static create(props: SupplierBidProps, id?: string): Result<SupplierBid> {
    if (props.leadTimeDays <= 0) {
      return Result.fail<SupplierBid>('Lead time must be positive');
    }
    return Result.ok<SupplierBid>(new SupplierBid(props, id));
  }
}
