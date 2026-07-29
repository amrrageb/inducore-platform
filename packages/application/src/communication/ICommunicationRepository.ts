import {
  CommunicationMessageAggregate,
  RFQChatThreadAggregate,
  AnnouncementAggregate,
  NotificationPreferencesAggregate,
  NotificationCategory,
  NotificationChannel,
} from '@inducore/core-domain';

export interface MessageFilter {
  tenantId?: string;
  recipientId?: string;
  channel?: NotificationChannel;
  category?: NotificationCategory;
  status?: string;
  relatedEntityId?: string;
}

export interface ICommunicationRepository {
  // Notifications & Messages
  saveMessage(message: CommunicationMessageAggregate): Promise<void>;
  getMessageById(id: string): Promise<CommunicationMessageAggregate | null>;
  findMessages(filter: MessageFilter): Promise<CommunicationMessageAggregate[]>;
  markAllAsRead(recipientId: string): Promise<number>;

  // RFQ Chat Threads
  saveRFQChatThread(thread: RFQChatThreadAggregate): Promise<void>;
  getRFQChatThread(rfqId: string): Promise<RFQChatThreadAggregate | null>;
  listRFQChatThreads(tenantId: string): Promise<RFQChatThreadAggregate[]>;

  // Announcements
  saveAnnouncement(announcement: AnnouncementAggregate): Promise<void>;
  getAnnouncementById(id: string): Promise<AnnouncementAggregate | null>;
  listAnnouncements(tenantId: string): Promise<AnnouncementAggregate[]>;

  // Preferences
  savePreferences(prefs: NotificationPreferencesAggregate): Promise<void>;
  getPreferences(userId: string): Promise<NotificationPreferencesAggregate | null>;

  // Communication Analytics
  getAnalytics(tenantId: string): Promise<{
    totalSent: number;
    emailDeliveryRate: number;
    smsDeliveryRate: number;
    pushDeliveryRate: number;
    unreadCount: number;
    channelBreakdown: Record<string, number>;
  }>;
}
