import { Router } from 'express';
import {
  FollowSupplierSchema,
  FollowCompanySchema,
  AddSharedContactSchema,
} from '@inducore/contracts';
import { NetworkUseCases } from '@inducore/application';
import { InMemoryNetworkRepository, InMemorySupplierRepository } from '@inducore/infrastructure';

const networkRepo = new InMemoryNetworkRepository();
const supplierRepo = new InMemorySupplierRepository();
const networkUseCases = new NetworkUseCases(networkRepo, supplierRepo);

export function createNetworkRouter(): Router {
  const router = Router();

  // Get full Network Summary (connections, trust scores, recommendations, shared contacts, activity feed)
  router.get('/summary', async (req, res) => {
    const result = await networkUseCases.getNetworkSummary();
    res.json({ success: result.isSuccess, data: result.getValue() });
  });

  // Company Follows Supplier
  router.post('/follow-supplier', async (req, res) => {
    const parse = FollowSupplierSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await networkUseCases.followSupplier(parse.data);
    res.json({ success: result.isSuccess, data: result.getValue() });
  });

  // Supplier Follows Company
  router.post('/follow-company', async (req, res) => {
    const parse = FollowCompanySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await networkUseCases.followCompany(parse.data);
    res.json({ success: result.isSuccess, data: result.getValue() });
  });

  // Toggle Favorite Connection
  router.patch('/connections/:id/favorite', async (req, res) => {
    const result = await networkUseCases.toggleFavorite(req.params.id);
    if (result.isFailure) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Verify Connection & Upgrade Trust Score
  router.patch('/connections/:id/verify', async (req, res) => {
    const result = await networkUseCases.verifyConnection(req.params.id);
    if (result.isFailure) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Add Shared Contact
  router.post('/contacts', async (req, res) => {
    const parse = AddSharedContactSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await networkUseCases.addSharedContact(parse.data);
    res.json({ success: true, data: result.getValue() });
  });

  return router;
}
