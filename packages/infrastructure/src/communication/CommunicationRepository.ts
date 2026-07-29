import {
  CommunicationMessageAggregate,
  RFQChatThreadAggregate,
  AnnouncementAggregate,
  NotificationPreferencesAggregate,
} from '@inducore/core-domain';
import { ICommunicationRepository, MessageFilter } from '@inducore/application';

export class CommunicationRepository implements ICommunicationRepository {
  private messages: Map<string, CommunicationMessageAggregate> = new Map();
  private rfqThreads: Map<string, RFQChatThreadAggregate> = new Map();
  private announcements: Map<string, AnnouncementAggregate> = new Map();
  private preferences: Map<string, NotificationPreferencesAggregate> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    const now = new Date().toISOString();
    const past1h = new Date(Date.now() - 3600000).toISOString();
    const past1d = new Date(Date.now() - 86400000).toISOString();
    const past2d = new Date(Date.now() - 172800000).toISOString();

    // 1. Seed In-App & Multi-channel Messages
    const msg1 = CommunicationMessageAggregate.create(
      {
        tenantId: 'tenant-inducore-01',
        senderId: 'usr-buyer-01',
        senderName: 'Elena Rostova (Lead Buyer)',
        recipientId: 'usr-current',
        recipientEmail: 'buyer@inducore.io',
        recipientPhone: '+49 171 555 0192',
        channel: 'EMAIL',
        category: 'RFQ_UPDATE',
        subject: 'Quotation Received: RFQ-2026-8841 Titanium Alloy Fasteners',
        body: 'Titanium-Tech GmbH has submitted a formal bid of EUR 14.50/unit for 2,500 Ti-6Al-4V Grade 5 fasteners. Review tender details in the RFQ tab.',
        status: 'DELIVERED',
        priority: 'HIGH',
        relatedEntityId: 'RFQ-2026-8841',
        relatedEntityType: 'RFQ',
        createdAt: past1h,
        updatedAt: past1h,
      },
      'msg-seed-1'
    ).getValue();

    const msg2 = CommunicationMessageAggregate.create(
      {
        tenantId: 'tenant-inducore-01',
        senderId: 'sys-quality',
        senderName: 'InduCore Quality Gate Sentinel',
        recipientId: 'usr-current',
        recipientEmail: 'quality@inducore.io',
        recipientPhone: '+49 171 555 0192',
        channel: 'SMS',
        category: 'QUALITY_ALERT',
        subject: '[URGENT SMS] Non-Conformance Incident NCR-2026-042 Flagged',
        body: 'ALERT: Defect rate spike (140 PPM) detected in Batch #44109 from Apex Precision. Automated hold issued.',
        status: 'DELIVERED',
        priority: 'URGENT',
        relatedEntityId: 'NCR-2026-042',
        relatedEntityType: 'SUPPLIER',
        createdAt: past1d,
        updatedAt: past1d,
      },
      'msg-seed-2'
    ).getValue();

    const msg3 = CommunicationMessageAggregate.create(
      {
        tenantId: 'tenant-inducore-01',
        senderId: 'sys-contract',
        senderName: 'Legal & Compliance Automation',
        recipientId: 'usr-current',
        recipientEmail: 'legal@inducore.io',
        channel: 'PUSH',
        category: 'CONTRACT_APPROVAL',
        subject: 'Contract Signature Required: CNT-2026-091',
        body: 'Master Services Agreement with HydroFlow Pumps SE is ready for executive e-signature.',
        status: 'SENT',
        priority: 'NORMAL',
        relatedEntityId: 'CNT-2026-091',
        relatedEntityType: 'CONTRACT',
        createdAt: past2d,
        updatedAt: past2d,
      },
      'msg-seed-3'
    ).getValue();

    const msg4 = CommunicationMessageAggregate.create(
      {
        tenantId: 'tenant-inducore-01',
        senderId: 'sys-po',
        senderName: 'ERP Dispatcher',
        recipientId: 'usr-current',
        recipientEmail: 'logistics@inducore.io',
        channel: 'IN_APP',
        category: 'PO_STATUS',
        subject: 'PO-2026-5540 Dispatched to Supplier',
        body: 'Purchase Order #5540 for 500 Hydraulic Servo Valves confirmed by HydroFlow Pumps.',
        status: 'DELIVERED',
        priority: 'NORMAL',
        relatedEntityId: 'PO-2026-5540',
        relatedEntityType: 'PO',
        createdAt: past1h,
        updatedAt: past1h,
      },
      'msg-seed-4'
    ).getValue();

    this.saveMessage(msg1);
    this.saveMessage(msg2);
    this.saveMessage(msg3);
    this.saveMessage(msg4);

