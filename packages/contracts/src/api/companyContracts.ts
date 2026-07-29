import { z } from 'zod';

export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  code: z.string().min(1, 'Company code is required'),
  taxId: z.string().optional(),
  logoUrl: z.string().optional(),
  settings: z.object({
    timezone: z.string().optional(),
    defaultCurrency: z.string().optional(),
    requireTwoFactorAuth: z.boolean().optional(),
    maxUsersAllowed: z.number().optional(),
    allowExternalSuppliers: z.boolean().optional(),
    securityPolicy: z.enum(['STANDARD', 'STRICT', 'FEDRAMP_COMPLIANT']).optional(),
  }).optional(),
  subscription: z.object({
    plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'EXPIRED', 'TRIAL']).optional(),
    expiresAt: z.string().optional(),
    maxPlants: z.number().optional(),
    customDomainEnabled: z.boolean().optional(),
    supportLevel: z.enum(['STANDARD', 'PREMIUM', 'DEDICATED_24_7']).optional(),
  }).optional(),
});

export const AddBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  code: z.string().min(1, 'Branch code is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  isHeadquarters: z.boolean().default(false),
});

export const AddPlantSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  name: z.string().min(1, 'Plant name is required'),
  code: z.string().min(1, 'Plant code is required'),
  location: z.string().min(1, 'Location is required'),
  operationalCapacityPercentage: z.number().min(0).max(100).default(100),
});

export const AddDepartmentSchema = z.object({
  branchId: z.string().optional(),
  plantId: z.string().optional(),
  name: z.string().min(1, 'Department name is required'),
  code: z.string().min(1, 'Department code is required'),
});

export const CreateTeamSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  name: z.string().min(1, 'Team name is required'),
  leadUserId: z.string().optional(),
});

export const SendInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']),
  departmentId: z.string().optional(),
  invitedByUserId: z.string().default('usr-admin'),
});

export const AssignUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']),
  branchId: z.string().optional(),
  plantId: z.string().optional(),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const UpdateCompanySettingsSchema = z.object({
  logoUrl: z.string().optional(),
  settings: z.object({
    timezone: z.string().optional(),
    defaultCurrency: z.string().optional(),
    requireTwoFactorAuth: z.boolean().optional(),
    maxUsersAllowed: z.number().optional(),
    allowExternalSuppliers: z.boolean().optional(),
    securityPolicy: z.enum(['STANDARD', 'STRICT', 'FEDRAMP_COMPLIANT']).optional(),
  }).optional(),
  subscription: z.object({
    plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'EXPIRED', 'TRIAL']).optional(),
    expiresAt: z.string().optional(),
    maxPlants: z.number().optional(),
    customDomainEnabled: z.boolean().optional(),
    supportLevel: z.enum(['STANDARD', 'PREMIUM', 'DEDICATED_24_7']).optional(),
  }).optional(),
});
