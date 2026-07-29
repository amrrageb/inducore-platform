import { Router, Request, Response } from 'express';
import { PurchaseOrderUseCases } from '@inducore/application';
import { InMemoryPurchaseOrderRepository } from '@inducore/infrastructure';
import {
  CreatePOSchema,
  ApprovePOSchema,
  AddDeliveryScheduleSchema,
  AddShipmentSchema,
  RecordGoodsReceiptSchema,
  RevisePOSchema,
  ClosePOSchema,
} from '@inducore/contracts';

const poRepo = new InMemoryPurchaseOrderRepository();
const poUseCases = new PurchaseOrderUseCases(poRepo);

export const purchaseOrderRouter = Router();

// List all POs
purchaseOrderRouter.get('/', async (_req: Request, res: Response) => {
  const result = await poUseCases.getAllPOs();
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Get PO by ID
purchaseOrderRouter.get('/:id', async (req: Request, res: Response) => {
  const result = await poUseCases.getPOById(req.params.id);
  if (result.isFailure) {
    return res.status(404).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Create PO (Generate from Award or Manual)
purchaseOrderRouter.post('/', async (req: Request, res: Response) => {
  const parseResult = CreatePOSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await poUseCases.createPO(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.status(201).json({ success: true, data: result.getValue() });
});

// Submit PO for approval
purchaseOrderRouter.post('/:id/submit', async (req: Request, res: Response) => {
  const result = await poUseCases.submitPO(req.params.id);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Approve PO
purchaseOrderRouter.post('/approve', async (req: Request, res: Response) => {
  const parseResult = ApprovePOSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await poUseCases.approvePO(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Issue PO to supplier
purchaseOrderRouter.post('/:id/issue', async (req: Request, res: Response) => {
  const result = await poUseCases.issuePO(req.params.id);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Delivery Schedule
purchaseOrderRouter.post('/schedule', async (req: Request, res: Response) => {
  const parseResult = AddDeliveryScheduleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await poUseCases.addDeliverySchedule(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Shipment Tracking
purchaseOrderRouter.post('/shipment', async (req: Request, res: Response) => {
  const parseResult = AddShipmentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await poUseCases.addShipment(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Goods Receipt (GRN - Partial, Over, Under delivery)
purchaseOrderRouter.post('/goods-receipt', async (req: Request, res: Response) => {
  const parseResult = RecordGoodsReceiptSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await poUseCases.recordGoodsReceipt(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// PO Revision
purchaseOrderRouter.post('/revise', async (req: Request, res: Response) => {
  const parseResult = RevisePOSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await poUseCases.revisePO(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// PO Closure
purchaseOrderRouter.post('/close', async (req: Request, res: Response) => {
  const parseResult = ClosePOSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await poUseCases.closePO(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});
