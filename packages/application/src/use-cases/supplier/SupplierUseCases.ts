import { SupplierAggregate, Result, CatalogueProduct } from '@inducore/core-domain';
import { ISupplierRepository, SupplierSearchFilter } from '../../ports/ISupplierRepository.js';
import {
  SupplierDTO,
  CreateSupplierInput,
  AddCertificationInput,
  AddDocumentInput,
  AddProductInput,
  RateSupplierInput,
} from '../../dtos/SupplierDTOs.js';

export function toSupplierDTO(supplier: SupplierAggregate): SupplierDTO {
  return {
    id: supplier.id,
    name: supplier.props.name,
    code: supplier.props.code,
    logoUrl: supplier.props.logoUrl,
    website: supplier.props.website,
    contactEmail: supplier.props.contactEmail,
    contactPhone: supplier.props.contactPhone,
    address: supplier.props.address,
    status: supplier.props.status,
    isFavorite: supplier.props.isFavorite,
    categories: supplier.props.categories,
    tags: supplier.props.tags,
    certifications: supplier.props.certifications,
    documents: supplier.props.documents,
    products: supplier.props.products,
    ratings: supplier.props.ratings,
    averageRating: supplier.props.averageRating,
    createdAt: supplier.props.createdAt,
    updatedAt: supplier.props.updatedAt,
  };
}

export class SupplierUseCases {
  constructor(private readonly supplierRepo: ISupplierRepository) {}

  public async createSupplier(input: CreateSupplierInput): Promise<Result<SupplierDTO>> {
    const existing = await this.supplierRepo.findByCode(input.code);
    if (existing) {
      return Result.fail<SupplierDTO>(`Supplier code ${input.code} already exists`);
    }

    const defaultLogo = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop';

    const result = SupplierAggregate.create({
      name: input.name,
      code: input.code,
      logoUrl: input.logoUrl || defaultLogo,
      website: input.website,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      address: input.address,
      status: 'VERIFIED',
      categories: input.categories,
      tags: input.tags || [],
    });

    if (result.isFailure) {
      return Result.fail<SupplierDTO>(result.error!);
    }

    const supplier = result.getValue();
    await this.supplierRepo.save(supplier);
    return Result.ok<SupplierDTO>(toSupplierDTO(supplier));
  }

  public async getSupplierById(id: string): Promise<Result<SupplierDTO>> {
    const supplier = await this.supplierRepo.findById(id);
    if (!supplier) {
      return Result.fail<SupplierDTO>('Supplier not found');
    }
    return Result.ok<SupplierDTO>(toSupplierDTO(supplier));
  }

  public async listSuppliers(filter?: SupplierSearchFilter): Promise<Result<SupplierDTO[]>> {
    const suppliers = await this.supplierRepo.findAll(filter);
    return Result.ok<SupplierDTO[]>(suppliers.map(toSupplierDTO));
  }

  public async toggleFavorite(supplierId: string): Promise<Result<SupplierDTO>> {
    const supplier = await this.supplierRepo.findById(supplierId);
    if (!supplier) {
      return Result.fail<SupplierDTO>('Supplier not found');
    }

    supplier.toggleFavorite();
    await this.supplierRepo.save(supplier);
    return Result.ok<SupplierDTO>(toSupplierDTO(supplier));
  }

  public async rateSupplier(input: RateSupplierInput): Promise<Result<SupplierDTO>> {
    const supplier = await this.supplierRepo.findById(input.supplierId);
    if (!supplier) {
      return Result.fail<SupplierDTO>('Supplier not found');
    }

    const ratingResult = supplier.addRating(input.rating, input.reviewerUserId, input.comment);
    if (ratingResult.isFailure) {
      return Result.fail<SupplierDTO>(ratingResult.error!);
    }

    await this.supplierRepo.save(supplier);
    return Result.ok<SupplierDTO>(toSupplierDTO(supplier));
  }

  public async addCertification(input: AddCertificationInput): Promise<Result<SupplierDTO>> {
    const supplier = await this.supplierRepo.findById(input.supplierId);
    if (!supplier) {
      return Result.fail<SupplierDTO>('Supplier not found');
    }

    const certResult = supplier.addCertification({
      name: input.name,
      issuer: input.issuer,
      certificateNumber: input.certificateNumber,
      issuedDate: input.issuedDate,
      validUntil: input.validUntil,
      verificationStatus: input.verificationStatus,
    });

    if (certResult.isFailure) {
      return Result.fail<SupplierDTO>(certResult.error!);
    }

    await this.supplierRepo.save(supplier);
    return Result.ok<SupplierDTO>(toSupplierDTO(supplier));
  }

  public async addDocument(input: AddDocumentInput): Promise<Result<SupplierDTO>> {
    const supplier = await this.supplierRepo.findById(input.supplierId);
    if (!supplier) {
      return Result.fail<SupplierDTO>('Supplier not found');
    }

    const docResult = supplier.addDocument({
      title: input.title,
      documentType: input.documentType,
      fileUrl: input.fileUrl,
      fileSizeBytes: input.fileSizeBytes,
    });

    if (docResult.isFailure) {
      return Result.fail<SupplierDTO>(docResult.error!);
    }

    await this.supplierRepo.save(supplier);
    return Result.ok<SupplierDTO>(toSupplierDTO(supplier));
  }

  public async addProduct(input: AddProductInput): Promise<Result<SupplierDTO>> {
    const supplier = await this.supplierRepo.findById(input.supplierId);
    if (!supplier) {
      return Result.fail<SupplierDTO>('Supplier not found');
    }

    const prodResult = supplier.addProduct({
      sku: input.sku,
      name: input.name,
      category: input.category,
      description: input.description,
      unitPrice: input.unitPrice,
      currency: input.currency,
      minOrderQuantity: input.minOrderQuantity,
      leadTimeDays: input.leadTimeDays,
      specifications: input.specifications,
      tags: input.tags || [],
      availabilityStatus: input.availabilityStatus,
    });

    if (prodResult.isFailure) {
      return Result.fail<SupplierDTO>(prodResult.error!);
    }

    await this.supplierRepo.save(supplier);
    return Result.ok<SupplierDTO>(toSupplierDTO(supplier));
  }

  public async searchProducts(query?: string, category?: string): Promise<Result<CatalogueProduct[]>> {
    const allSuppliers = await this.supplierRepo.findAll();
    let allProducts: CatalogueProduct[] = [];

    for (const sup of allSuppliers) {
      allProducts.push(...sup.props.products);
    }

    if (query && query.trim().length > 0) {
      const q = query.toLowerCase();
      allProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (category && category.trim().length > 0 && category !== 'ALL') {
      allProducts = allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    return Result.ok<CatalogueProduct[]>(allProducts);
  }
}
