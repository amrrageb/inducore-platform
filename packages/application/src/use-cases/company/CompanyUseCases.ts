import { CompanyAggregate, Result } from '@inducore/core-domain';
import { ICompanyRepository } from '../../ports/ICompanyRepository.js';
import {
  CompanyDTO,
  CreateCompanyInput,
  AddBranchInput,
  AddPlantInput,
  AddDepartmentInput,
  CreateTeamInput,
  SendInvitationInput,
  AssignUserInput,
  UpdateCompanySettingsInput,
} from '../../dtos/CompanyDTOs.js';

export function toCompanyDTO(company: CompanyAggregate): CompanyDTO {
  return {
    id: company.id,
    name: company.props.name,
    code: company.props.code,
    taxId: company.props.taxId,
    logoUrl: company.props.logoUrl,
    settings: company.props.settings,
    subscription: company.props.subscription,
    branches: company.props.branches,
    plants: company.props.plants,
    departments: company.props.departments,
    teams: company.props.teams,
    invitations: company.props.invitations,
    userAssignments: company.props.userAssignments,
    createdAt: company.props.createdAt,
    updatedAt: company.props.updatedAt,
  };
}

export class CompanyUseCases {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  public async createCompany(input: CreateCompanyInput): Promise<Result<CompanyDTO>> {
    const existing = await this.companyRepo.findByCode(input.code);
    if (existing) {
      return Result.fail<CompanyDTO>(`Company code ${input.code} already exists`);
    }

    const defaultSettings = {
      timezone: 'UTC',
      defaultCurrency: 'USD',
      requireTwoFactorAuth: false,
      maxUsersAllowed: 50,
      allowExternalSuppliers: true,
      securityPolicy: 'STANDARD' as const,
      ...input.settings,
    };

    const defaultSubscription = {
      plan: 'ENTERPRISE' as const,
      status: 'ACTIVE' as const,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      maxPlants: 10,
      customDomainEnabled: true,
      supportLevel: 'PREMIUM' as const,
      ...input.subscription,
    };

    const result = CompanyAggregate.create({
      name: input.name,
      code: input.code,
      taxId: input.taxId,
      logoUrl: input.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop',
      settings: defaultSettings,
      subscription: defaultSubscription,
    });

    if (result.isFailure) {
      return Result.fail<CompanyDTO>(result.error!);
    }

    const company = result.getValue();
    await this.companyRepo.save(company);
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async addBranch(input: AddBranchInput): Promise<Result<CompanyDTO>> {
    const company = await this.companyRepo.findById(input.companyId);
    if (!company) {
      return Result.fail<CompanyDTO>('Company not found');
    }

    const branchResult = company.addBranch({
      name: input.name,
      code: input.code,
      city: input.city,
      country: input.country,
      isHeadquarters: input.isHeadquarters,
    });

    if (branchResult.isFailure) {
      return Result.fail<CompanyDTO>(branchResult.error!);
    }

    await this.companyRepo.save(company);
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async addPlant(input: AddPlantInput): Promise<Result<CompanyDTO>> {
    const company = await this.companyRepo.findById(input.companyId);
    if (!company) {
      return Result.fail<CompanyDTO>('Company not found');
    }

    const plantResult = company.addPlant({
      branchId: input.branchId,
      name: input.name,
      code: input.code,
      location: input.location,
      operationalCapacityPercentage: input.operationalCapacityPercentage,
    });

    if (plantResult.isFailure) {
      return Result.fail<CompanyDTO>(plantResult.error!);
    }

    await this.companyRepo.save(company);
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async addDepartment(input: AddDepartmentInput): Promise<Result<CompanyDTO>> {
    const company = await this.companyRepo.findById(input.companyId);
    if (!company) {
      return Result.fail<CompanyDTO>('Company not found');
    }

    const deptResult = company.addDepartment({
      branchId: input.branchId,
      plantId: input.plantId,
      name: input.name,
      code: input.code,
    });

    if (deptResult.isFailure) {
      return Result.fail<CompanyDTO>(deptResult.error!);
    }

    await this.companyRepo.save(company);
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async createTeam(input: CreateTeamInput): Promise<Result<CompanyDTO>> {
    const company = await this.companyRepo.findById(input.companyId);
    if (!company) {
      return Result.fail<CompanyDTO>('Company not found');
    }

    const teamResult = company.createTeam({
      departmentId: input.departmentId,
      name: input.name,
      leadUserId: input.leadUserId,
    });

    if (teamResult.isFailure) {
      return Result.fail<CompanyDTO>(teamResult.error!);
    }

    await this.companyRepo.save(company);
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async sendInvitation(input: SendInvitationInput): Promise<Result<CompanyDTO>> {
    const company = await this.companyRepo.findById(input.companyId);
    if (!company) {
      return Result.fail<CompanyDTO>('Company not found');
    }

    const invResult = company.sendInvitation({
      email: input.email,
      role: input.role,
      departmentId: input.departmentId,
      invitedByUserId: input.invitedByUserId,
    });

    if (invResult.isFailure) {
      return Result.fail<CompanyDTO>(invResult.error!);
    }

    await this.companyRepo.save(company);
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async assignUser(input: AssignUserInput): Promise<Result<CompanyDTO>> {
    const company = await this.companyRepo.findById(input.companyId);
    if (!company) {
      return Result.fail<CompanyDTO>('Company not found');
    }

    const assignResult = company.assignUser({
      userId: input.userId,
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      branchId: input.branchId,
      plantId: input.plantId,
      departmentId: input.departmentId,
      teamId: input.teamId,
      status: input.status,
    });

    if (assignResult.isFailure) {
      return Result.fail<CompanyDTO>(assignResult.error!);
    }

    await this.companyRepo.save(company);
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async updateSettings(input: UpdateCompanySettingsInput): Promise<Result<CompanyDTO>> {
    const company = await this.companyRepo.findById(input.companyId);
    if (!company) {
      return Result.fail<CompanyDTO>('Company not found');
    }

    if (input.logoUrl) {
      company.updateLogo(input.logoUrl);
    }
    if (input.settings) {
      company.updateSettings(input.settings);
    }
    if (input.subscription) {
      company.updateSubscription(input.subscription);
    }

    await this.companyRepo.save(company);
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async getCompanyDetails(companyId: string): Promise<Result<CompanyDTO>> {
    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      return Result.fail<CompanyDTO>('Company not found');
    }
    return Result.ok<CompanyDTO>(toCompanyDTO(company));
  }

  public async listCompanies(): Promise<Result<CompanyDTO[]>> {
    const companies = await this.companyRepo.findAll();
    return Result.ok<CompanyDTO[]>(companies.map(toCompanyDTO));
  }
}
