import { Router } from 'express';
import {
  CreateRFQSchema,
  InviteSuppliersSchema,
  AddAttachmentSchema,
  AskClarificationSchema,
  AnswerClarificationSchema,
  CreateRevisionSchema,
} from '@inducore/contracts';
import { RFQUseCases } from '@inducore/application';
import { InMemoryRFQRepository } from '@inducore/infrastructure';

const rfqRepo = new InMemoryRFQRepository();
const rfqUseCases = new RFQUseCases(rfqRepo);

export function createRFQRouter(): Router {
  const router = Router();

  // List all RFQs with optional filtering
  router.get('/', async (req, res) => {
    const status = req.query.status as string | undefined;
    const visibility = req.query.visibility as string | undefined;
    const result = await rfqUseCases.getRFQs({ status, visibility });
    res.json({ success: result.isSuccess, data: result.getValue() });
  });

  // Get single RFQ detail
  router.get('/:id', async (req, res) => {
    const result = await rfqUseCases.getRFQById(req.params.id);
    if (result.isFailure) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Create Draft RFQ
  router.post('/', async (req, res) => {
    const parse = CreateRFQSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await rfqUseCases.createDraftRFQ(parse.data);
    res.status(201).json({ success: result.isSuccess, data: result.getValue() });
  });

  // Publish RFQ
  router.post('/:id/publish', async (req, res) => {
    const result = await rfqUseCases.publishRFQ(req.params.id);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Invite suppliers to RFQ
  router.post('/:id/invite', async (req, res) => {
    const parse = InviteSuppliersSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await rfqUseCases.inviteSuppliers({
      rfqId: req.params.id,
      supplierIds: parse.data.supplierIds,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Add Attachment
  router.post('/:id/attachments', async (req, res) => {
    const parse = AddAttachmentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await rfqUseCases.addAttachment({
      rfqId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Remove Attachment
  router.delete('/:id/attachments/:attachmentId', async (req, res) => {
    const result = await rfqUseCases.removeAttachment(req.params.id, req.params.attachmentId);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Ask Clarification Question
  router.post('/:id/clarifications', async (req, res) => {
    const parse = AskClarificationSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await rfqUseCases.askClarification({
      rfqId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Answer Clarification Question
  router.post('/:id/clarifications/:clarificationId/answer', async (req, res) => {
    const parse = AnswerClarificationSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await rfqUseCases.answerClarification({
      rfqId: req.params.id,
      clarificationId: req.params.clarificationId,
      answer: parse.data.answer,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Create Revision / Extend Deadline
  router.post('/:id/revisions', async (req, res) => {
    const parse = CreateRevisionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await rfqUseCases.createRevision({
      rfqId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Close RFQ
  router.post('/:id/close', async (req, res) => {
    const result = await rfqUseCases.closeRFQ(req.params.id);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  return router;
}
