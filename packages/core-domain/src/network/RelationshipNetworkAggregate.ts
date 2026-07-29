import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type ConnectionDirection = 'COMPANY_FOLLOWS_SUPPLIER' | 'SUPPLIER_FOLLOWS_COMPANY' | 'MUTUAL_PARTNER';
export type ConnectionStatus = 'PENDING' | 'CONNECTED' | 'BLOCKED';

export interface NetworkConnection {
  id: string;
  companyId: string;
  companyName: string;
  supplierId: string;
  supplierName: string;
  direction: ConnectionDirection;
  status: ConnectionStatus;
  isFavorite: boolean;
  trustScore: number; // 0 - 100
  isVerified: boolean;
  verifiedAt?: string;
  establishedAt: string;
}

export interface SharedContact {
  id: string;
  companyId: string;
  supplierId: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  department: string;
  sharedAt: string;
}

export interface NetworkActivity {
  id: string;
  actorType: 'COMPANY' | 'SUPPLIER';
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  activityType: 'FOLLOWED' | 'CONNECTED' | 'VERIFIED' | 'TRUST_SCORE_UPDATED' | 'CONTACT_SHARED' | 'CERTIFICATION_CHECKED';
  details: string;
  timestamp: string;
}

export interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  logoUrl: string;
  matchScorePercentage: number;
  reason: string;
  mutualConnectionsCount: number;
  categories: string[];
}

export interface RelationshipNetworkProps {
  connections: NetworkConnection[];
  sharedContacts: SharedContact[];
  activities: NetworkActivity[];
  updatedAt: string;
}

export class RelationshipNetworkAggregate extends AggregateRoot<RelationshipNetworkProps> {
  private constructor(props: RelationshipNetworkProps, id?: string) {
    super(props, id);
  }

  public static create(
    props?: Partial<RelationshipNetworkProps>,
    id?: string
  ): Result<RelationshipNetworkAggregate> {
    const defaultProps: RelationshipNetworkProps = {
      connections: props?.connections || [],
      sharedContacts: props?.sharedContacts || [],
      activities: props?.activities || [],
      updatedAt: new Date().toISOString(),
    };

    return Result.ok<RelationshipNetworkAggregate>(new RelationshipNetworkAggregate(defaultProps, id || 'global-network'));
  }

  public followSupplier(companyId: string, companyName: string, supplierId: string, supplierName: string): Result<NetworkConnection> {
    let existing = this.props.connections.find(
      c => c.companyId === companyId && c.supplierId === supplierId
    );

    if (existing) {
      if (existing.direction === 'SUPPLIER_FOLLOWS_COMPANY') {
        existing.direction = 'MUTUAL_PARTNER';
        existing.status = 'CONNECTED';
      }
      this.recordActivity({
        actorType: 'COMPANY',
        actorId: companyId,
        actorName: companyName,
        targetId: supplierId,
        targetName: supplierName,
        activityType: 'FOLLOWED',
        details: `${companyName} followed vendor ${supplierName}`,
      });
      this.props.updatedAt = new Date().toISOString();
      return Result.ok<NetworkConnection>(existing);
    }

    const newConn: NetworkConnection = {
      id: crypto.randomUUID(),
      companyId,
      companyName,
      supplierId,
      supplierName,
      direction: 'COMPANY_FOLLOWS_SUPPLIER',
      status: 'CONNECTED',
      isFavorite: false,
      trustScore: 88,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      establishedAt: new Date().toISOString(),
    };

    this.props.connections.push(newConn);
    this.recordActivity({
      actorType: 'COMPANY',
      actorId: companyId,
      actorName: companyName,
      targetId: supplierId,
      targetName: supplierName,
      activityType: 'FOLLOWED',
      details: `${companyName} initiated follow connection with ${supplierName}`,
    });
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<NetworkConnection>(newConn);
  }

  public followCompany(supplierId: string, supplierName: string, companyId: string, companyName: string): Result<NetworkConnection> {
    let existing = this.props.connections.find(
      c => c.companyId === companyId && c.supplierId === supplierId
    );

    if (existing) {
      if (existing.direction === 'COMPANY_FOLLOWS_SUPPLIER') {
        existing.direction = 'MUTUAL_PARTNER';
        existing.status = 'CONNECTED';
      }
      this.recordActivity({
        actorType: 'SUPPLIER',
        actorId: supplierId,
        actorName: supplierName,
        targetId: companyId,
        targetName: companyName,
        activityType: 'FOLLOWED',
        details: `${supplierName} followed back ${companyName}`,
      });
      this.props.updatedAt = new Date().toISOString();
      return Result.ok<NetworkConnection>(existing);
    }

    const newConn: NetworkConnection = {
      id: crypto.randomUUID(),
      companyId,
      companyName,
      supplierId,
      supplierName,
      direction: 'SUPPLIER_FOLLOWS_COMPANY',
      status: 'CONNECTED',
      isFavorite: false,
      trustScore: 85,
      isVerified: false,
      establishedAt: new Date().toISOString(),
    };

    this.props.connections.push(newConn);
    this.recordActivity({
      actorType: 'SUPPLIER',
      actorId: supplierId,
      actorName: supplierName,
      targetId: companyId,
      targetName: companyName,
      activityType: 'FOLLOWED',
      details: `${supplierName} followed company ${companyName}`,
    });
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<NetworkConnection>(newConn);
  }

  public toggleFavorite(connectionId: string): Result<boolean> {
    const conn = this.props.connections.find(c => c.id === connectionId);
    if (!conn) {
      return Result.fail<boolean>('Connection not found');
    }
    conn.isFavorite = !conn.isFavorite;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<boolean>(conn.isFavorite);
  }

  public verifyConnection(connectionId: string): Result<NetworkConnection> {
    const conn = this.props.connections.find(c => c.id === connectionId);
    if (!conn) {
      return Result.fail<NetworkConnection>('Connection not found');
    }
    conn.isVerified = true;
    conn.verifiedAt = new Date().toISOString();
    conn.trustScore = Math.min(100, conn.trustScore + 10);

    this.recordActivity({
      actorType: 'COMPANY',
      actorId: conn.companyId,
      actorName: conn.companyName,
      targetId: conn.supplierId,
      targetName: conn.supplierName,
      activityType: 'VERIFIED',
      details: `Trust score upgraded & connection verified for ${conn.supplierName}`,
    });

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<NetworkConnection>(conn);
  }

  public addSharedContact(contactData: Omit<SharedContact, 'id' | 'sharedAt'>): Result<SharedContact> {
    const contact: SharedContact = {
      ...contactData,
      id: crypto.randomUUID(),
      sharedAt: new Date().toISOString(),
    };
    this.props.sharedContacts.push(contact);

    this.recordActivity({
      actorType: 'COMPANY',
      actorId: contact.companyId,
      actorName: 'Apex Industrial Systems',
      targetId: contact.supplierId,
      targetName: 'Vendor',
      activityType: 'CONTACT_SHARED',
      details: `Shared procurement contact ${contact.fullName} (${contact.title})`,
    });

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<SharedContact>(contact);
  }

  public recordActivity(activity: Omit<NetworkActivity, 'id' | 'timestamp'>): void {
    const act: NetworkActivity = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.props.activities.unshift(act); // Latest first
    if (this.props.activities.length > 50) {
      this.props.activities = this.props.activities.slice(0, 50);
    }
  }
}
