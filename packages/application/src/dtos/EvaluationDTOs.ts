import { z } from 'zod';

export const EvaluatorScoreSchema = z.object({
  evaluatorId: z.string().min(1),
  evaluatorName: z.string().min(1),
  evaluatorRole: z.enum(['TECHNICAL_EXPERT', 'COMMERCIAL_LEAD', 'PROCUREMENT_DIRECTOR']),
  technicalScore: z.number().min(0).max(100),
  commercialScore: z.number().min(0).max(100),
  comments: z.string().default(''),
});

export const SubmitScoreInputSchema = z.object({
  evaluationId: z.string().min(1),
  quotationId: z.string().min(1),
  score: EvaluatorScoreSchema,
});

export const CreateEvaluationInputSchema = z.object({
  rfqId: z.string().min(1),
  rfqTitle: z.string().min(1),
  technicalWeight: z.number().min(0).max(100).default(50),
  commercialWeight: z.number().min(0).max(100).default(50),
  committeeMembers: z.array(z.string()).default([]),
  quotations: z.array(
    z.object({
      quotationId: z.string().min(1),
      supplierId: z.string().min(1),
      supplierName: z.string().min(1),
      rawTotalPrice: z.number().min(0),
      currency: z.string().default('USD'),
    })
  ),
});

export const ClarificationRequestSchema = z.object({
  evaluationId: z.string().min(1),
  quotationId: z.string().min(1),
  requestedBy: z.string().min(1),
  question: z.string().min(1),
});

export const ClarificationResponseSchema = z.object({
  evaluationId: z.string().min(1),
  quotationId: z.string().min(1),
  clarificationId: z.string().min(1),
  supplierResponse: z.string().min(1),
});

export const ApproveEvaluationInputSchema = z.object({
  evaluationId: z.string().min(1),
  approvedBy: z.string().min(1),
  approvalNotes: z.string().min(1),
});

export type SubmitScoreInput = z.infer<typeof SubmitScoreInputSchema>;
export type CreateEvaluationInput = z.infer<typeof CreateEvaluationInputSchema>;
export type ClarificationRequestInput = z.infer<typeof ClarificationRequestSchema>;
export type ClarificationResponseInput = z.infer<typeof ClarificationResponseSchema>;
export type ApproveEvaluationInput = z.infer<typeof ApproveEvaluationInputSchema>;
