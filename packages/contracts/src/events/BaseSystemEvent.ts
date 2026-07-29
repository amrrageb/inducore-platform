export interface BaseSystemEvent<T = unknown> {
  eventId: string;
  eventType: string;
  tenantId: string;
  timestamp: string;
  payload: T;
}
