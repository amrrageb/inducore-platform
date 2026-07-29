export type TenantIdString = string;
export type CorrelationIdString = string;

export interface BaseMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
