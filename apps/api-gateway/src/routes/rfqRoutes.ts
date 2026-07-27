import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/tenantContextMiddleware.js';
import { CreateRFQUseCase, SubmitBidUseCase, EvaluateBidsWithAIUseCase } from '@inducore/application';
import { PostgresRFQRepository, KafkaEventOutboxPublisher, GeminiAIService } from '@inducore/infrastructure';

export function createRFQRouter(): Router {
  const router = Router();

  const rfqRepo = new PostgresRFQRepository();
  const outboxPublisher = new KafkaEventOutboxPublisher();
  const geminiService = new GeminiAIService();

  const createRFQUseCase = new CreateRFQUseCase(rfqRepo, outboxPublisher);
  const submitBidUseCase = new SubmitBidUseCase(rfqRepo, outboxPublisher);
  const evaluateBidsUseCase = new EvaluateBidsWithAIUseCase(rfqRepo, geminiService);

  // GET /v1/rfqs - List RFQs
  router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const rfqs = await rfqRepo.listByTenant(req.tenantId!);
      res.json({
        data: rfqs.map(r => ({
          id: r.id,
          title: r.title,
          status: r.status,
          lineItemsCount: r.lineItems.length,
          bidsCount: r.bids.length,
          createdAt: r.props.createdAt
        }))
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /v1/rfqs - Create RFQ
  router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await createRFQUseCase.execute({
        tenantId: req.tenantId!,
        title: req.body.title,
        description: req.body.description || '',
        lineItems: req.body.lineItems || []
      });

      if (result.isFailure) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({ data: result.getValue() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /v1/rfqs/:id/bids - Submit Bid
  router.post('/:id/bids', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await submitBidUseCase.execute({
        rfqId: req.params.id,
        tenantId: req.tenantId!,
        supplierId: req.body.supplierId,
        supplierName: req.body.supplierName,
        totalBidAmount: req.body.totalBidAmount,
        currency: req.body.currency || 'USD',
        leadTimeDays: req.body.leadTimeDays
      });

      if (result.isFailure) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json({ message: 'Bid submitted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /v1/rfqs/:id/evaluate - AI Evaluation
  router.post('/:id/evaluate', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await evaluateBidsUseCase.execute(req.params.id, req.tenantId!);

      if (result.isFailure) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json({ data: result.getValue() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
