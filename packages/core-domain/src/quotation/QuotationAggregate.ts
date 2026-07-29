import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'REVISED' | 'WITHDRAWN' | 'ACCEPTED' | 'REJECTED';

export interface QuotationLineItem {
  id: string;
  rfqLineItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  isIncluded: boolean;
  technicalNotes?: string;
}

export interface QuotationAttachment {
  id: string;
  name: string;
  url: string;
  type: 'TECHNICAL' | 'COMMERCIAL';
  sizeKb: number;
  uploadedAt: string;
}

export interface BuyerComment {
  id: string;
  author: string;
  comment: string;
  createdAt: string;
}

export interface QuotationRevision {
  version: number;
  totalPrice: number;
  currency: string;
  incoterms: string;
  deliveryTimeDays: number;
  submittedAt: string;
  notes: string;
}

export interface QuotationProps {
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

export class QuotationAggregate extends AggregateRoot<QuotationProps> {
  private constructor(props: QuotationProps, id?: string) {
    super(props, id);
  }

  public static create(props: QuotationProps, id?: string): Result<QuotationAggregate> {
    if (!props.rfqId) {
      return Result.fail<QuotationAggregate>('Quotation must reference a valid RFQ ID');
    }
    if (!props.supplierId) {
      return Result.fail<QuotationAggregate>('Quotation must reference a valid Supplier ID');
    }

    // Auto-calculate total price & VAT
    const subtotal = props.lineItems
      .filter(item => item.isIncluded)
      .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const taxAmount = (subtotal * props.taxVatRatePercentage) / 100;
    props.subtotalPrice = subtotal;
    props.taxVatAmount = taxAmount;
    props.totalPrice = subtotal + taxAmount;

    return Result.ok<QuotationAggregate>(new QuotationAggregate(props, id));
  }

  public recalculateTotals(): void {
    const subtotal = this.props.lineItems
      .filter(item => item.isIncluded)
      .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const taxAmount = (subtotal * this.props.taxVatRatePercentage) / 100;
    this.props.subtotalPrice = subtotal;
    this.props.taxVatAmount = taxAmount;
    this.props.totalPrice = subtotal + taxAmount;
  }

  public submit(): Result<void> {
    if (this.props.status === 'WITHDRAWN') {
      return Result.fail<void>('Cannot submit a withdrawn quotation.');
    }
    this.recalculateTotals();
    this.props.status = 'SUBMITTED';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public withdraw(reason: string): Result<void> {
    if (this.props.status === 'WITHDRAWN') {
      return Result.fail<void>('Quotation is already withdrawn.');
    }
    this.props.status = 'WITHDRAWN';
    this.props.withdrawalReason = reason || 'Withdrawn by supplier';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public createRevision(
    notes: string,
    updatedLineItems?: QuotationLineItem[],
    updatedIncoterms?: string,
    updatedDeliveryDays?: number,
    updatedPaymentTerms?: string,
    updatedValidityUntil?: string
  ): Result<void> {
    if (this.props.status === 'WITHDRAWN') {
      return Result.fail<void>('Cannot revise a withdrawn quotation.');
    }

    // Snapshot current version
    const revisionSnapshot: QuotationRevision = {
      version: this.props.version,
      totalPrice: this.props.totalPrice,
      currency: this.props.currency,
      incoterms: this.props.incoterms,
      deliveryTimeDays: this.props.deliveryTimeDays,
      submittedAt: new Date().toISOString(),
      notes: notes || `Revision v${this.props.version} issued`,
    };

    this.props.revisions.push(revisionSnapshot);
    this.props.version += 1;

    if (updatedLineItems) {
      this.props.lineItems = updatedLineItems;
    }
    if (updatedIncoterms) this.props.incoterms = updatedIncoterms;
    if (updatedDeliveryDays !== undefined) this.props.deliveryTimeDays = updatedDeliveryDays;
    if (updatedPaymentTerms) this.props.paymentTerms = updatedPaymentTerms;
    if (updatedValidityUntil) this.props.validityUntil = updatedValidityUntil;

    this.recalculateTotals();
    this.props.status = 'REVISED';
    this.props.updatedAt = new Date().toISOString();

    return Result.ok<void>();
  }

  public addBuyerComment(author: string, comment: string): Result<BuyerComment> {
    if (!comment || comment.trim().length === 0) {
      return Result.fail<BuyerComment>('Comment text cannot be empty');
    }
    const newComment: BuyerComment = {
      id: `cmnt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      author: author || 'Buyer Officer',
      comment,
      createdAt: new Date().toISOString(),
    };
    this.props.buyerComments.push(newComment);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<BuyerComment>(newComment);
  }

  public addAttachment(attachment: Omit<QuotationAttachment, 'id' | 'uploadedAt'>): Result<QuotationAttachment> {
    const newAttachment: QuotationAttachment = {
      ...attachment,
      id: `qatt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toISOString(),
    };

    if (attachment.type === 'TECHNICAL') {
      this.props.technicalAttachments.push(newAttachment);
    } else {
      this.props.commercialAttachments.push(newAttachment);
    }

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<QuotationAttachment>(newAttachment);
  }
}
