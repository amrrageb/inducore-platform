import { ContractAggregate } from '@inducore/core-domain';
import { IContractRepository } from '@inducore/application';

export class InMemoryContractRepository implements IContractRepository {
  private contracts: Map<string, ContractAggregate> = new Map();

  constructor() {
    this.seedData();
  }

  public async findAll(): Promise<ContractAggregate[]> {
    return Array.from(this.contracts.values());
  }

  public async findById(id: string): Promise<ContractAggregate | null> {
    const contract = this.contracts.get(id);
    return contract || null;
  }

  public async findByNumber(contractNumber: string): Promise<ContractAggregate | null> {
    for (const contract of this.contracts.values()) {
      if (contract.props.contractNumber === contractNumber) {
        return contract;
      }
    }
    return null;
  }

  public async save(contract: ContractAggregate): Promise<void> {
    this.contracts.set(contract.id.toString(), contract);
  }

  public async delete(id: string): Promise<void> {
    this.contracts.delete(id);
  }

  private seedData(): void {
    const seed1 = ContractAggregate.create(
      {
        contractNumber: 'FA-2026-8801',
        title: 'Global Aerospace Titanium Framework Agreement',
        contractType: 'FRAMEWORK_AGREEMENT',
        supplierId: 'sup-101',
        supplierName: 'Titanium Global Corp',
        awardId: 'AWD-2026-001',
        status: 'ACTIVE',
        version: 2,
        startDate: '2025-01-01',
        endDate: '2026-08-30', // Expiring soon!
        autoRenew: true,
        noticePeriodDays: 60,
        currency: 'USD',
        totalValueCap: 8500000,
        currentSpend: 5420000,
        governingLaw: 'Delaware, USA',
        attachments: [
          {
            id: 'att-01',
            fileName: 'Titanium_Framework_Master_v2.pdf',
            fileSizeKb: 2450,
            uploadedAt: '2025-01-01T09:00:00Z',
            uploadedBy: 'Legal Compliance Team',
            fileType: 'application/pdf',
          },
          {
            id: 'att-02',
            fileName: 'Quality_SLA_Appendix_A.pdf',
            fileSizeKb: 1120,
            uploadedAt: '2025-01-01T09:05:00Z',
            uploadedBy: 'Quality Operations',
            fileType: 'application/pdf',
          },
        ],
        signatures: [
          {
            id: 'sig-01',
            signerName: 'Sarah Jenkins (CPO)',
            signerEmail: 'sarah.jenkins@inducore.com',
            role: 'BUYER',
            signedAt: '2025-01-02T10:15:00Z',
            ipAddress: '192.168.1.100',
            status: 'SIGNED',
            verificationHash: 'SHA256-8a9c0f-20250102',
          },
          {
            id: 'sig-02',
            signerName: 'Marcus Vance (CEO)',
            signerEmail: 'mvance@titaniumglobal.com',
            role: 'SUPPLIER',
            signedAt: '2025-01-02T14:30:00Z',
            ipAddress: '203.0.113.45',
            status: 'SIGNED',
            verificationHash: 'SHA256-3f11bc-20250102',
          },
        ],
        kpis: {
          slaAdherenceScorePct: 98.8,
          qualityPassRatePct: 99.4,
          onTimeDeliveryRatePct: 97.2,
          spendAgainstCapAmount: 5420000,
          contractValueCap: 8500000,
        },
        versionHistory: [
          {
            version: 1,
            modifiedBy: 'Legal Dept',
            changeSummary: 'Initial Master Agreement Execution',
            effectiveDate: '2025-01-01',
            timestamp: '2025-01-01T09:00:00Z',
          },
          {
            version: 2,
            modifiedBy: 'Chief Procurement Officer',
            changeSummary: 'Expanded annual volume cap by $2.5M for European plant lines',
            effectiveDate: '2025-08-15',
            timestamp: '2025-08-15T11:20:00Z',
          },
        ],
        createdAt: '2025-01-01T09:00:00Z',
        updatedAt: '2025-08-15T11:20:00Z',
      },
      'ctr-101'
    ).getValue();

    const seed2 = ContractAggregate.create(
      {
        contractNumber: 'SC-2026-4402',
        title: 'Precision Aerospace Fasteners Supply Contract',
        contractType: 'SUPPLY_CONTRACT',
        supplierId: 'sup-102',
        supplierName: 'Apex Fasteners Ltd',
        poId: 'PO-2026-9002',
        status: 'UNDER_RENEWAL',
        version: 1,
        startDate: '2025-06-01',
        endDate: '2026-06-01',
        autoRenew: false,
        noticePeriodDays: 30,
        currency: 'USD',
        totalValueCap: 1500000,
        currentSpend: 1380000,
        governingLaw: 'Frankfurt, Germany',
        attachments: [
          {
            id: 'att-10',
            fileName: 'Apex_Fasteners_Supply_Terms.pdf',
            fileSizeKb: 1800,
            uploadedAt: '2025-05-28T14:00:00Z',
            uploadedBy: 'Sourcing Lead',
            fileType: 'application/pdf',
          },
        ],
        signatures: [
          {
            id: 'sig-10',
            signerName: 'David Miller',
            signerEmail: 'dmiller@inducore.com',
            role: 'BUYER',
            signedAt: '2025-05-30T16:00:00Z',
            ipAddress: '192.168.1.102',
            status: 'SIGNED',
            verificationHash: 'SHA256-42d1ee-20250530',
          },
        ],
        kpis: {
          slaAdherenceScorePct: 94.2,
          qualityPassRatePct: 97.8,
          onTimeDeliveryRatePct: 93.5,
          spendAgainstCapAmount: 1380000,
          contractValueCap: 1500000,
        },
        versionHistory: [
          {
            version: 1,
            modifiedBy: 'Sourcing Manager',
            changeSummary: 'Initial 12-month supply contract',
            effectiveDate: '2025-06-01',
            timestamp: '2025-05-28T14:00:00Z',
          },
        ],
        renewalNotes: 'Supplier requested 3.5% price adjustment due to raw steel inflation; negotiating extension through 2027.',
        createdAt: '2025-05-28T14:00:00Z',
        updatedAt: '2026-05-01T10:00:00Z',
      },
      'ctr-102'
    ).getValue();

    const seed3 = ContractAggregate.create(
      {
        contractNumber: 'MSA-2026-9011',
        title: 'Hydraulic System Calibration & Master Maintenance Agreement',
        contractType: 'MASTER_SERVICES_AGREEMENT',
        supplierId: 'sup-103',
        supplierName: 'Vortex Fluid Systems',
        status: 'PENDING_SIGNATURE',
        version: 1,
        startDate: '2026-08-01',
        endDate: '2028-07-31',
        autoRenew: true,
        noticePeriodDays: 90,
        currency: 'USD',
        totalValueCap: 3200000,
        currentSpend: 0,
        governingLaw: 'New York, USA',
        attachments: [
          {
            id: 'att-20',
            fileName: 'Vortex_MSA_Draft_2026.docx',
            fileSizeKb: 890,
            uploadedAt: '2026-07-20T11:00:00Z',
            uploadedBy: 'Legal Dept',
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
        ],
        signatures: [
          {
            id: 'sig-20',
            signerName: 'Sarah Jenkins',
            signerEmail: 'sarah.jenkins@inducore.com',
            role: 'BUYER',
            signedAt: '2026-07-25T09:30:00Z',
            ipAddress: '192.168.1.100',
            status: 'SIGNED',
            verificationHash: 'SHA256-7890aa-20260725',
          },
          {
            id: 'sig-21',
            signerName: 'Elena Rostova',
            signerEmail: 'erostova@vortexfluid.com',
            role: 'SUPPLIER',
            signedAt: '',
            ipAddress: '',
            status: 'PENDING',
            verificationHash: '',
          },
        ],
        kpis: {
          slaAdherenceScorePct: 100,
          qualityPassRatePct: 100,
          onTimeDeliveryRatePct: 100,
          spendAgainstCapAmount: 0,
          contractValueCap: 3200000,
        },
        versionHistory: [
          {
            version: 1,
            modifiedBy: 'Legal Dept',
            changeSummary: 'Created draft for electronic execution',
            effectiveDate: '2026-08-01',
            timestamp: '2026-07-20T11:00:00Z',
          },
        ],
        createdAt: '2026-07-20T11:00:00Z',
        updatedAt: '2026-07-25T09:30:00Z',
      },
      'ctr-103'
    ).getValue();

    this.contracts.set(seed1.id.toString(), seed1);
    this.contracts.set(seed2.id.toString(), seed2);
    this.contracts.set(seed3.id.toString(), seed3);
  }
}
