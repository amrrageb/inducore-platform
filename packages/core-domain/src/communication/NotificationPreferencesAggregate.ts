import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export interface ChannelMatrix {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationPreferencesProps {
  userId: string;
  tenantId: string;
  userEmail: string;
  userPhone?: string;
  rfqUpdates: ChannelMatrix;
  poStatus: ChannelMatrix;
  contractApprovals: ChannelMatrix;
  qualityAlerts: ChannelMatrix;
  announcements: ChannelMatrix;
  directMessages: ChannelMatrix;
  digestFrequency: 'INSTANT' | 'DAILY_SUMMARY' | 'WEEKLY_DIGEST';
  doNotDisturb: boolean;
  updatedAt: string;
}

export class NotificationPreferencesAggregate extends AggregateRoot<NotificationPreferencesProps> {
  private constructor(props: NotificationPreferencesProps, id?: string) {
    super(props, id);
  }

  public static create(props: NotificationPreferencesProps, id?: string): Result<NotificationPreferencesAggregate> {
    if (!props.userId || !props.tenantId) {
      return Result.fail<NotificationPreferencesAggregate>('User ID and Tenant ID are required');
    }
    return Result.ok<NotificationPreferencesAggregate>(new NotificationPreferencesAggregate(props, id || props.userId));
  }

  public updatePreferences(newProps: Partial<NotificationPreferencesProps>): void {
    Object.assign(this.props, newProps, { updatedAt: new Date().toISOString() });
  }

  get userId(): string { return this.props.userId; }
  get tenantId(): string { return this.props.tenantId; }
  get digestFrequency(): string { return this.props.digestFrequency; }
  get doNotDisturb(): boolean { return this.props.doNotDisturb; }
}
