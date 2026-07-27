import React from 'react';
import { Building2, ShieldCheck, Cpu, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">InduCore</span>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              Enterprise v2.0
            </span>
          </div>
        </div>

        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('rfqs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'rfqs' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Procurement & RFQs</span>
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'telemetry' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Plant IoT Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'audit' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ISO Audit Trail</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
