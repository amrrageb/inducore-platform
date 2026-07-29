import {
  AwardType,
  AwardStatus,
  AwardLineAllocation,
  AwardApprovalLog,
  AwardRevisionLog,
  AwardContractDraft,
  AwardPurchaseRequest,
} from '@inducore/core-domain';

export interface AwardDTO {
  id: string;
  rfqId: string;
  rfqTitle: string;
  awardType: AwardType;
  status: AwardStatus;
  version: number;
  primarySupplierId: string;
  primarySupplierName: string;
  totalAwardedAmount: number;
  currency: string;
  lineAllocations: AwardLineAllocation[];
  approvalWorkflow: AwardApprovalLog[];
  awardLetterText?: string;
  awardLetterSentAt?: string;
  supplierAcceptedAt?: string;
  supplierRejectionReason?: string;
  contractDraft?: AwardContractDraft;
  purchaseRequest?: AwardPurchaseRequest;
  cancellationReason?: string;
  revisionHistory: AwardRevisionLog[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAwardDTO {
  rfqId: string;
  rfqTitle: string;
  awardType: AwardType;
  primarySupplierId: string;
  primarySupplierName: string;
  currency: string;
  lineAllocations: AwardLineAllocation[];
}

export interface SubmitAwardApprovalDTO {
  awardId: string;
  requestedBy: string;
  notes: string;
}

export interface ApproveAwardDTO {
  awardId: string;
  approverName: string;
  role: string;
  notes: string;
}

export interface DispatchAwardLetterDTO {
  awardId: string;
  letterBody: string;
}

export interface PrepareContractDTO {
  awardId: string;
  contractNumber: string;
  contractTitle: string;
  governingLaw: string;
  startDate: string;
  endDate: string;
  paymentTerms: string;
}

export interface GeneratePurchaseRequestDTO {
  awardId: string;
  costCenter: string;
  generatedBy: string;
}

export interface ReviseAwardDTO {
  awardId: string;
  revisedBy: string;
  reason: string;
  updatedAllocations?: AwardLineAllocation[];
}

export interface CancelAwardDTO {
  awardId: string;
  reason: string;
}
