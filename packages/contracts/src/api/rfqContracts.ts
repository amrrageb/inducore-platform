import { z } from 'zod';

export const CreateRFQSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  invitedSupplierIds: z.array(z.string()).optional(),
  deadline: z.string().min(1, 'Deadline ISO string is required'),
  lineItems: z.array(
    z.object({
      name: z.string().min(1, 'Item name is required'),
      quantity: z.number().positive('Quantity must be greater than 0'),
      unit: z.string().min(1, 'Unit is required'),
      targetPrice: z.number().optional(),
    })
  ).optional(),
  attachments: z.array(
    z.object({
      name: z.string().min(1),
      url: z.string().min(1),
      sizeKb: z.number().nonnegative(),
    })
  ).optional(),
});

export const InviteSuppliersSchema = z.object({
  supplierIds: z.array(z.string()).min(1, 'At least one supplier ID must be provided'),
});

export const AddAttachmentSchema = z.object({
  name: z.string().min(1, 'Attachment name is required'),
  url: z.string().min(1, 'Attachment URL is required'),
  sizeKb: z.number().nonnegative(),
});

export const AskClarificationSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  askedBy: z.string().min(1, 'Questioner identity is required'),
});

export const AnswerClarificationSchema = z.object({
  answer: z.string().min(2, 'Answer must be at least 2 characters'),
});

export const CreateRevisionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  deadline: z.string().optional(),
  revisionNotes: z.string().min(3, 'Revision notes are required'),
});
