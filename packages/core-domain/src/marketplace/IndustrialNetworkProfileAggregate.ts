import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export interface IndustrialCertification {
  name: string; // e.g., "ISO 9001:2015", "AS9100D", "API 6D"
  issuingBody: string;
  certificateNumber: string;
  validUntil: string;
  verified: boolean;
}

export interface ProductCatalogItem {
  id: string;
  title: string;
  category: string;
  description: string;
  unitPrice: number;
  currency: string;
  specifications: Record<string, string>;
  isAvailable: boolean;
}

export interface ServiceMarketplaceItem {
  id: string;
  title: string;
  serviceCategory: string; // e.g., "CNC Precision Machining", "NDT Testing", "Field Installation"
  description: string;
  hourlyRate?: number;
  leadTimeDays: number;
}

export interface CompanyNewsPost {
  id: string;
  title: string;
  content: string;
  category: 'PRODUCT_LAUNCH' | 'CERTIFICATION' | 'EXPANSION' | 'CASE_STUDY';
  publishedAt: string;
  author: string;
}

export interface IndustrialProfileProps {
  tenantId: string;
  companyName: string;
  logoUrl: string;
  industryCategory: string; // e.g., "Heavy Metallurgy & Steel", "Fluid Control & Valves"
  headquartersCountry: string;
  operatingLanguages: string[]; // e.g., ["EN", "DE", "FR", "ZH", "AR"]
  description: string;
  isVerifiedSupplier: boolean;
  reputationScore: number; // 0 to 100
  followersCount: number;
  capabilities: string[]; // e.g., ["5-Axis CNC", "Laser Cladding", "Hydrostatic Testing"]
  certifications: IndustrialCertification[];
  products: ProductCatalogItem[];
  services: ServiceMarketplaceItem[];
  newsPosts: CompanyNewsPost[];
  createdAt: string;
}

export class IndustrialNetworkProfileAggregate extends AggregateRoot<IndustrialProfileProps> {
  private constructor(props: IndustrialProfileProps, id?: string) {
    super(props, id);
  }

  public static create(props: IndustrialProfileProps, id?: string): Result<IndustrialNetworkProfileAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.companyName, argumentName: 'companyName' },
      { argument: props.industryCategory, argumentName: 'industryCategory' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<IndustrialNetworkProfileAggregate>(nullGuard.error || 'Invalid Industrial Profile properties');
    }

    if (props.reputationScore < 0 || props.reputationScore > 100) {
      return Result.fail<IndustrialNetworkProfileAggregate>('Reputation score must be between 0 and 100');
    }

    return Result.ok<IndustrialNetworkProfileAggregate>(new IndustrialNetworkProfileAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get companyName(): string { return this.props.companyName; }
  get logoUrl(): string { return this.props.logoUrl; }
  get industryCategory(): string { return this.props.industryCategory; }
  get headquartersCountry(): string { return this.props.headquartersCountry; }
  get operatingLanguages(): string[] { return this.props.operatingLanguages; }
  get description(): string { return this.props.description; }
  get isVerifiedSupplier(): boolean { return this.props.isVerifiedSupplier; }
  get reputationScore(): number { return this.props.reputationScore; }
  get followersCount(): number { return this.props.followersCount; }
  get capabilities(): string[] { return this.props.capabilities; }
  get certifications(): IndustrialCertification[] { return this.props.certifications; }
  get products(): ProductCatalogItem[] { return this.props.products; }
  get services(): ServiceMarketplaceItem[] { return this.props.services; }
  get newsPosts(): CompanyNewsPost[] { return this.props.newsPosts; }

  public incrementFollowers(): void {
    this.props.followersCount += 1;
  }

  public decrementFollowers(): void {
    if (this.props.followersCount > 0) {
      this.props.followersCount -= 1;
    }
  }

  public addCertification(cert: IndustrialCertification): void {
    this.props.certifications.push(cert);
  }

  public addProduct(product: ProductCatalogItem): void {
    this.props.products.push(product);
  }

  public addService(service: ServiceMarketplaceItem): void {
    this.props.services.push(service);
  }

  public addNewsPost(post: CompanyNewsPost): void {
    this.props.newsPosts.unshift(post);
  }

  public updateReputation(scoreDelta: number): void {
    const newScore = Math.max(0, Math.min(100, this.props.reputationScore + scoreDelta));
    this.props.reputationScore = Math.round(newScore * 10) / 10;
  }
}
