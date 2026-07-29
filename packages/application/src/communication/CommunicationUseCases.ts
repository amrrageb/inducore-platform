import {
  CommunicationMessageAggregate,
  RFQChatThreadAggregate,
  AnnouncementAggregate,
  NotificationPreferencesAggregate,
  Result,
} from '@inducore/core-domain';
import { ICommunicationRepository, MessageFilter } from './ICommunicationRepository.js';
import {
  SendNotificationDTO,
  SendRFQChatMessageDTO,
  CreateAnnouncementDTO,
  UpdateNotificationPreferencesDTO,
} from './CommunicationDTOs.js';

export class CommunicationUseCases {
  constructor(private repository: ICommunicationRepository) {}

  public async sendNotification(tenantId: string, senderId: string, senderName: string, dto: SendNotificationDTO): Promise<Result<CommunicationMessageAggregate>> {
    const msgRes = CommunicationMessageAggregate.create({
      tenantId,
      senderId,
      senderName,
      recipientId: dto.recipientId,
      recipientEmail: dto.recipientEmail,
      recipientPhone: dto.recipientPhone,
      channel: dto.channel,
      category: dto.category,
      subject: dto.subject,
      body: dto.body,
      status: dto.channel === 'IN_APP' ? 'SENT' : 'DELIVERED',
      priority: dto.priority,
      relatedEntityId: dto.relatedEntityId,
      relatedEntityType: dto.relatedEntityType,
      metadata: dto.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (msgRes.isFailure) {
      return msgRes;
    }

    const message = msgRes.getValue();
    await this.repository.saveMessage(message);
    return Result.ok<CommunicationMessageAggregate>(message);
  }

  public async getNotifications(filter: MessageFilter): Promise<CommunicationMessageAggregate[]> {
    return this.repository.findMessages(filter);
  }

  public async markMessageAsRead(messageId: string): Promise<Result<CommunicationMessageAggregate>> {
    const message = await this.repository.getMessageById(messageId);
    if (!message) {
      return Result.fail<CommunicationMessageAggregate>('Message not found');
    }
    message.markAsRead();
    await this.repository.saveMessage(message);
    return Result.ok<CommunicationMessageAggregate>(message);
  }

  public async markAllMessagesAsRead(recipientId: string): Promise<number> {
    return this.repository.markAllAsRead(recipientId);
  }

  public async sendRFQChatMessage(tenantId: string, dto: SendRFQChatMessageDTO): Promise<Result<RFQChatThreadAggregate>> {
    let thread = await this.repository.getRFQChatThread(dto.rfqId);
    if (!thread) {
      const threadRes = RFQChatThreadAggregate.create({
        tenantId,
        rfqId: dto.rfqId,
        rfqTitle: `RFQ Thread for ${dto.rfqId}`,
        supplierId: dto.senderRole === 'SUPPLIER' ? dto.senderId : 'supp-101',
        supplierName: dto.senderRole === 'SUPPLIER' ? dto.senderName : 'Titanium-Tech GmbH',
        buyerId: dto.senderRole === 'BUYER' ? dto.senderId : 'buyer-01',
        buyerName: dto.senderRole === 'BUYER' ? dto.senderName : 'InduCore Procurement Team',
        messages: [],
        status: 'ACTIVE',
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      if (threadRes.isFailure) return threadRes;
      thread = threadRes.getValue();
    }

    thread.appendMessage({
      senderId: dto.senderId,
      senderName: dto.senderName,
      senderRole: dto.senderRole,
      text: dto.text,
      attachments: dto.attachments,
      quoteReferenceId: dto.quoteReferenceId,
      priceQuoted: dto.priceQuoted,
    });

    await this.repository.saveRFQChatThread(thread);
    return Result.ok<RFQChatThreadAggregate>(thread);
  }

  public async getRFQChatThread(rfqId: string): Promise<RFQChatThreadAggregate | null> {
    return this.repository.getRFQChatThread(rfqId);
  }

  public async listRFQChatThreads(tenantId: string): Promise<RFQChatThreadAggregate[]> {
    return this.repository.listRFQChatThreads(tenantId);
  }

  public async createAnnouncement(tenantId: string, authorId: string, authorName: string, dto: CreateAnnouncementDTO): Promise<Result<AnnouncementAggregate>> {
    const annRes = AnnouncementAggregate.create({
      tenantId,
      authorId,
      authorName,
      title: dto.title,
      content: dto.content,
      category: dto.category,
      targetRoles: dto.targetRoles,
      isPinned: dto.isPinned,
      priority: dto.priority,
      acknowledgedUserIds: [authorId],
      expiresAt: dto.expiresAt,
      createdAt: new Date().toISOString(),
    });

    if (annRes.isFailure) return annRes;
    const ann = annRes.getValue();
    await this.repository.saveAnnouncement(ann);
    return Result.ok<AnnouncementAggregate>(ann);
  }

  public async acknowledgeAnnouncement(announcementId: string, userId: string): Promise<Result<AnnouncementAggregate>> {
    const ann = await this.repository.getAnnouncementById(announcementId);
    if (!ann) return Result.fail<AnnouncementAggregate>('Announcement not found');
    ann.acknowledge(userId);
    await this.repository.saveAnnouncement(ann);
    return Result.ok<AnnouncementAggregate>(ann);
  }

  public async listAnnouncements(tenantId: string): Promise<AnnouncementAggregate[]> {
    return this.repository.listAnnouncements(tenantId);
  }

  public async getPreferences(userId: string, tenantId: string): Promise<NotificationPreferencesAggregate> {
    let prefs = await this.repository.getPreferences(userId);
    if (!prefs) {
      const createdRes = NotificationPreferencesAggregate.create({
        userId,
        tenantId,
        userEmail: 'user@inducore.io',
        rfqUpdates: { email: true, sms: true, push: true, inApp: true },
        poStatus: { email: true, sms: false, push: true, inApp: true },
        contractApprovals: { email: true, sms: true, push: false, inApp: true },
        qualityAlerts: { email: true, sms: true, push: true, inApp: true },
        announcements: { email: true, sms: false, push: false, inApp: true },
        directMessages: { email: true, sms: true, push: true, inApp: true },
        digestFrequency: 'INSTANT',
        doNotDisturb: false,
        updatedAt: new Date().toISOString(),
      });
      prefs = createdRes.getValue();
      await this.repository.savePreferences(prefs);
    }
    return prefs;
  }

  public async updatePreferences(userId: string, tenantId: string, dto: UpdateNotificationPreferencesDTO): Promise<Result<NotificationPreferencesAggregate>> {
    const prefs = await this.getPreferences(userId, tenantId);
    prefs.updatePreferences(dto);
    await this.repository.savePreferences(prefs);
    return Result.ok<NotificationPreferencesAggregate>(prefs);
  }

  public async getAnalytics(tenantId: string) {
    return this.repository.getAnalytics(tenantId);
  }
}
