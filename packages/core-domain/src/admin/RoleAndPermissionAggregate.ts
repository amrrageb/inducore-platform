import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export interface Permission {
  code: string;
  name: string;
  category: 'RFQ' | 'CONTRACT' | 'INVENTORY' | 'ANALYTICS' | 'ADMIN';
  description: string;
}

export interface RoleProps {
  tenantId: string;
  name: string;
  code: string;
  description: string;
  isSystemRole: boolean;
  permissions: string[];
  assignedUserCount: number;
  createdAt: string;
}

export class RoleAndPermissionAggregate extends AggregateRoot<RoleProps> {
  private constructor(props: RoleProps, id?: string) {
    super(props, id);
  }

  public static create(props: RoleProps, id?: string): Result<RoleAndPermissionAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.code, argumentName: 'code' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<RoleAndPermissionAggregate>(nullGuard.error || 'Invalid Role properties');
    }

    return Result.ok<RoleAndPermissionAggregate>(new RoleAndPermissionAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get name(): string { return this.props.name; }
  get code(): string { return this.props.code; }
  get description(): string { return this.props.description; }
  get isSystemRole(): boolean { return this.props.isSystemRole; }
  get permissions(): string[] { return this.props.permissions; }
  get assignedUserCount(): number { return this.props.assignedUserCount; }

  public updatePermissions(newPermissions: string[]): Result<void> {
    if (this.props.isSystemRole && this.props.code === 'ROLE_SUPER_ADMIN') {
      return Result.fail<void>('Cannot modify permissions for Super Admin system role');
    }
    this.props.permissions = [...newPermissions];
    return Result.ok<void>(undefined);
  }
}
