import { QuotationLineItem, QuotationAttachment, BuyerComment, QuotationRevision, QuotationStatus } from '@inducore/core-domain';

export interface QuotationDTO {
  id: string;
  rfqId: string;
  rfqTitle: string;
  supplierId: string;
  supplierName: string;
  version: number;
  status: QuotationStatus;
  isAlternativeOffer: boolean;
  alternativeOfferDetails?: string;
  isPartialQuotation: boolean;
  currency: string;
  subtotalPrice: number;
  taxVatRatePercentage: number;
  taxVatAmount: number;
  totalPrice: number;
  incoterms: string;
  incotermsLocation: string;
  deliveryTimeDays: number;
  paymentTerms: string;
  validityUntil: string;
  lineItems: QuotationLineItem[];
  technicalAttachments: QuotationAttachment[];
  commercialAttachments: QuotationAttachment[];
  internalNotes: string;
  buyerComments: BuyerComment[];
  revisions: QuotationRevision[];
  withdrawalReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotationCommandDTO {
  rfqId: string;
  rfqTitle: string;
  supplierId: string;
  supplierName: string;
  isAlternativeOffer?: boolean;
  alternativeOfferDetails?: string;
  isPartialQuotation?: boolean;
  currency: string;
  taxVatRatePercentage?: number;
  incoterms: string;
  incotermsLocation: string;
  deliveryTimeDays: number;
  paymentTerms: string;
  validityUntil: string;
  lineItems: Array<{
    rfqLineItemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    isIncluded: boolean;
    technicalNotes?: string;
  }>;
  internalNotes?: string;
  isDraft?: boolean;
}

export interface CreateQuotationRevisionCommandDTO {
  notes: string;
  incoterms?: string;
  deliveryTimeDays?: number;
  paymentTerms?: string;
  validityUntil?: string;
  lineItems?: Array<{
    id: string;
    rfqLineItemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    isIncluded: boolean;
    technicalNotes?: string;
  }>;
}

export interface WithdrawQuotationCommandDTO {
  reason: string;
}

export interface AddBuyerCommentCommandDTO {
  author: string;
  comment: string;
}

export interface AddQuotationAttachmentCommandDTO {
  name: string;
  url: string;
  type: 'TECHNICAL' | 'COMMERCIAL';
  sizeKb: number;
}
