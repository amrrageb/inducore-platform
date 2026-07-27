import React, { useState } from 'react';
import { Header } from './components/Header';
import { RFQManagementView } from './components/RFQManagementView';
import { TelemetryView } from './components/TelemetryView';
import { AuditTrailView } from './components/AuditTrailView';
import { AIEvaluationModal } from './components/AIEvaluationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('rfqs');
  const [selectedRfqForAI, setSelectedRfqForAI] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rfqs' && (
          <RFQManagementView onOpenAIEvaluation={id => setSelectedRfqForAI(id)} />
        )}
        {activeTab === 'telemetry' && <TelemetryView />}
        {activeTab === 'audit' && <AuditTrailView />}
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
