import { ApiResponse } from './Envelope.js';

export interface EvaluationItemContract {
  id: string;
  rfqId: string;
  rfqTitle: string;
  status: string;
  technicalWeight: number;
  commercialWeight: number;
  committeeMembers: string[];
  quotationEvaluations: {
    quotationId: string;
    supplierId: string;
    supplierName: string;
    rawTotalPrice: number;
    currency: string;
    normalizedPriceScore: number;
    technicalScoreConsensus: number;
    commercialScoreConsensus: number;
    weightedTotalScore: number;
    rank: number;
    evaluatorScores: {
      evaluatorId: string;
      evaluatorName: string;
      evaluatorRole: string;
      technicalScore: number;
      commercialScore: number;
      comments: string;
      evaluatedAt: string;
    }[];
    criteriaBreakdown: {
      key: string;
      name: string;
      weightPercentage: number;
      scoreOutOf100: number;
    }[];
    clarifications: {
      id: string;
      requestedBy: string;
      question: string;
      supplierResponse?: string;
      requestedAt: string;
      respondedAt?: string;
    }[];
    isRecommendedWinner: boolean;
  }[];
  approvedBy?: string;
  approvalNotes?: string;
  decisionHistory: {
    id: string;
    action: string;
    actor: string;
    details: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type GetEvaluationResponse = ApiResponse<EvaluationItemContract>;
export type ListEvaluationsResponse = ApiResponse<EvaluationItemContract[]>;
