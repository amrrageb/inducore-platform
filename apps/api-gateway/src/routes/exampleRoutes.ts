import { Router } from 'express';

export function createExampleRouter(): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({ message: 'Example platform route working successfully', timestamp: new Date().toISOString() });
  });

  return router;
}
