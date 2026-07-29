import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Radio,
  Send,
  CheckCheck,
  Megaphone,
  Sliders,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Paperclip,
  Building2,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  category: 'RFQ_UPDATE' | 'PO_STATUS' | 'CONTRACT_APPROVAL' | 'QUALITY_ALERT' | 'ANNOUNCEMENT' | 'DIRECT_MESSAGE';
  subject: string;
  body: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  relatedEntityId?: string;
  relatedEntityType?: 'RFQ' | 'PO' | 'CONTRACT' | 'SUPPLIER' | 'ANNOUNCEMENT';
  createdAt: string;
  readAt?: string;
}

interface RFQChatThread {
  id: string;
  rfqId: string;
  rfqTitle: string;
  supplierId: string;
  supplierName: string;
  buyerId: string;
  buyerName: string;
  messageCount: number;
  status: string;
  lastActivityAt: string;
  latestMessage?: {
    messageId: string;
    senderId: string;
    senderName: string;
    senderRole: 'BUYER' | 'SUPPLIER' | 'SYSTEM';
    text: string;
    timestamp: string;
    attachments?: { fileName: string; fileUrl: string; fileSizeMb: number }[];
    quoteReferenceId?: string;
    priceQuoted?: number;
  };
}

interface ChatMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: 'BUYER' | 'SUPPLIER' | 'SYSTEM';
  text: string;
  timestamp: string;
  attachments?: { fileName: string; fileUrl: string; fileSizeMb: number }[];
  quoteReferenceId?: string;
  priceQuoted?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'MAINTENANCE' | 'QUALITY_MANDATE' | 'AUDIT_NOTICE' | 'PLATFORM_FEATURE' | 'GENERAL';
  targetRoles: string[];
  isPinned: boolean;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  acknowledgedCount: number;
  acknowledgedUserIds: string[];
  createdAt: string;
}

interface NotificationPreferences {
  userId: string;
  userEmail: string;
  userPhone?: string;
  rfqUpdates: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
  poStatus: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
  contractApprovals: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
  qualityAlerts: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
  announcements: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
  directMessages: { email: boolean; sms: boolean; push: boolean; inApp: boolean };
  digestFrequency: 'INSTANT' | 'DAILY_SUMMARY' | 'WEEKLY_DIGEST';
  doNotDisturb: boolean;
}

interface AnalyticsSummary {
  totalSent: number;
  emailDeliveryRate: number;
  smsDeliveryRate: number;
  pushDeliveryRate: number;
  unreadCount: number;
  channelBreakdown: Record<string, number>;
}

