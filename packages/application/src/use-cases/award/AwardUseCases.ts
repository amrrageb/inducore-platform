import { AwardAggregate, Result } from '@inducore/core-domain';
import { IAwardRepository } from '../../ports/IAwardRepository.js';
import {
  AwardDTO,
  CreateAwardDTO,
  SubmitAwardApprovalDTO,
  ApproveAwardDTO,
  DispatchAwardLetterDTO,
  PrepareContractDTO,
  GeneratePurchaseRequestDTO,
  ReviseAwardDTO,
  CancelAwardDTO,
} from '../../dtos/AwardDTOs.js';

export class AwardUseCases {
  constructor(private awardRepo: IAwardRepository) {}

  public static toDTO(award: AwardAggregate): AwardDTO {
    return {
      id: award.id,
      rfqId: award.props.rfqId,
      rfqTitle: award.props.rfqTitle,
      awardType: award.props.awardType,
      status: award.props.status,
      version: award.props.version,
      primarySupplierId: award.props.primarySupplierId,
      primarySupplierName: award.props.primarySupplierName,
      totalAwardedAmount: award.props.totalAwardedAmount,
      currency: award.props.currency,
      lineAllocations: award.props.lineAllocations,
      approvalWorkflow: award.props.approvalWorkflow,
      awardLetterText: award.props.awardLetterText,
      awardLetterSentAt: award.props.awardLetterSentAt,
      supplierAcceptedAt: award.props.supplierAcceptedAt,
      supplierRejectionReason: award.props.supplierRejectionReason,
      contractDraft: award.props.contractDraft,
      purchaseRequest: award.props.purchaseRequest,
      cancellationReason: award.props.cancellationReason,
      revisionHistory: award.props.revisionHistory,
      createdAt: award.props.createdAt,
      updatedAt: award.props.updatedAt,
    };
  }

  public async getAllAwards(): Promise<AwardDTO[]> {
    const awards = await this.awardRepo.findAll();
    return awards.map(AwardUseCases.toDTO);
  }

  public async getAwardById(id: string): Promise<AwardDTO | null> {
    const award = await this.awardRepo.findById(id);
    return award ? AwardUseCases.toDTO(award) : null;
  }

  public async createAward(dto: CreateAwardDTO): Promise<Result<AwardDTO>> {
    const now = new Date().toISOString();
    const createRes = AwardAggregate.create({
      rfqId: dto.rfqId,
      rfqTitle: dto.rfqTitle,
      awardType: dto.awardType,
      status: 'RECOMMENDED',
      version: 1,
      primarySupplierId: dto.primarySupplierId,
      primarySupplierName: dto.primarySupplierName,
      totalAwardedAmount: 0,
      currency: dto.currency || 'USD',
      lineAllocations: dto.lineAllocations || [],
      approvalWorkflow: [],
      revisionHistory: [],
      createdAt: now,
      updatedAt: now,
    });

    if (createRes.isFailure) {
      return Result.fail<AwardDTO>(createRes.getError());
    }

    const award = createRes.getValue();
    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }

  public async submitForApproval(dto: SubmitAwardApprovalDTO): Promise<Result<AwardDTO>> {
    const award = await this.awardRepo.findById(dto.awardId);
    if (!award) return Result.fail<AwardDTO>('Award not found');

    const res = award.submitForApproval(dto.requestedBy, dto.notes);
    if (res.isFailure) return Result.fail<AwardDTO>(res.getError());

    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }

  public async approveAward(dto: ApproveAwardDTO): Promise<Result<AwardDTO>> {
    const award = await this.awardRepo.findById(dto.awardId);
    if (!award) return Result.fail<AwardDTO>('Award not found');

    const res = award.approve(dto.approverName, dto.role, dto.notes);
    if (res.isFailure) return Result.fail<AwardDTO>(res.getError());

    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }

  public async dispatchAwardLetter(dto: DispatchAwardLetterDTO): Promise<Result<AwardDTO>> {
    const award = await this.awardRepo.findById(dto.awardId);
    if (!award) return Result.fail<AwardDTO>('Award not found');

    const res = award.dispatchAwardLetter(dto.letterBody);
    if (res.isFailure) return Result.fail<AwardDTO>(res.getError());

    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }

  public async recordSupplierAcceptance(awardId: string): Promise<Result<AwardDTO>> {
    const award = await this.awardRepo.findById(awardId);
    if (!award) return Result.fail<AwardDTO>('Award not found');

    const res = award.recordSupplierAcceptance();
    if (res.isFailure) return Result.fail<AwardDTO>(res.getError());

    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }

  public async prepareContract(dto: PrepareContractDTO): Promise<Result<AwardDTO>> {
    const award = await this.awardRepo.findById(dto.awardId);
    if (!award) return Result.fail<AwardDTO>('Award not found');

    const res = award.prepareContract({
      contractNumber: dto.contractNumber,
      contractTitle: dto.contractTitle,
      governingLaw: dto.governingLaw,
      startDate: dto.startDate,
      endDate: dto.endDate,
      paymentTerms: dto.paymentTerms,
    });
    if (res.isFailure) return Result.fail<AwardDTO>(res.getError());

    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }

  public async generatePurchaseRequest(dto: GeneratePurchaseRequestDTO): Promise<Result<AwardDTO>> {
    const award = await this.awardRepo.findById(dto.awardId);
    if (!award) return Result.fail<AwardDTO>('Award not found');

    const res = award.generatePurchaseRequest(dto.costCenter, dto.generatedBy);
    if (res.isFailure) return Result.fail<AwardDTO>(res.getError());

    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }

  public async reviseAward(dto: ReviseAwardDTO): Promise<Result<AwardDTO>> {
    const award = await this.awardRepo.findById(dto.awardId);
    if (!award) return Result.fail<AwardDTO>('Award not found');

    const res = award.reviseAward(dto.revisedBy, dto.reason, dto.updatedAllocations);
    if (res.isFailure) return Result.fail<AwardDTO>(res.getError());

    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }

  public async cancelAward(dto: CancelAwardDTO): Promise<Result<AwardDTO>> {
    const award = await this.awardRepo.findById(dto.awardId);
    if (!award) return Result.fail<AwardDTO>('Award not found');

    const res = award.cancelAward(dto.reason);
    if (res.isFailure) return Result.fail<AwardDTO>(res.getError());

    await this.awardRepo.save(award);
    return Result.ok<AwardDTO>(AwardUseCases.toDTO(award));
  }
}
