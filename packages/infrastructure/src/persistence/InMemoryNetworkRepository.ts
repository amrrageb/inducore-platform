import { RelationshipNetworkAggregate, NetworkConnection, SharedContact, NetworkActivity } from '@inducore/core-domain';
import { INetworkRepository } from '@inducore/application';

export class InMemoryNetworkRepository implements INetworkRepository {
  private networkAggregate: RelationshipNetworkAggregate;

  constructor() {
    this.networkAggregate = this.seedDefaultNetwork();
  }

  private seedDefaultNetwork(): RelationshipNetworkAggregate {
    const seedConnections: NetworkConnection[] = [
      {
        id: 'conn-1',
        companyId: 'comp-apex-01',
        companyName: 'Apex Industrial Systems',
        supplierId: 'sup-siemens-01',
        supplierName: 'Siemens Industrial Automation',
        direction: 'MUTUAL_PARTNER',
        status: 'CONNECTED',
        isFavorite: true,
        trustScore: 96,
        isVerified: true,
        verifiedAt: '2025-01-15T09:00:00Z',
        establishedAt: '2024-06-10T10:00:00Z',
      },
      {
        id: 'conn-2',
        companyId: 'comp-apex-01',
        companyName: 'Apex Industrial Systems',
        supplierId: 'sup-schneider-02',
        supplierName: 'Schneider Electric Power Systems',
        direction: 'COMPANY_FOLLOWS_SUPPLIER',
        status: 'CONNECTED',
        isFavorite: true,
        trustScore: 91,
        isVerified: true,
        verifiedAt: '2025-02-01T12:00:00Z',
        establishedAt: '2024-08-20T11:30:00Z',
      },
      {
        id: 'conn-3',
        companyId: 'comp-apex-01',
        companyName: 'Apex Industrial Systems',
        supplierId: 'sup-bosch-03',
        supplierName: 'Bosch Rexroth Hydraulics & Motion',
        direction: 'SUPPLIER_FOLLOWS_COMPANY',
        status: 'CONNECTED',
        isFavorite: false,
        trustScore: 84,
        isVerified: false,
        establishedAt: '2025-03-01T14:15:00Z',
      },
    ];

    const seedContacts: SharedContact[] = [
      {
        id: 'cnt-1',
        companyId: 'comp-apex-01',
        supplierId: 'sup-siemens-01',
        fullName: 'Dr. Markus Weber',
        title: 'Lead Industrial Automation Engineer',
        email: 'm.weber@siemens-automation.com',
        phone: '+49 89 636-00',
        department: 'OEM Integration & Support',
        sharedAt: '2025-01-20T10:00:00Z',
      },
      {
        id: 'cnt-2',
        companyId: 'comp-apex-01',
        supplierId: 'sup-schneider-02',
        fullName: 'Claire Dupont',
        title: 'Key Account Procurement Manager',
        email: 'claire.dupont@se-power.com',
        phone: '+33 1 41 29 70 00',
        department: 'Global Enterprise Sales',
        sharedAt: '2025-02-05T15:20:00Z',
      },
    ];

    const seedActivities: NetworkActivity[] = [
      {
        id: 'act-1',
        actorType: 'COMPANY',
        actorId: 'comp-apex-01',
        actorName: 'Apex Industrial Systems',
        targetId: 'sup-siemens-01',
        targetName: 'Siemens Industrial Automation',
        activityType: 'VERIFIED',
        details: 'Apex verified ISO9001 compliance credentials & upgraded trust score to 96.',
        timestamp: '2025-03-14T08:30:00Z',
      },
      {
        id: 'act-2',
        actorType: 'SUPPLIER',
        actorId: 'sup-schneider-02',
        actorName: 'Schneider Electric Power Systems',
        targetId: 'comp-apex-01',
        targetName: 'Apex Industrial Systems',
        activityType: 'CONNECTED',
        details: 'Schneider Electric accepted mutual partner connection request.',
        timestamp: '2025-03-12T11:15:00Z',
      },
      {
        id: 'act-3',
        actorType: 'COMPANY',
        actorId: 'comp-apex-01',
        actorName: 'Apex Industrial Systems',
        targetId: 'sup-bosch-03',
        targetName: 'Bosch Rexroth Hydraulics',
        activityType: 'FOLLOWED',
        details: 'Apex followed Bosch Rexroth for high-pressure hydraulic pump procurement updates.',
        timestamp: '2025-03-10T16:00:00Z',
      },
    ];

    return RelationshipNetworkAggregate.create({
      connections: seedConnections,
      sharedContacts: seedContacts,
      activities: seedActivities,
      updatedAt: new Date().toISOString(),
    }, 'global-network').getValue();
  }

  public async getNetwork(): Promise<RelationshipNetworkAggregate> {
    return this.networkAggregate;
  }

  public async saveNetwork(network: RelationshipNetworkAggregate): Promise<void> {
    this.networkAggregate = network;
  }
}