export const CommunicationPlatformView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'inbox' | 'rfq_chat' | 'supplier_messaging' | 'dispatcher' | 'announcements' | 'preferences'
  >('inbox');

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);

  // RFQ Chat State
  const [rfqThreads, setRfqThreads] = useState<RFQChatThread[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string>('RFQ-2026-8841');
  const [activeThreadMessages, setActiveThreadMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [chatPriceQuote, setChatPriceQuote] = useState<string>('');
  const [isLoadingThread, setIsLoadingThread] = useState<boolean>(false);

  // Supplier Messaging State
  const [supplierSearchQuery, setSupplierSearchQuery] = useState<string>('');

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<'MAINTENANCE' | 'QUALITY_MANDATE' | 'AUDIT_NOTICE' | 'PLATFORM_FEATURE' | 'GENERAL'>('QUALITY_MANDATE');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [isCreatingAnn, setIsCreatingAnn] = useState(false);

  // Dispatcher (Email, SMS, Push) State
  const [dispatchChannel, setDispatchChannel] = useState<'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'>('EMAIL');
  const [dispatchCategory, setDispatchCategory] = useState<'RFQ_UPDATE' | 'PO_STATUS' | 'CONTRACT_APPROVAL' | 'QUALITY_ALERT' | 'ANNOUNCEMENT' | 'DIRECT_MESSAGE'>('RFQ_UPDATE');
  const [dispatchRecipient, setDispatchRecipient] = useState('usr-current');
  const [dispatchSubject, setDispatchSubject] = useState('Critical Supplier Audit Alert: Action Required');
  const [dispatchBody, setDispatchBody] = useState('Your Q3 Quality Audit document submission is due within 5 business days.');
  const [dispatchPriority, setDispatchPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchRfqThreads();
    fetchAnnouncements();
    fetchPreferences();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (selectedRfqId) {
      fetchThreadDetails(selectedRfqId);
    }
  }, [selectedRfqId]);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await fetch('/v1/communication/notifications');
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const fetchRfqThreads = async () => {
    try {
      const res = await fetch('/v1/communication/rfq-chat');
      const data = await res.json();
      if (data.status === 'success') {
        setRfqThreads(data.data);
        if (data.data.length > 0 && !selectedRfqId) {
          setSelectedRfqId(data.data[0].rfqId);
        }
      }
    } catch (e) {
      console.error('Failed to fetch RFQ threads:', e);
    }
  };

  const fetchThreadDetails = async (rfqId: string) => {
    setIsLoadingThread(true);
    try {
      const res = await fetch(`/v1/communication/rfq-chat/${rfqId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setActiveThreadMessages(data.data.messages || []);
      }
    } catch (e) {
      console.error('Failed to fetch thread details:', e);
    } finally {
      setIsLoadingThread(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/v1/communication/announcements');
      const data = await res.json();
      if (data.status === 'success') {
        setAnnouncements(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch announcements:', e);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/v1/communication/preferences');
      const data = await res.json();
      if (data.status === 'success') {
        setPreferences(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch preferences:', e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/v1/communication/analytics');
      const data = await res.json();
      if (data.status === 'success') {
        setAnalytics(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/v1/communication/notifications/${id}/read`, { method: 'PATCH' });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n))
        );
        fetchAnalytics();
      }
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/v1/communication/notifications/read-all', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'READ', readAt: new Date().toISOString() })));
        fetchAnalytics();
      }
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInputText.trim()) return;
    try {
      const res = await fetch(`/v1/communication/rfq-chat/${selectedRfqId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'usr-buyer-01',
          senderName: 'Elena Rostova (Lead Buyer)',
          senderRole: 'BUYER',
          text: chatInputText,
          priceQuoted: chatPriceQuote ? Number(chatPriceQuote) : undefined,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setChatInputText('');
        setChatPriceQuote('');
        await fetchThreadDetails(selectedRfqId);
        await fetchRfqThreads();
      }
    } catch (e) {
      console.error('Failed to send chat message:', e);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    setIsCreatingAnn(true);
    try {
      const res = await fetch('/v1/communication/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAnnTitle,
          content: newAnnContent,
          category: newAnnCategory,
          targetRoles: ['BUYER', 'SUPPLIER', 'AUDITOR', 'ADMIN'],
          isPinned: true,
          priority: newAnnPriority,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNewAnnTitle('');
        setNewAnnContent('');
        await fetchAnnouncements();
      }
    } catch (e) {
      console.error('Failed to create announcement:', e);
    } finally {
      setIsCreatingAnn(false);
    }
  };

  const handleAcknowledgeAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/v1/communication/announcements/${id}/acknowledge`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        await fetchAnnouncements();
      }
    } catch (e) {
      console.error('Failed to acknowledge announcement:', e);
    }
  };

  const handleDispatchNotification = async () => {
    setIsDispatching(true);
    setDispatchSuccessMsg(null);
    try {
      const res = await fetch('/v1/communication/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: dispatchRecipient,
          channel: dispatchChannel,
          category: dispatchCategory,
          subject: dispatchSubject,
          body: dispatchBody,
          priority: dispatchPriority,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setDispatchSuccessMsg(`Successfully dispatched ${dispatchChannel} alert to ${dispatchRecipient}`);
        fetchNotifications();
        fetchAnalytics();
      }
    } catch (e) {
      console.error('Failed to dispatch message:', e);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setIsSavingPrefs(true);
    try {
      const res = await fetch('/v1/communication/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPreferences(data.data);
      }
    } catch (e) {
      console.error('Failed to save preferences:', e);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (unreadOnly && n.status === 'READ') return false;
    if (selectedChannelFilter !== 'ALL' && n.channel !== selectedChannelFilter) return false;
    if (selectedCategoryFilter !== 'ALL' && n.category !== selectedCategoryFilter) return false;
    return true;
  });

  const activeThread = rfqThreads.find(t => t.rfqId === selectedRfqId) || rfqThreads[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <MessageSquare className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Enterprise Communication Hub</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-Time Engine</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Unified Multi-Channel Dispatch (Email • SMS • Push • In-App) • RFQ Negotiation Chat • Supplier B2B Hub
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] uppercase text-indigo-300 font-semibold block">Unread Alerts</span>
              <span className="text-lg font-bold text-white">{analytics?.unreadCount ?? 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] uppercase text-indigo-300 font-semibold block">Email Delivery Rate</span>
              <span className="text-lg font-bold text-emerald-300">{analytics?.emailDeliveryRate ?? 98}%</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 border-t border-indigo-900/50 pt-4 overflow-x-auto">
          {[
            { id: 'inbox', label: 'In-App Notification Center', icon: Bell, badge: analytics?.unreadCount },
            { id: 'rfq_chat', label: 'RFQ Negotiation Chat', icon: MessageSquare, badge: rfqThreads.length },
            { id: 'supplier_messaging', label: 'Supplier B2B Hub', icon: Building2 },
            { id: 'dispatcher', label: 'Multi-Channel Dispatcher', icon: Radio },
            { id: 'announcements', label: 'Enterprise Announcements', icon: Megaphone, badge: announcements.length },
            { id: 'preferences', label: 'Notification Preferences', icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: In-App Notification Center */}
      {activeSubTab === 'inbox' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">Notification Inbox</h2>
              <span className="text-xs text-slate-500">({filteredNotifications.length} items)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedChannelFilter}
                onChange={e => setSelectedChannelFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Channels</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="PUSH">Push Alert</option>
                <option value="IN_APP">In-App</option>
              </select>

              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="RFQ_UPDATE">RFQ Updates</option>
                <option value="PO_STATUS">PO Status</option>
                <option value="CONTRACT_APPROVAL">Contract Approval</option>
                <option value="QUALITY_ALERT">Quality Alert</option>
                <option value="ANNOUNCEMENT">Announcements</option>
              </select>

              <button
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  unreadOnly
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Unread Only
              </button>

              <button
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mark All Read</span>
              </button>
            </div>
          </div>

          {/* List View */}
          <div className="space-y-3">
            {isLoadingNotifications ? (
              <div className="py-12 flex items-center justify-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">No notifications matching your filter criteria.</p>
              </div>
            ) : (
              filteredNotifications.map(notif => {
                const isUnread = notif.status !== 'READ';
                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isUnread
                        ? 'bg-indigo-50/40 border-indigo-200 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            notif.priority === 'URGENT' || notif.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {notif.channel === 'EMAIL' && <Mail className="w-4 h-4" />}
                          {notif.channel === 'SMS' && <Smartphone className="w-4 h-4" />}
                          {notif.channel === 'PUSH' && <Radio className="w-4 h-4" />}
                          {notif.channel === 'IN_APP' && <Bell className="w-4 h-4" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">{notif.subject}</span>
                            {isUnread && (
                              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-indigo-600 text-white rounded-full">
                                UNREAD
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-600 rounded">
                              {notif.channel}
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                              {notif.category.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{notif.body}</p>
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                            <span>Sender: {notif.senderName}</span>
                            <span>•</span>
                            <span>{new Date(notif.createdAt).toLocaleString()}</span>
                            {notif.relatedEntityId && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-indigo-600 font-semibold">{notif.relatedEntityId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-100/60 rounded-lg transition shrink-0"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RFQ Negotiation Chat */}
      {activeSubTab === 'rfq_chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread Selector Sidebar */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col h-[650px]">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Active RFQ Threads</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {rfqThreads.map(t => {
                const isSel = t.rfqId === selectedRfqId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedRfqId(t.rfqId)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all text-xs ${
                      isSel
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-medium shadow-2xs'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-900 truncate">{t.rfqTitle}</div>
                    <div className="text-[11px] text-indigo-700 font-mono mt-0.5">{t.rfqId}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>{t.supplierName}</span>
                      <span>{t.messageCount} msgs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{activeThread?.rfqTitle}</h3>
                <p className="text-xs text-slate-500">
                  Buyer: {activeThread?.buyerName} • Supplier: {activeThread?.supplierName}
                </p>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                THREAD ACTIVE
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingThread ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                activeThreadMessages.map((m, idx) => {
                  const isBuyer = m.senderRole === 'BUYER';
                  return (
                    <div
                      key={m.messageId || idx}
                      className={`flex items-start space-x-3 ${isBuyer ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                          isBuyer ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-indigo-300'
                        }`}
                      >
                        {isBuyer ? 'B' : 'S'}
                      </div>

                      <div
                        className={`max-w-xl rounded-2xl p-4 text-xs space-y-2 ${
                          isBuyer
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="font-semibold text-[11px] opacity-90">{m.senderName}</div>
                        <p className="leading-relaxed">{m.text}</p>

                        {m.priceQuoted && (
                          <div className={`p-2.5 rounded-xl border font-mono text-xs font-bold ${
                            isBuyer ? 'bg-indigo-700/60 border-indigo-400/40 text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          }`}>
                            Quoted Unit Price: €{m.priceQuoted.toFixed(2)} / PCS
                          </div>
                        )}

                        {m.attachments && m.attachments.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {m.attachments.map((att, aIdx) => (
                              <div
                                key={aIdx}
                                className={`p-2 rounded-lg text-[11px] flex items-center justify-between font-mono ${
                                  isBuyer ? 'bg-indigo-700 text-white' : 'bg-white border border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="flex items-center space-x-1.5 truncate">
                                  <Paperclip className="w-3.5 h-3.5" />
                                  <span>{att.fileName}</span>
                                </span>
                                <span>{att.fileSizeMb} MB</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className={`text-[10px] text-right ${isBuyer ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Quoted Price € (optional)"
                  value={chatPriceQuote}
                  onChange={e => setChatPriceQuote(e.target.value)}
                  className="w-44 text-xs border border-slate-300 rounded-xl px-3 py-2 font-mono"
                />
                <input
                  type="text"
                  placeholder="Type negotiation reply to supplier..."
                  value={chatInputText}
                  onChange={e => setChatInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInputText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Supplier B2B Hub */}
      {activeSubTab === 'supplier_messaging' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Direct B2B Supplier Directory & Messaging</h2>
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search supplier contact..."
                value={supplierSearchQuery}
                onChange={e => setSupplierSearchQuery(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'supp-1', name: 'Titanium-Tech GmbH', location: 'Stuttgart, Germany', contact: 'Dr. Markus Weber', status: 'Online', category: 'Raw Metals' },
              { id: 'supp-2', name: 'HydroFlow Pumps SE', location: 'Munich, Germany', contact: 'Ingrid Schneider', status: 'Active 10m ago', category: 'Hydraulics' },
              { id: 'supp-3', name: 'Apex Precision Corp', location: 'Zurich, Switzerland', contact: 'Hans Zimmermann', status: 'Offline', category: 'Fasteners' },
            ]
              .filter(s => s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()))
              .map(supp => (
                <div key={supp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">{supp.name}</h3>
                      <p className="text-[11px] text-slate-500">{supp.location}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                      {supp.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Contact: <span className="font-medium text-slate-900">{supp.contact}</span></div>
                    <div>Category: <span className="font-medium text-slate-900">{supp.category}</span></div>
                  </div>

                  <button
                    onClick={() => setActiveSubTab('rfq_chat')}
                    className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition flex items-center justify-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Messaging Thread</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Multi-Channel Dispatcher */}
      {activeSubTab === 'dispatcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-indigo-600" />
              <span>Multi-Channel Dispatcher Engine</span>
            </h2>

            {dispatchSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                {dispatchSuccessMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Channel</label>
                  <select
                    value={dispatchChannel}
                    onChange={e => setDispatchChannel(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-medium"
                  >
                    <option value="EMAIL">Email Delivery</option>
                    <option value="SMS">SMS Cellular Alert</option>
                    <option value="PUSH">Device Push Notification</option>
                    <option value="IN_APP">In-App Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={dispatchCategory}
                    onChange={e => setDispatchCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-medium"
                  >
                    <option value="RFQ_UPDATE">RFQ Update</option>
                    <option value="PO_STATUS">PO Status</option>
                    <option value="CONTRACT_APPROVAL">Contract Approval</option>
                    <option value="QUALITY_ALERT">Quality Alert</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Recipient ID / Email / Phone</label>
                <input
                  type="text"
                  value={dispatchRecipient}
                  onChange={e => setDispatchRecipient(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Subject / Header</label>
                <input
                  type="text"
                  value={dispatchSubject}
                  onChange={e => setDispatchSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Body Text</label>
                <textarea
                  rows={4}
                  value={dispatchBody}
                  onChange={e => setDispatchBody(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Priority</label>
                <select
                  value={dispatchPriority}
                  onChange={e => setDispatchPriority(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <button
                onClick={handleDispatchNotification}
                disabled={isDispatching}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow transition flex items-center justify-center space-x-2"
              >
                {isDispatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isDispatching ? 'Dispatching...' : `Dispatch ${dispatchChannel} Notification`}</span>
              </button>
            </div>
          </div>

          {/* Real-time Telemetry Stats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Delivery Telemetry & Channel Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block">Email Delivery Rate</span>
                <span className="text-xl font-bold text-slate-900">{analytics?.emailDeliveryRate}%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block">SMS Delivery Rate</span>
                <span className="text-xl font-bold text-slate-900">{analytics?.smsDeliveryRate}%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block">Push Delivery Rate</span>
                <span className="text-xl font-bold text-slate-900">{analytics?.pushDeliveryRate}%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block">Total Messages Sent</span>
                <span className="text-xl font-bold text-slate-900">{analytics?.totalSent}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Enterprise Announcements */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>Publish Enterprise Broadcast Announcement</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 ISO 9001 Quality Audit Schedule"
                  value={newAnnTitle}
                  onChange={e => setNewAnnTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Category</label>
                <select
                  value={newAnnCategory}
                  onChange={e => setNewAnnCategory(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="QUALITY_MANDATE">Quality Mandate</option>
                  <option value="AUDIT_NOTICE">Audit Notice</option>
                  <option value="MAINTENANCE">Platform Maintenance</option>
                  <option value="PLATFORM_FEATURE">Platform Feature</option>
                  <option value="GENERAL">General Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Priority</label>
                <select
                  value={newAnnPriority}
                  onChange={e => setNewAnnPriority(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-medium mb-1">Announcement Body Content</label>
              <textarea
                rows={3}
                placeholder="Details of mandatory quality standards or maintenance window..."
                value={newAnnContent}
                onChange={e => setNewAnnContent(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <button
              onClick={handleCreateAnnouncement}
              disabled={isCreatingAnn || !newAnnTitle.trim() || !newAnnContent.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow flex items-center space-x-2"
            >
              {isCreatingAnn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Publish Announcement</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map(ann => {
              const isAcked = ann.acknowledgedUserIds?.includes('usr-current');
              return (
                <div key={ann.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {ann.isPinned && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-100 text-amber-900 rounded">
                          PINNED
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-800 rounded">
                        {ann.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{ann.title}</h3>
                    </div>

                    <button
                      onClick={() => handleAcknowledgeAnnouncement(ann.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                        isAcked
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAcked ? 'Acknowledged' : 'Acknowledge Receipt'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Target Roles: {ann.targetRoles.join(', ')}</span>
                    <span>{ann.acknowledgedCount} user(s) acknowledged</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: Notification Preferences */}
      {activeSubTab === 'preferences' && preferences && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Notification Preferences Matrix</h2>
              <p className="text-xs text-slate-500">Customize notification channels per event category</p>
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={isSavingPrefs}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5"
            >
              {isSavingPrefs ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Preferences</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold">
                  <th className="p-3">Event Category</th>
                  <th className="p-3 text-center">Email</th>
                  <th className="p-3 text-center">SMS Alert</th>
                  <th className="p-3 text-center">Push Notification</th>
                  <th className="p-3 text-center">In-App Banner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { key: 'rfqUpdates', label: 'RFQ Updates & Bid Submissions' },
                  { key: 'poStatus', label: 'Purchase Order Dispatches' },
                  { key: 'contractApprovals', label: 'Contract Approval & Signatures' },
                  { key: 'qualityAlerts', label: 'Quality Non-Conformance Alerts' },
                  { key: 'announcements', label: 'Enterprise Announcements' },
                  { key: 'directMessages', label: 'Direct Messages' },
                ].map(item => {
                  const matrix = (preferences as any)[item.key];
                  return (
                    <tr key={item.key} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{item.label}</td>
                      {['email', 'sms', 'push', 'inApp'].map(ch => (
                        <td key={ch} className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={matrix?.[ch] ?? true}
                            onChange={e => {
                              const updated = {
                                ...preferences,
                                [item.key]: {
                                  ...matrix,
                                  [ch]: e.target.checked,
                                },
                              };
                              setPreferences(updated as any);
                            }}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
