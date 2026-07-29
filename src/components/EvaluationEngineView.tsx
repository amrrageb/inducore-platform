import React, { useState, useEffect } from 'react';
import { Button, Badge } from '@inducore/ui-kit';
import {
  Award,
  RotateCw,
  CheckCircle2,
  History,
  Percent,
  Sliders,
  UserCheck,
  Send,
  HelpCircle,
  TrendingUp,
  Plus,
} from 'lucide-react';

export interface EvaluatorScoreItem {
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: 'TECHNICAL_EXPERT' | 'COMMERCIAL_LEAD' | 'PROCUREMENT_DIRECTOR';
  technicalScore: number;
  commercialScore: number;
  comments: string;
  evaluatedAt: string;
}

export interface CriteriaBreakdownItem {
  key: string;
  name: string;
  weightPercentage: number;
  scoreOutOf100: number;
}

export interface ClarificationItem {
  id: string;
  requestedBy: string;
  question: string;
  supplierResponse?: string;
  requestedAt: string;
  respondedAt?: string;
}

export interface QuotationEvaluationItem {
  quotationId: string;
  supplierId: string;
  supplierName: string;
  rawTotalPrice: number;
  currency: string;
  normalizedPriceScore: number;
  technicalScoreConsensus: number;
  commercialScoreConsensus: number;
  weightedTotalScore: number;
  rank: number;
  evaluatorScores: EvaluatorScoreItem[];
  criteriaBreakdown: CriteriaBreakdownItem[];
  clarifications: ClarificationItem[];
  isRecommendedWinner: boolean;
}

export interface DecisionLogItem {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface EvaluationMatrixData {
  id: string;
  rfqId: string;
  rfqTitle: string;
  status: 'PENDING' | 'IN_EVALUATION' | 'CONSENSUS_REACHED' | 'APPROVED' | 'REJECTED';
  technicalWeight: number;
  commercialWeight: number;
  committeeMembers: string[];
  quotationEvaluations: QuotationEvaluationItem[];
  approvedBy?: string;
  approvalNotes?: string;
  decisionHistory: DecisionLogItem[];
  createdAt: string;
  updatedAt: string;
}

export const EvaluationEngineView: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationMatrixData[]>([]);
  const [selectedEval, setSelectedEval] = useState<EvaluationMatrixData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuotationEvaluationItem | null>(null);

  // Score Form
  const [scoreForm, setScoreForm] = useState({
    evaluatorName: 'Dr. Aris Thorne',
    evaluatorRole: 'TECHNICAL_EXPERT' as 'TECHNICAL_EXPERT' | 'COMMERCIAL_LEAD' | 'PROCUREMENT_DIRECTOR',
    technicalScore: 90,
    commercialScore: 85,
    comments: 'Evaluated specs and warranty terms.',
  });

  // Clarification Form
  const [clarificationForm, setClarificationForm] = useState({
    requestedBy: 'Dr. Aris Thorne (Tech Lead)',
    question: '',
  });

  // Supplier Response Form inside modal
  const [supplierResponseText, setSupplierResponseText] = useState<{ [clarId: string]: string }>({});

