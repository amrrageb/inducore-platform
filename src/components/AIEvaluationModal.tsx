import React, { useState } from 'react';
import { Button, Badge } from '@inducore/ui-kit';
import { Sparkles } from 'lucide-react';

interface AIEvaluationModalProps {
  rfqId: string;
  onClose: () => void;
}

export const AIEvaluationModal: React.FC<AIEvaluationModalProps> = ({ rfqId, onClose }) => {
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<any[] | null>([
    {
      supplierId: 'sup-alpha-industrial',
      supplierName: 'Alpha Industrial Seals & Gaskets',
      score: 94,
      amount: '$14,200',
      leadTime: '5 Days',
      reasoning: 'ISO 9001 certified. Price is 8% below target threshold with verified 5-day lead time for emergency hydro-seal line.'
    },
    {
      supplierId: 'sup-apex-machining',
      supplierName: 'Apex Machining Works',
      score: 81,
      amount: '$15,800',
      leadTime: '12 Days',
      reasoning: 'Higher unit cost and longer lead time (12 days) exceeds standard maintenance window requirement.'
    }
  ]);

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`/v1/rfqs/${rfqId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': 'tnt_1234567890ab' }
      });
      const data = await res.json();
      if (data.data) {
        setResults(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gemini AI Bid Evaluation Matrix</h3>
              <p className="text-xs text-slate-500">Service: <code className="text-slate-700 font-mono">GeminiAIService (@google/genai)</code></p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="space-y-4 my-4">
          {results?.map((res, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">{res.supplierName || res.supplierId}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={res.score >= 90 ? 'success' : 'warning'}>Score: {res.score}/100</Badge>
                  <span className="text-xs font-bold text-slate-700">{res.amount || '$14,200'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{res.reasoning}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">Evaluates price competitiveness, lead time, and compliance ratings.</p>
          <Button onClick={handleRunEvaluation} disabled={evaluating} size="sm" className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{evaluating ? 'Running Gemini AI...' : 'Re-Run AI Evaluation'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
