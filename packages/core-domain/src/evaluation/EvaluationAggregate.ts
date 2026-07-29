import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type EvaluationStatus = 'PENDING' | 'IN_EVALUATION' | 'CONSENSUS_REACHED' | 'APPROVED' | 'REJECTED';

export interface EvaluatorScore {
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: 'TECHNICAL_EXPERT' | 'COMMERCIAL_LEAD' | 'PROCUREMENT_DIRECTOR';
  technicalScore: number; // 0 - 100
  commercialScore: number; // 0 - 100
  comments: string;
  evaluatedAt: string;
}

export interface CriteriaWeight {
  key: string;
  name: string;
  weightPercentage: number; // e.g. 40% technical, 40% price, 10% delivery, 10% compliance
  scoreOutOf100: number;
}

export interface EvaluationClarification {
  id: string;
  requestedBy: string;
  question: string;
  supplierResponse?: string;
  requestedAt: string;
  respondedAt?: string;
}

export interface DecisionLog {
  id: string;
  action: 'SCORE_SUBMITTED' | 'CONSENSUS_UPDATED' | 'CLARIFICATION_SENT' | 'APPROVED' | 'REJECTED';
  actor: string;
  details: string;
  timestamp: string;
}

export interface QuotationEvaluationItem {
  quotationId: string;
  supplierId: string;
  supplierName: string;
  rawTotalPrice: number;
  currency: string;
  normalizedPriceScore: number; // 0 - 100 (auto-calculated relative to lowest bid)
  technicalScoreConsensus: number; // 0 - 100
  commercialScoreConsensus: number; // 0 - 100
  weightedTotalScore: number; // 0 - 100
  rank: number;
  evaluatorScores: EvaluatorScore[];
  criteriaBreakdown: CriteriaWeight[];
  clarifications: EvaluationClarification[];
  isRecommendedWinner: boolean;
}

export interface EvaluationProps {
  rfqId: string;
  rfqTitle: string;
  status: EvaluationStatus;
  technicalWeight: number; // e.g. 50%
  commercialWeight: number; // e.g. 50%
  committeeMembers: string[];
  quotationEvaluations: QuotationEvaluationItem[];
  approvedBy?: string;
  approvalNotes?: string;
  decisionHistory: DecisionLog[];
  createdAt: string;
  updatedAt: string;
}

export class EvaluationAggregate extends AggregateRoot<EvaluationProps> {
  private constructor(props: EvaluationProps, id?: string) {
    super(props, id);
  }

  public static create(props: EvaluationProps, id?: string): Result<EvaluationAggregate> {
    if (!props.rfqId) {
      return Result.fail<EvaluationAggregate>('Evaluation must reference an RFQ ID');
    }
    if (props.technicalWeight + props.commercialWeight !== 100) {
      return Result.fail<EvaluationAggregate>('Technical and Commercial weights must sum to 100%');
    }

    const evalAggregate = new EvaluationAggregate(props, id);
    evalAggregate.recalculateRankings();
    return Result.ok<EvaluationAggregate>(evalAggregate);
  }

  public recalculateRankings(): void {
    const quotes = this.props.quotationEvaluations;
    if (quotes.length === 0) return;

    // Find lowest price for price normalization
    const validPrices = quotes.map(q => q.rawTotalPrice).filter(p => p > 0);
    const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 1;

    for (const q of quotes) {
      // Normalization: Lowest price gets 100, others get (lowestPrice / rawPrice) * 100
      q.normalizedPriceScore = q.rawTotalPrice > 0 ? Math.round((lowestPrice / q.rawTotalPrice) * 100) : 0;

      // Evaluator averages for technical & commercial consensus
      if (q.evaluatorScores.length > 0) {
        const sumTech = q.evaluatorScores.reduce((acc, e) => acc + e.technicalScore, 0);
        const sumComm = q.evaluatorScores.reduce((acc, e) => acc + e.commercialScore, 0);
        q.technicalScoreConsensus = Math.round(sumTech / q.evaluatorScores.length);
        q.commercialScoreConsensus = Math.round(sumComm / q.evaluatorScores.length);
      }

      // Weighted total score formula
      const techPart = (q.technicalScoreConsensus * this.props.technicalWeight) / 100;
      const commPart = (q.normalizedPriceScore * this.props.commercialWeight) / 100;
      q.weightedTotalScore = Math.round((techPart + commPart) * 10) / 10;
    }

    // Sort by weighted total score descending to calculate rank
    quotes.sort((a, b) => b.weightedTotalScore - a.weightedTotalScore);
    quotes.forEach((q, idx) => {
      q.rank = idx + 1;
      q.isRecommendedWinner = idx === 0;
    });
  }

