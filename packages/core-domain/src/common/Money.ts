import { ValueObject } from './ValueObject.js';
import { Result } from './Result.js';
import { Guard } from './Guard.js';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  private constructor(props: MoneyProps) {
    super(props);
  }

  public static create(amount: number, currency: string = 'USD'): Result<Money> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: amount, argumentName: 'amount' },
      { argument: currency, argumentName: 'currency' }
    ]);
    if (nullGuard.isFailure) return Result.fail<Money>(nullGuard.error!);

    if (amount < 0) {
      return Result.fail<Money>('Money amount cannot be negative');
    }

    return Result.ok<Money>(new Money({ amount, currency: currency.toUpperCase() }));
  }

  public add(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail<Money>('Cannot add money of different currencies');
    }
    return Money.create(this.amount + other.amount, this.currency);
  }
}
