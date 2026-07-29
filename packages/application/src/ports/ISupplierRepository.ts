import { SupplierAggregate } from '@inducore/core-domain';

export interface SupplierSearchFilter {
  query?: string;
  category?: string;
  tag?: string;
  favoriteOnly?: boolean;
  minRating?: number;
}

export interface ISupplierRepository {
  save(supplier: SupplierAggregate): Promise<void>;
  findById(id: string): Promise<SupplierAggregate | null>;
  findByCode(code: string): Promise<SupplierAggregate | null>;
  findAll(filter?: SupplierSearchFilter): Promise<SupplierAggregate[]>;
}
