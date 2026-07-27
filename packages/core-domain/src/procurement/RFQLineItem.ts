import { Entity } from '../common/Entity.js';
import { Money } from '../common/Money.js';
import { Result } from '../common/Result.js';

export interface RFQLineItemProps {
  sku: string;
  partName: string;
  quantity: number;
  targetPrice?: Money;
}

export class RFQLineItem extends Entity<RFQLineItemProps> {
  get sku(): string {
    return this.props.sku;
  }

  get partName(): string {
    return this.props.partName;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get targetPrice(): Money | undefined {
    return this.props.targetPrice;
  }

  private constructor(props: RFQLineItemProps, id?: string) {
    super(props, id);
  }

  public static create(props: RFQLineItemProps, id?: string): Result<RFQLineItem> {
    if (props.quantity <= 0) {
      return Result.fail<RFQLineItem>('Quantity must be greater than zero');
    }
    return Result.ok<RFQLineItem>(new RFQLineItem(props, id));
  }
}
