import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SupplierTier = 'PREFERRED' | 'STANDARD' | 'UNDER_REVIEW' | 'BLACKLISTED';

export interface PerformanceMetricsBreakdown {
  defectPpm: number; // Defect rate in Parts Per Million
  onTimeDeliveryPct: number; // On-Time Delivery percentage (0 - 100)
  costVariancePct: number; // Cost competitiveness/variance % relative to benchmark
  avgResponseHours: number; // Average inquiry/RFQ response time in hours
  auditCompliancePct: number; // Quality & ESG audit compliance score (0 - 100)
}

export interface HistoricalTrendPoint {
  id: string;
  period: string; // e.g., 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'
  qualityScore: number;
  deliveryScore: number;
  costScore: number;
  responsivenessScore: number;
  overallScore: number;
  recordedAt: string;
  notes?: string;
}

export interface BlacklistRecord {
  isBlacklisted: boolean;
  reason?: string;
  blacklistedAt?: string;
  blacklistedBy?: string;
}

export interface PreferredStatusRecord {
  isPreferred: boolean;
  preferredSince?: string;
  preferredCategory?: string;
  approvedBy?: string;
}

export interface PerformanceScorecardProps {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  qualityScore: number; // 0 - 100
  deliveryScore: number; // 0 - 100
  costScore: number; // 0 - 100
  responsivenessScore: number; // 0 - 100
  overallScore: number; // Weighted composite 0 - 100
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

export class PerformanceScorecardAggregate extends AggregateRoot<PerformanceScorecardProps> {
  private constructor(props: PerformanceScorecardProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: Omit<
      PerformanceScorecardProps,
      'overallScore' | 'createdAt' | 'updatedAt' | 'lastEvaluatedAt'
    > & {
      overallScore?: number;
      lastEvaluatedAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
    id?: string
  ): Result<PerformanceScorecardAggregate> {
    if (!props.supplierId || props.supplierId.trim().length === 0) {
      return Result.fail<PerformanceScorecardAggregate>('Supplier ID is required');
    }
    if (!props.supplierName || props.supplierName.trim().length === 0) {
      return Result.fail<PerformanceScorecardAggregate>('Supplier Name is required');
    }

    const overall =
      props.overallScore !== undefined
        ? props.overallScore
        : PerformanceScorecardAggregate.calculateOverallScore(
            props.qualityScore,
            props.deliveryScore,
            props.costScore,
            props.responsivenessScore
          );

    const scorecardProps: PerformanceScorecardProps = {
      ...props,
      overallScore: overall,
      lastEvaluatedAt: props.lastEvaluatedAt || new Date().toISOString(),
      createdAt: props.createdAt || new Date().toISOString(),
      updatedAt: props.updatedAt || new Date().toISOString(),
    };

    return Result.ok<PerformanceScorecardAggregate>(
      new PerformanceScorecardAggregate(scorecardProps, id)
    );
  }

  public static calculateOverallScore(
    quality: number,
    delivery: number,
    cost: number,
    responsiveness: number,
    weights = { quality: 0.35, delivery: 0.3, cost: 0.2, responsiveness: 0.15 }
  ): number {
    const calculated =
      quality * weights.quality +
      delivery * weights.delivery +
      cost * weights.cost +
      responsiveness * weights.responsiveness;
    return Number(calculated.toFixed(1));
  }

  public updateScores(scores: {
    qualityScore?: number;
    deliveryScore?: number;
    costScore?: number;
    responsivenessScore?: number;
    evaluatedBy?: string;
  }): Result<void> {
    if (scores.qualityScore !== undefined) {
      if (scores.qualityScore < 0 || scores.qualityScore > 100) {
        return Result.fail<void>('Quality score must be between 0 and 100');
      }
      this.props.qualityScore = scores.qualityScore;
    }

    if (scores.deliveryScore !== undefined) {
      if (scores.deliveryScore < 0 || scores.deliveryScore > 100) {
        return Result.fail<void>('Delivery score must be between 0 and 100');
      }
      this.props.deliveryScore = scores.deliveryScore;
    }

    if (scores.costScore !== undefined) {
      if (scores.costScore < 0 || scores.costScore > 100) {
        return Result.fail<void>('Cost score must be between 0 and 100');
      }
      this.props.costScore = scores.costScore;
    }

    if (scores.responsivenessScore !== undefined) {
      if (scores.responsivenessScore < 0 || scores.responsivenessScore > 100) {
        return Result.fail<void>('Responsiveness score must be between 0 and 100');
      }
      this.props.responsivenessScore = scores.responsivenessScore;
    }

    this.props.overallScore = PerformanceScorecardAggregate.calculateOverallScore(
      this.props.qualityScore,
      this.props.deliveryScore,
      this.props.costScore,
      this.props.responsivenessScore
    );

    if (scores.evaluatedBy) {
      this.props.evaluatedBy = scores.evaluatedBy;
    }

    this.props.lastEvaluatedAt = new Date().toISOString();
    this.props.updatedAt = new Date().toISOString();
    this.updateTierAndRisk();

    return Result.ok<void>();
  }

  public updateMetrics(metrics: Partial<PerformanceMetricsBreakdown>): void {
    this.props.metrics = {
      ...this.props.metrics,
      ...metrics,
    };
    this.props.updatedAt = new Date().toISOString();
  }

  public blacklistSupplier(reason: string, blacklistedBy: string): Result<void> {
    if (!reason || reason.trim().length === 0) {
      return Result.fail<void>('Reason for blacklisting is required');
    }

    this.props.blacklist = {
      isBlacklisted: true,
      reason,
      blacklistedAt: new Date().toISOString(),
      blacklistedBy,
    };
    this.props.tier = 'BLACKLISTED';
    this.props.riskLevel = 'CRITICAL';
    this.props.preferredStatus.isPreferred = false;
    this.props.updatedAt = new Date().toISOString();

    return Result.ok<void>();
  }

  public removeBlacklist(removedBy: string): Result<void> {
    this.props.blacklist = {
      isBlacklisted: false,
    };
    this.props.updatedAt = new Date().toISOString();
    this.props.evaluatedBy = removedBy;
    this.updateTierAndRisk();

    return Result.ok<void>();
  }

  public togglePreferredSupplier(
    category?: string,
    approvedBy: string = 'Procurement Board'
  ): boolean {
    if (this.props.blacklist.isBlacklisted) {
      return false;
    }

    const nextState = !this.props.preferredStatus.isPreferred;
    this.props.preferredStatus = {
      isPreferred: nextState,
      preferredSince: nextState ? new Date().toISOString().split('T')[0] : undefined,
      preferredCategory: category || this.props.preferredStatus.preferredCategory,
      approvedBy: nextState ? approvedBy : undefined,
    };

    if (nextState) {
      this.props.tier = 'PREFERRED';
    } else {
      this.updateTierAndRisk();
    }

    this.props.updatedAt = new Date().toISOString();
    return nextState;
  }

  public updateRiskLevel(riskLevel: RiskLevel): void {
    this.props.riskLevel = riskLevel;
    this.props.updatedAt = new Date().toISOString();
  }

  public recordHistoricalTrendPoint(period: string, notes?: string): Result<HistoricalTrendPoint> {
    const newPoint: HistoricalTrendPoint = {
      id: `trend-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      period,
      qualityScore: this.props.qualityScore,
      deliveryScore: this.props.deliveryScore,
      costScore: this.props.costScore,
      responsivenessScore: this.props.responsivenessScore,
      overallScore: this.props.overallScore,
      recordedAt: new Date().toISOString(),
      notes,
    };

    this.props.historicalTrends.push(newPoint);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<HistoricalTrendPoint>(newPoint);
  }

  private updateTierAndRisk(): void {
    if (this.props.blacklist.isBlacklisted) {
      this.props.tier = 'BLACKLISTED';
      this.props.riskLevel = 'CRITICAL';
      return;
    }

    if (this.props.preferredStatus.isPreferred) {
      this.props.tier = 'PREFERRED';
    } else if (this.props.overallScore >= 85) {
      this.props.tier = 'STANDARD';
    } else {
      this.props.tier = 'UNDER_REVIEW';
    }

    if (this.props.overallScore >= 90) {
      this.props.riskLevel = 'LOW';
    } else if (this.props.overallScore >= 75) {
      this.props.riskLevel = 'MEDIUM';
    } else if (this.props.overallScore >= 60) {
      this.props.riskLevel = 'HIGH';
    } else {
      this.props.riskLevel = 'CRITICAL';
    }
  }
}
