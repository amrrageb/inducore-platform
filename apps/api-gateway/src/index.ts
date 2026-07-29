import express from 'express';
import cors from 'cors';
import { tenantContextMiddleware } from './middleware/tenantContextMiddleware.js';
import { createExampleRouter } from './routes/exampleRoutes.js';
import { createCompanyRouter } from './routes/companyRoutes.js';
import { createSupplierRouter } from './routes/supplierRoutes.js';
import { createNetworkRouter } from './routes/networkRoutes.js';
import { createRFQRouter } from './routes/rfqRoutes.js';
import { createQuotationRouter } from './routes/quotationRoutes.js';
import { createEvaluationRouter } from './routes/evaluationRoutes.js';
import { awardRouter } from './routes/awardRoutes.js';
import { purchaseOrderRouter } from './routes/purchaseOrderRoutes.js';
import { contractRouter } from './routes/contractRoutes.js';
import { performanceRouter } from './routes/performanceRoutes.js';
import { Logger } from '@inducore/logger';

export function createGatewayApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(tenantContextMiddleware as any);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
  });

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

  return app;
}


if (process.env.NODE_ENV !== 'test' && !process.env.EMBEDDED_SERVER) {
  const app = createGatewayApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    Logger.info(`InduCore API Gateway listening on port ${PORT}`);
  });
}
