import {
  RiskLevel,
  SupplierTier,
  PerformanceMetricsBreakdown,
  HistoricalTrendPoint,
  BlacklistRecord,
  PreferredStatusRecord,
} from '@inducore/core-domain';

export interface UpdateScoresDTO {
  supplierId: string;
  qualityScore?: number;
  deliveryScore?: number;
  costScore?: number;
  responsivenessScore?: number;
  evaluatedBy?: string;
}

export interface UpdateMetricsDTO {
  supplierId: string;
  metrics: Partial<PerformanceMetricsBreakdown>;
}

export interface BlacklistSupplierDTO {
  supplierId: string;
  reason: string;
  blacklistedBy: string;
}

export interface RemoveBlacklistDTO {
  supplierId: string;
  removedBy: string;
}

export interface TogglePreferredSupplierDTO {
  supplierId: string;
  category?: string;
  approvedBy?: string;
}

export interface UpdateRiskLevelDTO {
  supplierId: string;
  riskLevel: RiskLevel;
}

export interface RecordHistoricalTrendDTO {
  supplierId: string;
  period: string;
  notes?: string;
}

export interface PerformanceScorecardResponseDTO {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  qualityScore: number;
  deliveryScore: number;
  costScore: number;
  responsivenessScore: number;
  overallScore: number;
  riskLevel: RiskLevel;
  tier: SupplierTier;
  metrics: PerformanceMetricsBreakdown;
  blacklist: BlacklistRecord;
  preferredStatus: PreferredStatusRecord;
  historicalTrends: HistoricalTrendPoint[];
  lastEvaluatedAt: string;
  evaluatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceKPIDashboardSummaryDTO {
  totalSuppliersCount: number;
  preferredSuppliersCount: number;
  blacklistedSuppliersCount: number;
  underReviewSuppliersCount: number;
  avgQualityScore: number;
  avgDeliveryScore: number;
  avgCostScore: number;
  avgResponsivenessScore: number;
  avgOverallScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}
