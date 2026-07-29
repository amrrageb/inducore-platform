import { QuotationAggregate } from '@inducore/core-domain';

export interface IQuotationRepository {
  findById(id: string): Promise<QuotationAggregate | null>;
  findByRfqId(rfqId: string): Promise<QuotationAggregate[]>;
  findBySupplierId(supplierId: string): Promise<QuotationAggregate[]>;
  findAll(): Promise<QuotationAggregate[]>;
  save(quotation: QuotationAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}
