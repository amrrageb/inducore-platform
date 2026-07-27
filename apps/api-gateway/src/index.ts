import express from 'express';
import cors from 'cors';
import { tenantContextMiddleware } from './middleware/tenantContextMiddleware.js';
import { createRFQRouter } from './routes/rfqRoutes.js';
import { Logger } from '@inducore/logger';

export function createGatewayApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(tenantContextMiddleware as any);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
  });

  app.use('/v1/rfqs', createRFQRouter());

  return app;
}

if (process.env.NODE_ENV !== 'test' && !process.env.EMBEDDED_SERVER) {
  const app = createGatewayApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    Logger.info(`InduCore API Gateway listening on port ${PORT}`);
  });
}
