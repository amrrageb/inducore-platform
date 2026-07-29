import { CompanySettings, SubscriptionMetadata, Branch, Plant, Department, Team, Invitation, UserAssignment } from '@inducore/core-domain';

export interface CompanyDTO {
  id: string;
  name: string;
  code: string;
  taxId?: string;
  logoUrl: string;
  settings: CompanySettings;
  subscription: SubscriptionMetadata;
  branches: Branch[];
  plants: Plant[];
  departments: Department[];
  teams: Team[];
  invitations: Invitation[];
  userAssignments: UserAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyInput {
  name: string;
  code: string;
  taxId?: string;
  logoUrl?: string;
  settings?: Partial<CompanySettings>;
  subscription?: Partial<SubscriptionMetadata>;
}

export interface AddBranchInput {
  companyId: string;
  name: string;
  code: string;
  city: string;
  country: string;
  isHeadquarters: boolean;
}

export interface AddPlantInput {
  companyId: string;
  branchId: string;
  name: string;
  code: string;
  location: string;
  operationalCapacityPercentage: number;
}

export interface AddDepartmentInput {
  companyId: string;
  branchId?: string;
  plantId?: string;
  name: string;
  code: string;
}

export interface CreateTeamInput {
  companyId: string;
  departmentId: string;
  name: string;
  leadUserId?: string;
}

export interface SendInvitationInput {
  companyId: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  departmentId?: string;
  invitedByUserId: string;
}

export interface AssignUserInput {
  companyId: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  branchId?: string;
  plantId?: string;
  departmentId?: string;
  teamId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateCompanySettingsInput {
  companyId: string;
  logoUrl?: string;
  settings?: Partial<CompanySettings>;
  subscription?: Partial<SubscriptionMetadata>;
}
