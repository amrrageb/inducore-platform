import { IndustrialNetworkProfileAggregate, PartnershipRequestAggregate, ProductCatalogItem, ServiceMarketplaceItem } from '@inducore/core-domain';

export interface AISupplierRecommendation {
  profile: IndustrialNetworkProfileAggregate;
  matchScore: number; // 0 to 100
  reasoning: string;
  matchingCapabilities: string[];
}

export interface AIRFQRecommendation {
  rfqId: string;
  title: string;
  category: string;
  budgetUsd: number;
  matchScore: number;
  buyerCompany: string;
  recommendedReason: string;
}

export interface IMarketplaceRepository {
  listProfiles(query?: string, category?: string, verifiedOnly?: boolean): Promise<IndustrialNetworkProfileAggregate[]>;
  getProfileById(id: string): Promise<IndustrialNetworkProfileAggregate | null>;
  saveProfile(profile: IndustrialNetworkProfileAggregate): Promise<void>;

  listPartnershipRequests(companyId: string): Promise<PartnershipRequestAggregate[]>;
  savePartnershipRequest(request: PartnershipRequestAggregate): Promise<void>;
  getPartnershipRequestById(id: string): Promise<PartnershipRequestAggregate | null>;

  getAllProducts(): Promise<{ product: ProductCatalogItem; companyName: string; companyId: string }[]>;
  getAllServices(): Promise<{ service: ServiceMarketplaceItem; companyName: string; companyId: string }[]>;
  getAllNewsPosts(): Promise<{ newsPost: any; companyName: string; companyId: string }[]>;

  recommendSuppliers(query: string): Promise<AISupplierRecommendation[]>;
  recommendRFQs(companyId: string): Promise<AIRFQRecommendation[]>;
}
