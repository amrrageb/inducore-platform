import { CompanyAggregate } from '@inducore/core-domain';
import { ICompanyRepository } from '@inducore/application';

export class InMemoryCompanyRepository implements ICompanyRepository {
  private companies: Map<string, CompanyAggregate> = new Map();

  constructor() {
    this.seedDefaultCompany();
  }

  private seedDefaultCompany() {
    const seedCompany = CompanyAggregate.create({
      name: 'Apex Industrial Systems',
      code: 'APEX-GLOBAL',
      taxId: 'US-883920194',
      logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop',
      settings: {
        timezone: 'America/New_York',
        defaultCurrency: 'USD',
        requireTwoFactorAuth: true,
        maxUsersAllowed: 250,
        allowExternalSuppliers: true,
        securityPolicy: 'FEDRAMP_COMPLIANT',
      },
      subscription: {
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        expiresAt: '2028-12-31T23:59:59Z',
        maxPlants: 15,
        customDomainEnabled: true,
        supportLevel: 'DEDICATED_24_7',
      },
      branches: [
        {
          id: 'b1',
          name: 'North America Headquarters',
          code: 'NA-HQ',
          city: 'Chicago',
          country: 'USA',
          isHeadquarters: true,
        },
        {
          id: 'b2',
          name: 'Europe Regional Operations',
          code: 'EU-BRANCH',
          city: 'Frankfurt',
          country: 'Germany',
          isHeadquarters: false,
        },
      ],
      plants: [
        {
          id: 'p1',
          branchId: 'b1',
          name: 'Apex Heavy Machinery Facility 1',
          code: 'PLANT-CHI-01',
          location: 'Industrial Park Zone 4, Chicago, IL',
          operationalCapacityPercentage: 94.2,
        },
        {
          id: 'p2',
          branchId: 'b2',
          name: 'Frankfurt Precision Assembly Plant',
          code: 'PLANT-FRA-02',
          location: 'Hessen Tech Park, Frankfurt',
          operationalCapacityPercentage: 88.5,
        },
      ],
      departments: [
        {
          id: 'd1',
          plantId: 'p1',
          name: 'Procurement & Vendor Management',
          code: 'DEPT-PROC',
        },
        {
          id: 'd2',
          plantId: 'p1',
          name: 'Plant Maintenance & Quality Control',
          code: 'DEPT-QUAL',
        },
        {
          id: 'd3',
          plantId: 'p2',
          name: 'Automated Robotics Assembly',
          code: 'DEPT-ROBO',
        },
      ],
      teams: [
        {
          id: 't1',
          departmentId: 'd1',
          name: 'Global RFQ & Sourcing Alpha',
          leadUserId: 'usr-101',
        },
        {
          id: 't2',
          departmentId: 'd2',
          name: 'Predictive Vibration Analysis Team',
          leadUserId: 'usr-102',
        },
      ],
      invitations: [
        {
          id: 'inv-1',
          email: 'sourcing.specialist@apexindustrial.com',
          role: 'MANAGER',
          departmentId: 'd1',
          invitedByUserId: 'usr-admin',
          token: 'tok-inv-9921',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
      ],
      userAssignments: [
        {
          id: 'ua-1',
          userId: 'usr-101',
          email: 'amr.rageb@inducore.io',
          fullName: 'Amr Rageb (Chief Operations Officer)',
          role: 'OWNER',
          branchId: 'b1',
          plantId: 'p1',
          departmentId: 'd1',
          teamId: 't1',
          status: 'ACTIVE',
          assignedAt: new Date().toISOString(),
        },
        {
          id: 'ua-2',
          userId: 'usr-102',
          email: 's.miller@apexindustrial.com',
          fullName: 'Sarah Miller (Plant Operations Director)',
          role: 'ADMIN',
          branchId: 'b1',
          plantId: 'p1',
          departmentId: 'd2',
          teamId: 't2',
          status: 'ACTIVE',
          assignedAt: new Date().toISOString(),
        },
      ],
    }, 'comp-apex-01').getValue();

    this.companies.set(seedCompany.id, seedCompany);
  }

  public async save(company: CompanyAggregate): Promise<void> {
    this.companies.set(company.id, company);
  }

  public async findById(id: string): Promise<CompanyAggregate | null> {
    return this.companies.get(id) || null;
  }

  public async findByCode(code: string): Promise<CompanyAggregate | null> {
    for (const comp of this.companies.values()) {
      if (comp.props.code.toLowerCase() === code.toLowerCase()) {
        return comp;
      }
    }
    return null;
  }

  public async findAll(): Promise<CompanyAggregate[]> {
    return Array.from(this.companies.values());
  }
}
