import { EvaluationAggregate } from '@inducore/core-domain';
import { IEvaluationRepository } from '@inducore/application';

export class InMemoryEvaluationRepository implements IEvaluationRepository {
  private evaluations: Map<string, EvaluationAggregate> = new Map();

  constructor() {
    this.seedInitialEvaluations();
  }

  public async findById(id: string): Promise<EvaluationAggregate | null> {
    const evalAgg = this.evaluations.get(id);
    return evalAgg || null;
  }

  public async findByRfqId(rfqId: string): Promise<EvaluationAggregate | null> {
    for (const evalAgg of this.evaluations.values()) {
      if (evalAgg.props.rfqId === rfqId) {
        return evalAgg;
      }
    }
    return null;
  }

  public async findAll(): Promise<EvaluationAggregate[]> {
    return Array.from(this.evaluations.values());
  }

  public async save(evaluation: EvaluationAggregate): Promise<void> {
    this.evaluations.set(evaluation.id, evaluation);
  }

  private seedInitialEvaluations() {
    const now = new Date().toISOString();

    const eval1Res = EvaluationAggregate.create(
      {
        rfqId: 'rfq-001',
        rfqTitle: 'High Pressure Hydraulic Valve Cartridges - Line C',
        status: 'IN_EVALUATION',
        technicalWeight: 50,
        commercialWeight: 50,
        committeeMembers: ['Dr. Aris Thorne (Tech Expert)', 'Marcus Vance (Commercial Lead)', 'Sarah Jenkins (Procurement Dir)'],
        quotationEvaluations: [
          {
            quotationId: 'quote-001',
            supplierId: 'sup-bosch-01',
            supplierName: 'Bosch Rexroth Hydraulics GmbH',
            rawTotalPrice: 5280,
            currency: 'USD',
            normalizedPriceScore: 91,
            technicalScoreConsensus: 92,
            commercialScoreConsensus: 90,
            weightedTotalScore: 91.5,
            rank: 1,
            evaluatorScores: [
              {
                evaluatorId: 'eval-001',
                evaluatorName: 'Dr. Aris Thorne',
                evaluatorRole: 'TECHNICAL_EXPERT',
                technicalScore: 94,
                commercialScore: 88,
                comments: 'Exceptional Viton seals and 350 Bar fatigue resistance testing data.',
                evaluatedAt: now,
              },
              {
                evaluatorId: 'eval-002',
                evaluatorName: 'Marcus Vance',
                evaluatorRole: 'COMMERCIAL_LEAD',
                technicalScore: 90,
                commercialScore: 92,
                comments: 'Competitive DDP pricing with Net 30 payment schedule.',
                evaluatedAt: now,
              },
            ],
            criteriaBreakdown: [
              { key: 'tech_spec', name: 'Technical Spec Compliance', weightPercentage: 30, scoreOutOf100: 95 },
              { key: 'quality_iso', name: 'ISO 9001 & IATF Certification', weightPercentage: 20, scoreOutOf100: 90 },
              { key: 'price_val', name: 'Commercial Price & TCO', weightPercentage: 40, scoreOutOf100: 91 },
              { key: 'lead_time', name: 'Delivery Lead Time (21 Days)', weightPercentage: 10, scoreOutOf100: 88 },
            ],
            clarifications: [
              {
                id: 'clar-101',
                requestedBy: 'Dr. Aris Thorne',
                question: 'Can you confirm material compliance for sub-zero temperature operation down to -30°C?',
                supplierResponse: 'Yes, full cryogenic Viton seal test report attached in technical proposal.',
                requestedAt: now,
                respondedAt: now,
              },
            ],
            isRecommendedWinner: true,
          },
          {
            quotationId: 'quote-002',
            supplierId: 'sup-parker-02',
            supplierName: 'Parker Hannifin Industrial Automation',
            rawTotalPrice: 4800,
            currency: 'USD',
            normalizedPriceScore: 100,
            technicalScoreConsensus: 82,
            commercialScoreConsensus: 95,
            weightedTotalScore: 91.0,
            rank: 2,
            evaluatorScores: [
              {
                evaluatorId: 'eval-001',
                evaluatorName: 'Dr. Aris Thorne',
                evaluatorRole: 'TECHNICAL_EXPERT',
                technicalScore: 80,
                commercialScore: 94,
                comments: 'Lowest price proposal ($4,800), lead time slightly longer (28 days).',
                evaluatedAt: now,
              },
            ],
            criteriaBreakdown: [
              { key: 'tech_spec', name: 'Technical Spec Compliance', weightPercentage: 30, scoreOutOf100: 82 },
              { key: 'quality_iso', name: 'ISO 9001 & IATF Certification', weightPercentage: 20, scoreOutOf100: 85 },
              { key: 'price_val', name: 'Commercial Price & TCO', weightPercentage: 40, scoreOutOf100: 100 },
              { key: 'lead_time', name: 'Delivery Lead Time (28 Days)', weightPercentage: 10, scoreOutOf100: 75 },
            ],
            clarifications: [],
            isRecommendedWinner: false,
          },
        ],
        decisionHistory: [
          {
            id: 'dec-001',
            action: 'SCORE_SUBMITTED',
            actor: 'Dr. Aris Thorne',
            details: 'Submitted technical score 94 for Bosch Rexroth',
            timestamp: now,
          },
          {
            id: 'dec-002',
            action: 'CONSENSUS_UPDATED',
            actor: 'Evaluation Committee',
            details: 'Calculated consensus ranking: Bosch Rexroth #1 (91.5 pts), Parker Hannifin #2 (91.0 pts)',
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      'eval-matrix-001'
    );

    if (eval1Res.isSuccess) {
      this.save(eval1Res.getValue());
    }
  }
}
