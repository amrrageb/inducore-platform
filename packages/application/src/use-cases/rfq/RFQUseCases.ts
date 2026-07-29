import { Result, RFQAggregate } from '@inducore/core-domain';
import { IRFQRepository } from '../../ports/IRFQRepository.js';
import {
  RFQDTO,
  CreateRFQInput,
  InviteSuppliersInput,
  AddAttachmentInput,
  AskClarificationInput,
  AnswerClarificationInput,
  CreateRevisionInput,
} from '../../dtos/RFQDTOs.js';

export class RFQUseCases {
  constructor(private readonly rfqRepo: IRFQRepository) {}

  private mapToDTO(rfq: RFQAggregate): RFQDTO {
    return {
      id: rfq.id,
      title: rfq.props.title,
      description: rfq.props.description,
      status: rfq.props.status,
      visibility: rfq.props.visibility,
      invitedSupplierIds: rfq.props.invitedSupplierIds,
      deadline: rfq.props.deadline,
      attachments: rfq.props.attachments,
      clarifications: rfq.props.clarifications,
      revisions: rfq.props.revisions,
      version: rfq.props.version,
      lineItems: rfq.props.lineItems,
      bidsCount: rfq.props.bidsCount,
      createdAt: rfq.props.createdAt,
      updatedAt: rfq.props.updatedAt,
    };
  }

  public async getRFQs(filter?: { status?: string; visibility?: string }): Promise<Result<RFQDTO[]>> {
    const list = await this.rfqRepo.findAll(filter);
    return Result.ok<RFQDTO[]>(list.map(r => this.mapToDTO(r)));
  }

  public async getRFQById(id: string): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(id);
    if (!rfq) {
      return Result.fail<RFQDTO>('RFQ not found');
    }
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async createDraftRFQ(input: CreateRFQInput): Promise<Result<RFQDTO>> {
    const lineItems = (input.lineItems || []).map((item, idx) => ({
      ...item,
      id: `li-${Date.now()}-${idx}`,
    }));

    const attachments = (input.attachments || []).map((att, idx) => ({
      ...att,
      id: `att-${Date.now()}-${idx}`,
      uploadedAt: new Date().toISOString(),
    }));

    const now = new Date().toISOString();
    const rfqOrError = RFQAggregate.create({
      title: input.title,
      description: input.description,
      status: 'DRAFT',
      visibility: input.visibility || 'PUBLIC',
      invitedSupplierIds: input.invitedSupplierIds || [],
      deadline: input.deadline,
      attachments,
      clarifications: [],
      revisions: [],
      version: 1,
      lineItems,
      bidsCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    if (rfqOrError.isFailure) {
      return Result.fail<RFQDTO>(rfqOrError.error!);
    }

    const rfq = rfqOrError.getValue();
    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async publishRFQ(id: string): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(id);
    if (!rfq) return Result.fail<RFQDTO>('RFQ not found');

    const pubRes = rfq.publish();
    if (pubRes.isFailure) return Result.fail<RFQDTO>(pubRes.error!);

    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async inviteSuppliers(input: InviteSuppliersInput): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(input.rfqId);
    if (!rfq) return Result.fail<RFQDTO>('RFQ not found');

    rfq.inviteSuppliers(input.supplierIds);
    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async addAttachment(input: AddAttachmentInput): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(input.rfqId);
    if (!rfq) return Result.fail<RFQDTO>('RFQ not found');

    rfq.addAttachment({
      name: input.name,
      url: input.url,
      sizeKb: input.sizeKb,
    });

    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async removeAttachment(rfqId: string, attachmentId: string): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(rfqId);
    if (!rfq) return Result.fail<RFQDTO>('RFQ not found');

    const res = rfq.removeAttachment(attachmentId);
    if (res.isFailure) return Result.fail<RFQDTO>(res.error!);

    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async askClarification(input: AskClarificationInput): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(input.rfqId);
    if (!rfq) return Result.fail<RFQDTO>('RFQ not found');

    const res = rfq.askClarification(input.question, input.askedBy);
    if (res.isFailure) return Result.fail<RFQDTO>(res.error!);

    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async answerClarification(input: AnswerClarificationInput): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(input.rfqId);
    if (!rfq) return Result.fail<RFQDTO>('RFQ not found');

    const res = rfq.answerClarification(input.clarificationId, input.answer);
    if (res.isFailure) return Result.fail<RFQDTO>(res.error!);

    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async createRevision(input: CreateRevisionInput): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(input.rfqId);
    if (!rfq) return Result.fail<RFQDTO>('RFQ not found');

    const res = rfq.createRevision(
      input.title || '',
      input.description || '',
      input.deadline || '',
      input.revisionNotes
    );
    if (res.isFailure) return Result.fail<RFQDTO>(res.error!);

    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }

  public async closeRFQ(id: string): Promise<Result<RFQDTO>> {
    const rfq = await this.rfqRepo.findById(id);
    if (!rfq) return Result.fail<RFQDTO>('RFQ not found');

    rfq.close();
    await this.rfqRepo.save(rfq);
    return Result.ok<RFQDTO>(this.mapToDTO(rfq));
  }
}
