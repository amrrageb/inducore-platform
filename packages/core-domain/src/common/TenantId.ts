import { ValueObject } from './ValueObject.js';
import { Result } from './Result.js';
import { Guard } from './Guard.js';

interface TenantIdProps {
  value: string;
}

export class TenantId extends ValueObject<TenantIdProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: TenantIdProps) {
    super(props);
  }

  public static create(id?: string): Result<TenantId> {
    const value = id || crypto.randomUUID();
    const guard = Guard.againstNullOrUndefined(value, 'TenantId');
    if (guard.isFailure) return Result.fail<TenantId>(guard.error!);

    return Result.ok<TenantId>(new TenantId({ value }));
  }
}
