import { ContractType, ContractStatus, ContractAttachment, DigitalSignature, ContractKPIs, ContractVersionLog } from '@inducore/core-domain';

export interface CreateContractDTO {
  contractNumber: string;
  title: string;
  contractType: ContractType;
  supplierId: string;
  supplierName: string;
  awardId?: string;
  poId?: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  noticePeriodDays: number;
  currency: string;
  totalValueCap: number;
  governingLaw: string;
}

export interface AddAttachmentDTO {
  contractId: string;
  fileName: string;
  fileSizeKb: number;
  uploadedBy: string;
  fileType: string;
}

export interface RequestSignatureDTO {
  contractId: string;
  signerName: string;
  signerEmail: string;
  role: 'BUYER' | 'SUPPLIER' | 'LEGAL_WITNESS';
}

export interface SignContractDTO {
  contractId: string;
  signatureId: string;
  signerName: string;
  ipAddress: string;
}

export interface InitiateRenewalDTO {
  contractId: string;
  notes: string;
}

export interface ExecuteRenewalDTO {
  contractId: string;
  newEndDate: string;
  revisedValueCap: number;
  changeSummary: string;
  modifiedBy: string;
}

export interface ContractResponseDTO {
  id: string;
  contractNumber: string;
  title: string;
  contractType: ContractType;
  supplierId: string;
  supplierName: string;
  awardId?: string;
  poId?: string;
  status: ContractStatus;
  version: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  noticePeriodDays: number;
  currency: string;
  totalValueCap: number;
  currentSpend: number;
  governingLaw: string;
  attachments: ContractAttachment[];
  signatures: DigitalSignature[];
  kpis: ContractKPIs;
  versionHistory: ContractVersionLog[];
  renewalNotes?: string;
  createdAt: string;
  updatedAt: string;
}
