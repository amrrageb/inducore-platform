import { Router, Request, Response } from 'express';
import { PerformanceScorecardUseCases } from '@inducore/application';
import { InMemoryPerformanceScorecardRepository } from '@inducore/infrastructure';
import {
  UpdateScoresSchema,
  UpdateMetricsSchema,
  BlacklistSupplierSchema,
  RemoveBlacklistSchema,
  TogglePreferredSupplierSchema,
  UpdateRiskLevelSchema,
  RecordHistoricalTrendSchema,
} from '@inducore/contracts';

const scorecardRepo = new InMemoryPerformanceScorecardRepository();
const scorecardUseCases = new PerformanceScorecardUseCases(scorecardRepo);

export const performanceRouter = Router();

// KPI Dashboard summary
performanceRouter.get('/kpi-summary', async (_req: Request, res: Response) => {
  const result = await scorecardUseCases.getKPIDashboardSummary();
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// List all performance scorecards
performanceRouter.get('/', async (_req: Request, res: Response) => {
  const result = await scorecardUseCases.getAllScorecards();
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Get scorecard by supplier ID
performanceRouter.get('/supplier/:supplierId', async (req: Request, res: Response) => {
  const result = await scorecardUseCases.getScorecardBySupplierId(req.params.supplierId);
  if (result.isFailure) {
    return res.status(404).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Update scores
performanceRouter.post('/scores/update', async (req: Request, res: Response) => {
  const parseResult = UpdateScoresSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await scorecardUseCases.updateScores(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Update metrics
performanceRouter.post('/metrics/update', async (req: Request, res: Response) => {
  const parseResult = UpdateMetricsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await scorecardUseCases.updateMetrics(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Blacklist supplier
performanceRouter.post('/blacklist', async (req: Request, res: Response) => {
  const parseResult = BlacklistSupplierSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await scorecardUseCases.blacklistSupplier(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Remove blacklist
performanceRouter.post('/blacklist/remove', async (req: Request, res: Response) => {
  const parseResult = RemoveBlacklistSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await scorecardUseCases.removeBlacklist(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Toggle preferred supplier
performanceRouter.post('/preferred/toggle', async (req: Request, res: Response) => {
  const parseResult = TogglePreferredSupplierSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await scorecardUseCases.togglePreferredSupplier(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Update risk level
performanceRouter.post('/risk-level', async (req: Request, res: Response) => {
  const parseResult = UpdateRiskLevelSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await scorecardUseCases.updateRiskLevel(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Record historical trend point
performanceRouter.post('/trends/record', async (req: Request, res: Response) => {
  const parseResult = RecordHistoricalTrendSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await scorecardUseCases.recordHistoricalTrend(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});
