import { z } from 'zod';

export const FollowSupplierSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierName: z.string().min(1, 'Supplier Name is required'),
});

export const FollowCompanySchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierName: z.string().min(1, 'Supplier Name is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  companyName: z.string().min(1, 'Company Name is required'),
});

export const AddSharedContactSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  fullName: z.string().min(1, 'Contact Name is required'),
  title: z.string().min(1, 'Title is required'),
  email: z.string().email('Invalid contact email'),
  phone: z.string().min(1, 'Phone is required'),
  department: z.string().min(1, 'Department is required'),
});
