import { describe, it, expect } from 'vitest';
import { CommunicationMessageAggregate } from './CommunicationMessageAggregate.js';
import { RFQChatThreadAggregate } from './RFQChatThreadAggregate.js';
import { AnnouncementAggregate } from './AnnouncementAggregate.js';
import { NotificationPreferencesAggregate } from './NotificationPreferencesAggregate.js';

describe('Communication Aggregates', () => {
  it('should create CommunicationMessageAggregate and handle markAsRead', () => {
    const res = CommunicationMessageAggregate.create({
      tenantId: 'tenant-101',
      senderId: 'usr-1',
      senderName: 'Chief Buyer',
      recipientId: 'usr-2',
      channel: 'EMAIL',
      category: 'RFQ_UPDATE',
      subject: 'RFQ-2026-8841 Amendment',
      body: 'Specification revised for titanium Grade 5.',
      status: 'DELIVERED',
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(res.isSuccess).toBe(true);
    const msg = res.getValue();
    expect(msg.subject).toBe('RFQ-2026-8841 Amendment');
    expect(msg.status).toBe('DELIVERED');

    msg.markAsRead();
    expect(msg.status).toBe('READ');
    expect(msg.readAt).toBeDefined();
  });

  it('should create RFQChatThreadAggregate and append chat messages', () => {
    const threadRes = RFQChatThreadAggregate.create({
      tenantId: 'tenant-101',
      rfqId: 'rfq-99',
      rfqTitle: 'Ti-6Al-4V Fasteners',
      supplierId: 'supp-101',
      supplierName: 'Titanium-Tech GmbH',
      buyerId: 'usr-1',
      buyerName: 'Senior Buyer',
      messages: [],
      status: 'ACTIVE',
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    expect(threadRes.isSuccess).toBe(true);
    const thread = threadRes.getValue();
    const appended = thread.appendMessage({
      senderId: 'usr-1',
      senderName: 'Senior Buyer',
      senderRole: 'BUYER',
      text: 'Can you match EUR 14.50 per unit?',
      priceQuoted: 14.5,
    });

    expect(appended.messageId).toBeDefined();
    expect(thread.messages.length).toBe(1);
  });

  it('should create AnnouncementAggregate and record user acknowledgments', () => {
    const annRes = AnnouncementAggregate.create({
      tenantId: 'tenant-101',
      authorId: 'admin-1',
      authorName: 'Compliance Director',
      title: 'ISO 9001:2015 Annual Audit Window',
      content: 'All certified suppliers must submit Q2 audit logs by Sept 30.',
      category: 'AUDIT_NOTICE',
      targetRoles: ['SUPPLIER', 'BUYER'],
      isPinned: true,
      priority: 'HIGH',
      acknowledgedUserIds: [],
      createdAt: new Date().toISOString(),
    });

    expect(annRes.isSuccess).toBe(true);
    const ann = annRes.getValue();
    expect(ann.acknowledge('user-777')).toBe(true);
    expect(ann.acknowledge('user-777')).toBe(false); // second time returns false
    expect(ann.acknowledgedUserIds).toContain('user-777');
  });

  it('should create and update NotificationPreferencesAggregate', () => {
    const prefRes = NotificationPreferencesAggregate.create({
      userId: 'usr-100',
      tenantId: 'tenant-101',
      userEmail: 'buyer@inducore.io',
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

    expect(prefRes.isSuccess).toBe(true);
    const pref = prefRes.getValue();
    pref.updatePreferences({ digestFrequency: 'DAILY_SUMMARY' });
    expect(pref.digestFrequency).toBe('DAILY_SUMMARY');
  });
});
