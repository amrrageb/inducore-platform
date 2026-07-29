import { Result, ContractAggregate } from '@inducore/core-domain';
import { IContractRepository } from './IContractRepository.js';
import {
  CreateContractDTO,
  AddAttachmentDTO,
  RequestSignatureDTO,
  SignContractDTO,
  InitiateRenewalDTO,
  ExecuteRenewalDTO,
  ContractResponseDTO,
} from './ContractDTOs.js';

export class ContractUseCases {
  constructor(private contractRepo: IContractRepository) {}

  public async getAllContracts(): Promise<Result<ContractResponseDTO[]>> {
    try {
      const contracts = await this.contractRepo.findAll();
      // Auto check expiries
      contracts.forEach(c => c.checkExpiryStatus());
      const dtos = contracts.map(c => this.toDTO(c));
      return Result.ok<ContractResponseDTO[]>(dtos);
    } catch (err: any) {
      return Result.fail<ContractResponseDTO[]>(err.message || 'Failed to fetch contracts');
    }
  }

  public async getContractById(id: string): Promise<Result<ContractResponseDTO>> {
    try {
      const contract = await this.contractRepo.findById(id);
      if (!contract) {
        return Result.fail<ContractResponseDTO>('Contract not found');
      }
      contract.checkExpiryStatus();
      return Result.ok<ContractResponseDTO>(this.toDTO(contract));
    } catch (err: any) {
      return Result.fail<ContractResponseDTO>(err.message || 'Failed to fetch contract');
    }
  }

