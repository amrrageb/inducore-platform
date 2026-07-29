import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';
import { Guard } from '../common/Guard.js';

export interface ApiKeyProps {
  tenantId: string;
  name: string;
  keyPrefix: string;
  hashedSecret: string;
  scopes: string[];
  isActive: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdBy: string;
  createdAt: string;
}

export class ApiKeyAggregate extends AggregateRoot<ApiKeyProps> {
  private constructor(props: ApiKeyProps, id?: string) {
    super(props, id);
  }

  public static create(props: ApiKeyProps, id?: string): Result<ApiKeyAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.keyPrefix, argumentName: 'keyPrefix' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<ApiKeyAggregate>(nullGuard.error || 'Invalid API Key properties');
    }

    return Result.ok<ApiKeyAggregate>(new ApiKeyAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get name(): string { return this.props.name; }
  get keyPrefix(): string { return this.props.keyPrefix; }
  get scopes(): string[] { return this.props.scopes; }
  get isActive(): boolean { return this.props.isActive; }
  get lastUsedAt(): string | undefined { return this.props.lastUsedAt; }
  get expiresAt(): string | undefined { return this.props.expiresAt; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): string { return this.props.createdAt; }

  public revoke(): void {
    this.props.isActive = false;
  }
}

export interface WebhookProps {
  tenantId: string;
  name: string;
  targetUrl: string;
  secretKey: string;
  subscribedEvents: string[];
  isActive: boolean;
  failedAttempts: number;
  lastTriggeredAt?: string;
  lastResponseCode?: number;
  createdAt: string;
}

export class WebhookSubscriptionAggregate extends AggregateRoot<WebhookProps> {
  private constructor(props: WebhookProps, id?: string) {
    super(props, id);
  }

  public static create(props: WebhookProps, id?: string): Result<WebhookSubscriptionAggregate> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.tenantId, argumentName: 'tenantId' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.targetUrl, argumentName: 'targetUrl' },
    ]);

    if (nullGuard.isFailure) {
      return Result.fail<WebhookSubscriptionAggregate>(nullGuard.error || 'Invalid Webhook properties');
    }

    if (!props.targetUrl.startsWith('http://') && !props.targetUrl.startsWith('https://')) {
      return Result.fail<WebhookSubscriptionAggregate>('Webhook target URL must start with http:// or https://');
    }

    return Result.ok<WebhookSubscriptionAggregate>(new WebhookSubscriptionAggregate(props, id));
  }

  get tenantId(): string { return this.props.tenantId; }
  get name(): string { return this.props.name; }
  get targetUrl(): string { return this.props.targetUrl; }
  get secretKey(): string { return this.props.secretKey; }
  get subscribedEvents(): string[] { return this.props.subscribedEvents; }
  get isActive(): boolean { return this.props.isActive; }
  get failedAttempts(): number { return this.props.failedAttempts; }
  get lastTriggeredAt(): string | undefined { return this.props.lastTriggeredAt; }
  get lastResponseCode(): number | undefined { return this.props.lastResponseCode; }

  public toggleActive(): void {
    this.props.isActive = !this.props.isActive;
  }

  public recordDeliveryResult(statusCode: number): void {
    this.props.lastTriggeredAt = new Date().toISOString();
    this.props.lastResponseCode = statusCode;
    if (statusCode >= 200 && statusCode < 300) {
      this.props.failedAttempts = 0;
    } else {
      this.props.failedAttempts += 1;
      if (this.props.failedAttempts >= 5) {
        this.props.isActive = false;
      }
    }
  }
}
