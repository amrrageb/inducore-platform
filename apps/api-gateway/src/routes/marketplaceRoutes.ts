import { Router, Request, Response } from 'express';
import {
  MarketplaceUseCases,
  CreateProfileSchema,
  AddProductSchema,
  AddServiceSchema,
  CreatePartnershipRequestSchema,
  PostNewsSchema,
  AICapabilitySearchSchema,
} from '@inducore/application';
import { MarketplaceRepository } from '@inducore/infrastructure';

export const marketplaceRouter = Router();
const marketplaceRepo = new MarketplaceRepository();
const marketplaceUseCases = new MarketplaceUseCases(marketplaceRepo);

// GET /v1/marketplace/profiles - List public company/supplier profiles with search & filters
marketplaceRouter.get('/profiles', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string | undefined;
    const category = req.query.category as string | undefined;
    const verifiedOnly = req.query.verifiedOnly === 'true';

    const result = await marketplaceUseCases.listProfiles(query, category, verifiedOnly);
    if (result.isFailure) return res.status(400).json({ error: result.error });

    const dtos = result.getValue().map(p => ({
      id: p.id,
      tenantId: p.tenantId,
      companyName: p.companyName,
      logoUrl: p.logoUrl,
      industryCategory: p.industryCategory,
      headquartersCountry: p.headquartersCountry,
      operatingLanguages: p.operatingLanguages,
      description: p.description,
      isVerifiedSupplier: p.isVerifiedSupplier,
      reputationScore: p.reputationScore,
      followersCount: p.followersCount,
      capabilities: p.capabilities,
      certifications: p.certifications,
      productsCount: p.products.length,
      servicesCount: p.services.length,
      newsPostsCount: p.newsPosts.length,
    }));

    return res.json(dtos);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/marketplace/profiles/:id - Get detailed company public profile
marketplaceRouter.get('/profiles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await marketplaceUseCases.getProfileById(id);
    if (result.isFailure) return res.status(404).json({ error: result.error });

    const p = result.getValue();
    return res.json({
      id: p.id,
      tenantId: p.tenantId,
      companyName: p.companyName,
      logoUrl: p.logoUrl,
      industryCategory: p.industryCategory,
      headquartersCountry: p.headquartersCountry,
      operatingLanguages: p.operatingLanguages,
      description: p.description,
      isVerifiedSupplier: p.isVerifiedSupplier,
      reputationScore: p.reputationScore,
      followersCount: p.followersCount,
      capabilities: p.capabilities,
      certifications: p.certifications,
      products: p.products,
      services: p.services,
      newsPosts: p.newsPosts,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/marketplace/profiles - Create company public profile
marketplaceRouter.post('/profiles', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-1';
    const validation = CreateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }

    const result = await marketplaceUseCases.createProfile(tenantId, validation.data);
    if (result.isFailure) return res.status(400).json({ error: result.error });

    return res.status(201).json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/marketplace/profiles/:id/follow - Follow company
marketplaceRouter.post('/profiles/:id/follow', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await marketplaceUseCases.toggleFollow(id);
    if (result.isFailure) return res.status(400).json({ error: result.error });
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/marketplace/profiles/:id/products - Add product
marketplaceRouter.post('/profiles/:id/products', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = AddProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const result = await marketplaceUseCases.addProduct(id, validation.data);
    if (result.isFailure) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/marketplace/profiles/:id/services - Add service
marketplaceRouter.post('/profiles/:id/services', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = AddServiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const result = await marketplaceUseCases.addService(id, validation.data);
    if (result.isFailure) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/marketplace/profiles/:id/news - Post news/case study
marketplaceRouter.post('/profiles/:id/news', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = PostNewsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const result = await marketplaceUseCases.postNews(id, validation.data);
    if (result.isFailure) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/marketplace/products - Global Product Discovery Catalog
marketplaceRouter.get('/products', async (_req: Request, res: Response) => {
  try {
    const result = await marketplaceUseCases.getAllProducts();
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/marketplace/services - Global Service Marketplace
marketplaceRouter.get('/services', async (_req: Request, res: Response) => {
  try {
    const result = await marketplaceUseCases.getAllServices();
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/marketplace/news - Global Industrial News Feed
marketplaceRouter.get('/news', async (_req: Request, res: Response) => {
  try {
    const result = await marketplaceUseCases.getAllNewsPosts();
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/marketplace/partnerships - Request Partnership
marketplaceRouter.post('/partnerships', async (req: Request, res: Response) => {
  try {
    const requesterCompanyId = req.body.requesterCompanyId || 'comp-101';
    const requesterCompanyName = req.body.requesterCompanyName || 'Apex Precision Metallurgy Ltd';

    const validation = CreatePartnershipRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }

    const result = await marketplaceUseCases.createPartnershipRequest(requesterCompanyId, requesterCompanyName, validation.data);
    if (result.isFailure) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/marketplace/partnerships - List Partnership Requests
marketplaceRouter.get('/partnerships', async (req: Request, res: Response) => {
  try {
    const companyId = (req.query.companyId as string) || 'comp-101';
    const result = await marketplaceUseCases.listPartnershipRequests(companyId);
    if (result.isFailure) return res.status(400).json({ error: result.error });

    const dtos = result.getValue().map(r => ({
      id: r.id,
      requesterCompanyId: r.requesterCompanyId,
      requesterCompanyName: r.requesterCompanyName,
      targetCompanyId: r.targetCompanyId,
      targetCompanyName: r.targetCompanyName,
      partnershipType: r.partnershipType,
      proposedScope: r.proposedScope,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
      respondedAt: r.respondedAt,
    }));
    return res.json(dtos);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/marketplace/partnerships/:id/respond - Respond to Partnership Request
marketplaceRouter.post('/partnerships/:id/respond', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accept = req.body.accept === true;

    const result = await marketplaceUseCases.respondPartnershipRequest(id, accept);
    if (result.isFailure) return res.status(400).json({ error: result.error });
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /v1/marketplace/ai/search - AI Capability Search & Supplier Matchmaking
marketplaceRouter.post('/ai/search', async (req: Request, res: Response) => {
  try {
    const validation = AICapabilitySearchSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }

    const result = await marketplaceUseCases.searchCapabilitiesAI(validation.data);
    if (result.isFailure) return res.status(400).json({ error: result.error });
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /v1/marketplace/ai/rfq-recommendations - AI Recommended RFQs for Supplier
marketplaceRouter.get('/ai/rfq-recommendations', async (req: Request, res: Response) => {
  try {
    const companyId = (req.query.companyId as string) || 'comp-101';
    const result = await marketplaceUseCases.recommendRFQs(companyId);
    if (result.isFailure) return res.status(400).json({ error: result.error });
    return res.json(result.getValue());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