    // 2. Seed RFQ Chat Threads
    const thread1 = RFQChatThreadAggregate.create(
      {
        tenantId: 'tenant-inducore-01',
        rfqId: 'RFQ-2026-8841',
        rfqTitle: 'Ti-6Al-4V Grade 5 Aerospace Titanium Sheet & Fasteners',
        supplierId: 'supp-titanium-tech',
        supplierName: 'Titanium-Tech GmbH (Stuttgart)',
        buyerId: 'usr-buyer-01',
        buyerName: 'Elena Rostova (InduCore Lead Buyer)',
        status: 'ACTIVE',
        lastActivityAt: past1h,
        createdAt: past2d,
        messages: [
          {
            messageId: 'chat-1',
            senderId: 'usr-buyer-01',
            senderName: 'Elena Rostova',
            senderRole: 'BUYER',
            text: 'Hello Team Titanium-Tech, we reviewed your initial bid of €15.20 per unit. Can you verify if EN 10204 3.1 chemical test certs are included at this price?',
            timestamp: past2d,
          },
          {
            messageId: 'chat-2',
            senderId: 'supp-titanium-tech',
            senderName: 'Dr. Markus Weber (Sales Director)',
            senderRole: 'SUPPLIER',
            text: 'Good afternoon Elena. Yes, EN 10204 3.1 mill test certificates are standard for all our AS9100D aerospace Grade 5 titanium lots. If you commit to 2,500 units, we can drop price to €14.50/unit.',
            timestamp: past1d,
            attachments: [
              {
                fileName: 'Ti6Al4V_Grade5_MillCert_Sample.pdf',
                fileUrl: '#',
                fileSizeMb: 1.8,
              },
            ],
            quoteReferenceId: 'QUOTE-TT-8841-A',
            priceQuoted: 14.5,
          },
          {
            messageId: 'chat-3',
            senderId: 'usr-buyer-01',
            senderName: 'Elena Rostova',
            senderRole: 'BUYER',
            text: 'Appreciated Markus! We accept €14.50/unit for 2,500 PCS with lead time delivery by Sept 15, 2026 to Plant DE-01.',
            timestamp: past1h,
          },
        ],
      },
      'thread-rfq-8841'
    ).getValue();

    const thread2 = RFQChatThreadAggregate.create(
      {
        tenantId: 'tenant-inducore-01',
        rfqId: 'RFQ-2026-9012',
        rfqTitle: 'High-Pressure Hydraulic Servo Pumps (350 Bar)',
        supplierId: 'supp-hydroflow',
        supplierName: 'HydroFlow Pumps SE (Munich)',
        buyerId: 'usr-buyer-01',
        buyerName: 'Elena Rostova (InduCore Lead Buyer)',
        status: 'ACTIVE',
        lastActivityAt: past1d,
        createdAt: past2d,
        messages: [
          {
            messageId: 'chat-201',
            senderId: 'supp-hydroflow',
            senderName: 'Ingrid Schneider',
            senderRole: 'SUPPLIER',
            text: 'Regarding RFQ-2026-9012: We have 40 units of 350 bar ISO 4401 pumps in stock ready for immediate delivery. Price per unit is €2,400.',
            timestamp: past2d,
          },
          {
            messageId: 'chat-202',
            senderId: 'usr-buyer-01',
            senderName: 'Elena Rostova',
            senderRole: 'BUYER',
            text: 'Thank you Ingrid. Please confirm warranty terms—we require 24-month OEM warranty for severe-duty hydraulic service.',
            timestamp: past1d,
          },
        ],
      },
      'thread-rfq-9012'
    ).getValue();

    this.saveRFQChatThread(thread1);
    this.saveRFQChatThread(thread2);

    // 3. Seed Enterprise Announcements
    const ann1 = AnnouncementAggregate.create(
      {
        tenantId: 'tenant-inducore-01',
        authorId: 'usr-audit-dir',
        authorName: 'Dr. Gerhard Vance (Global Quality Director)',
        title: 'Mandatory ISO 9001:2015 & AS9100D Recertification Audit Schedule',
        content: 'All Tier-1 and Tier-2 suppliers in the EMEA network must upload updated calibration logs and material mill certs into the Audit Trail module prior to Sept 30, 2026.',
        category: 'AUDIT_NOTICE',
        targetRoles: ['BUYER', 'SUPPLIER', 'AUDITOR', 'ADMIN'],
        isPinned: true,
        priority: 'HIGH',
        acknowledgedUserIds: ['usr-audit-dir'],
        createdAt: past2d,
      },
      'ann-1'
    ).getValue();

    const ann2 = AnnouncementAggregate.create(
      {
        tenantId: 'tenant-inducore-01',
        authorId: 'usr-sys-admin',
        authorName: 'InduCore Infrastructure Team',
        title: 'Platform Maintenance & ERP Gateway Synchronization Window',
        content: 'Scheduled maintenance for SAP S/4HANA & Dynamics 365 EDI sync on Saturday August 2, 2026 between 02:00 - 04:00 UTC.',
        category: 'MAINTENANCE',
        targetRoles: ['BUYER', 'SUPPLIER', 'ADMIN'],
        isPinned: false,
        priority: 'NORMAL',
        acknowledgedUserIds: [],
        createdAt: past1d,
      },
      'ann-2'
    ).getValue();

