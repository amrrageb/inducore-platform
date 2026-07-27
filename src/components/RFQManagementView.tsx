import React, { useState } from 'react';
import { Button, Card, Badge } from '@inducore/ui-kit';
import { Plus, Sparkles, FileText, CheckCircle2, Clock, Send } from 'lucide-react';

interface RFQManagementViewProps {
  onOpenAIEvaluation: (rfqId: string) => void;
}

export const RFQManagementView: React.FC<RFQManagementViewProps> = ({ onOpenAIEvaluation }) => {
  const [rfqs, setRfqs] = useState([
    {
      id: 'rfq-8841-a9',
      title: 'High-Temp Hydrocarbon Pump Seal Replacement (Line B)',
      status: 'PUBLISHED',
      lineItems: 4,
      bidsCount: 3,
      createdAt: '2026-07-27 08:30',
    },
    {
      id: 'rfq-7712-b3',
      title: 'Turbine Vibration Sensor Calibration & Spare Cable Harness',
      status: 'EVALUATING',
      lineItems: 2,
      bidsCount: 2,
      createdAt: '2026-07-26 14:15',
    }
  ]);

  const [showNewRfqModal, setShowNewRfqModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const newRfq = {
      id: `rfq-${Math.floor(1000 + Math.random() * 9000)}-x1`,
      title,
      status: 'PUBLISHED',
      lineItems: 3,
      bidsCount: 0,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setRfqs([newRfq, ...rfqs]);
    setTitle('');
    setDescription('');
    setShowNewRfqModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">RFQ Procurement Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Domain: <span className="font-semibold text-slate-700">Procurement Bounded Context</span> | RLS Tenant Isolation Active
          </p>
        </div>
        <Button onClick={() => setShowNewRfqModal(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create New RFQ</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rfqs.map(rfq => (
          <Card key={rfq.id} title={rfq.title} subtitle={`ID: ${rfq.id} | Created: ${rfq.createdAt}`}>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <Badge variant={rfq.status === 'PUBLISHED' ? 'success' : 'warning'}>
                  {rfq.status}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">
                  {rfq.bidsCount} Bids Received
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenAIEvaluation(rfq.id)}
                className="flex items-center space-x-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Evaluate Bids with AI</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showNewRfqModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Issue New Procurement RFQ</h3>
            <p className="text-xs text-slate-500 mb-4">Executes <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">CreateRFQUseCase</code></p>
            <form onSubmit={handleCreateRfq} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">RFQ Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Line C Centrifugal Valve Actuators"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Specify operating pressure, ISO certifications required, and max lead time..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNewRfqModal(false)}>Cancel</Button>
                <Button type="submit">Publish RFQ</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
