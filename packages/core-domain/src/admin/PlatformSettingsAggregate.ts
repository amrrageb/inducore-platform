import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  targetTenants: string[];
}

export interface SubscriptionPlanInfo {
  planType: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE_PREMIUM';
  maxUsers: number;
  maxRFQsPerMonth: number;
  aiRAGQuotaPerMonth: number;
  customSLAEnabled: boolean;
  renewalDate: string;
  billingStatus: 'ACTIVE' | 'PAST_DUE' | 'TRIALING';
}

export interface CompanyPlatformSettingsProps {
  tenantId: string;
  companyName: string;
  domainName: string;
  supportEmail: string;
  defaultCurrency: string;
  timezone: string;
  enforceSSO: boolean;
  requireMFA: boolean;
  passwordPolicyDays: number;
  subscription: SubscriptionPlanInfo;
  featureFlags: FeatureFlag[];
  updatedAt: string;
}

export class PlatformSettingsAggregate extends AggregateRoot<CompanyPlatformSettingsProps> {
  private constructor(props: CompanyPlatformSettingsProps, id?: string) {
    super(props, id);
  }

  public static create(props: CompanyPlatformSettingsProps, id?: string): Result<PlatformSettingsAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.companyName, argumentName: 'companyName font' },
      { argument: props.supportEmail, argumentName: 'supportEmail' },
      { argument: props.subscription, argumentName: 'subscription' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<PlatformSettingsAggregate>(nullGuard.error || 'Invalid Platform Settings properties');
    }

    return Result.ok<PlatformSettingsAggregate>(new PlatformSettingsAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get companyName(): string { return this.props.companyName; }
  get domainName(): string { return this.props.domainName; }
  get supportEmail(): string { return this.props.supportEmail; }
  get defaultCurrency(): string { return this.props.defaultCurrency; }
  get timezone(): string { return this.props.timezone; }
  get enforceSSO(): boolean { return this.props.enforceSSO; }
  get requireMFA(): boolean { return this.props.requireMFA; }
  get passwordPolicyDays(): number { return this.props.passwordPolicyDays; }
  get subscription(): SubscriptionPlanInfo { return this.props.subscription; }
  get featureFlags(): FeatureFlag[] { return this.props.featureFlags; }

  public updateCompanyInfo(companyName: string, supportEmail: string, timezone: string, currency: string): void {
    this.props.companyName = companyName;
    this.props.supportEmail = supportEmail;
    this.props.timezone = timezone;
    this.props.defaultCurrency = currency;
    this.props.updatedAt = new Date().toISOString();
  }

  public updateSecurityPolicy(enforceSSO: boolean, requireMFA: boolean, passwordPolicyDays: number): void {
    this.props.enforceSSO = enforceSSO;
    this.props.requireMFA = requireMFA;
    this.props.passwordPolicyDays = passwordPolicyDays;
    this.props.updatedAt = new Date().toISOString();
  }

  public toggleFeatureFlag(flagKey: string): void {
    const flag = this.props.featureFlags.find(f => f.key === flagKey);
    if (flag) {
      flag.isEnabled = !flag.isEnabled;
      this.props.updatedAt = new Date().toISOString();
    }
  }
}
