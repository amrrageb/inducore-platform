import React, { useState } from 'react';
import { Header } from './components/Header';
import { CompanyManagementView } from './components/CompanyManagementView';
import { SupplierCatalogueView } from './components/SupplierCatalogueView';
import { RelationshipNetworkView } from './components/RelationshipNetworkView';
import { RFQManagementView } from './components/RFQManagementView';
import { QuotationManagementView } from './components/QuotationManagementView';
import { EvaluationEngineView } from './components/EvaluationEngineView';
import { AwardManagementView } from './components/AwardManagementView';
import { PurchaseOrderView } from './components/PurchaseOrderView';
import { ContractManagementView } from './components/ContractManagementView';
import { SupplierPerformanceView } from './components/SupplierPerformanceView';
import { InventoryIntegrationView } from './components/InventoryIntegrationView';
import { TelemetryView } from './components/TelemetryView';
import { AuditTrailView } from './components/AuditTrailView';
import { IndustrialAIAssistantView } from './components/IndustrialAIAssistantView';
import { CommunicationPlatformView } from './components/CommunicationPlatformView';
import { AnalyticsView } from './components/AnalyticsView';
import { AdministrationView } from './components/AdministrationView';
import { ProductionReadinessView } from './components/ProductionReadinessView';
import { IndustrialMarketplaceView } from './components/IndustrialMarketplaceView';
import { AIEvaluationModal } from './components/AIEvaluationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [selectedRfqForAI, setSelectedRfqForAI] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'companies' && <CompanyManagementView />}
        {activeTab === 'suppliers' && <SupplierCatalogueView />}
        {activeTab === 'network' && <RelationshipNetworkView />}
        {activeTab === 'rfqs' && (
          <RFQManagementView onOpenAIEvaluation={id => setSelectedRfqForAI(id)} />
        )}
        {activeTab === 'quotations' && <QuotationManagementView />}
        {activeTab === 'evaluation' && <EvaluationEngineView />}
        {activeTab === 'awards' && <AwardManagementView />}
        {activeTab === 'orders' && <PurchaseOrderView />}
        {activeTab === 'contracts' && <ContractManagementView />}
        {activeTab === 'performance' && <SupplierPerformanceView />}
        {activeTab === 'inventory' && <InventoryIntegrationView />}
        {activeTab === 'telemetry' && <TelemetryView />}
        {activeTab === 'audit' && <AuditTrailView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'admin' && <AdministrationView />}
        {activeTab === 'devops' && <ProductionReadinessView />}
        {activeTab === 'marketplace' && <IndustrialMarketplaceView />}
        {activeTab === 'communication' && <CommunicationPlatformView />}
        {activeTab === 'ai-assistant' && <IndustrialAIAssistantView />}
      </main>


      {selectedRfqForAI && (
        <AIEvaluationModal
          rfqId={selectedRfqForAI}
          onClose={() => setSelectedRfqForAI(null)}
        />
      )}

      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          InduCore Enterprise Platform © 2026 | Built on Clean Architecture, DDD & Event-Driven Outbox Pattern.
        </div>
      </footer>
    </div>
  );
}
