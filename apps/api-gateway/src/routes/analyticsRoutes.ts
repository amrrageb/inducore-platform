import { Router, Request, Response } from 'express';
import {
  AnalyticsFilterSchema,
  CreateScheduledReportSchema,
  ExportReportSchema,
  AnalyticsUseCases,
} from '@inducore/application';
import { AnalyticsRepository } from '@inducore/infrastructure';

const router: Router = Router();
const analyticsRepo = new AnalyticsRepository();
const useCases = new AnalyticsUseCases(analyticsRepo);

// GET /v1/analytics/snapshot - Get executive dashboard & KPIs snapshot
router.get('/snapshot', async (req: Request, res: Response) => {
  try {
    const filterResult = AnalyticsFilterSchema.safeParse(req.query);
    const timeframe = filterResult.success ? filterResult.data.timeframe : 'YTD';
    const tenantId = (req.query.tenantId as string) || 'tenant-1';

    const result = await useCases.getAnalyticsSnapshot(tenantId, timeframe);
    if (result.isFailure) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    const snapshot = result.getValue();
    res.json({
      status: 'success',
      data: {
        id: snapshot.id,
        tenantId: snapshot.tenantId,
        snapshotDate: snapshot.snapshotDate,
        timeframe: snapshot.timeframe,
        kpis: snapshot.kpis,
        rfqAnalytics: snapshot.rfqAnalytics,
        categorySpends: snapshot.categorySpends,
        topSupplierSpends: snapshot.topSupplierSpends,
        costSavingsTrends: snapshot.costSavingsTrends,
        updatedAt: snapshot.props.updatedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /v1/analytics/scheduled-reports - List scheduled report configurations
router.get('/scheduled-reports', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-1';
    const result = await useCases.listScheduledReports(tenantId);
    
    res.json({
      status: 'success',
      data: result.getValue().map(r => ({
        id: r.id,
        tenantId: r.tenantId,
        name: r.name,
        description: r.description,
        reportType: r.reportType,
        frequency: r.frequency,
        format: r.format,
        recipients: r.recipients,
        isActive: r.isActive,
        lastRunAt: r.lastRunAt,
        nextRunAt: r.nextRunAt,
        createdBy: r.createdBy,
        createdAt: r.createdAt,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /v1/analytics/scheduled-reports - Create a new scheduled report
router.post('/scheduled-reports', async (req: Request, res: Response) => {
  try {
    const parseRes = CreateScheduledReportSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ status: 'error', errors: parseRes.error.flatten() });
    }

    const tenantId = (req.body.tenantId as string) || 'tenant-1';
    const createdBy = (req.body.createdBy as string) || 'Executive User';

    const result = await useCases.createScheduledReport(tenantId, createdBy, parseRes.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }

    const report = result.getValue();
    res.status(201).json({
      status: 'success',
      data: {
        id: report.id,
        name: report.name,
        description: report.description,
        reportType: report.reportType,
        frequency: report.frequency,
        format: report.format,
        recipients: report.recipients,
        isActive: report.isActive,
        nextRunAt: report.nextRunAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PATCH /v1/analytics/scheduled-reports/:id/toggle - Toggle report status
router.patch('/scheduled-reports/:id/toggle', async (req: Request, res: Response) => {
  try {
    const result = await useCases.toggleScheduledReportStatus(req.params.id);
    if (result.isFailure) {
      return res.status(404).json({ status: 'error', message: result.error });
    }

    const report = result.getValue();
    res.json({
      status: 'success',
      data: { id: report.id, isActive: report.isActive },
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /v1/analytics/scheduled-reports/:id - Delete a scheduled report
router.delete('/scheduled-reports/:id', async (req: Request, res: Response) => {
  try {
    const result = await useCases.deleteScheduledReport(req.params.id);
    if (result.isFailure) {
      return res.status(404).json({ status: 'error', message: result.error });
    }
    res.json({ status: 'success', message: 'Report schedule deleted' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /v1/analytics/export - Export report file data (Excel / PDF / CSV)
router.post('/export', async (req: Request, res: Response) => {
  try {
    const parseRes = ExportReportSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ status: 'error', errors: parseRes.error.flatten() });
    }

    const tenantId = (req.body.tenantId as string) || 'tenant-1';
    const result = await useCases.exportReportData(tenantId, parseRes.data);

    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }

    const exportData = result.getValue();
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.fileName}"`);
    res.json({
      status: 'success',
      data: exportData,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
