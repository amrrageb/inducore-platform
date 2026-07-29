import { z } from 'zod';

export const ContractTypeSchema = z.enum([
  'FRAMEWORK_AGREEMENT',
  'SUPPLY_CONTRACT',
  'MASTER_SERVICES_AGREEMENT',
  'NDA',
]);

export const CreateContractSchema = z.object({
  contractNumber: z.string().min(1, 'Contract number is required'),
  title: z.string().min(1, 'Contract title is required'),
  contractType: ContractTypeSchema,
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierName: z.string().min(1, 'Supplier Name is required'),
  awardId: z.string().optional(),
  poId: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  autoRenew: z.boolean().default(false),
  noticePeriodDays: z.number().int().min(0).default(30),
  currency: z.string().default('USD'),
  totalValueCap: z.number().positive('Total value cap must be greater than 0'),
  governingLaw: z.string().default('Delaware, USA'),
});

export const AddContractAttachmentSchema = z.object({
  contractId: z.string().min(1),
  fileName: z.string().min(1),
  fileSizeKb: z.number().positive(),
  uploadedBy: z.string().min(1),
  fileType: z.string().default('application/pdf'),
});

export const RequestContractSignatureSchema = z.object({
  contractId: z.string().min(1),
  signerName: z.string().min(1),
  signerEmail: z.string().email(),
  role: z.enum(['BUYER', 'SUPPLIER', 'LEGAL_WITNESS']),
});

export const SignContractSchema = z.object({
  contractId: z.string().min(1),
  signatureId: z.string().min(1),
  signerName: z.string().min(1),
  ipAddress: z.string().default('127.0.0.1'),
});

export const InitiateContractRenewalSchema = z.object({
  contractId: z.string().min(1),
  notes: z.string().min(1, 'Renewal notes are required'),
});

export const ExecuteContractRenewalSchema = z.object({
  contractId: z.string().min(1),
  newEndDate: z.string().min(1, 'New end date is required'),
  revisedValueCap: z.number().positive(),
  changeSummary: z.string().min(1, 'Change summary is required'),
  modifiedBy: z.string().min(1),
});