  public submitEvaluatorScore(
    quotationId: string,
    score: EvaluatorScore
  ): Result<void> {
    const quoteEval = this.props.quotationEvaluations.find(q => q.quotationId === quotationId);
    if (!quoteEval) {
      return Result.fail<void>(`Quotation ${quotationId} not found in evaluation committee matrix`);
    }

    // Upsert evaluator score
    const existingIdx = quoteEval.evaluatorScores.findIndex(e => e.evaluatorId === score.evaluatorId);
    if (existingIdx >= 0) {
      quoteEval.evaluatorScores[existingIdx] = score;
    } else {
      quoteEval.evaluatorScores.push(score);
    }

    this.props.status = 'IN_EVALUATION';
    this.recalculateRankings();

    this.logDecision(
      'SCORE_SUBMITTED',
      score.evaluatorName,
      `Submitted Tech Score: ${score.technicalScore}, Comm Score: ${score.commercialScore} for ${quoteEval.supplierName}`
    );

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public sendClarificationRequest(
    quotationId: string,
    requestedBy: string,
    question: string
  ): Result<EvaluationClarification> {
    const quoteEval = this.props.quotationEvaluations.find(q => q.quotationId === quotationId);
    if (!quoteEval) {
      return Result.fail<EvaluationClarification>(`Quotation ${quotationId} not found`);
    }

    const clarification: EvaluationClarification = {
      id: `clar-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestedBy,
      question,
      requestedAt: new Date().toISOString(),
    };

    quoteEval.clarifications.push(clarification);
    this.logDecision('CLARIFICATION_SENT', requestedBy, `Asked clarification to ${quoteEval.supplierName}: "${question}"`);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<EvaluationClarification>(clarification);
  }

  public recordSupplierResponse(
    quotationId: string,
    clarificationId: string,
    supplierResponse: string
  ): Result<void> {
    const quoteEval = this.props.quotationEvaluations.find(q => q.quotationId === quotationId);
    if (!quoteEval) return Result.fail<void>(`Quotation ${quotationId} not found`);

    const clar = quoteEval.clarifications.find(c => c.id === clarificationId);
    if (!clar) return Result.fail<void>(`Clarification ${clarificationId} not found`);

    clar.supplierResponse = supplierResponse;
    clar.respondedAt = new Date().toISOString();

    this.logDecision(
      'CONSENSUS_UPDATED',
      quoteEval.supplierName,
      `Supplier responded to clarification request ${clarificationId}`
    );
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public approveEvaluation(approvedBy: string, approvalNotes: string): Result<void> {
    if (this.props.quotationEvaluations.length === 0) {
      return Result.fail<void>('Cannot approve an empty evaluation committee matrix');
    }

    this.props.status = 'APPROVED';
    this.props.approvedBy = approvedBy;
    this.props.approvalNotes = approvalNotes;

    const winner = this.props.quotationEvaluations[0];
    this.logDecision(
      'APPROVED',
      approvedBy,
      `Evaluation approved. Recommended winning supplier: ${winner.supplierName} (Rank #1, Score ${winner.weightedTotalScore}/100)`
    );

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  private logDecision(action: DecisionLog['action'], actor: string, details: string): void {
    this.props.decisionHistory.push({
      id: `dec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      actor,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
