export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    correlationId: string;
    tenantId: string;
  };
}
