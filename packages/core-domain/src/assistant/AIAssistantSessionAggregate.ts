import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type AssistantMode =
  | 'general_chat'
  | 'procurement_advisor'
  | 'rfq_writer'
  | 'supplier_matcher'
  | 'product_search'
  | 'document_qa'
  | 'knowledge_indexer';

export interface GroundingCitation {
  sourceTitle: string;
  sourceType: 'doc' | 'supplier' | 'product' | 'rfq' | 'contract';
  snippet: string;
  confidenceScore: number;
}

export interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: AssistantMode;
  citations?: GroundingCitation[];
  promptTemplateId?: string;
  tokensUsed?: number;
}

export interface AIAssistantSessionProps {
  tenantId: string;
  title: string;
  mode: AssistantMode;
  messages: ChatMessageProps[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export class AIAssistantSessionAggregate extends AggregateRoot<AIAssistantSessionProps> {
  private constructor(props: AIAssistantSessionProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<AIAssistantSessionProps, 'createdAt' | 'updatedAt' | 'messages' | 'isArchived'>, id?: string): Result<AIAssistantSessionAggregate> {
    if (!props.tenantId) {
      return Result.fail<AIAssistantSessionAggregate>('Tenant ID is required.');
    }
    if (!props.title || props.title.trim().length === 0) {
      return Result.fail<AIAssistantSessionAggregate>('Session title is required.');
    }

    const now = new Date().toISOString();
    const aggregate = new AIAssistantSessionAggregate(
      {
        ...props,
        messages: [],
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      },
      id
    );

    return Result.ok<AIAssistantSessionAggregate>(aggregate);
  }

  public addMessage(message: Omit<ChatMessageProps, 'id' | 'timestamp'>): Result<void> {
    if (!message.content || message.content.trim().length === 0) {
      return Result.fail<void>('Message content cannot be empty.');
    }

    const now = new Date().toISOString();
    const newMessage: ChatMessageProps = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: now,
    };

    this.props.messages.push(newMessage);
    this.props.updatedAt = now;

    // Auto update title if first user message and generic title
    if (this.props.messages.length === 1 && this.props.title === 'New Conversation') {
      this.props.title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
    }

    return Result.ok<void>();
  }

  public rename(newTitle: string): Result<void> {
    if (!newTitle || newTitle.trim().length === 0) {
      return Result.fail<void>('Title cannot be empty.');
    }
    this.props.title = newTitle.trim();
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public setMode(newMode: AssistantMode): void {
    this.props.mode = newMode;
    this.props.updatedAt = new Date().toISOString();
  }

  public clearMessages(): void {
    this.props.messages = [];
    this.props.updatedAt = new Date().toISOString();
  }

  public archive(): void {
    this.props.isArchived = true;
    this.props.updatedAt = new Date().toISOString();
  }
}
