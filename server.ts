import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { tenantContextMiddleware } from './apps/api-gateway/src/middleware/tenantContextMiddleware.js';
import { createRFQRouter } from './apps/api-gateway/src/routes/rfqRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'inducore-unified-gateway',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Gateway REST endpoints
  app.use(tenantContextMiddleware as any);
  app.use('/v1/rfqs', createRFQRouter());

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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InduCore Enterprise Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
