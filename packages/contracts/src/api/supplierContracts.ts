import { z } from 'zod';

export const CreateSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  code: z.string().min(1, 'Supplier code is required'),
  logoUrl: z.string().optional(),
  website: z.string().optional(),
  contactEmail: z.string().email('Invalid contact email'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  address: z.string().min(1, 'Address is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  tags: z.array(z.string()).optional(),
});

export const AddCertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  certificateNumber: z.string().min(1, 'Certificate number is required'),
  issuedDate: z.string().min(1, 'Issued date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  verificationStatus: z.enum(['VERIFIED', 'PENDING', 'EXPIRED']).default('VERIFIED'),
});

export const AddDocumentSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  documentType: z.enum([
    'ISO_CERTIFICATE',
    'COMPLIANCE',
    'SAFETY_DATA_SHEET',
    'AUDIT_REPORT',
    'TECHNICAL_SPEC',
  ]),
  fileUrl: z.string().url('Invalid document file URL'),
  fileSizeBytes: z.number().min(1, 'File size is required'),
});

export const AddProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  currency: z.string().default('USD'),
  minOrderQuantity: z.number().min(1, 'Min order quantity must be at least 1').default(1),
  leadTimeDays: z.number().min(0, 'Lead time days must be positive').default(7),
  specifications: z.record(z.string()).default({}),
  tags: z.array(z.string()).optional(),
  availabilityStatus: z.enum(['IN_STOCK', 'MADE_TO_ORDER', 'OUT_OF_STOCK']).default('IN_STOCK'),
});

export const RateSupplierSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewerUserId: z.string().default('usr-admin'),
  comment: z.string().min(1, 'Comment is required'),
});
