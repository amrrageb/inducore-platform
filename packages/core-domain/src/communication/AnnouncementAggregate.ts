import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export interface AnnouncementProps {
  tenantId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'MAINTENANCE' | 'QUALITY_MANDATE' | 'AUDIT_NOTICE' | 'PLATFORM_FEATURE' | 'GENERAL';
  targetRoles: ('BUYER' | 'SUPPLIER' | 'AUDITOR' | 'ADMIN')[];
  isPinned: boolean;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  acknowledgedUserIds: string[];
  expiresAt?: string;
  createdAt: string;
}

export class AnnouncementAggregate extends AggregateRoot<AnnouncementProps> {
  private constructor(props: AnnouncementProps, id?: string) {
    super(props, id);
  }

  public static create(props: AnnouncementProps, id?: string): Result<AnnouncementAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.title, argumentName: 'title' },
      { argument: props.content, argumentName: 'content' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<AnnouncementAggregate>(nullGuard.error || 'Invalid announcement properties');
    }

    return Result.ok<AnnouncementAggregate>(new AnnouncementAggregate(props, id));
  }

  public acknowledge(userId: string): boolean {
    if (!this.props.acknowledgedUserIds.includes(userId)) {
      this.props.acknowledgedUserIds.push(userId);
      return true;
    }
    return false;
  }

  get tenantId(): string { return this.props.tenantId; }
  get title(): string { return this.props.title; }
  get content(): string { return this.props.content; }
  get category(): string { return this.props.category; }
  get targetRoles(): string[] { return this.props.targetRoles; }
  get isPinned(): boolean { return this.props.isPinned; }
  get priority(): string { return this.props.priority; }
  get acknowledgedUserIds(): string[] { return this.props.acknowledgedUserIds; }
  get createdAt(): string { return this.props.createdAt; }
}
