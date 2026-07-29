import { AwardAggregate } from '@inducore/core-domain';
import { IAwardRepository } from '@inducore/application';

export class InMemoryAwardRepository implements IAwardRepository {
  private awards: Map<string, AwardAggregate> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const seed1 = AwardAggregate.create(
      {
        rfqId: 'RFQ-2026-001',
        rfqTitle: 'Heavy Machinery Hydraulic Actuators & Valves',
        awardType: 'MULTI_SUPPLIER',
        status: 'APPROVED',
        version: 1,
        primarySupplierId: 'sup-001',
        primarySupplierName: 'Bosch Rexroth AG',
        totalAwardedAmount: 184000,
        currency: 'EUR',
        lineAllocations: [
          {
            id: 'alloc-101',
            rfqLineItemId: 'item-101',
            itemName: 'Hydraulic Cylinder 500mm Stroke',
            requestedQuantity: 20,
            awardedQuantity: 12,
            unit: 'EA',
            unitPrice: 4200,
            totalAmount: 50400,
            supplierId: 'sup-001',
            supplierName: 'Bosch Rexroth AG',
          },
          {
            id: 'alloc-102',
            rfqLineItemId: 'item-101',
            itemName: 'Hydraulic Cylinder 500mm Stroke',
            requestedQuantity: 20,
            awardedQuantity: 8,
            unit: 'EA',
            unitPrice: 4400,
            totalAmount: 35200,
            supplierId: 'sup-002',
            supplierName: 'Parker Hannifin Corp',
          },
          {
            id: 'alloc-103',
            rfqLineItemId: 'item-102',
            itemName: 'Proportional Control Valve 24V',
            requestedQuantity: 50,
            awardedQuantity: 50,
            unit: 'EA',
            unitPrice: 1960,
            totalAmount: 98000,
            supplierId: 'sup-001',
            supplierName: 'Bosch Rexroth AG',
          },
        ],
        approvalWorkflow: [
          {
            id: 'appr-01',
            approverName: 'Elena Rostova',
            role: 'Senior Category Manager',
            status: 'APPROVED',
            notes: 'Multi-supplier split verified for risk mitigation.',
            timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
          {
            id: 'appr-02',
            approverName: 'Marcus Vance',
            role: 'VP Procurement & Supply Chain',
            status: 'APPROVED',
            notes: 'Commercial score matrix & dual sourcing strategy approved.',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ],
        awardLetterText:
          'Official Award Notice: InduCore Global Procurement hereby awards RFQ-2026-001 under a dual-sourcing framework. Bosch Rexroth AG is awarded 60% line volume and Parker Hannifin Corp is awarded 40% line volume under MSA-2026-091.',
        awardLetterSentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        supplierAcceptedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        contractDraft: {
          contractNumber: 'CNT-2026-BR-001',
          contractTitle: 'Master Equipment & Valve Supply Agreement',
          governingLaw: 'Frankfurt / German Commercial Code',
          startDate: '2026-09-01',
          endDate: '2027-09-01',
          paymentTerms: 'NET 45 Days with 2% Early Settlement Discount',
          preparedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        purchaseRequest: {
          prNumber: 'PR-2026-8819',
          costCenter: 'CC-HYD-4010',
          totalPrAmount: 184000,
          currency: 'EUR',
          generatedBy: 'Automated Sourcing Pipeline',
          createdAt: new Date().toISOString(),
        },
        revisionHistory: [],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      'award-2026-001'
    ).getValue();

    const seed2 = AwardAggregate.create(
      {
        rfqId: 'RFQ-2026-002',
        rfqTitle: 'High Temperature Seamless Alloy Pipes',
        awardType: 'FULL',
        status: 'RECOMMENDED',
        version: 1,
        primarySupplierId: 'sup-003',
        primarySupplierName: 'Tenaris S.A.',
        totalAwardedAmount: 245000,
        currency: 'USD',
        lineAllocations: [
          {
            id: 'alloc-201',
            rfqLineItemId: 'item-201',
            itemName: 'Seamless Alloy Steel Pipe 12 Inch Sch80',
            requestedQuantity: 500,
            awardedQuantity: 500,
            unit: 'MTR',
            unitPrice: 490,
            totalAmount: 245000,
            supplierId: 'sup-003',
            supplierName: 'Tenaris S.A.',
          },
        ],
        approvalWorkflow: [
          {
            id: 'appr-10',
            approverName: 'Sourcing Lead Bot',
            role: 'Evaluation Engine',
            status: 'CONDITIONALLY_APPROVED',
            notes: 'Tenaris ranked #1 with weighted score 94.2/100.',
            timestamp: new Date().toISOString(),
          },
        ],
        revisionHistory: [],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      'award-2026-002'
    ).getValue();

    this.awards.set(seed1.id, seed1);
    this.awards.set(seed2.id, seed2);
  }

  public async findAll(): Promise<AwardAggregate[]> {
    return Array.from(this.awards.values());
  }

  public async findById(id: string): Promise<AwardAggregate | null> {
    return this.awards.get(id) || null;
  }

  public async findByRfqId(rfqId: string): Promise<AwardAggregate[]> {
    return Array.from(this.awards.values()).filter(a => a.props.rfqId === rfqId);
  }

  public async save(award: AwardAggregate): Promise<void> {
    this.awards.set(award.id, award);
  }

  public async delete(id: string): Promise<void> {
    this.awards.delete(id);
  }
}
