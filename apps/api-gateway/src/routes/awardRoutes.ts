import { Router, Request, Response } from 'express';
import { AwardUseCases } from '@inducore/application';
import { InMemoryAwardRepository } from '@inducore/infrastructure';
import {
  CreateAwardRequestSchema,
  SubmitAwardApprovalRequestSchema,
  ApproveAwardRequestSchema,
  DispatchAwardLetterRequestSchema,
  PrepareContractRequestSchema,
  GeneratePurchaseRequestSchema,
  ReviseAwardRequestSchema,
  CancelAwardRequestSchema,
} from '@inducore/contracts';

const awardRepo = new InMemoryAwardRepository();
const awardUseCases = new AwardUseCases(awardRepo);

export const awardRouter = Router();

// GET /v1/awards
awardRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const awards = await awardUseCases.getAllAwards();
    res.json({ success: true, data: awards, error: null });
  } catch (err: any) {
    res.status(500).json({ success: false, data: null, error: err.message });
  }
});

// GET /v1/awards/:id
awardRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const award = await awardUseCases.getAwardById(req.params.id);
    if (!award) {
      return res.status(404).json({ success: false, data: null, error: 'Award not found' });
    }
    res.json({ success: true, data: award, error: null });
  } catch (err: any) {
    res.status(500).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards
awardRouter.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = CreateAwardRequestSchema.parse(req.body);
    const result = await awardUseCases.createAward(parsed);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.status(201).json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards/submit-approval
awardRouter.post('/submit-approval', async (req: Request, res: Response) => {
  try {
    const parsed = SubmitAwardApprovalRequestSchema.parse(req.body);
    const result = await awardUseCases.submitForApproval(parsed);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards/approve
awardRouter.post('/approve', async (req: Request, res: Response) => {
  try {
    const parsed = ApproveAwardRequestSchema.parse(req.body);
    const result = await awardUseCases.approveAward(parsed);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards/letter
awardRouter.post('/letter', async (req: Request, res: Response) => {
  try {
    const parsed = DispatchAwardLetterRequestSchema.parse(req.body);
    const result = await awardUseCases.dispatchAwardLetter(parsed);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards/:id/accept
awardRouter.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const result = await awardUseCases.recordSupplierAcceptance(req.params.id);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards/contract
awardRouter.post('/contract', async (req: Request, res: Response) => {
  try {
    const parsed = PrepareContractRequestSchema.parse(req.body);
    const result = await awardUseCases.prepareContract(parsed);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards/purchase-request
awardRouter.post('/purchase-request', async (req: Request, res: Response) => {
  try {
    const parsed = GeneratePurchaseRequestSchema.parse(req.body);
    const result = await awardUseCases.generatePurchaseRequest(parsed);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards/revise
awardRouter.post('/revise', async (req: Request, res: Response) => {
  try {
    const parsed = ReviseAwardRequestSchema.parse(req.body);
    const result = await awardUseCases.reviseAward(parsed);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});

// POST /v1/awards/cancel
awardRouter.post('/cancel', async (req: Request, res: Response) => {
  try {
    const parsed = CancelAwardRequestSchema.parse(req.body);
    const result = await awardUseCases.cancelAward(parsed);
    if (result.isFailure) {
      return res.status(400).json({ success: false, data: null, error: result.getError() });
    }
    res.json({ success: true, data: result.getValue(), error: null });
  } catch (err: any) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
});
