import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type ContractType = 'FRAMEWORK_AGREEMENT' | 'SUPPLY_CONTRACT' | 'MASTER_SERVICES_AGREEMENT' | 'NDA';

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'UNDER_RENEWAL'
  | 'RENEWED'
  | 'TERMINATED';

export interface ContractAttachment {
  id: string;
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  uploadedBy: string;
  fileType: string;
}

export interface DigitalSignature {
  id: string;
  signerName: string;
  signerEmail: string;
  role: 'BUYER' | 'SUPPLIER' | 'LEGAL_WITNESS';
  signedAt: string;
  ipAddress: string;
  status: 'PENDING' | 'SIGNED' | 'DECLINED';
  verificationHash: string;
}

export interface ContractKPIs {
  slaAdherenceScorePct: number; // e.g. 98.5%
  qualityPassRatePct: number; // e.g. 99.2%
  onTimeDeliveryRatePct: number; // e.g. 96.0%
  spendAgainstCapAmount: number; // Current spend against contract cap
  contractValueCap: number; // Total max cap value
}

export interface ContractVersionLog {
  version: number;
  modifiedBy: string;
  changeSummary: string;
  effectiveDate: string;
  timestamp: string;
}

export interface ContractProps {
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

export class ContractAggregate extends AggregateRoot<ContractProps> {
  private constructor(props: ContractProps, id?: string) {
    super(props, id);
  }

  public static create(props: ContractProps, id?: string): Result<ContractAggregate> {
    if (!props.contractNumber) {
      return Result.fail<ContractAggregate>('Contract number is required');
    }
    if (!props.title) {
      return Result.fail<ContractAggregate>('Contract title is required');
    }
    if (!props.supplierId || !props.supplierName) {
      return Result.fail<ContractAggregate>('Supplier details are required');
    }
    if (!props.startDate || !props.endDate) {
      return Result.fail<ContractAggregate>('Start date and end date are required');
    }

    return Result.ok<ContractAggregate>(new ContractAggregate(props, id));
  }

  public addAttachment(attachment: Omit<ContractAttachment, 'id' | 'uploadedAt'>): Result<void> {
    const newAtt: ContractAttachment = {
      ...attachment,
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toISOString(),
    };
    this.props.attachments.push(newAtt);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public requestSignature(signerName: string, signerEmail: string, role: 'BUYER' | 'SUPPLIER' | 'LEGAL_WITNESS'): Result<void> {
    const sig: DigitalSignature = {
      id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      signerName,
      signerEmail,
      role,
      signedAt: '',
      ipAddress: '',
      status: 'PENDING',
      verificationHash: '',
    };
    this.props.signatures.push(sig);
    this.props.status = 'PENDING_SIGNATURE';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public signContract(signatureId: string, signerName: string, ipAddress: string): Result<void> {
    const sig = this.props.signatures.find(s => s.id === signatureId);
    if (!sig) {
      return Result.fail<void>('Signature request not found');
    }
    sig.status = 'SIGNED';
    sig.signerName = signerName;
    sig.signedAt = new Date().toISOString();
    sig.ipAddress = ipAddress;
    sig.verificationHash = `SHA256-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;

    // If all required signatures are signed, set contract to ACTIVE
    const allSigned = this.props.signatures.every(s => s.status === 'SIGNED');
    if (allSigned) {
      this.props.status = 'ACTIVE';
    }

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public checkExpiryStatus(): void {
    if (this.props.status === 'EXPIRED' || this.props.status === 'TERMINATED') return;

    const now = new Date();
    const end = new Date(this.props.endDate);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 0) {
      this.props.status = 'EXPIRED';
    } else if (diffDays <= this.props.noticePeriodDays) {
      this.props.status = 'EXPIRING_SOON';
    }
  }

  public initiateRenewal(notes: string): Result<void> {
    if (this.props.status === 'TERMINATED') {
      return Result.fail<void>('Cannot renew a terminated contract');
    }
    this.props.status = 'UNDER_RENEWAL';
    this.props.renewalNotes = notes;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public executeRenewal(newEndDate: string, revisedValueCap: number, changeSummary: string, modifiedBy: string): Result<void> {
    this.props.version += 1;
    this.props.endDate = newEndDate;
    this.props.totalValueCap = revisedValueCap;
    this.props.kpis.contractValueCap = revisedValueCap;
    this.props.status = 'ACTIVE';

    this.props.versionHistory.push({
      version: this.props.version,
      modifiedBy,
      changeSummary,
      effectiveDate: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    });

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public updateKPIs(updatedKPIs: Partial<ContractKPIs>): void {
    this.props.kpis = {
      ...this.props.kpis,
      ...updatedKPIs,
    };
    this.props.updatedAt = new Date().toISOString();
  }
}
