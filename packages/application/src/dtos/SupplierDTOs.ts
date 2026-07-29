import {
  SupplierCertification,
  SupplierDocument,
  CatalogueProduct,
  SupplierRating,
} from '@inducore/core-domain';

export interface SupplierDTO {
  id: string;
  name: string;
  code: string;
  logoUrl: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'ACTIVE' | 'VERIFIED' | 'UNDER_REVIEW' | 'SUSPENDED';
  isFavorite: boolean;
  categories: string[];
  tags: string[];
  certifications: SupplierCertification[];
  documents: SupplierDocument[];
  products: CatalogueProduct[];
  ratings: SupplierRating[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  code: string;
  logoUrl?: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  categories: string[];
  tags?: string[];
}

export interface AddCertificationInput {
  supplierId: string;
  name: string;
  issuer: string;
  certificateNumber: string;
  issuedDate: string;
  validUntil: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED';
}

export interface AddDocumentInput {
  supplierId: string;
  title: string;
  documentType: 'ISO_CERTIFICATE' | 'COMPLIANCE' | 'SAFETY_DATA_SHEET' | 'AUDIT_REPORT' | 'TECHNICAL_SPEC';
  fileUrl: string;
  fileSizeBytes: number;
}

export interface AddProductInput {
  supplierId: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitPrice: number;
  currency: string;
  minOrderQuantity: number;
  leadTimeDays: number;
  specifications: Record<string, string>;
  tags?: string[];
  availabilityStatus: 'IN_STOCK' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';
}

export interface RateSupplierInput {
  supplierId: string;
  rating: number;
  reviewerUserId: string;
  comment: string;
}
