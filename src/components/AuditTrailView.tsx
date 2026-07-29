import React from 'react';
import { Card } from '@inducore/ui-kit';
import { ShieldCheck } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const auditLogs = [
    { id: 'audit-1092', action: 'rfq.created', actor: 'usr_admin_default', tenant: 'tnt_1234567890ab', timestamp: '2026-07-27 08:30:11' },
    { id: 'audit-1093', action: 'bid.submitted', actor: 'sup_alpha_rep', tenant: 'tnt_1234567890ab', timestamp: '2026-07-27 08:45:22' },
    { id: 'audit-1094', action: 'ai.evaluation.completed', actor: 'system_gemini_worker', tenant: 'tnt_1234567890ab', timestamp: '2026-07-27 08:46:01' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">ISO Compliance & Immutable Audit Log</h2>
        <p className="text-xs text-slate-500 mt-1">Subdomain: <span className="font-semibold text-slate-700">Generic Governance & Audit Context</span></p>
      </div>

      <Card>
        <div className="divide-y divide-slate-100">
          {auditLogs.map(log => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-mono font-bold text-slate-900">{log.action}</span>
                  <p className="text-slate-400 text-[11px]">Actor: {log.actor} | Tenant: {log.tenant}</p>
                </div>
              </div>
              <span className="text-slate-400 font-mono">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
