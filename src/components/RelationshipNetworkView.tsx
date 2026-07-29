import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@inducore/ui-kit';
import {
  Network,
  Users,
  ShieldCheck,
  Star,
  Sparkles,
  Heart,
  CheckCircle2,
  Activity,
  Lightbulb,
  Share2,
  Mail,
  Phone,
  Search,
  RotateCw,
} from 'lucide-react';

interface NetworkConnection {
  id: string;
  companyId: string;
  companyName: string;
  supplierId: string;
  supplierName: string;
  direction: 'COMPANY_FOLLOWS_SUPPLIER' | 'SUPPLIER_FOLLOWS_COMPANY' | 'MUTUAL_PARTNER';
  status: 'PENDING' | 'CONNECTED' | 'BLOCKED';
  isFavorite: boolean;
  trustScore: number;
  isVerified: boolean;
  verifiedAt?: string;
  establishedAt: string;
}

interface SharedContact {
  id: string;
  companyId: string;
  supplierId: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  department: string;
  sharedAt: string;
}

interface NetworkActivity {
  id: string;
  actorType: 'COMPANY' | 'SUPPLIER';
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  activityType: string;
  details: string;
  timestamp: string;
}

interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  logoUrl: string;
  matchScorePercentage: number;
  reason: string;
  mutualConnectionsCount: number;
  categories: string[];
}

interface NetworkSummaryData {
  connections: NetworkConnection[];
  sharedContacts: SharedContact[];
  activities: NetworkActivity[];
  recommendations: SupplierRecommendation[];
  updatedAt: string;
}