    this.saveAnnouncement(ann1);
    this.saveAnnouncement(ann2);

    // 4. Seed User Preferences
    const pref = NotificationPreferencesAggregate.create(
      {
        userId: 'usr-current',
        tenantId: 'tenant-inducore-01',
        userEmail: 'buyer@inducore.io',
        userPhone: '+49 171 555 0192',
        rfqUpdates: { email: true, sms: false, push: true, inApp: true },
        poStatus: { email: true, sms: true, push: true, inApp: true },
        contractApprovals: { email: true, sms: true, push: true, inApp: true },
        qualityAlerts: { email: true, sms: true, push: true, inApp: true },
        announcements: { email: true, sms: false, push: false, inApp: true },
        directMessages: { email: true, sms: true, push: true, inApp: true },
        digestFrequency: 'INSTANT',
        doNotDisturb: false,
        updatedAt: now,
      },
      'usr-current'
    ).getValue();

    this.savePreferences(pref);
  }

  public async saveMessage(message: CommunicationMessageAggregate): Promise<void> {
    this.messages.set(message.id, message);
  }

  public async getMessageById(id: string): Promise<CommunicationMessageAggregate | null> {
    return this.messages.get(id) || null;
  }

  public async findMessages(filter: MessageFilter): Promise<CommunicationMessageAggregate[]> {
    let list = Array.from(this.messages.values());

    if (filter.recipientId) {
      list = list.filter(m => m.recipientId === filter.recipientId || filter.recipientId === 'usr-current');
    }
    if (filter.channel) {
      list = list.filter(m => m.channel === filter.channel);
    }
    if (filter.category) {
      list = list.filter(m => m.category === filter.category);
    }
    if (filter.status) {
      list = list.filter(m => m.status === filter.status);
    }
    if (filter.relatedEntityId) {
      list = list.filter(m => m.relatedEntityId === filter.relatedEntityId);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markAllAsRead(recipientId: string): Promise<number> {
    let count = 0;
    for (const msg of this.messages.values()) {
      if (msg.recipientId === recipientId || recipientId === 'usr-current') {
        if (msg.status !== 'READ') {
          msg.markAsRead();
          count++;
        }
      }
    }
    return count;
  }

  public async saveRFQChatThread(thread: RFQChatThreadAggregate): Promise<void> {
    this.rfqThreads.set(thread.rfqId, thread);
  }

  public async getRFQChatThread(rfqId: string): Promise<RFQChatThreadAggregate | null> {
    return this.rfqThreads.get(rfqId) || null;
  }

  public async listRFQChatThreads(_tenantId: string): Promise<RFQChatThreadAggregate[]> {
    return Array.from(this.rfqThreads.values()).sort(
      (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
  }

  public async saveAnnouncement(announcement: AnnouncementAggregate): Promise<void> {
    this.announcements.set(announcement.id, announcement);
  }

  public async getAnnouncementById(id: string): Promise<AnnouncementAggregate | null> {
    return this.announcements.get(id) || null;
  }

  public async listAnnouncements(_tenantId: string): Promise<AnnouncementAggregate[]> {
    return Array.from(this.announcements.values()).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public async savePreferences(prefs: NotificationPreferencesAggregate): Promise<void> {
    this.preferences.set(prefs.userId, prefs);
  }

  public async getPreferences(userId: string): Promise<NotificationPreferencesAggregate | null> {
    return this.preferences.get(userId) || null;
  }

  public async getAnalytics(_tenantId: string) {
    const msgs = Array.from(this.messages.values());
    const emailMsgs = msgs.filter(m => m.channel === 'EMAIL');
    const smsMsgs = msgs.filter(m => m.channel === 'SMS');
    const pushMsgs = msgs.filter(m => m.channel === 'PUSH');
    const inAppMsgs = msgs.filter(m => m.channel === 'IN_APP');

    const emailDelivered = emailMsgs.filter(m => m.status === 'DELIVERED' || m.status === 'READ').length;
    const smsDelivered = smsMsgs.filter(m => m.status === 'DELIVERED' || m.status === 'READ').length;
    const pushDelivered = pushMsgs.filter(m => m.status === 'DELIVERED' || m.status === 'READ' || m.status === 'SENT').length;

    const unreadCount = msgs.filter(m => m.status !== 'READ').length;

    return {
      totalSent: msgs.length,
      emailDeliveryRate: emailMsgs.length > 0 ? Math.round((emailDelivered / emailMsgs.length) * 100) : 98,
      smsDeliveryRate: smsMsgs.length > 0 ? Math.round((smsDelivered / smsMsgs.length) * 100) : 99,
      pushDeliveryRate: pushMsgs.length > 0 ? Math.round((pushDelivered / pushMsgs.length) * 100) : 96,
      unreadCount,
      channelBreakdown: {
        EMAIL: emailMsgs.length,
        SMS: smsMsgs.length,
        PUSH: pushMsgs.length,
        IN_APP: inAppMsgs.length,
      },
    };
  }
}
