import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type RFQStatus = 'DRAFT' | 'PUBLISHED' | 'EVALUATING' | 'CLOSED' | 'CANCELLED' | 'AWARDED';
export type RFQVisibility = 'PUBLIC' | 'PRIVATE';

export interface RFQAttachment {
  id: string;
  name: string;
  url: string;
  sizeKb: number;
  uploadedAt: string;
}

export interface RFQClarification {
  id: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer?: string;
  answeredAt?: string;
}

export interface RFQRevision {
  version: number;
  title: string;
  description: string;
  deadline: string;
  revisedAt: string;
  revisionNotes: string;
}

export interface RFQLineItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
}

export interface RFQProps {
  title: string;
  description: string;
  status: RFQStatus;
  visibility: RFQVisibility;
  invitedSupplierIds: string[];
  deadline: string;
  attachments: RFQAttachment[];
  clarifications: RFQClarification[];
  revisions: RFQRevision[];
  version: number;
  lineItems: RFQLineItem[];
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
}

export class RFQAggregate extends AggregateRoot<RFQProps> {
  private constructor(props: RFQProps, id?: string) {
    super(props, id);
  }

  public static create(props: RFQProps, id?: string): Result<RFQAggregate> {
    if (!props.title || props.title.trim().length === 0) {
      return Result.fail<RFQAggregate>('RFQ title cannot be empty');
    }
    return Result.ok<RFQAggregate>(new RFQAggregate(props, id));
  }

  public publish(): Result<void> {
    if (this.props.status !== 'DRAFT') {
      return Result.fail<void>(`Cannot publish RFQ from status ${this.props.status}. Must be DRAFT.`);
    }
    if (!this.props.deadline) {
      return Result.fail<void>('Cannot publish RFQ without a deadline.');
    }
    this.props.status = 'PUBLISHED';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public inviteSuppliers(supplierIds: string[]): Result<void> {
    const newIds = supplierIds.filter(id => !this.props.invitedSupplierIds.includes(id));
    this.props.invitedSupplierIds.push(...newIds);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public setVisibility(visibility: RFQVisibility): Result<void> {
    this.props.visibility = visibility;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public addAttachment(attachment: Omit<RFQAttachment, 'id' | 'uploadedAt'>): Result<RFQAttachment> {
    const newAttachment: RFQAttachment = {
      ...attachment,
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toISOString(),
    };
    this.props.attachments.push(newAttachment);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<RFQAttachment>(newAttachment);
  }

  public removeAttachment(attachmentId: string): Result<void> {
    const initialLength = this.props.attachments.length;
    this.props.attachments = this.props.attachments.filter(a => a.id !== attachmentId);
    if (this.props.attachments.length === initialLength) {
      return Result.fail<void>('Attachment not found');
    }
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public askClarification(question: string, askedBy: string): Result<RFQClarification> {
    if (!question || question.trim().length === 0) {
      return Result.fail<RFQClarification>('Question cannot be empty');
    }
    const clarification: RFQClarification = {
      id: `clr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      question,
      askedBy,
      askedAt: new Date().toISOString(),
    };
    this.props.clarifications.push(clarification);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<RFQClarification>(clarification);
  }

  public answerClarification(clarificationId: string, answer: string): Result<void> {
    const item = this.props.clarifications.find(c => c.id === clarificationId);
    if (!item) {
      return Result.fail<void>('Clarification thread not found');
    }
    item.answer = answer;
    item.answeredAt = new Date().toISOString();
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public createRevision(title: string, description: string, deadline: string, revisionNotes: string): Result<void> {
    // Record current snapshot before bumping
    const revisionSnapshot: RFQRevision = {
      version: this.props.version,
      title: this.props.title,
      description: this.props.description,
      deadline: this.props.deadline,
      revisedAt: new Date().toISOString(),
      revisionNotes: revisionNotes || `Revision v${this.props.version} issued`,
    };

    this.props.revisions.push(revisionSnapshot);
    this.props.version += 1;
    this.props.title = title || this.props.title;
    this.props.description = description || this.props.description;
    this.props.deadline = deadline || this.props.deadline;
    this.props.updatedAt = new Date().toISOString();

    return Result.ok<void>();
  }

  public extendDeadline(newDeadline: string, reason: string): Result<void> {
    if (new Date(newDeadline).getTime() <= Date.now()) {
      return Result.fail<void>('New deadline must be in the future');
    }
    return this.createRevision(
      this.props.title,
      this.props.description,
      newDeadline,
      `Deadline extended: ${reason}`
    );
  }

  public close(): Result<void> {
    this.props.status = 'CLOSED';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }
}
