import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type AwardType = 'FULL' | 'PARTIAL' | 'MULTI_SUPPLIER';

export type AwardStatus =
  | 'RECOMMENDED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'AWARD_LETTER_SENT'
  | 'ACCEPTED_BY_SUPPLIER'
  | 'REJECTED_BY_SUPPLIER'
  | 'CONTRACT_PREPARED'
  | 'PURCHASE_REQUEST_GENERATED'
  | 'CANCELLED'
  | 'REVISED';

export interface AwardLineAllocation {
  id: string;
  rfqLineItemId: string;
  itemName: string;
  requestedQuantity: number;
  awardedQuantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  supplierId: string;
  supplierName: string;
}

export interface AwardApprovalLog {
  id: string;
  approverName: string;
  role: string;
  status: 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED';
  notes: string;
  timestamp: string;
}

export interface AwardRevisionLog {
  version: number;
  revisedBy: string;
  reason: string;
  previousTotalAmount: number;
  newTotalAmount: number;
  timestamp: string;
}

export interface AwardContractDraft {
  contractNumber: string;
  contractTitle: string;
  governingLaw: string;
  startDate: string;
  endDate: string;
  paymentTerms: string;
  preparedAt: string;
}

export interface AwardPurchaseRequest {
  prNumber: string;
  costCenter: string;
  totalPrAmount: number;
  currency: string;
  generatedBy: string;
  createdAt: string;
}

export interface AwardProps {
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

export class AwardAggregate extends AggregateRoot<AwardProps> {
  private constructor(props: AwardProps, id?: string) {
    super(props, id);
  }

  public static create(props: AwardProps, id?: string): Result<AwardAggregate> {
    if (!props.rfqId) {
      return Result.fail<AwardAggregate>('Award must reference an RFQ ID');
    }
    if (!props.primarySupplierId) {
      return Result.fail<AwardAggregate>('Award must specify at least one primary supplier ID');
    }

    // Auto calculate total awarded amount from line allocations
    const calculatedTotal = props.lineAllocations.reduce((acc, line) => acc + line.totalAmount, 0);
    props.totalAwardedAmount = calculatedTotal > 0 ? calculatedTotal : props.totalAwardedAmount;

    return Result.ok<AwardAggregate>(new AwardAggregate(props, id));
  }

  public submitForApproval(requestedBy: string, notes: string): Result<void> {
    if (this.props.status === 'CANCELLED') {
      return Result.fail<void>('Cannot submit a cancelled award for approval');
    }
    this.props.status = 'PENDING_APPROVAL';
    this.props.approvalWorkflow.push({
      id: `appr-log-${Date.now()}`,
      approverName: requestedBy,
      role: 'Sourcing Lead',
      status: 'CONDITIONALLY_APPROVED',
      notes: notes || 'Submitted for Director review',
      timestamp: new Date().toISOString(),
    });
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public approve(approverName: string, role: string, notes: string): Result<void> {
    if (this.props.status === 'CANCELLED') {
      return Result.fail<void>('Cannot approve a cancelled award');
    }
    this.props.status = 'APPROVED';
    this.props.approvalWorkflow.push({
      id: `appr-log-${Date.now()}`,
      approverName,
      role,
      status: 'APPROVED',
      notes: notes || 'Award decision approved in full',
      timestamp: new Date().toISOString(),
    });
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public dispatchAwardLetter(letterBody: string): Result<void> {
    if (this.props.status !== 'APPROVED' && this.props.status !== 'CONTRACT_PREPARED') {
      return Result.fail<void>('Award must be in APPROVED state before dispatching official award letter');
    }
    this.props.status = 'AWARD_LETTER_SENT';
    this.props.awardLetterText = letterBody;
    this.props.awardLetterSentAt = new Date().toISOString();
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public recordSupplierAcceptance(): Result<void> {
    if (this.props.status !== 'AWARD_LETTER_SENT') {
      return Result.fail<void>('Award letter must be sent before supplier acceptance can be recorded');
    }
    this.props.status = 'ACCEPTED_BY_SUPPLIER';
    this.props.supplierAcceptedAt = new Date().toISOString();
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public recordSupplierRejection(reason: string): Result<void> {
    this.props.status = 'REJECTED_BY_SUPPLIER';
    this.props.supplierRejectionReason = reason;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public prepareContract(contractDetails: Omit<AwardContractDraft, 'preparedAt'>): Result<void> {
    this.props.contractDraft = {
      ...contractDetails,
      preparedAt: new Date().toISOString(),
    };
    if (this.props.status === 'ACCEPTED_BY_SUPPLIER' || this.props.status === 'APPROVED') {
      this.props.status = 'CONTRACT_PREPARED';
    }
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public generatePurchaseRequest(costCenter: string, generatedBy: string): Result<AwardPurchaseRequest> {
    const prNumber = `PR-${Date.now().toString().slice(-6)}`;
    const pr: AwardPurchaseRequest = {
      prNumber,
      costCenter: costCenter || 'CC-MFG-9020',
      totalPrAmount: this.props.totalAwardedAmount,
      currency: this.props.currency,
      generatedBy,
      createdAt: new Date().toISOString(),
    };

    this.props.purchaseRequest = pr;
    this.props.status = 'PURCHASE_REQUEST_GENERATED';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<AwardPurchaseRequest>(pr);
  }

  public reviseAward(
    revisedBy: string,
    reason: string,
    updatedAllocations?: AwardLineAllocation[]
  ): Result<void> {
    if (this.props.status === 'CANCELLED') {
      return Result.fail<void>('Cannot revise a cancelled award');
    }

    const previousTotal = this.props.totalAwardedAmount;
    if (updatedAllocations) {
      this.props.lineAllocations = updatedAllocations;
      this.props.totalAwardedAmount = updatedAllocations.reduce((acc, l) => acc + l.totalAmount, 0);
    }

    this.props.version += 1;
    this.props.status = 'REVISED';
    this.props.revisionHistory.push({
      version: this.props.version,
      revisedBy,
      reason,
      previousTotalAmount: previousTotal,
      newTotalAmount: this.props.totalAwardedAmount,
      timestamp: new Date().toISOString(),
    });

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public cancelAward(reason: string): Result<void> {
    this.props.status = 'CANCELLED';
    this.props.cancellationReason = reason;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }
}