  // Approval Form
  const [approvalForm, setApprovalForm] = useState({
    approvedBy: 'Sarah Jenkins (Procurement Director)',
    approvalNotes: 'Approved based on superior technical score and compliant commercial terms.',
  });

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/v1/evaluations');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setEvaluations(data.data);
        const current = selectedEval
          ? data.data.find((e: EvaluationMatrixData) => e.id === selectedEval.id) || data.data[0]
          : data.data[0];
        setSelectedEval(current);
      }
    } catch (err) {
      console.error('Failed to fetch evaluation matrices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEval || !selectedQuote) return;

    try {
      const res = await fetch('/v1/evaluations/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId: selectedEval.id,
          quotationId: selectedQuote.quotationId,
          score: {
            evaluatorId: `eval-${scoreForm.evaluatorName.toLowerCase().replace(/\s+/g, '-')}`,
            evaluatorName: scoreForm.evaluatorName,
            evaluatorRole: scoreForm.evaluatorRole,
            technicalScore: Number(scoreForm.technicalScore),
            commercialScore: Number(scoreForm.commercialScore),
            comments: scoreForm.comments,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify(`Score recorded by ${scoreForm.evaluatorName}`);
        setShowScoreModal(false);
        fetchEvaluations();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error submitting score', err);
    }
  };

  const handleRequestClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEval || !selectedQuote) return;

    try {
      const res = await fetch('/v1/evaluations/clarifications/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId: selectedEval.id,
          quotationId: selectedQuote.quotationId,
          requestedBy: clarificationForm.requestedBy,
          question: clarificationForm.question,
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify('Clarification request dispatched to supplier');
        setShowClarificationModal(false);
        setClarificationForm({ ...clarificationForm, question: '' });
        fetchEvaluations();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error requesting clarification', err);
    }
  };

  const handleSupplierResponse = async (quotationId: string, clarificationId: string) => {
    const responseText = supplierResponseText[clarificationId];
    if (!selectedEval || !responseText) return;

    try {
      const res = await fetch('/v1/evaluations/clarifications/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId: selectedEval.id,
          quotationId,
          clarificationId,
          supplierResponse: responseText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify('Supplier clarification response recorded');
        fetchEvaluations();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error submitting supplier response', err);
    }
  };

  const handleApproveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEval) return;

    try {
      const res = await fetch('/v1/evaluations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId: selectedEval.id,
          approvedBy: approvalForm.approvedBy,
          approvalNotes: approvalForm.approvalNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify(`Evaluation approved by ${approvalForm.approvedBy}`);
        setShowApprovalModal(false);
        fetchEvaluations();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error approving evaluation', err);
    }
  };

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
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Quotation Evaluation & Sourcing Consensus Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weighted Multi-Criteria Evaluation, Price Normalization, Committee Scoring, Clarification Loops & Decision History.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {evaluations.length > 0 && (
            <select
              value={selectedEval?.id}
              onChange={e => {
                const found = evaluations.find(ev => ev.id === e.target.value);
                if (found) setSelectedEval(found);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {evaluations.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.rfqId}: {ev.rfqTitle}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchEvaluations}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          {selectedEval && selectedEval.status !== 'APPROVED' && (
            <Button onClick={() => setShowApprovalModal(true)} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700">
              <UserCheck className="w-4 h-4" />
              <span>Approve Winner Selection</span>
            </Button>
          )}
        </div>
      </div>

      {loading || !selectedEval ? (
        <div className="py-20 text-center text-slate-500">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Loading Sourcing Evaluation Matrix...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sourcing Summary Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">RFQ Sourcing Reference</span>
              <h2 className="text-base font-bold text-white mt-1 line-clamp-1">{selectedEval.rfqTitle}</h2>
              <span className="font-mono text-xs text-indigo-400 font-semibold">{selectedEval.rfqId}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weighting Model</span>
              <div className="flex items-center space-x-3 mt-2">
                <div className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Technical: {selectedEval.technicalWeight}%</span>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Commercial: {selectedEval.commercialWeight}%</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Evaluation Status</span>
              <div className="mt-2">
                <Badge
                  variant={
                    selectedEval.status === 'APPROVED'
                      ? 'success'
                      : selectedEval.status === 'IN_EVALUATION'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {selectedEval.status}
                </Badge>
                {selectedEval.approvedBy && (
                  <span className="text-[11px] text-slate-400 block mt-1">Approved by {selectedEval.approvedBy}</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Evaluation Committee</span>
              <div className="mt-1 space-y-0.5 text-xs text-slate-300 font-medium">
                {selectedEval.committeeMembers.map((m, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 truncate">
                    <UserCheck className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ranking & Multi-Criteria Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>Automated Ranking & Normalized Multi-Criteria Scores</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Price score normalized relative to lowest bid ($
                  {Math.min(...selectedEval.quotationEvaluations.map(q => q.rawTotalPrice)).toLocaleString()} = 100 pts)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedEval.quotationEvaluations.map(quote => (
                <div
                  key={quote.quotationId}
                  className={`border rounded-2xl p-5 space-y-4 shadow-sm transition-all ${
                    quote.isRecommendedWinner
                      ? 'border-indigo-500 bg-indigo-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl font-bold font-mono text-sm flex items-center justify-center shadow-xs ${
                          quote.rank === 1
                            ? 'bg-amber-500 text-white'
                            : quote.rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-amber-800/60 text-amber-100'
                        }`}
                      >
                        #{quote.rank}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">{quote.supplierName}</h3>
                        <span className="font-mono text-xs text-slate-500">
                          Raw Offer: {quote.currency} ${quote.rawTotalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Weighted Score</span>
                      <span className="text-xl font-mono font-bold text-indigo-600">
                        {quote.weightedTotalScore} <span className="text-xs text-slate-400">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Normalized Breakdown Bar */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">Technical Score</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${quote.technicalScoreConsensus}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800">{quote.technicalScoreConsensus} pts</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">Normalized Price Score</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${quote.normalizedPriceScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800">{quote.normalizedPriceScore} pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Criteria Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Multi-Criteria Breakdown
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {quote.criteriaBreakdown.map(crit => (
                        <div key={crit.key} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700 truncate">{crit.name}</span>
                            <span className="font-mono font-bold text-slate-900">{crit.scoreOutOf100}/100</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Weight: {crit.weightPercentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluator Scores & Comments */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Committee Scores ({quote.evaluatorScores.length})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedQuote(quote);
                          setShowScoreModal(true);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Evaluator Score</span>
                      </button>
                    </div>

                    {quote.evaluatorScores.map((ev, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{ev.evaluatorName} ({ev.evaluatorRole.replace('_', ' ')})</span>
                          <span className="font-mono text-indigo-600">Tech: {ev.technicalScore} | Comm: {ev.commercialScore}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] italic">{ev.comments}</p>
                      </div>
                    ))}
                  </div>

                  {/* Clarifications Thread */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Supplier Clarification Thread ({quote.clarifications.length})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedQuote(quote);
                          setShowClarificationModal(true);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Request Clarification</span>
                      </button>
                    </div>

                    {quote.clarifications.map(clar => (
                      <div key={clar.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs space-y-2">
                        <div>
                          <span className="font-bold text-slate-900 block">Q: {clar.question}</span>
                          <span className="text-[10px] text-slate-400">Asked by {clar.requestedBy}</span>
                        </div>

                        {clar.supplierResponse ? (
                          <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium">
                            <span className="font-bold text-indigo-600 block">Supplier Answer:</span>
                            {clar.supplierResponse}
                          </div>
                        ) : (
                          <div className="space-y-1 pt-1">
                            <input
                              type="text"
                              placeholder="Record supplier response to clarification..."
                              value={supplierResponseText[clar.id] || ''}
                              onChange={e =>
                                setSupplierResponseText({ ...supplierResponseText, [clar.id]: e.target.value })
                              }
                              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                            />
                            <button
                              onClick={() => handleSupplierResponse(quote.quotationId, clar.id)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 flex items-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit Supplier Answer</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Audit Log */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span>Sourcing Decision & Audit Trail</span>
            </h2>

            <div className="space-y-2">
              {selectedEval.decisionHistory.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-600">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-medium text-slate-800">{log.actor}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Evaluator Score Modal */}
      {showScoreModal && selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Submit Evaluator Score for {selectedQuote.supplierName}
            </h3>

            <form onSubmit={handleSubmitScore} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Evaluator Name</label>
                <input
                  type="text"
                  required
                  value={scoreForm.evaluatorName}
                  onChange={e => setScoreForm({ ...scoreForm, evaluatorName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Committee Role</label>
                <select
                  value={scoreForm.evaluatorRole}
                  onChange={e =>
                    setScoreForm({
                      ...scoreForm,
                      evaluatorRole: e.target.value as 'TECHNICAL_EXPERT' | 'COMMERCIAL_LEAD' | 'PROCUREMENT_DIRECTOR',
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="TECHNICAL_EXPERT">TECHNICAL_EXPERT</option>
                  <option value="COMMERCIAL_LEAD">COMMERCIAL_LEAD</option>
                  <option value="PROCUREMENT_DIRECTOR">PROCUREMENT_DIRECTOR</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Technical Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={scoreForm.technicalScore}
                    onChange={e => setScoreForm({ ...scoreForm, technicalScore: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Commercial Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={scoreForm.commercialScore}
                    onChange={e => setScoreForm({ ...scoreForm, commercialScore: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Evaluation Comments</label>
                <textarea
                  rows={3}
                  value={scoreForm.comments}
                  onChange={e => setScoreForm({ ...scoreForm, comments: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setShowScoreModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Score</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clarification Request Modal */}
      {showClarificationModal && selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Clarification Request for {selectedQuote.supplierName}
            </h3>

            <form onSubmit={handleRequestClarification} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Requested By</label>
                <input
                  type="text"
                  required
                  value={clarificationForm.requestedBy}
                  onChange={e => setClarificationForm({ ...clarificationForm, requestedBy: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clarification Question</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Please clarify warranty coverage for high temp environment..."
                  value={clarificationForm.question}
                  onChange={e => setClarificationForm({ ...clarificationForm, question: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setShowClarificationModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Send Question</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedEval && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Approve Sourcing Award Decision</h3>

            <form onSubmit={handleApproveEvaluation} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Approved By</label>
                <input
                  type="text"
                  required
                  value={approvalForm.approvedBy}
                  onChange={e => setApprovalForm({ ...approvalForm, approvedBy: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Approval Rationale & Justification</label>
                <textarea
                  required
                  rows={3}
                  value={approvalForm.approvalNotes}
                  onChange={e => setApprovalForm({ ...approvalForm, approvalNotes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Confirm Sourcing Award
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
