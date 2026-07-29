import React, { useState, useEffect } from 'react';
import {
  Building2,
  Shield,
  CreditCard,
  Flag,
  UserCheck,
  FileText,
  Key,
  Webhook,
  Activity,
  Server,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  Play,
  Lock,
  Clock,
  Send,
} from 'lucide-react';

interface PlatformSettingsData {
  companyName: string;
  domainName: string;
  supportEmail: string;
  defaultCurrency: string;
  timezone: string;
  enforceSSO: boolean;
  requireMFA: boolean;
  passwordPolicyDays: number;
  subscription: {
    planType: string;
    maxUsers: number;
    maxRFQsPerMonth: number;
    aiRAGQuotaPerMonth: number;
    customSLAEnabled: boolean;
    renewalDate: string;
    billingStatus: string;
  };
  featureFlags: Array<{
    key: string;
    name: string;
    description: string;
    isEnabled: boolean;
  }>;
}

interface RoleData {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystemRole: boolean;
  permissions: string[];
  assignedUserCount: number;
}

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
}

interface WebhookData {
  id: string;
  name: string;
  targetUrl: string;
  subscribedEvents: string[];
  isActive: boolean;
  failedAttempts: number;
  lastTriggeredAt?: string;
  lastResponseCode?: number;
}

interface JobData {
  id: string;
  queueName: string;
  jobName: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  progressPercentage: number;
  durationMs?: number;
  errorMessage?: string;
  attempts: number;
  maxAttempts: number;
  payloadSummary: string;
  createdAt: string;
}

interface SystemHealthData {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  activeWorkers: number;
  queueBacklogCount: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  services: Array<{
    serviceName: string;
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    latencyMs: number;
    uptimePercent: number;
  }>;
}

interface AuditLogData {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export const AdministrationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'company' | 'subscription' | 'flags' | 'roles' | 'audit' | 'apikeys' | 'jobs' | 'health'
  >('company');

