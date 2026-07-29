import { CompanyAggregate } from '@inducore/core-domain';

export interface ICompanyRepository {
  save(company: CompanyAggregate): Promise<void>;
  findById(id: string): Promise<CompanyAggregate | null>;
  findByCode(code: string): Promise<CompanyAggregate | null>;
  findAll(): Promise<CompanyAggregate[]>;
}
