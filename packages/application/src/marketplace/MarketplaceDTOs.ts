import { z } from 'zod';

export const CreateProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  logoUrl: z.string().default('/logos/default.png'),
  industryCategory: z.string().min(2, 'Industry category is required'),
  headquartersCountry: z.string().min(2, 'Headquarters country is required'),
  operatingLanguages: z.array(z.string()).default(['EN']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  capabilities: z.array(z.string()).default([]),
});

export type CreateProfileDTO = z.infer<typeof CreateProfileSchema>;

export const AddProductSchema = z.object({
  title: z.string().min(2, 'Product title is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(5),
  unitPrice: z.number().positive(),
  currency: z.string().default('USD'),
  specifications: z.record(z.string()).default({}),
});

export type AddProductDTO = z.infer<typeof AddProductSchema>;

export const AddServiceSchema = z.object({
  title: z.string().min(2, 'Service title is required'),
  serviceCategory: z.string().min(2, 'Service category is required'),
  description: z.string().min(5),
  hourlyRate: z.number().optional(),
  leadTimeDays: z.number().min(1),
});

export type AddServiceDTO = z.infer<typeof AddServiceSchema>;

export const CreatePartnershipRequestSchema = z.object({
  targetCompanyId: z.string().min(1, 'Target company ID is required'),
  targetCompanyName: z.string().min(1),
  partnershipType: z.enum([
    'PREFERRED_SUPPLIER',
    'OEM_JOINT_VENTURE',
    'SUBCONTRACTOR',
    'TECHNOLOGY_TRANSFER',
  ]),
  proposedScope: z.string().min(10, 'Proposed scope is required'),
  message: z.string().min(5),
});

export type CreatePartnershipRequestDTO = z.infer<typeof CreatePartnershipRequestSchema>;

export const PostNewsSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.enum(['PRODUCT_LAUNCH', 'CERTIFICATION', 'EXPANSION', 'CASE_STUDY']),
});

export type PostNewsDTO = z.infer<typeof PostNewsSchema>;

export const AICapabilitySearchSchema = z.object({
  query: z.string().min(2, 'Search query is required'),
  requiredCertifications: z.array(z.string()).optional(),
  minReputationScore: z.number().min(0).max(100).optional(),
  preferredCountry: z.string().optional(),
});

export type AICapabilitySearchDTO = z.infer<typeof AICapabilitySearchSchema>;
