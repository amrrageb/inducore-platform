import { Router } from 'express';
import {
  CreateQuotationSchema,
  CreateQuotationRevisionSchema,
  WithdrawQuotationSchema,
  AddBuyerCommentSchema,
  AddQuotationAttachmentSchema,
} from '@inducore/contracts';
import { QuotationUseCases } from '@inducore/application';
import { InMemoryQuotationRepository } from '@inducore/infrastructure';

const quotationRepo = new InMemoryQuotationRepository();
const quotationUseCases = new QuotationUseCases(quotationRepo);

export function createQuotationRouter(): Router {
  const router = Router();

  // List all quotations or filter by rfqId / supplierId
  router.get('/', async (req, res) => {
    const rfqId = req.query.rfqId as string | undefined;
    const supplierId = req.query.supplierId as string | undefined;

    if (rfqId) {
      const result = await quotationUseCases.getByRfq(rfqId);
      res.json({ success: true, data: result.getValue() });
      return;
    }

    if (supplierId) {
      const result = await quotationUseCases.getBySupplier(supplierId);
      res.json({ success: true, data: result.getValue() });
      return;
    }

    const result = await quotationUseCases.getAll();
    res.json({ success: true, data: result.getValue() });
  });

  // Get single quotation
  router.get('/:id', async (req, res) => {
    const result = await quotationUseCases.getById(req.params.id);
    if (result.isFailure) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Create Quotation (Draft or Submitted)
  router.post('/', async (req, res) => {
    const parse = CreateQuotationSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await quotationUseCases.create(parse.data);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Submit Draft Quotation
  router.post('/:id/submit', async (req, res) => {
    const result = await quotationUseCases.submitDraft(req.params.id);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Create Quotation Revision
  router.post('/:id/revisions', async (req, res) => {
    const parse = CreateQuotationRevisionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await quotationUseCases.createRevision(req.params.id, parse.data);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Withdraw Quotation
  router.post('/:id/withdraw', async (req, res) => {
    const parse = WithdrawQuotationSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await quotationUseCases.withdraw(req.params.id, parse.data);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Add Buyer Comment / Feedback
  router.post('/:id/comments', async (req, res) => {
    const parse = AddBuyerCommentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await quotationUseCases.addComment(req.params.id, parse.data);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Add Attachment (Technical / Commercial)
  router.post('/:id/attachments', async (req, res) => {
    const parse = AddQuotationAttachmentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await quotationUseCases.addAttachment(req.params.id, parse.data);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  return router;
}
