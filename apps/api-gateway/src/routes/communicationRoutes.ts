import { Router, Request, Response } from 'express';
import {
  SendNotificationRequestSchema,
  SendRFQChatMessageSchema,
  CreateAnnouncementSchema,
  UpdateNotificationPreferencesSchema,
  CommunicationUseCases,
} from '@inducore/application';
import { CommunicationRepository } from '@inducore/infrastructure';

const router: Router = Router();
const commRepository = new CommunicationRepository();
const useCases = new CommunicationUseCases(commRepository);

// GET /v1/communication/notifications - List messages / notifications
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const channel = req.query.channel as any;
    const category = req.query.category as any;
    const status = req.query.status as any;
    const recipientId = (req.query.recipientId as string) || 'usr-current';

    const messages = await useCases.getNotifications({
      recipientId,
      channel,
      category,
      status,
    });

    res.json({
      status: 'success',
      data: messages.map(m => ({
        id: m.id,
        tenantId: m.tenantId,
        senderId: m.senderId,
        senderName: m.senderName,
        recipientId: m.recipientId,
        channel: m.channel,
        category: m.category,
        subject: m.subject,
        body: m.body,
        status: m.status,
        priority: m.priority,
        relatedEntityId: m.relatedEntityId,
        relatedEntityType: m.relatedEntityType,
        createdAt: m.createdAt,
        readAt: m.readAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PATCH /v1/communication/notifications/:id/read - Mark message read
router.patch('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const result = await useCases.markMessageAsRead(req.params.id);
    if (result.isFailure) {
      return res.status(404).json({ status: 'error', message: result.error });
    }
    const m = result.getValue();
    res.json({
      status: 'success',
      data: {
        id: m.id,
        status: m.status,
        readAt: m.readAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /v1/communication/notifications/read-all - Mark all read
router.post('/notifications/read-all', async (req: Request, res: Response) => {
  try {
    const recipientId = req.body.recipientId || 'usr-current';
    const count = await useCases.markAllMessagesAsRead(recipientId);
    res.json({ status: 'success', data: { markedReadCount: count } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /v1/communication/send - Dispatch Email, SMS, Push or In-App message
router.post('/send', async (req: Request, res: Response) => {
  try {
    const parsed = SendNotificationRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', errors: parsed.error.format() });
    }

    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-inducore-01';
    const senderId = (req.headers['x-user-id'] as string) || 'usr-current';
    const senderName = req.body.senderName || 'InduCore Communication Dispatcher';

    const result = await useCases.sendNotification(tenantId, senderId, senderName, parsed.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }

    const m = result.getValue();
    res.status(201).json({
      status: 'success',
      data: {
        id: m.id,
        channel: m.channel,
        recipientId: m.recipientId,
        subject: m.subject,
        status: m.status,
        createdAt: m.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /v1/communication/rfq-chat - List all RFQ chat threads
router.get('/rfq-chat', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-inducore-01';
    const threads = await useCases.listRFQChatThreads(tenantId);
    res.json({
      status: 'success',
      data: threads.map(t => ({
        id: t.id,
        rfqId: t.rfqId,
        rfqTitle: t.rfqTitle,
        supplierId: t.supplierId,
        supplierName: t.supplierName,
        buyerId: t.buyerId,
        buyerName: t.buyerName,
        messageCount: t.messages.length,
        status: t.status,
        lastActivityAt: t.lastActivityAt,
        latestMessage: t.messages.length > 0 ? t.messages[t.messages.length - 1] : null,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /v1/communication/rfq-chat/:rfqId - Get thread details
router.get('/rfq-chat/:rfqId', async (req: Request, res: Response) => {
  try {
    const thread = await useCases.getRFQChatThread(req.params.rfqId);
    if (!thread) {
      return res.status(404).json({ status: 'error', message: 'RFQ Chat Thread not found' });
    }
    res.json({
      status: 'success',
      data: {
        id: thread.id,
        rfqId: thread.rfqId,
        rfqTitle: thread.rfqTitle,
        supplierId: thread.supplierId,
        supplierName: thread.supplierName,
        buyerId: thread.buyerId,
        buyerName: thread.buyerName,
        status: thread.status,
        lastActivityAt: thread.lastActivityAt,
        messages: thread.messages,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /v1/communication/rfq-chat/:rfqId - Append message to RFQ chat
router.post('/rfq-chat/:rfqId', async (req: Request, res: Response) => {
  try {
    const parsed = SendRFQChatMessageSchema.safeParse({ ...req.body, rfqId: req.params.rfqId });
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', errors: parsed.error.format() });
    }

    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-inducore-01';
    const result = await useCases.sendRFQChatMessage(tenantId, parsed.data);

    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }

    const thread = result.getValue();
    res.json({
      status: 'success',
      data: {
        rfqId: thread.rfqId,
        messageCount: thread.messages.length,
        latestMessage: thread.messages[thread.messages.length - 1],
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /v1/communication/announcements - List Announcements
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-inducore-01';
    const list = await useCases.listAnnouncements(tenantId);
    res.json({
      status: 'success',
      data: list.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        category: a.category,
        targetRoles: a.targetRoles,
        isPinned: a.isPinned,
        priority: a.priority,
        acknowledgedCount: a.acknowledgedUserIds.length,
        acknowledgedUserIds: a.acknowledgedUserIds,
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /v1/communication/announcements - Create Announcement
router.post('/announcements', async (req: Request, res: Response) => {
  try {
    const parsed = CreateAnnouncementSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', errors: parsed.error.format() });
    }

    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-inducore-01';
    const authorId = (req.headers['x-user-id'] as string) || 'usr-current';
    const authorName = req.body.authorName || 'Executive Administration';

    const result = await useCases.createAnnouncement(tenantId, authorId, authorName, parsed.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }

    const a = result.getValue();
    res.status(201).json({
      status: 'success',
      data: {
        id: a.id,
        title: a.title,
        createdAt: a.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /v1/communication/announcements/:id/acknowledge - Acknowledge receipt
router.post('/announcements/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'usr-current';
    const result = await useCases.acknowledgeAnnouncement(req.params.id, userId);
    if (result.isFailure) {
      return res.status(404).json({ status: 'error', message: result.error });
    }
    const a = result.getValue();
    res.json({
      status: 'success',
      data: {
        id: a.id,
        acknowledgedUserIds: a.acknowledgedUserIds,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /v1/communication/preferences - Get notification preferences
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'usr-current';
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-inducore-01';
    const prefs = await useCases.getPreferences(userId, tenantId);
    res.json({ status: 'success', data: prefs });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /v1/communication/preferences - Update notification preferences
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const parsed = UpdateNotificationPreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', errors: parsed.error.format() });
    }

    const userId = (req.headers['x-user-id'] as string) || 'usr-current';
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-inducore-01';

    const result = await useCases.updatePreferences(userId, tenantId, parsed.data);
    if (result.isFailure) {
      return res.status(400).json({ status: 'error', message: result.error });
    }

    res.json({ status: 'success', data: result.getValue() });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /v1/communication/analytics - Multi-channel analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant-inducore-01';
    const analytics = await useCases.getAnalytics(tenantId);
    res.json({ status: 'success', data: analytics });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
