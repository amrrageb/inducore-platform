import { EvaluationAggregate, Result } from '@inducore/core-domain';
import { IEvaluationRepository } from '../../ports/IEvaluationRepository.js';
import {
  CreateEvaluationInput,
  SubmitScoreInput,
  ClarificationRequestInput,
  ClarificationResponseInput,
  ApproveEvaluationInput,
} from '../../dtos/EvaluationDTOs.js';

export class EvaluationUseCases {
  constructor(private readonly evaluationRepo: IEvaluationRepository) {}

  public async createEvaluation(input: CreateEvaluationInput): Promise<Result<EvaluationAggregate>> {
    const existing = await this.evaluationRepo.findByRfqId(input.rfqId);
    if (existing) {
      return Result.ok(existing);
    }

    const now = new Date().toISOString();
    const evalResult = EvaluationAggregate.create({
      rfqId: input.rfqId,
      rfqTitle: input.rfqTitle,
      status: 'PENDING',
      technicalWeight: input.technicalWeight,
      commercialWeight: input.commercialWeight,
      committeeMembers: input.committeeMembers.length > 0 ? input.committeeMembers : ['Lead Technical Evaluator', 'Commercial Procurement Lead', 'VP Sourcing'],
      quotationEvaluations: input.quotations.map(q => ({
        quotationId: q.quotationId,
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        rawTotalPrice: q.rawTotalPrice,
        currency: q.currency,
        normalizedPriceScore: 0,
        technicalScoreConsensus: 0,
        commercialScoreConsensus: 0,
        weightedTotalScore: 0,
        rank: 0,
        evaluatorScores: [],
        criteriaBreakdown: [
          { key: 'tech_spec', name: 'Technical Specification Compliance', weightPercentage: 30, scoreOutOf100: 85 },
          { key: 'quality_iso', name: 'Quality System & ISO Certification', weightPercentage: 20, scoreOutOf100: 90 },
          { key: 'price_val', name: 'Commercial Price & TCO', weightPercentage: 40, scoreOutOf100: 80 },
          { key: 'lead_time', name: 'Delivery Lead Time & Logistics', weightPercentage: 10, scoreOutOf100: 85 },
        ],
        clarifications: [],
        isRecommendedWinner: false,
      })),
      decisionHistory: [
        {
          id: `dec-${Date.now()}-init`,
          action: 'SCORE_SUBMITTED',
          actor: 'System Sourcing Engine',
          details: `Evaluation Matrix initialized for RFQ ${input.rfqId} with ${input.quotations.length} quotations. Technical Weight: ${input.technicalWeight}%, Commercial Weight: ${input.commercialWeight}%`,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    if (evalResult.isFailure) {
      return Result.fail(evalResult.errorValue());
    }

    const evaluation = evalResult.getValue();
    await this.evaluationRepo.save(evaluation);
    return Result.ok(evaluation);
  }

  public async submitEvaluatorScore(input: SubmitScoreInput): Promise<Result<EvaluationAggregate>> {
    const evalAgg = await this.evaluationRepo.findById(input.evaluationId);
    if (!evalAgg) {
      return Result.fail(`Evaluation matrix ${input.evaluationId} not found`);
    }

    const submitRes = evalAgg.submitEvaluatorScore(input.quotationId, {
      ...input.score,
      evaluatedAt: new Date().toISOString(),
    });

    if (submitRes.isFailure) {
      return Result.fail(submitRes.errorValue());
    }

    await this.evaluationRepo.save(evalAgg);
    return Result.ok(evalAgg);
  }

  public async requestClarification(input: ClarificationRequestInput): Promise<Result<EvaluationAggregate>> {
    const evalAgg = await this.evaluationRepo.findById(input.evaluationId);
    if (!evalAgg) return Result.fail(`Evaluation ${input.evaluationId} not found`);

    const res = evalAgg.sendClarificationRequest(input.quotationId, input.requestedBy, input.question);
    if (res.isFailure) return Result.fail(res.errorValue());

    await this.evaluationRepo.save(evalAgg);
    return Result.ok(evalAgg);
  }

  public async respondClarification(input: ClarificationResponseInput): Promise<Result<EvaluationAggregate>> {
    const evalAgg = await this.evaluationRepo.findById(input.evaluationId);
    if (!evalAgg) return Result.fail(`Evaluation ${input.evaluationId} not found`);

    const res = evalAgg.recordSupplierResponse(input.quotationId, input.clarificationId, input.supplierResponse);
    if (res.isFailure) return Result.fail(res.errorValue());

    await this.evaluationRepo.save(evalAgg);
    return Result.ok(evalAgg);
  }

  public async approveEvaluation(input: ApproveEvaluationInput): Promise<Result<EvaluationAggregate>> {
    const evalAgg = await this.evaluationRepo.findById(input.evaluationId);
    if (!evalAgg) return Result.fail(`Evaluation ${input.evaluationId} not found`);

    const res = evalAgg.approveEvaluation(input.approvedBy, input.approvalNotes);
    if (res.isFailure) return Result.fail(res.errorValue());

    await this.evaluationRepo.save(evalAgg);
    return Result.ok(evalAgg);
  }

  public async getEvaluation(id: string): Promise<EvaluationAggregate | null> {
    return this.evaluationRepo.findById(id);
  }

  public async listEvaluations(): Promise<EvaluationAggregate[]> {
    return this.evaluationRepo.findAll();
  }
}
