import { describe, it, expect } from 'vitest';
import { EvaluationAggregate } from './EvaluationAggregate.js';

describe('EvaluationAggregate Domain Unit Tests', () => {
  it('should create an evaluation aggregate and normalize prices & calculate weighted scores', () => {
    const res = EvaluationAggregate.create({
      rfqId: 'rfq-test-01',
      rfqTitle: 'Test RFQ for Valve Assemblies',
      status: 'PENDING',
      technicalWeight: 60,
      commercialWeight: 40,
      committeeMembers: ['Member A', 'Member B'],
      quotationEvaluations: [
        {
          quotationId: 'q1',
          supplierId: 's1',
          supplierName: 'Supplier Alpha',
          rawTotalPrice: 1000,
          currency: 'USD',
          normalizedPriceScore: 0,
          technicalScoreConsensus: 90,
          commercialScoreConsensus: 0,
          weightedTotalScore: 0,
          rank: 0,
          evaluatorScores: [
            {
              evaluatorId: 'e1',
              evaluatorName: 'Evaluator 1',
              evaluatorRole: 'TECHNICAL_EXPERT',
              technicalScore: 90,
              commercialScore: 80,
              comments: 'Solid design',
              evaluatedAt: new Date().toISOString(),
            },
          ],
          criteriaBreakdown: [],
          clarifications: [],
          isRecommendedWinner: false,
        },
        {
          quotationId: 'q2',
          supplierId: 's2',
          supplierName: 'Supplier Beta',
          rawTotalPrice: 2000,
          currency: 'USD',
          normalizedPriceScore: 0,
          technicalScoreConsensus: 80,
          commercialScoreConsensus: 0,
          weightedTotalScore: 0,
          rank: 0,
          evaluatorScores: [],
          criteriaBreakdown: [],
          clarifications: [],
          isRecommendedWinner: false,
        },
      ],
      decisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(res.isSuccess).toBe(true);
    const agg = res.getValue();

    // Lowest price is 1000
    // q1 normalized price score: (1000/1000) * 100 = 100
    // q2 normalized price score: (1000/2000) * 100 = 50
    // q1 weighted score: 90 * 0.60 + 100 * 0.40 = 54 + 40 = 94.0
    // q2 weighted score: 80 * 0.60 + 50 * 0.40 = 48 + 20 = 68.0

    const quotes = agg.props.quotationEvaluations;
    expect(quotes[0].supplierName).toBe('Supplier Alpha');
    expect(quotes[0].rank).toBe(1);
    expect(quotes[0].normalizedPriceScore).toBe(100);
    expect(quotes[0].weightedTotalScore).toBe(94);
    expect(quotes[0].isRecommendedWinner).toBe(true);

    expect(quotes[1].supplierName).toBe('Supplier Beta');
    expect(quotes[1].rank).toBe(2);
    expect(quotes[1].normalizedPriceScore).toBe(50);
    expect(quotes[1].weightedTotalScore).toBe(68);
  });

  it('should record score submissions and recalculate rankings dynamically', () => {
    const res = EvaluationAggregate.create({
      rfqId: 'rfq-test-02',
      rfqTitle: 'Pipes Sourcing',
      status: 'PENDING',
      technicalWeight: 50,
      commercialWeight: 50,
      committeeMembers: ['Evaluator A'],
      quotationEvaluations: [
        {
          quotationId: 'q1',
          supplierId: 's1',
          supplierName: 'Supplier One',
          rawTotalPrice: 500,
          currency: 'USD',
          normalizedPriceScore: 100,
          technicalScoreConsensus: 0,
          commercialScoreConsensus: 0,
          weightedTotalScore: 0,
          rank: 1,
          evaluatorScores: [],
          criteriaBreakdown: [],
          clarifications: [],
          isRecommendedWinner: true,
        },
      ],
      decisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const agg = res.getValue();
    const scoreRes = agg.submitEvaluatorScore('q1', {
      evaluatorId: 'e1',
      evaluatorName: 'Evaluator A',
      evaluatorRole: 'TECHNICAL_EXPERT',
      technicalScore: 96,
      commercialScore: 92,
      comments: 'Great quality',
      evaluatedAt: new Date().toISOString(),
    });

    expect(scoreRes.isSuccess).toBe(true);
    expect(agg.props.quotationEvaluations[0].technicalScoreConsensus).toBe(96);
    expect(agg.props.quotationEvaluations[0].weightedTotalScore).toBe(98);
  });
});
