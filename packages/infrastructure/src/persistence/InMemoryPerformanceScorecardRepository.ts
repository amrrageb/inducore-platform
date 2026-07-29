import { PerformanceScorecardAggregate } from '@inducore/core-domain';
import { IPerformanceScorecardRepository } from '@inducore/application';

export class InMemoryPerformanceScorecardRepository implements IPerformanceScorecardRepository {
  private scorecards: Map<string, PerformanceScorecardAggregate> = new Map();

  constructor() {
    this.seedData();
  }

  public async findAll(): Promise<PerformanceScorecardAggregate[]> {
    return Array.from(this.scorecards.values());
  }

  public async findById(id: string): Promise<PerformanceScorecardAggregate | null> {
    return this.scorecards.get(id) || null;
  }

  public async findBySupplierId(
    supplierId: string
  ): Promise<PerformanceScorecardAggregate | null> {
    for (const scorecard of this.scorecards.values()) {
      if (scorecard.props.supplierId === supplierId) {
        return scorecard;
      }
    }
    return null;
  }

  public async save(scorecard: PerformanceScorecardAggregate): Promise<void> {
    this.scorecards.set(scorecard.id.toString(), scorecard);
  }

  public async delete(id: string): Promise<void> {
    this.scorecards.delete(id);
  }