export const RelationshipNetworkView: React.FC = () => {
  const [data, setData] = useState<NetworkSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connections' | 'recommendations' | 'contacts' | 'activity'>('connections');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MUTUAL' | 'FAVORITES' | 'VERIFIED'>('ALL');

  // Shared Contact Modal State
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    supplierId: 'sup-siemens-01',
    companyId: 'comp-apex-01',
    fullName: '',
    title: '',
    email: '',
    phone: '',
    department: 'Procurement Engineering',
  });

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/v1/network/summary');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch network summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleFollowSupplier = async (supplierId: string, supplierName: string) => {
    try {
      const res = await fetch('/v1/network/follow-supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'comp-apex-01',
          companyName: 'Apex Industrial Systems',
          supplierId,
          supplierName,
        }),
      });
      const result = await res.json();
      if (result.success) {
        notify(`You are now following ${supplierName}`);
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to follow supplier', err);
    }
  };

  const handleToggleFavorite = async (connId: string) => {
    try {
      const res = await fetch(`/v1/network/connections/${connId}/favorite`, { method: 'PATCH' });
      const result = await res.json();
      if (result.success) {
        notify('Favorite status updated');
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleVerifyConnection = async (connId: string) => {
    try {
      const res = await fetch(`/v1/network/connections/${connId}/verify`, { method: 'PATCH' });
      const result = await res.json();
      if (result.success) {
        notify('Connection verified & trust score boosted!');
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to verify connection', err);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/network/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const result = await res.json();
      if (result.success) {
        notify(`Shared contact ${contactForm.fullName} saved`);
        setShowAddContact(false);
        setContactForm({
          supplierId: 'sup-siemens-01',
          companyId: 'comp-apex-01',
          fullName: '',
          title: '',
          email: '',
          phone: '',
          department: 'Procurement Engineering',
        });
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to add contact', err);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Sparkles className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
        <p className="text-xs font-semibold">Loading Industrial Relationship Network...</p>
      </div>
    );
  }

  // Filter connections
  const filteredConnections = data.connections.filter(c => {
    const matchesSearch =
      c.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'MUTUAL') return c.direction === 'MUTUAL_PARTNER';
    if (filterType === 'FAVORITES') return c.isFavorite;
    if (filterType === 'VERIFIED') return c.isVerified;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-indigo-500/30 flex items-center space-x-2 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Network className="w-6 h-6 text-indigo-600" />
            <span>Industrial Relationship Network</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise company-to-supplier network, mutual partnerships, trust scores, verification, and shared procurement contacts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button label="+ Share Contact" onClick={() => setShowAddContact(true)} />
          <button
            onClick={fetchSummary}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* High-Level Network Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Connections</span>
            <span className="text-lg font-bold text-slate-900">{data.connections.length} Partners</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Trust Score</span>
            <span className="text-lg font-bold text-slate-900">
              {Math.round(data.connections.reduce((acc, c) => acc + c.trustScore, 0) / (data.connections.length || 1))}/100
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Favorites</span>
            <span className="text-lg font-bold text-slate-900">
              {data.connections.filter(c => c.isFavorite).length} Preferred Vendors
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Shared Contacts</span>
            <span className="text-lg font-bold text-slate-900">{data.sharedContacts.length} Key Contacts</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
            activeTab === 'connections' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Active Connections ({data.connections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
            activeTab === 'recommendations' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>AI Recommendations ({data.recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
            activeTab === 'contacts' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Shared Contacts Directory ({data.sharedContacts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
            activeTab === 'activity' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Feed ({data.activities.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Connections Matrix */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          {/* Sub-toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none"
              />
            </div>

            <div className="flex space-x-1">
              {(['ALL', 'MUTUAL', 'FAVORITES', 'VERIFIED'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg font-semibold ${
                    filterType === type ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConnections.map(conn => (
              <div
                key={conn.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900">{conn.supplierName}</h3>
                      <button onClick={() => handleToggleFavorite(conn.id)}>
                        <Heart
                          className={`w-4 h-4 ${
                            conn.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Connected to {conn.companyName}</p>
                  </div>

                  <Badge variant={conn.direction === 'MUTUAL_PARTNER' ? 'success' : 'info'}>
                    {conn.direction.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Trust Score Gauge & Verification */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Trust Score Rating</span>
                    </span>
                    <span className="font-bold text-slate-900">{conn.trustScore} / 100</span>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${conn.trustScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <span>
                      {conn.isVerified ? (
                        <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ISO & Compliance Verified</span>
                        </span>
                      ) : (
                        <span className="text-amber-600">Pending Verification</span>
                      )}
                    </span>

                    {!conn.isVerified && (
                      <button
                        onClick={() => handleVerifyConnection(conn.id)}
                        className="text-indigo-600 hover:underline font-bold"
                      >
                        Verify Now (+10 Score)
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                  <span>Established: {new Date(conn.establishedAt).toLocaleDateString()}</span>
                  <span className="font-mono text-[10px] text-slate-500">ID: {conn.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Recommendations */}
      {activeTab === 'recommendations' && (
        <Card title="AI-Matched Industrial Supplier Recommendations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.recommendations.map(rec => (
              <div key={rec.supplierId} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-600">{rec.supplierCode}</span>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      {rec.matchScorePercentage}% AI Match
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{rec.supplierName}</h3>
                  <p className="text-xs text-slate-600 italic">"{rec.reason}"</p>

                  <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Mutual Network Partners:</span>
                      <span className="font-bold text-slate-800">{rec.mutualConnectionsCount} Vendors</span>
                    </div>
                  </div>
                </div>

                <Button
                  label="Follow & Connect"
                  onClick={() => handleFollowSupplier(rec.supplierId, rec.supplierName)}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Shared Contacts */}
      {activeTab === 'contacts' && (
        <Card title="Shared Procurement & OEM Technical Contacts">
          <div className="space-y-3">
            {data.sharedContacts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No shared contacts registered yet.</p>
            ) : (
              data.sharedContacts.map(cnt => (
                <div key={cnt.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {cnt.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{cnt.fullName}</h4>
                      <p className="text-slate-500">{cnt.title} • {cnt.department}</p>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5 text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{cnt.email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{cnt.phone}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 4: Activity Feed */}
      {activeTab === 'activity' && (
        <Card title="Network Event & Trust Audit Feed">
          <div className="space-y-3">
            {data.activities.map(act => (
              <div key={act.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3 text-xs">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg mt-0.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{act.actorName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Share Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Share Procurement Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={contactForm.fullName}
                  onChange={e => setContactForm({ ...contactForm, fullName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Supply Chain Officer"
                  value={contactForm.title}
                  onChange={e => setContactForm({ ...contactForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="elena@company.com"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 555 0192"
                    value={contactForm.phone}
                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowAddContact(false)} />
                <Button label="Save Contact" onClick={handleAddContact} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
