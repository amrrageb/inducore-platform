import { DeploymentPipelineAggregate, DisasterRecoveryAggregate } from '@inducore/core-domain';

export interface PerformanceLoadTestResult {
  id: string;
  timestamp: string;
  targetEndpoint: string;
  virtualUsers: number;
  durationSeconds: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rps: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  errorRatePercentage: number;
}

export interface PrometheusMetricSample {
  metricName: string;
  type: 'COUNTER' | 'GAUGE' | 'HISTOGRAM';
  value: number;
  unit: string;
  description: string;
}

export interface IDevOpsRepository {
  listPipelines(tenantId: string): Promise<DeploymentPipelineAggregate[]>;
  getPipelineById(id: string): Promise<DeploymentPipelineAggregate | null>;
  savePipeline(pipeline: DeploymentPipelineAggregate): Promise<void>;

  listBackups(tenantId: string): Promise<DisasterRecoveryAggregate[]>;
  getBackupById(id: string): Promise<DisasterRecoveryAggregate | null>;
  saveBackup(backup: DisasterRecoveryAggregate): Promise<void>;

  listLoadTests(tenantId: string): Promise<PerformanceLoadTestResult[]>;
  saveLoadTest(testResult: PerformanceLoadTestResult): Promise<void>;

  getPrometheusMetrics(tenantId: string): Promise<PrometheusMetricSample[]>;
}