  private seedData(): void {
    // 1. Titanium Global Corp (Preferred Supplier, Low Risk, Top Score)
    const seed1 = PerformanceScorecardAggregate.create(
      {
        supplierId: 'sup-101',
        supplierName: 'Titanium Global Corp',
        supplierCode: 'SUP-TITANIUM',
        qualityScore: 98.5,
        deliveryScore: 96.0,
        costScore: 92.5,
        responsivenessScore: 95.0,
        riskLevel: 'LOW',
        tier: 'PREFERRED',
        metrics: {
          defectPpm: 85,
          onTimeDeliveryPct: 98.2,
          costVariancePct: -2.4,
          avgResponseHours: 2.5,
          auditCompliancePct: 99.1,
        },
        blacklist: { isBlacklisted: false },
        preferredStatus: {
          isPreferred: true,
          preferredSince: '2024-01-15',
          preferredCategory: 'Aerospace Metals & Titanium Alloys',
          approvedBy: 'Procurement Steering Board',
        },
        historicalTrends: [
          {
            id: 'trend-101-1',
            period: 'Q1 2025',
            qualityScore: 96.0,
            deliveryScore: 94.0,
            costScore: 90.0,
            responsivenessScore: 92.0,
            overallScore: 93.6,
            recordedAt: '2025-03-31T23:59:59Z',
            notes: 'Initial aerospace titanium alloy qualification passed',
          },
          {
            id: 'trend-101-2',
            period: 'Q2 2025',
            qualityScore: 97.2,
            deliveryScore: 95.5,
            costScore: 91.0,
            responsivenessScore: 93.5,
            overallScore: 94.9,
            recordedAt: '2025-06-30T23:59:59Z',
            notes: 'Expanded automated ultrasonic testing throughput',
          },
          {
            id: 'trend-101-3',
            period: 'Q3 2025',
            qualityScore: 98.0,
            deliveryScore: 95.8,
            costScore: 92.0,
            responsivenessScore: 94.0,
            overallScore: 95.6,
            recordedAt: '2025-09-30T23:59:59Z',
          },
          {
            id: 'trend-101-4',
            period: 'Q4 2025',
            qualityScore: 98.2,
            deliveryScore: 96.0,
            costScore: 92.0,
            responsivenessScore: 94.8,
            overallScore: 95.8,
            recordedAt: '2025-12-31T23:59:59Z',
          },
          {
            id: 'trend-101-5',
            period: 'Q1 2026',
            qualityScore: 98.5,
            deliveryScore: 96.0,
            costScore: 92.5,
            responsivenessScore: 95.0,
            overallScore: 96.0,
            recordedAt: '2026-03-31T23:59:59Z',
            notes: 'Zero defect shipments recorded across all European plant deliveries',
          },
        ],
        evaluatedBy: 'VP of Global Quality',
      },
      'sc-101'
    ).getValue();

    // 2. Apex Fasteners Ltd (Standard Tier, Medium Risk)
    const seed2 = PerformanceScorecardAggregate.create(
      {
        supplierId: 'sup-102',
        supplierName: 'Apex Fasteners Ltd',
        supplierCode: 'SUP-APEX',
        qualityScore: 88.0,
        deliveryScore: 84.5,
        costScore: 94.0,
        responsivenessScore: 86.0,
        riskLevel: 'MEDIUM',
        tier: 'STANDARD',
        metrics: {
          defectPpm: 340,
          onTimeDeliveryPct: 88.5,
          costVariancePct: -4.1,
          avgResponseHours: 6.0,
          auditCompliancePct: 91.5,
        },
        blacklist: { isBlacklisted: false },
        preferredStatus: { isPreferred: false },
        historicalTrends: [
          {
            id: 'trend-102-1',
            period: 'Q4 2025',
            qualityScore: 86.0,
            deliveryScore: 82.0,
            costScore: 93.0,
            responsivenessScore: 84.0,
            overallScore: 85.5,
            recordedAt: '2025-12-31T23:59:59Z',
          },
          {
            id: 'trend-102-2',
            period: 'Q1 2026',
            qualityScore: 88.0,
            deliveryScore: 84.5,
            costScore: 94.0,
            responsivenessScore: 86.0,
            overallScore: 87.9,
            recordedAt: '2026-03-31T23:59:59Z',
            notes: 'Slight delivery lag due to German logistics strikes; quality remains solid',
          },
        ],
        evaluatedBy: 'Senior Sourcing Manager',
      },
      'sc-102'
    ).getValue();

    // 3. Vortex Fluid Systems (Under Review, High Risk)
    const seed3 = PerformanceScorecardAggregate.create(
      {
        supplierId: 'sup-103',
        supplierName: 'Vortex Fluid Systems',
        supplierCode: 'SUP-VORTEX',
        qualityScore: 72.0,
        deliveryScore: 68.0,
        costScore: 85.0,
        responsivenessScore: 70.0,
        riskLevel: 'HIGH',
        tier: 'UNDER_REVIEW',
        metrics: {
          defectPpm: 890,
          onTimeDeliveryPct: 71.0,
          costVariancePct: 1.2,
          avgResponseHours: 18.5,
          auditCompliancePct: 76.0,
        },
        blacklist: { isBlacklisted: false },
        preferredStatus: { isPreferred: false },
        historicalTrends: [
          {
            id: 'trend-103-1',
            period: 'Q3 2025',
            qualityScore: 85.0,
            deliveryScore: 82.0,
            costScore: 86.0,
            responsivenessScore: 80.0,
            overallScore: 83.5,
            recordedAt: '2025-09-30T23:59:59Z',
          },
          {
            id: 'trend-103-2',
            period: 'Q4 2025',
            qualityScore: 78.0,
            deliveryScore: 74.0,
            costScore: 85.0,
            responsivenessScore: 75.0,
            overallScore: 77.8,
            recordedAt: '2025-12-31T23:59:59Z',
          },
          {
            id: 'trend-103-3',
            period: 'Q1 2026',
            qualityScore: 72.0,
            deliveryScore: 68.0,
            costScore: 85.0,
            responsivenessScore: 70.0,
            overallScore: 73.1,
            recordedAt: '2026-03-31T23:59:59Z',
            notes: 'Hydraulic seal leakage rate elevated; corrective action request (CAPA) issued',
          },
        ],
        evaluatedBy: 'Audit Lead',
      },
      'sc-103'
    ).getValue();

    // 4. Subpar Components Ltd (Blacklisted, Critical Risk)
    const seed4 = PerformanceScorecardAggregate.create(
      {
        supplierId: 'sup-104',
        supplierName: 'Subpar Components Ltd',
        supplierCode: 'SUP-SUBPAR',
        qualityScore: 42.0,
        deliveryScore: 50.0,
        costScore: 65.0,
        responsivenessScore: 35.0,
        riskLevel: 'CRITICAL',
        tier: 'BLACKLISTED',
        metrics: {
          defectPpm: 4800,
          onTimeDeliveryPct: 48.0,
          costVariancePct: 12.4,
          avgResponseHours: 72.0,
          auditCompliancePct: 45.0,
        },
        blacklist: {
          isBlacklisted: true,
          reason: 'Non-conforming raw material certification and failure to pass ISO compliance re-audit',
          blacklistedAt: '2026-02-10T11:00:00Z',
          blacklistedBy: 'Chief Risk & Compliance Officer',
        },
        preferredStatus: { isPreferred: false },
        historicalTrends: [
          {
            id: 'trend-104-1',
            period: 'Q4 2025',
            qualityScore: 55.0,
            deliveryScore: 60.0,
            costScore: 65.0,
            responsivenessScore: 45.0,
            overallScore: 56.8,
            recordedAt: '2025-12-31T23:59:59Z',
          },
          {
            id: 'trend-104-2',
            period: 'Q1 2026',
            qualityScore: 42.0,
            deliveryScore: 50.0,
            costScore: 65.0,
            responsivenessScore: 35.0,
            overallScore: 48.0,
            recordedAt: '2026-02-10T11:00:00Z',
            notes: 'Formal blacklisting executed following critical audit rejection',
          },
        ],
        evaluatedBy: 'Chief Compliance Officer',
      },
      'sc-104'
    ).getValue();

    this.scorecards.set(seed1.id.toString(), seed1);
    this.scorecards.set(seed2.id.toString(), seed2);
    this.scorecards.set(seed3.id.toString(), seed3);
    this.scorecards.set(seed4.id.toString(), seed4);
  }
}
