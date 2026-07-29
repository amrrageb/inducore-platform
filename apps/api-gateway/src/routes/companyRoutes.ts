import { Router } from 'express';
import {
  CreateCompanySchema,
  AddBranchSchema,
  AddPlantSchema,
  AddDepartmentSchema,
  CreateTeamSchema,
  SendInvitationSchema,
  AssignUserSchema,
  UpdateCompanySettingsSchema,
} from '@inducore/contracts';
import { CompanyUseCases } from '@inducore/application';
import { InMemoryCompanyRepository } from '@inducore/infrastructure';

const companyRepo = new InMemoryCompanyRepository();
const companyUseCases = new CompanyUseCases(companyRepo);

export function createCompanyRouter(): Router {
  const router = Router();

  // List all companies
  router.get('/', async (_req, res) => {
    const result = await companyUseCases.listCompanies();
    res.json({ success: result.isSuccess, data: result.getValue() });
  });

  // Create new company
  router.post('/', async (req, res) => {
    const parse = CreateCompanySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await companyUseCases.createCompany(parse.data);
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Get company details
  router.get('/:id', async (req, res) => {
    const result = await companyUseCases.getCompanyDetails(req.params.id);
    if (result.isFailure) {
      res.status(404).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Add branch to company
  router.post('/:id/branches', async (req, res) => {
    const parse = AddBranchSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await companyUseCases.addBranch({
      companyId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Add plant to company
  router.post('/:id/plants', async (req, res) => {
    const parse = AddPlantSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await companyUseCases.addPlant({
      companyId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Add department to company
  router.post('/:id/departments', async (req, res) => {
    const parse = AddDepartmentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await companyUseCases.addDepartment({
      companyId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Create team
  router.post('/:id/teams', async (req, res) => {
    const parse = CreateTeamSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await companyUseCases.createTeam({
      companyId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Send invitation
  router.post('/:id/invitations', async (req, res) => {
    const parse = SendInvitationSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await companyUseCases.sendInvitation({
      companyId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.status(201).json({ success: true, data: result.getValue() });
  });

  // Assign user
  router.post('/:id/users/assign', async (req, res) => {
    const parse = AssignUserSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await companyUseCases.assignUser({
      companyId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  // Update company settings / logos / subscription
  router.put('/:id/settings', async (req, res) => {
    const parse = UpdateCompanySettingsSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }
    const result = await companyUseCases.updateSettings({
      companyId: req.params.id,
      ...parse.data,
    });
    if (result.isFailure) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result.getValue() });
  });

  return router;
}
