import { Router, Request, Response } from 'express';
import { ContractUseCases } from '@inducore/application';
import { InMemoryContractRepository } from '@inducore/infrastructure';
import {
  CreateContractSchema,
  AddContractAttachmentSchema,
  RequestContractSignatureSchema,
  SignContractSchema,
  InitiateContractRenewalSchema,
  ExecuteContractRenewalSchema,
} from '@inducore/contracts';

const contractRepo = new InMemoryContractRepository();
const contractUseCases = new ContractUseCases(contractRepo);

export const contractRouter = Router();

// List all contracts
contractRouter.get('/', async (_req: Request, res: Response) => {
  const result = await contractUseCases.getAllContracts();
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Get contract by ID
contractRouter.get('/:id', async (req: Request, res: Response) => {
  const result = await contractUseCases.getContractById(req.params.id);
  if (result.isFailure) {
    return res.status(404).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Create contract
contractRouter.post('/', async (req: Request, res: Response) => {
  const parseResult = CreateContractSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await contractUseCases.createContract(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.status(201).json({ success: true, data: result.getValue() });
});

// Add attachment
contractRouter.post('/attachments', async (req: Request, res: Response) => {
  const parseResult = AddContractAttachmentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await contractUseCases.addAttachment(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Request digital signature
contractRouter.post('/signatures/request', async (req: Request, res: Response) => {
  const parseResult = RequestContractSignatureSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await contractUseCases.requestSignature(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Execute digital signature
contractRouter.post('/signatures/sign', async (req: Request, res: Response) => {
  const parseResult = SignContractSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await contractUseCases.signContract(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Initiate renewal workflow
contractRouter.post('/renew/initiate', async (req: Request, res: Response) => {
  const parseResult = InitiateContractRenewalSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await contractUseCases.initiateRenewal(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});

// Execute renewal and log version
contractRouter.post('/renew/execute', async (req: Request, res: Response) => {
  const parseResult = ExecuteContractRenewalSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ success: false, error: parseResult.error.errors[0].message });
  }
  const result = await contractUseCases.executeRenewal(parseResult.data);
  if (result.isFailure) {
    return res.status(400).json({ success: false, error: result.errorValue() });
  }
  return res.json({ success: true, data: result.getValue() });
});
