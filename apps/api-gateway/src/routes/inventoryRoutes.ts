import { Router, Request, Response } from 'express';
import { InventoryUseCases } from '@inducore/application';
import { InMemoryInventoryRepository } from '@inducore/infrastructure';
import {
  AdjustStockOnHandSchema,
  ReserveStockSchema,
  ReleaseStockSchema,
  UpdateInventoryPolicySchema,
  ConvertQuantitySchema,
  TriggerErpSyncSchema,
} from '@inducore/contracts';

const router = Router();
const inventoryRepo = new InMemoryInventoryRepository();
const inventoryUseCases = new InventoryUseCases(inventoryRepo);

// GET /v1/inventory
router.get('/', async (_req: Request, res: Response) => {
  const result = await inventoryUseCases.getAllInventoryItems();
  if (result.isFailure) {
    return res.status(500).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// GET /v1/inventory/kpi-summary
router.get('/kpi-summary', async (_req: Request, res: Response) => {
  const result = await inventoryUseCases.getKPIDashboardSummary();
  if (result.isFailure) {
    return res.status(500).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// GET /v1/inventory/reorder-suggestions
router.get('/reorder-suggestions', async (_req: Request, res: Response) => {
  const result = await inventoryUseCases.getReorderSuggestions();
  if (result.isFailure) {
    return res.status(500).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// GET /v1/inventory/:id
router.get('/:id', async (req: Request, res: Response) => {
  const result = await inventoryUseCases.getInventoryById(req.params.id);
  if (result.isFailure) {
    return res.status(404).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// POST /v1/inventory/adjust-stock
router.post('/adjust-stock', async (req: Request, res: Response) => {
  const parsed = AdjustStockOnHandSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  const result = await inventoryUseCases.adjustStockOnHand(parsed.data);
  if (result.isFailure) {
    return res.status(400).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// POST /v1/inventory/reserve-stock
router.post('/reserve-stock', async (req: Request, res: Response) => {
  const parsed = ReserveStockSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  const result = await inventoryUseCases.reserveStock(parsed.data);
  if (result.isFailure) {
    return res.status(400).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// POST /v1/inventory/release-stock
router.post('/release-stock', async (req: Request, res: Response) => {
  const parsed = ReleaseStockSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  const result = await inventoryUseCases.releaseStock(parsed.data);
  if (result.isFailure) {
    return res.status(400).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// POST /v1/inventory/policy/update
router.post('/policy/update', async (req: Request, res: Response) => {
  const parsed = UpdateInventoryPolicySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  const result = await inventoryUseCases.updateInventoryPolicy(parsed.data);
  if (result.isFailure) {
    return res.status(400).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// POST /v1/inventory/unit-conversion
router.post('/unit-conversion', async (req: Request, res: Response) => {
  const parsed = ConvertQuantitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  const result = await inventoryUseCases.convertUnitQuantity(parsed.data);
  if (result.isFailure) {
    return res.status(400).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

// POST /v1/inventory/erp-sync
router.post('/erp-sync', async (req: Request, res: Response) => {
  const parsed = TriggerErpSyncSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  const result = await inventoryUseCases.triggerErpSync(parsed.data);
  if (result.isFailure) {
    return res.status(400).json({ error: result.errorValue() });
  }
  return res.json({ status: 'success', data: result.getValue() });
});

export default router;
