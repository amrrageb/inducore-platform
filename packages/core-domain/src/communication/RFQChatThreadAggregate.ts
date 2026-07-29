import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export interface ChatMessageItem {
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: 'BUYER' | 'SUPPLIER' | 'SYSTEM';
  text: string;
  timestamp: string;
  attachments?: { fileName: string; fileUrl: string; fileSizeMb: number }[];
  quoteReferenceId?: string;
  priceQuoted?: number;
}

export interface RFQChatThreadProps {
  tenantId: string;
  rfqId: string;
  rfqTitle: string;
  supplierId: string;
  supplierName: string;
  buyerId: string;
  buyerName: string;
  messages: ChatMessageItem[];
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  lastActivityAt: string;
  createdAt: string;
}

export class RFQChatThreadAggregate extends AggregateRoot<RFQChatThreadProps> {
  private constructor(props: RFQChatThreadProps, id?: string) {
    super(props, id);
  }

  public static create(props: RFQChatThreadProps, id?: string): Result<RFQChatThreadAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.rfqId, argumentName: 'rfqId' },
      { argument: props.supplierId, argumentName: 'supplierId' },
      { argument: props.buyerId, argumentName: 'buyerId' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<RFQChatThreadAggregate>(nullGuard.error || 'Invalid RFQ Chat Thread properties');
    }

    return Result.ok<RFQChatThreadAggregate>(new RFQChatThreadAggregate(props, id));
  }

  public appendMessage(msg: Omit<ChatMessageItem, 'messageId' | 'timestamp'>): ChatMessageItem {
    const newMsg: ChatMessageItem = {
      ...msg,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.props.messages.push(newMsg);
    this.props.lastActivityAt = newMsg.timestamp;
    return newMsg;
  }

  get rfqId(): string { return this.props.rfqId; }
  get rfqTitle(): string { return this.props.rfqTitle; }
  get supplierId(): string { return this.props.supplierId; }
  get supplierName(): string { return this.props.supplierName; }
  get buyerId(): string { return this.props.buyerId; }
  get buyerName(): string { return this.props.buyerName; }
  get messages(): ChatMessageItem[] { return this.props.messages; }
  get status(): string { return this.props.status; }
  get lastActivityAt(): string { return this.props.lastActivityAt; }
}
