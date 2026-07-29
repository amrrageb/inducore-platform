import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export type PartnershipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'UNDER_REVIEW';
export type PartnershipType = 'PREFERRED_SUPPLIER' | 'OEM_JOINT_VENTURE' | 'SUBCONTRACTOR' | 'TECHNOLOGY_TRANSFER';

export interface PartnershipRequestProps {
  requesterCompanyId: string;
  requesterCompanyName: string;
  targetCompanyId: string;
  targetCompanyName: string;
  partnershipType: PartnershipType;
  proposedScope: string;
  message: string;
  status: PartnershipStatus;
  createdAt: string;
  respondedAt?: string;
}

export class PartnershipRequestAggregate extends AggregateRoot<PartnershipRequestProps> {
  private constructor(props: PartnershipRequestProps, id?: string) {
    super(props, id);
  }

  public static create(props: PartnershipRequestProps, id?: string): Result<PartnershipRequestAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.requesterCompanyId, argumentName: 'requesterCompanyId' },
      { argument: props.targetCompanyId, argumentName: 'targetCompanyId' },
      { argument: props.proposedScope, argumentName: 'proposedScope' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<PartnershipRequestAggregate>(nullGuard.error || 'Invalid Partnership Request properties');
    }

    return Result.ok<PartnershipRequestAggregate>(new PartnershipRequestAggregate(props, id));
  }

  get requesterCompanyId(): string { return this.props.requesterCompanyId; }
  get requesterCompanyName(): string { return this.props.requesterCompanyName; }
  get targetCompanyId(): string { return this.props.targetCompanyId; }
  get targetCompanyName(): string { return this.props.targetCompanyName; }
  get partnershipType(): PartnershipType { return this.props.partnershipType; }
  get proposedScope(): string { return this.props.proposedScope; }
  get message(): string { return this.props.message; }
  get status(): PartnershipStatus { return this.props.status; }
  get createdAt(): string { return this.props.createdAt; }
  get respondedAt(): string | undefined { return this.props.respondedAt; }

  public respond(accept: boolean): void {
    this.props.status = accept ? 'ACCEPTED' : 'DECLINED';
    this.props.respondedAt = new Date().toISOString();
  }
}
