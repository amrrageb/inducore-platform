import { Router, Request, Response } from 'express';
import {
  EvaluationUseCases,
  CreateEvaluationInputSchema,
  SubmitScoreInputSchema,
  ClarificationRequestSchema,
  ClarificationResponseSchema,
  ApproveEvaluationInputSchema,
} from '@inducore/application';
import { InMemoryEvaluationRepository } from '@inducore/infrastructure';

export function createEvaluationRouter(): Router {
  const router = Router();
  const repo = new InMemoryEvaluationRepository();
  const evaluationUseCases = new EvaluationUseCases(repo);

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const list = await evaluationUseCases.listEvaluations();
      return res.json({
        success: true,
        data: list.map(e => e.props),
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.get('/rfq/:rfqId', async (req: Request, res: Response) => {
    try {
      const list = await evaluationUseCases.listEvaluations();
      const evalAgg = list.find(e => e.props.rfqId === req.params.rfqId);
      if (!evalAgg) {
        return res.status(404).json({ success: false, error: 'Evaluation matrix not found for RFQ' });
      }
      return res.json({
        success: true,
        data: evalAgg.props,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const parsed = CreateEvaluationInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      }

      const result = await evaluationUseCases.createEvaluation(parsed.data);
      if (result.isFailure) {
        return res.status(400).json({ success: false, error: result.errorValue() });
      }

      return res.status(201).json({
        success: true,
        data: result.getValue().props,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.post('/scores', async (req: Request, res: Response) => {
    try {
      const parsed = SubmitScoreInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      }

      const result = await evaluationUseCases.submitEvaluatorScore(parsed.data);
      if (result.isFailure) {
        return res.status(400).json({ success: false, error: result.errorValue() });
      }

      return res.json({
        success: true,
        data: result.getValue().props,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.post('/clarifications/request', async (req: Request, res: Response) => {
    try {
      const parsed = ClarificationRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      }

      const result = await evaluationUseCases.requestClarification(parsed.data);
      if (result.isFailure) {
        return res.status(400).json({ success: false, error: result.errorValue() });
      }

      return res.json({
        success: true,
        data: result.getValue().props,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.post('/clarifications/response', async (req: Request, res: Response) => {
    try {
      const parsed = ClarificationResponseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      }

      const result = await evaluationUseCases.respondClarification(parsed.data);
      if (result.isFailure) {
        return res.status(400).json({ success: false, error: result.errorValue() });
      }

      return res.json({
        success: true,
        data: result.getValue().props,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.post('/approve', async (req: Request, res: Response) => {
    try {
      const parsed = ApproveEvaluationInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      }

      const result = await evaluationUseCases.approveEvaluation(parsed.data);
      if (result.isFailure) {
        return res.status(400).json({ success: false, error: result.errorValue() });
      }

      return res.json({
        success: true,
        data: result.getValue().props,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  return router;
}
