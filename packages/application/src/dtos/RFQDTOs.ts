import {
  RFQStatus,
  RFQVisibility,
  RFQAttachment,
  RFQClarification,
  RFQRevision,
  RFQLineItem,
} from '@inducore/core-domain';

export interface RFQDTO {
  id: string;
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

export interface CreateRFQInput {
  title: string;
  description: string;
  visibility: RFQVisibility;
  invitedSupplierIds?: string[];
  deadline: string;
  lineItems?: Array<{ name: string; quantity: number; unit: string; targetPrice?: number }>;
  attachments?: Array<{ name: string; url: string; sizeKb: number }>;
}

export interface InviteSuppliersInput {
  rfqId: string;
  supplierIds: string[];
}

export interface AddAttachmentInput {
  rfqId: string;
  name: string;
  url: string;
  sizeKb: number;
}

export interface AskClarificationInput {
  rfqId: string;
  question: string;
  askedBy: string;
}

export interface AnswerClarificationInput {
  rfqId: string;
  clarificationId: string;
  answer: string;
}

export interface CreateRevisionInput {
  rfqId: string;
  title?: string;
  description?: string;
  deadline?: string;
  revisionNotes: string;
}
