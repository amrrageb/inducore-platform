import {
  NetworkConnection,
  SharedContact,
  NetworkActivity,
  SupplierRecommendation,
} from '@inducore/core-domain';

export interface NetworkSummaryDTO {
  connections: NetworkConnection[];
  sharedContacts: SharedContact[];
  activities: NetworkActivity[];
  recommendations: SupplierRecommendation[];
  updatedAt: string;
}

export interface FollowSupplierInput {
  companyId: string;
  companyName: string;
  supplierId: string;
  supplierName: string;
}

export interface FollowCompanyInput {
  supplierId: string;
  supplierName: string;
  companyId: string;
  companyName: string;
}

export interface AddSharedContactInput {
  companyId: string;
  supplierId: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  department: string;
}
