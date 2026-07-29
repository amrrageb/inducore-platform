import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { tenantContextMiddleware } from './apps/api-gateway/src/middleware/tenantContextMiddleware.js';
import { createExampleRouter } from './apps/api-gateway/src/routes/exampleRoutes.js';
import { createCompanyRouter } from './apps/api-gateway/src/routes/companyRoutes.js';
import { createSupplierRouter } from './apps/api-gateway/src/routes/supplierRoutes.js';
import { createNetworkRouter } from './apps/api-gateway/src/routes/networkRoutes.js';
import { createRFQRouter } from './apps/api-gateway/src/routes/rfqRoutes.js';
import { createQuotationRouter } from './apps/api-gateway/src/routes/quotationRoutes.js';
import { createEvaluationRouter } from './apps/api-gateway/src/routes/evaluationRoutes.js';
import { awardRouter } from './apps/api-gateway/src/routes/awardRoutes.js';
import { purchaseOrderRouter } from './apps/api-gateway/src/routes/purchaseOrderRoutes.js';
import { contractRouter } from './apps/api-gateway/src/routes/contractRoutes.js';
import { performanceRouter } from './apps/api-gateway/src/routes/performanceRoutes.js';
import inventoryRouter from './apps/api-gateway/src/routes/inventoryRoutes.js';
import assistantRouter from './apps/api-gateway/src/routes/assistantRoutes.js';
import communicationRouter from './apps/api-gateway/src/routes/communicationRoutes.js';
import analyticsRouter from './apps/api-gateway/src/routes/analyticsRoutes.js';
import adminRouter from './apps/api-gateway/src/routes/adminRoutes.js';
import { devopsRouter } from './apps/api-gateway/src/routes/devopsRoutes.js';
import { marketplaceRouter } from './apps/api-gateway/src/routes/marketplaceRoutes.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'inducore-unified-gateway',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Gateway REST endpoints
  app.use(tenantContextMiddleware as any);
  app.use('/v1/example', createExampleRouter());
  app.use('/v1/companies', createCompanyRouter());
  app.use('/v1/suppliers', createSupplierRouter());
  app.use('/v1/network', createNetworkRouter());
  app.use('/v1/rfqs', createRFQRouter());
  app.use('/v1/quotations', createQuotationRouter());
  app.use('/v1/evaluations', createEvaluationRouter());
  app.use('/v1/awards', awardRouter);
  app.use('/v1/purchase-orders', purchaseOrderRouter);
  app.use('/v1/contracts', contractRouter);
  app.use('/v1/performance', performanceRouter);
  app.use('/v1/inventory', inventoryRouter);
  app.use('/v1/assistant', assistantRouter);
  app.use('/v1/communication', communicationRouter);
  app.use('/v1/analytics', analyticsRouter);
  app.use('/v1/admin', adminRouter);
  app.use('/v1/devops', devopsRouter);
  app.use('/v1/marketplace', marketplaceRouter);


  // Vite middleware for development or static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InduCore Enterprise Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
