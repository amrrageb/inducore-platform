import { Router } from 'express';
import {
  CreateSupplierSchema,
  AddCertificationSchema,
  AddDocumentSchema,
  AddProductSchema,
  RateSupplierSchema,
} from '@inducore/contracts';
import { SupplierUseCases } from '@inducore/application';
import { InMemorySupplierRepository } from '@inducore/infrastructure';

const supplierRepo = new InMemorySupplierRepository();
const supplierUseCases = new SupplierUseCases(supplierRepo);

export function createSupplierRouter(): Router {
  const router = Router();

  // Search or List Suppliers with filters
  router.get('/', async (req, res) => {
    const { query, category, tag, favoriteOnly, minRating } = req.query;
    const filter = {
      query: query ? String(query) : undefined,
      category: category ? String(category) : undefined,
      tag: tag ? String(tag) : undefined,
      favoriteOnly: favoriteOnly === 'true',
      minRating: minRating ? Number(minRating) : undefined,
    };

    const result = await supplierUseCases.listSuppliers(filter);
    res.json({ success: result.isSuccess, data: result.getValue() });
  });

  // Global Product Search across all suppliers
  router.get('/products/search', async (req, res) => {
    const { query, category } = req.query;
    const result = await supplierUseCases.searchProducts(
      query ? String(query) : undefined,
      category ? String(category) : undefined
    );
    res.json({ success: result.isSuccess, data: result.getValue() });
  });

  // Create new Supplier
  router.post('/', async (req, res) => {
    const parse = CreateSupplierSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await supplierUseCases.createSupplier(parse.data);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Get Supplier Details by ID
  router.get('/:id', async (req, res) => {
    const result = await supplierUseCases.getSupplierById(req.params.id);
    if (result.isFailure) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Toggle Favorite Status
  router.patch('/:id/favorite', async (req, res) => {
    const result = await supplierUseCases.toggleFavorite(req.params.id);
    if (result.isFailure) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Add Rating
  router.post('/:id/ratings', async (req, res) => {
    const parse = RateSupplierSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await supplierUseCases.rateSupplier({
      supplierId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Add Certification
  router.post('/:id/certifications', async (req, res) => {
    const parse = AddCertificationSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await supplierUseCases.addCertification({
      supplierId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Add Document
  router.post('/:id/documents', async (req, res) => {
    const parse = AddDocumentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await supplierUseCases.addDocument({
      supplierId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Add Product to Catalogue
  router.post('/:id/products', async (req, res) => {
    const parse = AddProductSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await supplierUseCases.addProduct({
      supplierId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  return router;
}
