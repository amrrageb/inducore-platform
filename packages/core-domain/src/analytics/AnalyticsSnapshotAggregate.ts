import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export interface CategorySpend {
  category: string;
  actualSpend: number;
  budget: number;
  savings: number;
  percentageOfTotal: number;
}

export interface SupplierSpend {
  supplierId: string;
  supplierName: string;
  spend: number;
  contractCount: number;
  onTimeDeliveryRate: number;
  qualityComplianceRate: number;
}

export interface CostSavingsMonth {
  month: string;
  negotiatedSavings: number;
  volumeRebateSavings: number;
  processOptimizationSavings: number;
  totalSavings: number;
  targetSavings: number;
}

export interface RFQAnalyticsSummary {
  totalRFQsIssued: number;
  awardedCount: number;
  cancelledCount: number;
  avgBidsPerRFQ: number;
  avgCycleTimeDays: number;
  totalEstimatedValue: number;
  totalAwardedValue: number;
  bidYieldRate: number;
}

export interface ProcurementKPIs {
  totalSpendYTD: number;
  totalSavingsYTD: number;
  savingsPercentageYTD: number;
  activeContractsCount: number;
  contractComplianceRate: number;
  supplierOnTimeDeliveryRate: number;
  supplierQualityPassRate: number;
  avgProcurementLeadTimeDays: number;
}

export interface AnalyticsSnapshotProps {
  tenantId: string;
  snapshotDate: string;
  timeframe: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'YTD' | 'TRAILING_12M';
  kpis: ProcurementKPIs;
  rfqAnalytics: RFQAnalyticsSummary;
  categorySpends: CategorySpend[];
  topSupplierSpends: SupplierSpend[];
  costSavingsTrends: CostSavingsMonth[];
  updatedAt: string;
}

export class AnalyticsSnapshotAggregate extends AggregateRoot<AnalyticsSnapshotProps> {
  private constructor(props: AnalyticsSnapshotProps, id?: string) {
    super(props, id);
  }

  public static create(props: AnalyticsSnapshotProps, id?: string): Result<AnalyticsSnapshotAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.snapshotDate, argumentName: 'snapshotDate' },
      { argument: props.timeframe, argumentName: 'timeframe' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<AnalyticsSnapshotAggregate>(nullGuard.error || 'Invalid Analytics Snapshot properties');
    }

    return Result.ok<AnalyticsSnapshotAggregate>(new AnalyticsSnapshotAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get snapshotDate(): string { return this.props.snapshotDate; }
  get timeframe(): string { return this.props.timeframe; }
  get kpis(): ProcurementKPIs { return this.props.kpis; }
  get rfqAnalytics(): RFQAnalyticsSummary { return this.props.rfqAnalytics; }
  get categorySpends(): CategorySpend[] { return this.props.categorySpends; }
  get topSupplierSpends(): SupplierSpend[] { return this.props.topSupplierSpends; }
  get costSavingsTrends(): CostSavingsMonth[] { return this.props.costSavingsTrends; }
}
