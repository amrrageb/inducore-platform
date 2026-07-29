import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export interface SupplierCertification {
  id: string;
  name: string;
  issuer: string;
  certificateNumber: string;
  issuedDate: string;
  validUntil: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED';
}

export interface SupplierDocument {
  id: string;
  title: string;
  documentType: 'ISO_CERTIFICATE' | 'COMPLIANCE' | 'SAFETY_DATA_SHEET' | 'AUDIT_REPORT' | 'TECHNICAL_SPEC';
  fileUrl: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface CatalogueProduct {
  id: string;
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
  tags: string[];
  availabilityStatus: 'IN_STOCK' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';
}

export interface SupplierRating {
  id: string;
  rating: number; // 1 to 5
  reviewerUserId: string;
  comment: string;
  createdAt: string;
}

export interface SupplierProps {
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

export class SupplierAggregate extends AggregateRoot<SupplierProps> {
  private constructor(props: SupplierProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: Omit<SupplierProps, 'isFavorite' | 'certifications' | 'documents' | 'products' | 'ratings' | 'averageRating' | 'createdAt' | 'updatedAt'> & {
      isFavorite?: boolean;
      certifications?: SupplierCertification[];
      documents?: SupplierDocument[];
      products?: CatalogueProduct[];
      ratings?: SupplierRating[];
      averageRating?: number;
    },
    id?: string
  ): Result<SupplierAggregate> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<SupplierAggregate>('Supplier name is required');
    }
    if (!props.code || props.code.trim().length === 0) {
      return Result.fail<SupplierAggregate>('Supplier code is required');
    }

    const ratingsList = props.ratings || [];
    const avgRating = ratingsList.length > 0
      ? Number((ratingsList.reduce((acc, r) => acc + r.rating, 0) / ratingsList.length).toFixed(1))
      : props.averageRating || 5.0;

    const supplierProps: SupplierProps = {
      ...props,
      isFavorite: props.isFavorite || false,
      certifications: props.certifications || [],
      documents: props.documents || [],
      products: props.products || [],
      ratings: ratingsList,
      averageRating: avgRating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return Result.ok<SupplierAggregate>(new SupplierAggregate(supplierProps, id));
  }

  public toggleFavorite(): boolean {
    this.props.isFavorite = !this.props.isFavorite;
    this.props.updatedAt = new Date().toISOString();
    return this.props.isFavorite;
  }

  public addRating(ratingValue: number, reviewerUserId: string, comment: string): Result<SupplierRating> {
    if (ratingValue < 1 || ratingValue > 5) {
      return Result.fail<SupplierRating>('Rating must be between 1 and 5');
    }

    const newRating: SupplierRating = {
      id: crypto.randomUUID(),
      rating: ratingValue,
      reviewerUserId,
      comment,
      createdAt: new Date().toISOString(),
    };

    this.props.ratings.push(newRating);
    const sum = this.props.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.props.averageRating = Number((sum / this.props.ratings.length).toFixed(1));
    this.props.updatedAt = new Date().toISOString();

    return Result.ok<SupplierRating>(newRating);
  }

  public addCertification(certData: Omit<SupplierCertification, 'id'>): Result<SupplierCertification> {
    const cert: SupplierCertification = {
      ...certData,
      id: crypto.randomUUID(),
    };
    this.props.certifications.push(cert);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<SupplierCertification>(cert);
  }

  public addDocument(docData: Omit<SupplierDocument, 'id' | 'uploadedAt'>): Result<SupplierDocument> {
    const doc: SupplierDocument = {
      ...docData,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString(),
    };
    this.props.documents.push(doc);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<SupplierDocument>(doc);
  }

  public addProduct(productData: Omit<CatalogueProduct, 'id' | 'supplierId'>): Result<CatalogueProduct> {
    const existingSku = this.props.products.find(p => p.sku.toLowerCase() === productData.sku.toLowerCase());
    if (existingSku) {
      return Result.fail<CatalogueProduct>(`Product SKU ${productData.sku} already exists for this supplier`);
    }

    const product: CatalogueProduct = {
      ...productData,
      id: crypto.randomUUID(),
      supplierId: this.id,
    };

    this.props.products.push(product);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<CatalogueProduct>(product);
  }

  public addTag(tag: string): void {
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
      this.props.updatedAt = new Date().toISOString();
    }
  }

  public removeTag(tag: string): void {
    this.props.tags = this.props.tags.filter(t => t !== tag);
    this.props.updatedAt = new Date().toISOString();
  }
}
