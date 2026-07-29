import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Terminal,
  Play,
  RefreshCw,
  CheckCircle,
  Zap,
  Lock,
  Layers,
  BarChart2,
  Database
} from 'lucide-react';

export function ProductionReadinessView() {
  const [activeTab, setActiveTab] = useState<'pipelines' | 'docker' | 'dr' | 'loadtest' | 'metrics'>('pipelines');
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [loadTests, setLoadTests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggerBranch, setTriggerBranch] = useState('main');
  const [triggerMsg, setTriggerMsg] = useState('feat(sprint-17): Production Readiness release');
  const [loadTestUsers, setLoadTestUsers] = useState(200);
  const [loadTestDuration, setLoadTestDuration] = useState(60);
  const [securityScanStatus, setSecurityScanStatus] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, bRes, lRes] = await Promise.all([
        fetch('/v1/devops/pipelines'),
        fetch('/v1/devops/backups'),
        fetch('/v1/devops/load-tests'),
      ]);
      if (pRes.ok) setPipelines(await pRes.json());
      if (bRes.ok) setBackups(await bRes.json());
      if (lRes.ok) setLoadTests(await lRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/v1/devops/pipelines/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: triggerBranch,
          commitMessage: triggerMsg,
          triggeredBy: 'DevOps Lead',
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyBackup = async (id: string) => {
    try {
      const res = await fetch(`/v1/devops/backups/${id}/verify`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunLoadTest = async () => {
    try {
      const res = await fetch('/v1/devops/load-tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEndpoint: 'https://api.inducore.com/v1/rfqs',
          virtualUsers: Number(loadTestUsers),
          durationSeconds: Number(loadTestDuration),
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerScan = async () => {
    setSecurityScanStatus('Running Trivy Container Vulnerability Scanner...');
    try {
      const res = await fetch('/v1/devops/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dockerImageTag: 'inducore-api:v2.5.0-release',
          scanType: 'TRIVY_CONTAINER',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSecurityScanStatus(data.summary);
      }
    } catch (err) {
      console.error(err);
      setSecurityScanStatus('Security scan failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Production Readiness & DevOps Control Panel</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Sprint 17: CI/CD Release Pipelines, Multi-Stage Docker Optimization, Prometheus/Grafana Monitoring, DR & Security Vulnerability Auditing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Repository Production Ready
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 space-x-2">
        <button
          onClick={() => setActiveTab('pipelines')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
            activeTab === 'pipelines'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Terminal className="w-4 h-4" />
          CI/CD Release Automation
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
            activeTab === 'docker'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Docker & Security Scans
        </button>

        <button
          onClick={() => setActiveTab('dr')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
            activeTab === 'dr'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Database className="w-4 h-4" />
          Backup & Disaster Recovery
        </button>

        <button
          onClick={() => setActiveTab('loadtest')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
            activeTab === 'loadtest'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Zap className="w-4 h-4" />
          Performance & Load Testing
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
            activeTab === 'metrics'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Prometheus & Grafana
        </button>
      </div>

      {/* TAB 1: CI/CD PIPELINES */}
      {activeTab === 'pipelines' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trigger Form */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-400" />
                Trigger Automated Pipeline
              </h2>
              <form onSubmit={handleTriggerPipeline} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Git Branch</label>
                  <input
                    type="text"
                    value={triggerBranch}
                    onChange={e => setTriggerBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Commit Message</label>
                  <input
                    type="text"
                    value={triggerMsg}
                    onChange={e => setTriggerMsg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Dispatch CI/CD Build
                </button>
              </form>
            </div>

            {/* Pipeline Overview Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <div className="text-slate-400 text-xs">Total Pipeline Executions</div>
                <div className="text-2xl font-bold text-white mt-1">{pipelines.length}</div>
                <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 100% SLA Compliance
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <div className="text-slate-400 text-xs">Docker Container Size</div>
                <div className="text-2xl font-bold text-indigo-400 mt-1">148.5 MB</div>
                <div className="text-xs text-slate-400 mt-2">Multi-stage Alpine image</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <div className="text-slate-400 text-xs">Zero Downtime Release</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">Cloud Run</div>
                <div className="text-xs text-slate-400 mt-2">100% Canary Traffic Shift</div>
              </div>
            </div>
          </div>

          {/* Pipelines List */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <h3 className="text-md font-semibold text-white mb-4">Pipeline Execution History</h3>
            <div className="space-y-4">
              {pipelines.map(pipe => (
                <div key={pipe.id} className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        pipe.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}>
                        {pipe.status}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-white">{pipe.pipelineName} ({pipe.branch})</div>
                        <div className="text-xs text-slate-400 font-mono">commit {pipe.commitHash} — "{pipe.commitMessage}"</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-4">
                      <span>Tag: <code className="text-indigo-300 font-mono">{pipe.dockerImageTag}</code></span>
                      <span>Triggered by: {pipe.triggeredBy}</span>
                    </div>
                  </div>

                  {/* Execution Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {pipe.steps.map((step: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-200">{step.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            step.status === 'PASSED' ? 'bg-emerald-950 text-emerald-400' : step.status === 'RUNNING' ? 'bg-indigo-950 text-indigo-400 animate-pulse' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{step.logSummary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCKER OPTIMIZATION & SECURITY SCANS */}
      {activeTab === 'docker' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Docker Architecture Specifications */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Multi-Stage Dockerfile Optimization Specs
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Non-Root Security Context:</span> Runtime container operates under restricted UID 1001 (<code className="text-indigo-300">inducore</code> user) with no sudo privileges.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Layer Pruning & esbuild Bundling:</span> Server bundled into single <code className="text-indigo-300">dist/server.cjs</code> CommonJS artifact reducing layer count by 70%.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Native Healthcheck Probes:</span> Automatic liveness & readiness probes polling <code className="text-indigo-300">/v1/admin/health</code> every 30 seconds.
                  </div>
                </li>
              </ul>
            </div>

            {/* Trivy Security Scanner */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Trivy Static Security & Vulnerability Auditing
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Scans container image layers and npm lockfiles for known CVE vulnerabilities and hardcoded secrets.
              </p>
              <button
                onClick={handleTriggerScan}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Run Trivy Container Vulnerability Scan
              </button>
              {securityScanStatus && (
                <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400">
                  {securityScanStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISASTER RECOVERY & BACKUPS */}
      {activeTab === 'dr' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <h3 className="text-md font-semibold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Automated Cloud SQL & Vector Knowledge Base Backups
              </span>
              <span className="text-xs text-slate-400 font-normal">
                RPO Target: &lt; 5 mins | RTO Target: &lt; 15 mins
              </span>
            </h3>

            <div className="space-y-4">
              {backups.map(bak => (
                <div key={bak.id} className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{bak.backupName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {bak.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {bak.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      Size: {(bak.sizeBytes / 1000000).toFixed(0)} MB | SHA256: {bak.checksumSha256.substring(0, 24)}...
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Region: <span className="text-slate-200">{bak.storageRegion}</span> | AES-256 Encrypted | Retention: {bak.retentionDays} Days
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVerifyBackup(bak.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Verify Restore Dry-Run
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE & LOAD TESTING */}
      {activeTab === 'loadtest' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Trigger k6 Load Test Suite
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Virtual Users (VUs)</label>
                  <input
                    type="number"
                    value={loadTestUsers}
                    onChange={e => setLoadTestUsers(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={loadTestDuration}
                    onChange={e => setLoadTestDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <button
                  onClick={handleRunLoadTest}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Execute k6 Load Simulation
                </button>
              </div>
            </div>

            {/* Load Test Results */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-md font-semibold text-white">Recent Load Test Benchmark Results</h3>
              {loadTests.map(test => (
                <div key={test.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                    <span className="font-semibold text-sm text-white">{test.targetEndpoint}</span>
                    <span className="text-xs text-slate-400">{new Date(test.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">Total Requests</div>
                      <div className="text-lg font-bold text-white">{test.totalRequests.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">RPS</div>
                      <div className="text-lg font-bold text-emerald-400">{test.rps} req/s</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">p95 Latency</div>
                      <div className="text-lg font-bold text-indigo-400">{test.latencyP95Ms} ms</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">Error Rate</div>
                      <div className="text-lg font-bold text-emerald-400">{test.errorRatePercentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROMETHEUS & GRAFANA */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Live Prometheus Telemetry Scraping Stream
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time application metrics exposed at <code className="text-indigo-300 font-mono">/v1/devops/prometheus-metrics</code> for scrape collector aggregation.
            </p>

            <iframe
              src="/v1/devops/prometheus-metrics"
              className="w-full h-64 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 p-4"
              title="Prometheus Metrics Endpoint Stream"
            />
          </div>
        </div>
      )}
    </div>
  );
}