  public async createContract(dto: CreateContractDTO): Promise<Result<ContractResponseDTO>> {
    try {
      const existing = await this.contractRepo.findByNumber(dto.contractNumber);
      if (existing) {
        return Result.fail<ContractResponseDTO>('Contract number already exists');
      }

      const contractOrError = ContractAggregate.create({
        contractNumber: dto.contractNumber,
        title: dto.title,
        contractType: dto.contractType,
        supplierId: dto.supplierId,
        supplierName: dto.supplierName,
        awardId: dto.awardId,
        poId: dto.poId,
        status: 'DRAFT',
        version: 1,
        startDate: dto.startDate,
        endDate: dto.endDate,
        autoRenew: dto.autoRenew,
        noticePeriodDays: dto.noticePeriodDays || 30,
        currency: dto.currency || 'USD',
        totalValueCap: dto.totalValueCap,
        currentSpend: 0,
        governingLaw: dto.governingLaw || 'Delaware, USA',
        attachments: [],
        signatures: [],
        kpis: {
          slaAdherenceScorePct: 98.0,
          qualityPassRatePct: 99.0,
          onTimeDeliveryRatePct: 96.5,
          spendAgainstCapAmount: 0,
          contractValueCap: dto.totalValueCap,
        },
        versionHistory: [
          {
            version: 1,
            modifiedBy: 'Legal Admin',
            changeSummary: 'Initial draft created',
            effectiveDate: dto.startDate,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (contractOrError.isFailure) {
        return Result.fail<ContractResponseDTO>(contractOrError.errorValue());
      }

      const contract = contractOrError.getValue();
      await this.contractRepo.save(contract);
      return Result.ok<ContractResponseDTO>(this.toDTO(contract));
    } catch (err: any) {
      return Result.fail<ContractResponseDTO>(err.message || 'Failed to create contract');
    }
  }

  public async addAttachment(dto: AddAttachmentDTO): Promise<Result<ContractResponseDTO>> {
    try {
      const contract = await this.contractRepo.findById(dto.contractId);
      if (!contract) return Result.fail<ContractResponseDTO>('Contract not found');

      contract.addAttachment({
        fileName: dto.fileName,
        fileSizeKb: dto.fileSizeKb,
        uploadedBy: dto.uploadedBy,
        fileType: dto.fileType,
      });

      await this.contractRepo.save(contract);
      return Result.ok<ContractResponseDTO>(this.toDTO(contract));
    } catch (err: any) {
      return Result.fail<ContractResponseDTO>(err.message || 'Failed to add attachment');
    }
  }

  public async requestSignature(dto: RequestSignatureDTO): Promise<Result<ContractResponseDTO>> {
    try {
      const contract = await this.contractRepo.findById(dto.contractId);
      if (!contract) return Result.fail<ContractResponseDTO>('Contract not found');

      contract.requestSignature(dto.signerName, dto.signerEmail, dto.role);
      await this.contractRepo.save(contract);
      return Result.ok<ContractResponseDTO>(this.toDTO(contract));
    } catch (err: any) {
      return Result.fail<ContractResponseDTO>(err.message || 'Failed to request signature');
    }
  }

  public async signContract(dto: SignContractDTO): Promise<Result<ContractResponseDTO>> {
    try {
      const contract = await this.contractRepo.findById(dto.contractId);
      if (!contract) return Result.fail<ContractResponseDTO>('Contract not found');

      const signRes = contract.signContract(dto.signatureId, dto.signerName, dto.ipAddress);
      if (signRes.isFailure) return Result.fail<ContractResponseDTO>(signRes.errorValue());

      await this.contractRepo.save(contract);
      return Result.ok<ContractResponseDTO>(this.toDTO(contract));
    } catch (err: any) {
      return Result.fail<ContractResponseDTO>(err.message || 'Failed to sign contract');
    }
  }

  public async initiateRenewal(dto: InitiateRenewalDTO): Promise<Result<ContractResponseDTO>> {
    try {
      const contract = await this.contractRepo.findById(dto.contractId);
      if (!contract) return Result.fail<ContractResponseDTO>('Contract not found');

      const renRes = contract.initiateRenewal(dto.notes);
      if (renRes.isFailure) return Result.fail<ContractResponseDTO>(renRes.errorValue());

      await this.contractRepo.save(contract);
      return Result.ok<ContractResponseDTO>(this.toDTO(contract));
    } catch (err: any) {
      return Result.fail<ContractResponseDTO>(err.message || 'Failed to initiate renewal');
    }
  }

  public async executeRenewal(dto: ExecuteRenewalDTO): Promise<Result<ContractResponseDTO>> {
    try {
      const contract = await this.contractRepo.findById(dto.contractId);
      if (!contract) return Result.fail<ContractResponseDTO>('Contract not found');

      const renRes = contract.executeRenewal(dto.newEndDate, dto.revisedValueCap, dto.changeSummary, dto.modifiedBy);
      if (renRes.isFailure) return Result.fail<ContractResponseDTO>(renRes.errorValue());

      await this.contractRepo.save(contract);
      return Result.ok<ContractResponseDTO>(this.toDTO(contract));
    } catch (err: any) {
      return Result.fail<ContractResponseDTO>(err.message || 'Failed to execute renewal');
    }
  }

  private toDTO(contract: ContractAggregate): ContractResponseDTO {
    return {
      id: contract.id.toString(),
      contractNumber: contract.props.contractNumber,
      title: contract.props.title,
      contractType: contract.props.contractType,
      supplierId: contract.props.supplierId,
      supplierName: contract.props.supplierName,
      awardId: contract.props.awardId,
      poId: contract.props.poId,
      status: contract.props.status,
      version: contract.props.version,
      startDate: contract.props.startDate,
      endDate: contract.props.endDate,
      autoRenew: contract.props.autoRenew,
      noticePeriodDays: contract.props.noticePeriodDays,
      currency: contract.props.currency,
      totalValueCap: contract.props.totalValueCap,
      currentSpend: contract.props.currentSpend,
      governingLaw: contract.props.governingLaw,
      attachments: contract.props.attachments,
      signatures: contract.props.signatures,
      kpis: contract.props.kpis,
      versionHistory: contract.props.versionHistory,
      renewalNotes: contract.props.renewalNotes,
      createdAt: contract.props.createdAt,
      updatedAt: contract.props.updatedAt,
    };
  }
}
