import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export interface ExampleAggregateProps {
  name: string;
  status: string;
}

export class ExampleAggregate extends AggregateRoot<ExampleAggregateProps> {
  private constructor(props: ExampleAggregateProps, id?: string) {
    super(props, id);
  }

  public static create(props: ExampleAggregateProps, id?: string): Result<ExampleAggregate> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<ExampleAggregate>('Name is required');
    }
    return Result.ok<ExampleAggregate>(new ExampleAggregate(props, id));
  }

  public getName(): string {
    return this.props.name;
  }

  public getStatus(): string {
    return this.props.status;
  }
}
