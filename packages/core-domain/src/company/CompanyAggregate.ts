import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export interface CompanySettings {
  timezone: string;
  defaultCurrency: string;
  requireTwoFactorAuth: boolean;
  maxUsersAllowed: number;
  allowExternalSuppliers: boolean;
  securityPolicy: 'STANDARD' | 'STRICT' | 'FEDRAMP_COMPLIANT';
}

export interface SubscriptionMetadata {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'TRIAL';
  expiresAt: string;
  maxPlants: number;
  customDomainEnabled: boolean;
  supportLevel: 'STANDARD' | 'PREMIUM' | 'DEDICATED_24_7';
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  isHeadquarters: boolean;
}

export interface Plant {
  id: string;
  branchId: string;
  name: string;
  code: string;
  location: string;
  operationalCapacityPercentage: number;
}

export interface Department {
  id: string;
  plantId?: string;
  branchId?: string;
  name: string;
  code: string;
}

export interface Team {
  id: string;
  departmentId: string;
  name: string;
  leadUserId?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  departmentId?: string;
  invitedByUserId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
}

export interface UserAssignment {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  branchId?: string;
  plantId?: string;
  departmentId?: string;
  teamId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  assignedAt: string;
}

export interface CompanyProps {
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

export class CompanyAggregate extends AggregateRoot<CompanyProps> {
  private constructor(props: CompanyProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: Omit<CompanyProps, 'branches' | 'plants' | 'departments' | 'teams' | 'invitations' | 'userAssignments' | 'createdAt' | 'updatedAt'> & {
      branches?: Branch[];
      plants?: Plant[];
      departments?: Department[];
      teams?: Team[];
      invitations?: Invitation[];
      userAssignments?: UserAssignment[];
    },
    id?: string
  ): Result<CompanyAggregate> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<CompanyAggregate>('Company name is required');
    }
    if (!props.code || props.code.trim().length === 0) {
      return Result.fail<CompanyAggregate>('Company registration/code is required');
    }

    const companyProps: CompanyProps = {
      ...props,
      branches: props.branches || [],
      plants: props.plants || [],
      departments: props.departments || [],
      teams: props.teams || [],
      invitations: props.invitations || [],
      userAssignments: props.userAssignments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return Result.ok<CompanyAggregate>(new CompanyAggregate(companyProps, id));
  }

  public addBranch(branchData: Omit<Branch, 'id'>): Result<Branch> {
    const branch: Branch = {
      ...branchData,
      id: crypto.randomUUID(),
    };
    this.props.branches.push(branch);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<Branch>(branch);
  }

  public addPlant(plantData: Omit<Plant, 'id'>): Result<Plant> {
    if (this.props.plants.length >= this.props.subscription.maxPlants) {
      return Result.fail<Plant>(`Subscription limit reached. Maximum plants allowed: ${this.props.subscription.maxPlants}`);
    }
    const plant: Plant = {
      ...plantData,
      id: crypto.randomUUID(),
    };
    this.props.plants.push(plant);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<Plant>(plant);
  }

  public addDepartment(deptData: Omit<Department, 'id'>): Result<Department> {
    const department: Department = {
      ...deptData,
      id: crypto.randomUUID(),
    };
    this.props.departments.push(department);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<Department>(department);
  }

  public createTeam(teamData: Omit<Team, 'id'>): Result<Team> {
    const team: Team = {
      ...teamData,
      id: crypto.randomUUID(),
    };
    this.props.teams.push(team);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<Team>(team);
  }

  public sendInvitation(invData: Omit<Invitation, 'id' | 'token' | 'status' | 'createdAt'>): Result<Invitation> {
    const invitation: Invitation = {
      ...invData,
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.props.invitations.push(invitation);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<Invitation>(invitation);
  }

  public assignUser(assignmentData: Omit<UserAssignment, 'id' | 'assignedAt'>): Result<UserAssignment> {
    const existing = this.props.userAssignments.find(u => u.userId === assignmentData.userId || u.email === assignmentData.email);
    if (existing) {
      existing.role = assignmentData.role;
      existing.branchId = assignmentData.branchId;
      existing.plantId = assignmentData.plantId;
      existing.departmentId = assignmentData.departmentId;
      existing.teamId = assignmentData.teamId;
      existing.status = assignmentData.status;
      this.props.updatedAt = new Date().toISOString();
      return Result.ok<UserAssignment>(existing);
    }

    const assignment: UserAssignment = {
      ...assignmentData,
      id: crypto.randomUUID(),
      assignedAt: new Date().toISOString(),
    };
    this.props.userAssignments.push(assignment);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<UserAssignment>(assignment);
  }

  public updateSettings(newSettings: Partial<CompanySettings>): void {
    this.props.settings = { ...this.props.settings, ...newSettings };
    this.props.updatedAt = new Date().toISOString();
  }

  public updateSubscription(newSubscription: Partial<SubscriptionMetadata>): void {
    this.props.subscription = { ...this.props.subscription, ...newSubscription };
    this.props.updatedAt = new Date().toISOString();
  }

  public updateLogo(logoUrl: string): void {
    this.props.logoUrl = logoUrl;
    this.props.updatedAt = new Date().toISOString();
  }
}
