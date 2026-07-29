import React from 'react';
import { Globe, Building2, ShieldCheck, Cpu, Layers, Building, Package, Network, FileCheck2, Award, ShoppingBag, Boxes, Sparkles, MessageSquare, BarChart3, Shield } from 'lucide-react';

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
            onClick={() => setActiveTab('companies')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'companies' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Companies & Plants</span>
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'suppliers' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Suppliers & Catalogue</span>
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'network' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Relationship Network</span>
          </button>
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
            onClick={() => setActiveTab('quotations')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'quotations' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Quotations & Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'evaluation' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Evaluation Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('awards')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'awards' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Award & Contracts</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'orders' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Purchase Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'contracts' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <span>Contracts</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'performance' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Performance</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'inventory' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span>Inventory</span>
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
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'analytics' ? 'bg-indigo-900/80 text-white border border-indigo-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'admin' ? 'bg-indigo-900/80 text-white border border-indigo-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Administration</span>
          </button>
          <button
            onClick={() => setActiveTab('devops')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'devops' ? 'bg-emerald-900/80 text-white border border-emerald-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DevOps & Readiness</span>
          </button>
          <button
            onClick={() => setActiveTab('communication')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'communication' ? 'bg-indigo-900/80 text-white border border-indigo-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Communication Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'marketplace' ? 'bg-indigo-900/80 text-white border border-indigo-700' : 'text-indigo-400 hover:text-indigo-200'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Industrial Marketplace</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'ai-assistant' ? 'bg-indigo-900/80 text-white border border-indigo-700' : 'text-indigo-400 hover:text-indigo-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Assistant</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

