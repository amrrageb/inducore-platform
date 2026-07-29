import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';
import { DomainEvent } from '../common/DomainEvent.js';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type NotificationCategory = 'RFQ_UPDATE' | 'PO_STATUS' | 'CONTRACT_APPROVAL' | 'QUALITY_ALERT' | 'ANNOUNCEMENT' | 'DIRECT_MESSAGE';
export type MessageStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface CommunicationMessageProps {
  tenantId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  subject: string;
  body: string;
  status: MessageStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  relatedEntityId?: string; // e.g. rfqId, poId, contractId
  relatedEntityType?: 'RFQ' | 'PO' | 'CONTRACT' | 'SUPPLIER' | 'ANNOUNCEMENT';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

export class MessageSentEvent implements DomainEvent {
  public dateTimeOccurred: Date = new Date();
  constructor(public messageId: string, public channel: NotificationChannel, public recipientId: string) {}
  getAggregateId(): string {
    return this.messageId;
  }
}

export class MessageReadEvent implements DomainEvent {
  public dateTimeOccurred: Date = new Date();
  constructor(public messageId: string, public readAt: string) {}
  getAggregateId(): string {
    return this.messageId;
  }
}

export class CommunicationMessageAggregate extends AggregateRoot<CommunicationMessageProps> {
  private constructor(props: CommunicationMessageProps, id?: string) {
    super(props, id);
  }

  public static create(props: CommunicationMessageProps, id?: string): Result<CommunicationMessageAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.senderId, argumentName: 'senderId' },
      { argument: props.recipientId, argumentName: 'recipientId' },
      { argument: props.channel, argumentName: 'channel' },
      { argument: props.subject, argumentName: 'subject' },
      { argument: props.body, argumentName: 'body' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<CommunicationMessageAggregate>(nullGuard.error || 'Invalid communication message properties');
    }

    const message = new CommunicationMessageAggregate(props, id);

    if (!id) {
      message.addDomainEvent(new MessageSentEvent(message.id, props.channel, props.recipientId));
    }

    return Result.ok<CommunicationMessageAggregate>(message);
  }

  public markAsRead(): Result<void> {
    if (this.props.status === 'READ') {
      return Result.ok<void>();
    }
    this.props.status = 'READ';
    const now = new Date().toISOString();
    this.props.readAt = now;
    this.props.updatedAt = now;
    this.addDomainEvent(new MessageReadEvent(this.id, now));
    return Result.ok<void>();
  }

  public updateStatus(newStatus: MessageStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date().toISOString();
  }

  get tenantId(): string { return this.props.tenantId; }
  get senderId(): string { return this.props.senderId; }
  get senderName(): string { return this.props.senderName; }
  get recipientId(): string { return this.props.recipientId; }
  get channel(): NotificationChannel { return this.props.channel; }
  get category(): NotificationCategory { return this.props.category; }
  get subject(): string { return this.props.subject; }
  get body(): string { return this.props.body; }
  get status(): MessageStatus { return this.props.status; }
  get priority(): string { return this.props.priority; }
  get relatedEntityId(): string | undefined { return this.props.relatedEntityId; }
  get relatedEntityType(): string | undefined { return this.props.relatedEntityType; }
  get createdAt(): string { return this.props.createdAt; }
  get readAt(): string | undefined { return this.props.readAt; }
}
