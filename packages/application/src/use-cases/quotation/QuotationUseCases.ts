import { QuotationAggregate, Result } from '@inducore/core-domain';
import { IQuotationRepository } from '../../ports/IQuotationRepository.js';
import {
  QuotationDTO,
  CreateQuotationCommandDTO,
  CreateQuotationRevisionCommandDTO,
  WithdrawQuotationCommandDTO,
  AddBuyerCommentCommandDTO,
  AddQuotationAttachmentCommandDTO,
} from '../../dtos/QuotationDTOs.js';

export class QuotationUseCases {
  constructor(private repo: IQuotationRepository) {}

  private mapToDTO(q: QuotationAggregate): QuotationDTO {
    return {
      id: q.id,
      rfqId: q.props.rfqId,
      rfqTitle: q.props.rfqTitle,
      supplierId: q.props.supplierId,
      supplierName: q.props.supplierName,
      version: q.props.version,
      status: q.props.status,
      isAlternativeOffer: q.props.isAlternativeOffer,
      alternativeOfferDetails: q.props.alternativeOfferDetails,
      isPartialQuotation: q.props.isPartialQuotation,
      currency: q.props.currency,
      subtotalPrice: q.props.subtotalPrice,
      taxVatRatePercentage: q.props.taxVatRatePercentage,
      taxVatAmount: q.props.taxVatAmount,
      totalPrice: q.props.totalPrice,
      incoterms: q.props.incoterms,
      incotermsLocation: q.props.incotermsLocation,
      deliveryTimeDays: q.props.deliveryTimeDays,
      paymentTerms: q.props.paymentTerms,
      validityUntil: q.props.validityUntil,
      lineItems: q.props.lineItems,
      technicalAttachments: q.props.technicalAttachments,
      commercialAttachments: q.props.commercialAttachments,
      internalNotes: q.props.internalNotes,
      buyerComments: q.props.buyerComments,
      revisions: q.props.revisions,
      withdrawalReason: q.props.withdrawalReason,
      createdAt: q.props.createdAt,
      updatedAt: q.props.updatedAt,
    };
  }

  public async getAll(): Promise<Result<QuotationDTO[]>> {
    const quotes = await this.repo.findAll();
    return Result.ok(quotes.map(q => this.mapToDTO(q)));
  }

  public async getById(id: string): Promise<Result<QuotationDTO>> {
    const q = await this.repo.findById(id);
    if (!q) return Result.fail(`Quotation with ID ${id} not found`);
    return Result.ok(this.mapToDTO(q));
  }

  public async getByRfq(rfqId: string): Promise<Result<QuotationDTO[]>> {
    const quotes = await this.repo.findByRfqId(rfqId);
    return Result.ok(quotes.map(q => this.mapToDTO(q)));
  }

  public async getBySupplier(supplierId: string): Promise<Result<QuotationDTO[]>> {
    const quotes = await this.repo.findBySupplierId(supplierId);
    return Result.ok(quotes.map(q => this.mapToDTO(q)));
  }

  public async create(dto: CreateQuotationCommandDTO): Promise<Result<QuotationDTO>> {
    const quoteId = `quote-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const lineItems = dto.lineItems.map((li, idx) => ({
      id: `qli-${idx + 1}-${Date.now()}`,
      rfqLineItemId: li.rfqLineItemId,
      itemName: li.itemName,
      quantity: li.quantity,
      unit: li.unit,
      unitPrice: li.unitPrice,
      totalPrice: li.quantity * li.unitPrice,
      isIncluded: li.isIncluded ?? true,
      technicalNotes: li.technicalNotes,
    }));

    const result = QuotationAggregate.create(
      {
        rfqId: dto.rfqId,
        rfqTitle: dto.rfqTitle,
        supplierId: dto.supplierId,
        supplierName: dto.supplierName,
        version: 1,
        status: dto.isDraft ? 'DRAFT' : 'SUBMITTED',
        isAlternativeOffer: dto.isAlternativeOffer ?? false,
        alternativeOfferDetails: dto.alternativeOfferDetails,
        isPartialQuotation: dto.isPartialQuotation ?? false,
        currency: dto.currency || 'USD',
        subtotalPrice: 0,
        taxVatRatePercentage: dto.taxVatRatePercentage ?? 10,
        taxVatAmount: 0,
        totalPrice: 0,
        incoterms: dto.incoterms || 'FOB',
        incotermsLocation: dto.incotermsLocation || 'Port of Houston',
        deliveryTimeDays: dto.deliveryTimeDays || 30,
        paymentTerms: dto.paymentTerms || 'Net 30',
        validityUntil: dto.validityUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems,
        technicalAttachments: [],
        commercialAttachments: [],
        internalNotes: dto.internalNotes || '',
        buyerComments: [],
        revisions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      quoteId
    );

    if (result.isFailure) {
      return Result.fail(result.error);
    }

    const quote = result.getValue();
    await this.repo.save(quote);
    return Result.ok(this.mapToDTO(quote));
  }

  public async submitDraft(id: string): Promise<Result<QuotationDTO>> {
    const q = await this.repo.findById(id);
    if (!q) return Result.fail(`Quotation ${id} not found`);

    const submitRes = q.submit();
    if (submitRes.isFailure) return Result.fail(submitRes.error);

    await this.repo.save(q);
    return Result.ok(this.mapToDTO(q));
  }

  public async createRevision(id: string, dto: CreateQuotationRevisionCommandDTO): Promise<Result<QuotationDTO>> {
    const q = await this.repo.findById(id);
    if (!q) return Result.fail(`Quotation ${id} not found`);

    const revRes = q.createRevision(
      dto.notes,
      dto.lineItems,
      dto.incoterms,
      dto.deliveryTimeDays,
      dto.paymentTerms,
      dto.validityUntil
    );

    if (revRes.isFailure) return Result.fail(revRes.error);

    await this.repo.save(q);
    return Result.ok(this.mapToDTO(q));
  }

  public async withdraw(id: string, dto: WithdrawQuotationCommandDTO): Promise<Result<QuotationDTO>> {
    const q = await this.repo.findById(id);
    if (!q) return Result.fail(`Quotation ${id} not found`);

    const wRes = q.withdraw(dto.reason);
    if (wRes.isFailure) return Result.fail(wRes.error);

    await this.repo.save(q);
    return Result.ok(this.mapToDTO(q));
  }

  public async addComment(id: string, dto: AddBuyerCommentCommandDTO): Promise<Result<QuotationDTO>> {
    const q = await this.repo.findById(id);
    if (!q) return Result.fail(`Quotation ${id} not found`);

    const cRes = q.addBuyerComment(dto.author, dto.comment);
    if (cRes.isFailure) return Result.fail(cRes.error);

    await this.repo.save(q);
    return Result.ok(this.mapToDTO(q));
  }

  public async addAttachment(id: string, dto: AddQuotationAttachmentCommandDTO): Promise<Result<QuotationDTO>> {
    const q = await this.repo.findById(id);
    if (!q) return Result.fail(`Quotation ${id} not found`);

    const aRes = q.addAttachment(dto);
    if (aRes.isFailure) return Result.fail(aRes.error);

    await this.repo.save(q);
    return Result.ok(this.mapToDTO(q));
  }
}
