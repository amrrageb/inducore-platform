import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@inducore/ui-kit';
import {
  GitBranch,
  Factory,
  Users,
  Settings,
  ShieldCheck,
  Plus,
  Mail,
  CreditCard,
  Globe,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';


interface CompanyData {
  id: string;
  name: string;
  code: string;
  taxId?: string;
  logoUrl: string;
  settings: {
    timezone: string;
    defaultCurrency: string;
    requireTwoFactorAuth: boolean;
    maxUsersAllowed: number;
    allowExternalSuppliers: boolean;
    securityPolicy: 'STANDARD' | 'STRICT' | 'FEDRAMP_COMPLIANT';
  };
  subscription: {
    plan: 'FREE' | 'PRO' | 'ENTERPRISE';
    status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'TRIAL';
    expiresAt: string;
    maxPlants: number;
    customDomainEnabled: boolean;
    supportLevel: 'STANDARD' | 'PREMIUM' | 'DEDICATED_24_7';
  };
  branches: Array<{
    id: string;
    name: string;
    code: string;
    city: string;
    country: string;
    isHeadquarters: boolean;
  }>;
  plants: Array<{
    id: string;
    branchId: string;
    name: string;
    code: string;
    location: string;
    operationalCapacityPercentage: number;
  }>;
  departments: Array<{
    id: string;
    plantId?: string;
    branchId?: string;
    name: string;
    code: string;
  }>;
  teams: Array<{
    id: string;
    departmentId: string;
    name: string;
    leadUserId?: string;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
    departmentId?: string;
    token: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
    createdAt: string;
  }>;
  userAssignments: Array<{
    id: string;
    userId: string;
    email: string;
    fullName: string;
    role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
    branchId?: string;
    plantId?: string;
    departmentId?: string;
    teamId?: string;
    status: 'ACTIVE' | 'INACTIVE';
    assignedAt: string;
  }>;
}

export const CompanyManagementView: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'hierarchy' | 'users' | 'settings' | 'subscription'>('hierarchy');
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Form Modals / Inputs
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', code: '', city: '', country: '', isHeadquarters: false });

  const [showAddPlant, setShowAddPlant] = useState(false);
  const [plantForm, setPlantForm] = useState({ branchId: '', name: '', code: '', location: '', capacity: 95 });

  const [showAddDept, setShowAddDept] = useState(false);
  const [deptForm, setDeptForm] = useState({ plantId: '', name: '', code: '' });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'MANAGER' as const, departmentId: '' });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: '',
    email: '',
    fullName: '',
    role: 'MANAGER' as const,
    branchId: '',
    plantId: '',
    departmentId: '',
    teamId: '',
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/v1/companies');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCompanies(data.data);
        if (!selectedCompanyId) {
          setSelectedCompanyId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    const res = await fetch(`/v1/companies/${selectedCompany.id}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchForm),
    });
    const data = await res.json();
    if (data.success) {
      notify(`Branch "${branchForm.name}" created successfully`);
      setShowAddBranch(false);
      setBranchForm({ name: '', code: '', city: '', country: '', isHeadquarters: false });
      fetchCompanies();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    const res = await fetch(`/v1/companies/${selectedCompany.id}/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: plantForm.branchId || selectedCompany.branches[0]?.id || '',
        name: plantForm.name,
        code: plantForm.code,
        location: plantForm.location,
        operationalCapacityPercentage: Number(plantForm.capacity),
      }),
    });
    const data = await res.json();
    if (data.success) {
      notify(`Plant "${plantForm.name}" added successfully`);
      setShowAddPlant(false);
      setPlantForm({ branchId: '', name: '', code: '', location: '', capacity: 95 });
      fetchCompanies();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    const res = await fetch(`/v1/companies/${selectedCompany.id}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plantId: deptForm.plantId || undefined,
        name: deptForm.name,
        code: deptForm.code,
      }),
    });
    const data = await res.json();
    if (data.success) {
      notify(`Department "${deptForm.name}" added successfully`);
      setShowAddDept(false);
      setDeptForm({ plantId: '', name: '', code: '' });
      fetchCompanies();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    const res = await fetch(`/v1/companies/${selectedCompany.id}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteForm.email,
        role: inviteForm.role,
        departmentId: inviteForm.departmentId || undefined,
        invitedByUserId: 'usr-admin',
      }),
    });
    const data = await res.json();
    if (data.success) {
      notify(`Invitation sent to ${inviteForm.email}`);
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'MANAGER', departmentId: '' });
      fetchCompanies();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    const userId = assignForm.userId || `usr-${Date.now().toString().slice(-4)}`;
    const res = await fetch(`/v1/companies/${selectedCompany.id}/users/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email: assignForm.email,
        fullName: assignForm.fullName,
        role: assignForm.role,
        branchId: assignForm.branchId || undefined,
        plantId: assignForm.plantId || undefined,
        departmentId: assignForm.departmentId || undefined,
        teamId: assignForm.teamId || undefined,
        status: 'ACTIVE',
      }),
    });
    const data = await res.json();
    if (data.success) {
      notify(`User ${assignForm.fullName} assigned to ${selectedCompany.name}`);
      setShowAssignModal(false);
      setAssignForm({
        userId: '',
        email: '',
        fullName: '',
        role: 'MANAGER',
        branchId: '',
        plantId: '',
        departmentId: '',
        teamId: '',
      });
      fetchCompanies();
    } else {
      notify(`Error: ${data.error}`);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
        Loading Company Management workspace...
      </div>
    );
  }

  if (!selectedCompany) {
    return <div className="py-8 text-center text-slate-500">No company data found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-500/30 flex items-center space-x-2 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner & Company Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={selectedCompany.logoUrl}
            alt={selectedCompany.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">{selectedCompany.name}</h1>
              <Badge variant="success">{selectedCompany.subscription.plan} Plan</Badge>
              <Badge variant="neutral">{selectedCompany.code}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
              <span>Tax ID: {selectedCompany.taxId || 'N/A'}</span>
              <span>•</span>
              <span>HQ: {selectedCompany.branches.find(b => b.isHeadquarters)?.city || 'Global'}</span>
              <span>•</span>
              <span>{selectedCompany.branches.length} Branches, {selectedCompany.plants.length} Plants</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedCompanyId}
            onChange={e => setSelectedCompanyId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <Button
            label="New Branch"
            onClick={() => setShowAddBranch(true)}
          />
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('hierarchy')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'hierarchy'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Hierarchy & Facilities</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'users'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Assignments ({selectedCompany.userAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'settings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Company Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subscription')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeSubTab === 'subscription'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription & Limits</span>
        </button>
      </div>

      {/* Tab 1: Hierarchy & Facilities */}
      {activeSubTab === 'hierarchy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Branches Column */}
          <Card title="Branches">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-500 font-medium">{selectedCompany.branches.length} Registered</span>
              <button
                onClick={() => setShowAddBranch(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </button>
            </div>
            <div className="space-y-3">
              {selectedCompany.branches.map(b => (
                <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{b.name}</span>
                    {b.isHeadquarters && <Badge variant="info">HQ</Badge>}
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{b.city}, {b.country}</span>
                    <span className="ml-2 font-mono text-slate-400">[{b.code}]</span>
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Plants Column */}
          <Card title="Manufacturing Plants">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-500 font-medium">
                {selectedCompany.plants.length} / {selectedCompany.subscription.maxPlants} Max
              </span>
              <button
                onClick={() => setShowAddPlant(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plant</span>
              </button>
            </div>
            <div className="space-y-3">
              {selectedCompany.plants.map(p => (
                <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Factory className="w-3.5 h-3.5 text-slate-600" />
                      <span>{p.name}</span>
                    </span>
                    <Badge variant="success">{p.operationalCapacityPercentage}% Cap</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">{p.location}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Departments & Teams Column */}
          <Card title="Departments & Teams">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-500 font-medium">{selectedCompany.departments.length} Departments</span>
              <button
                onClick={() => setShowAddDept(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
            </div>
            <div className="space-y-3">
              {selectedCompany.departments.map(d => {
                const deptTeams = selectedCompany.teams.filter(t => t.departmentId === d.id);
                return (
                  <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{d.name}</span>
                      <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded">{d.code}</span>
                    </div>
                    {deptTeams.length > 0 && (
                      <div className="mt-2 space-y-1 pl-2 border-l-2 border-slate-300">
                        {deptTeams.map(t => (
                          <div key={t.id} className="text-[11px] text-slate-600 font-medium flex items-center justify-between">
                            <span>• {t.name}</span>
                            <span className="text-[10px] text-slate-400">Lead: {t.leadUserId || 'Unassigned'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: User Assignments & Invitations */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Assigned Company Members</h2>
            <div className="flex space-x-2">
              <Button label="Send Invitation" onClick={() => setShowInviteModal(true)} />
              <Button label="Assign User" onClick={() => setShowAssignModal(true)} />
            </div>
          </div>

          <Card title="Active User Assignments">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department / Team</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedCompany.userAssignments.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={u.role === 'OWNER' ? 'success' : u.role === 'ADMIN' ? 'info' : 'neutral'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {selectedCompany.departments.find(d => d.id === u.departmentId)?.name || 'Company Wide'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>{u.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {new Date(u.assignedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pending Invitations */}
          <Card title="Pending Company Invitations">
            <div className="space-y-2">
              {selectedCompany.invitations.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No active pending invitations.</p>
              ) : (
                selectedCompany.invitations.map(inv => (
                  <div key={inv.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="font-bold text-slate-800">{inv.email}</span>
                        <span className="ml-2 text-[11px] text-slate-500">Role: {inv.role}</span>
                      </div>
                    </div>
                    <Badge variant="warning">{inv.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Company Settings */}
      {activeSubTab === 'settings' && (
        <Card title="Company Policy & Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Timezone</label>
                <input
                  type="text"
                  readOnly
                  value={selectedCompany.settings.timezone}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base Currency</label>
                <input
                  type="text"
                  readOnly
                  value={selectedCompany.settings.defaultCurrency}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Security Policy Level</label>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-bold flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{selectedCompany.settings.securityPolicy}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Two-Factor Authentication (2FA)</label>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-800">
                  {selectedCompany.settings.requireTwoFactorAuth ? 'Enforced across all company accounts' : 'Optional'}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">External Supplier Access</label>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-800">
                  {selectedCompany.settings.allowExternalSuppliers ? 'Allowed for RFQs and Bid Submissions' : 'Restricted'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Subscription Metadata */}
      {activeSubTab === 'subscription' && (
        <Card title="Subscription Plan & Platform Entitlements">
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <div className="text-lg font-bold flex items-center space-x-2">
                  <span>{selectedCompany.subscription.plan} Tier</span>
                  <Badge variant="success">{selectedCompany.subscription.status}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Support Level: <span className="text-emerald-400 font-semibold">{selectedCompany.subscription.supportLevel}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Renews / Expires At</span>
                <span className="font-mono text-sm font-bold text-white">
                  {new Date(selectedCompany.subscription.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Max Plants Allowed</span>
                <span className="text-lg font-bold text-slate-900">{selectedCompany.subscription.maxPlants}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Max Users Allowed</span>
                <span className="text-lg font-bold text-slate-900">{selectedCompany.settings.maxUsersAllowed}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Custom Domain</span>
                <span className="text-sm font-bold text-slate-900 flex items-center space-x-1 mt-1">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>{selectedCompany.subscription.customDomainEnabled ? 'Enabled' : 'Disabled'}</span>
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add Branch Modal */}
      {showAddBranch && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Branch</h3>
            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asia Pacific Regional Office"
                  value={branchForm.name}
                  onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Branch Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APAC-SGP"
                  value={branchForm.code}
                  onChange={e => setBranchForm({ ...branchForm, code: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Singapore"
                    value={branchForm.city}
                    onChange={e => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    placeholder="Singapore"
                    value={branchForm.country}
                    onChange={e => setBranchForm({ ...branchForm, country: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="hqCheck"
                  checked={branchForm.isHeadquarters}
                  onChange={e => setBranchForm({ ...branchForm, isHeadquarters: e.target.checked })}
                />
                <label htmlFor="hqCheck" className="text-slate-700 font-medium">Designate as Corporate Headquarters</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowAddBranch(false)} />
                <Button label="Create Branch" onClick={handleCreateBranch} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Plant Modal */}
      {showAddPlant && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Manufacturing Plant</h3>
            <form onSubmit={handleCreatePlant} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Branch</label>
                <select
                  value={plantForm.branchId}
                  onChange={e => setPlantForm({ ...plantForm, branchId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  {selectedCompany.branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Plant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Texas Turbine Assembly Plant"
                  value={plantForm.name}
                  onChange={e => setPlantForm({ ...plantForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Plant Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PLANT-TX-04"
                  value={plantForm.code}
                  onChange={e => setPlantForm({ ...plantForm, code: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Physical Location Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 Industrial Pkwy, Houston, TX"
                  value={plantForm.location}
                  onChange={e => setPlantForm({ ...plantForm, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowAddPlant(false)} />
                <Button label="Add Plant" onClick={handleCreatePlant} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDept && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Department</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Engineering"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DEPT-ELEC"
                  value={deptForm.code}
                  onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowAddDept(false)} />
                <Button label="Add Department" onClick={handleCreateDepartment} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Send Company Member Invitation</h3>
            <form onSubmit={handleSendInvitation} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Recipient Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="engineer@company.com"
                  value={inviteForm.email}
                  onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={inviteForm.role}
                  onChange={e => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowInviteModal(false)} />
                <Button label="Send Invitation" onClick={handleSendInvitation} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Assign User to Company</h3>
            <form onSubmit={handleAssignUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={assignForm.fullName}
                  onChange={e => setAssignForm({ ...assignForm, fullName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex.johnson@inducore.io"
                  value={assignForm.email}
                  onChange={e => setAssignForm({ ...assignForm, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Company Role</label>
                <select
                  value={assignForm.role}
                  onChange={e => setAssignForm({ ...assignForm, role: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button label="Cancel" onClick={() => setShowAssignModal(false)} />
                <Button label="Assign User" onClick={handleAssignUser} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