  const [settings, setSettings] = useState<PlatformSettingsData | null>(null);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form States
  const [companyForm, setCompanyForm] = useState({ companyName: '', supportEmail: '', timezone: 'America/New_York', defaultCurrency: 'USD' });
  const [securityForm, setSecurityForm] = useState({ enforceSSO: true, requireMFA: true, passwordPolicyDays: 90 });
  const [newKeyForm, setNewKeyForm] = useState({ name: '', scopes: ['rfq:read', 'inventory:read'] });
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);
  const [newWebhookForm, setNewWebhookForm] = useState({ name: '', targetUrl: '', subscribedEvents: ['rfq.created'] });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [settRes, rolesRes, keysRes, hooksRes, jobsRes, healthRes, auditRes] = await Promise.all([
        fetch('/v1/admin/settings').then(r => r.json()),
        fetch('/v1/admin/roles').then(r => r.json()),
        fetch('/v1/admin/api-keys').then(r => r.json()),
        fetch('/v1/admin/webhooks').then(r => r.json()),
        fetch('/v1/admin/background-jobs').then(r => r.json()),
        fetch('/v1/admin/health').then(r => r.json()),
        fetch('/v1/admin/audit-logs').then(r => r.json()),
      ]);

      if (settRes.status === 'success') {
        setSettings(settRes.data);
        setCompanyForm({
          companyName: settRes.data.companyName,
          supportEmail: settRes.data.supportEmail,
          timezone: settRes.data.timezone,
          defaultCurrency: settRes.data.defaultCurrency,
        });
        setSecurityForm({
          enforceSSO: settRes.data.enforceSSO,
          requireMFA: settRes.data.requireMFA,
          passwordPolicyDays: settRes.data.passwordPolicyDays,
        });
      }
      if (rolesRes.status === 'success') setRoles(rolesRes.data);
      if (keysRes.status === 'success') setApiKeys(keysRes.data);
      if (hooksRes.status === 'success') setWebhooks(hooksRes.data);
      if (jobsRes.status === 'success') setJobs(jobsRes.data);
      if (healthRes.status === 'success') setHealth(healthRes.data);
      if (auditRes.status === 'success') setAuditLogs(auditRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/admin/company-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });
      if (res.ok) {
        alert('Company settings updated successfully.');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSecurityPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/admin/security-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityForm),
      });
      if (res.ok) {
        alert('Security policy updated successfully.');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFlag = async (key: string) => {
    try {
      const res = await fetch(`/v1/admin/feature-flags/${key}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newKeyForm, expiresInDays: 90 }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCreatedKeySecret(data.data.rawSecret);
        setNewKeyForm({ name: '', scopes: ['rfq:read', 'inventory:read'] });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke and delete this API Key?')) return;
    try {
      await fetch(`/v1/admin/api-keys/${id}`, { method: 'DELETE' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhookForm),
      });
      if (res.ok) {
        setNewWebhookForm({ name: '', targetUrl: '', subscribedEvents: ['rfq.created'] });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const res = await fetch(`/v1/admin/webhooks/${id}/test`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Webhook tested');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook endpoint?')) return;
    try {
      await fetch(`/v1/admin/webhooks/${id}`, { method: 'DELETE' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryJob = async (id: string) => {
    try {
      const res = await fetch(`/v1/admin/background-jobs/${id}/retry`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Job requeued successfully.');
        fetchAdminData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="h-7 w-7 text-indigo-400" />
            Administration & Governance Control Plane
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise tenant security, sub-system integrations, background workers, and platform health telemetry.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Control Plane
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'company'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Company & Security
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'subscription'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Subscription & Quotas
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'flags'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Flag className="h-4 w-4" />
          Feature Flags
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'roles'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Roles & Permissions
        </button>

        <button
          onClick={() => setActiveTab('apikeys')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'apikeys'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Key className="h-4 w-4" />
          API Keys & Webhooks
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'audit'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          Audit Logs
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'jobs'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="h-4 w-4" />
          Background Jobs
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'health'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="h-4 w-4" />
          System Health
        </button>
      </div>

      {/* TAB 1: COMPANY & SECURITY */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-400" />
              Company Organization Profile
            </h3>
            <form onSubmit={handleSaveCompanyInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={companyForm.companyName}
                  onChange={e => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Support & Governance Email</label>
                <input
                  type="email"
                  value={companyForm.supportEmail}
                  onChange={e => setCompanyForm({ ...companyForm, supportEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Default Currency</label>
                  <select
                    value={companyForm.defaultCurrency}
                    onChange={e => setCompanyForm({ ...companyForm, defaultCurrency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={companyForm.timezone}
                    onChange={e => setCompanyForm({ ...companyForm, timezone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
              >
                Save Organization Profile
              </button>
            </form>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-400" />
              Security & Identity Policies
            </h3>
            <form onSubmit={handleSaveSecurityPolicy} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <p className="text-sm font-medium text-white">Enforce Enterprise Single Sign-On (SSO)</p>
                  <p className="text-xs text-slate-400">Require SAML 2.0 / OpenID Connect for all procurement staff.</p>
                </div>
                <input
                  type="checkbox"
                  checked={securityForm.enforceSSO}
                  onChange={e => setSecurityForm({ ...securityForm, enforceSSO: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <p className="text-sm font-medium text-white">Mandatory Multi-Factor Authentication (MFA)</p>
                  <p className="text-xs text-slate-400">Enforce TOTP authenticator app or hardware keys.</p>
                </div>
                <input
                  type="checkbox"
                  checked={securityForm.requireMFA}
                  onChange={e => setSecurityForm({ ...securityForm, requireMFA: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Password Rotation Policy (Days): {securityForm.passwordPolicyDays}
                </label>
                <input
                  type="range"
                  min="30"
                  max="365"
                  step="30"
                  value={securityForm.passwordPolicyDays}
                  onChange={e => setSecurityForm({ ...securityForm, passwordPolicyDays: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
              >
                Update Security Policies
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION PLANS & QUOTAS */}
      {activeTab === 'subscription' && settings && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {settings.subscription.planType}
              </span>
              <h2 className="text-xl font-bold text-white mt-2">Enterprise Heavy Industry License</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Billing Status:{' '}
                <span className="text-emerald-400 font-semibold">{settings.subscription.billingStatus}</span> | Next
                Renewal: {new Date(settings.subscription.renewalDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition">
                Manage Billing & Tier Upgrade
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-2">
              <p className="text-xs font-medium text-slate-400">Max Active User Licenses</p>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-white">168 / {settings.subscription.maxUsers}</span>
                <span className="text-xs text-slate-400">33.6% used</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '33.6%' }} />
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-2">
              <p className="text-xs font-medium text-slate-400">Monthly RFQ Quota</p>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-white">2,410 / {settings.subscription.maxRFQsPerMonth}</span>
                <span className="text-xs text-slate-400">24.1% used</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '24.1%' }} />
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-2">
              <p className="text-xs font-medium text-slate-400">Gemini AI RAG Vector Quota</p>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-white">18,500 / {settings.subscription.aiRAGQuotaPerMonth}</span>
                <span className="text-xs text-slate-400">37.0% used</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '37.0%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEATURE FLAGS */}
      {activeTab === 'flags' && settings && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-white">Platform Feature Toggles</h3>
              <p className="text-xs text-slate-400">Enable or disable sub-system capabilities instantly across the tenant.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {settings.featureFlags.map(flag => (
              <div key={flag.key} className="py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{flag.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">{flag.key}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{flag.description}</p>
                </div>
                <button
                  onClick={() => handleToggleFlag(flag.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    flag.isEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {flag.isEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-white">RBAC Roles & Authorization Matrices</h3>
              <p className="text-xs text-slate-400">Manage permission boundaries and user role assignments.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map(role => (
              <div key={role.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{role.name}</span>
                    {role.isSystemRole && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        SYSTEM
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-1">{role.code}</p>
                  <p className="text-xs text-slate-400 mt-2">{role.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map(perm => (
                      <span key={perm} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-indigo-300 border border-slate-800 font-mono">
                        {perm}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400">{role.assignedUserCount} Active Users</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: API KEYS & WEBHOOKS */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          {/* API Keys Panel */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-400" />
              API Secret Keys
            </h3>

            {createdKeySecret && (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-emerald-400">API Key Created Successfully! Save this token now:</p>
                <div className="p-2 bg-slate-950 rounded font-mono text-xs text-emerald-300 select-all border border-slate-800">
                  {createdKeySecret}
                </div>
                <button
                  onClick={() => setCreatedKeySecret(null)}
                  className="text-xs text-slate-400 underline hover:text-white"
                >
                  Dismiss Secret Banner
                </button>
              </div>
            )}

            <form onSubmit={handleCreateApiKey} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Key Description (e.g. SAP S/4HANA Sync)"
                value={newKeyForm.name}
                onChange={e => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Generate API Key
              </button>
            </form>

            <div className="divide-y divide-slate-800">
              {apiKeys.map(k => (
                <div key={k.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{k.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">{k.keyPrefix}_****</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {k.scopes.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-indigo-400 border border-slate-800 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteApiKey(k.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks Panel */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Webhook className="h-5 w-5 text-indigo-400" />
              Outgoing Event Webhook Subscriptions
            </h3>

            <form onSubmit={handleCreateWebhook} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Webhook Name (e.g. Slack Procurement Hook)"
                value={newWebhookForm.name}
                onChange={e => setNewWebhookForm({ ...newWebhookForm, name: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="url"
                placeholder="Target URL (https://...)"
                value={newWebhookForm.targetUrl}
                onChange={e => setNewWebhookForm({ ...newWebhookForm, targetUrl: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Webhook Target
              </button>
            </form>

            <div className="divide-y divide-slate-800">
              {webhooks.map(w => (
                <div key={w.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">{w.name}</span>
                    <p className="text-xs font-mono text-slate-400">{w.targetUrl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestWebhook(w.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1"
                    >
                      <Send className="h-3 w-3" /> Test Delivery
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(w.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-white">Immutable Administrative Audit Viewer</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-950/50">
                    <td className="py-3 px-4 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-white">{log.actor}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{log.action}</td>
                    <td className="py-3 px-4 text-slate-300">{log.target}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: BACKGROUND JOBS */}
      {activeTab === 'jobs' && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-white">Asynchronous Background Job Queues</h3>
          <div className="divide-y divide-slate-800">
            {jobs.map(j => (
              <div key={j.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{j.jobName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">{j.queueName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        j.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : j.status === 'RUNNING'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {j.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{j.payloadSummary}</p>
                  {j.errorMessage && <p className="text-xs text-red-400 font-mono">Error: {j.errorMessage}</p>}
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">
                    Attempts: {j.attempts}/{j.maxAttempts}
                  </span>
                  {j.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetryJob(j.id)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" /> Retry Job
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SYSTEM HEALTH */}
      {activeTab === 'health' && health && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Overall Platform Telemetry</p>
              <p className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5" /> {health.overallStatus}
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Worker Instances</p>
              <p className="text-lg font-bold text-white">{health.activeWorkers} Active</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">CPU Usage</p>
              <p className="text-lg font-bold text-white">{health.cpuUsagePercent}%</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Memory Usage</p>
              <p className="text-lg font-bold text-white">{health.memoryUsagePercent}%</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white">Sub-system Microservice Health</h3>
            <div className="divide-y divide-slate-800">
              {health.services.map(s => (
                <div key={s.serviceName} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-white">{s.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-400">{s.latencyMs} ms latency</span>
                    <span className="text-xs font-mono text-slate-400">{s.uptimePercent}% uptime</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
