import { ContractAggregate } from '@inducore/core-domain';

export interface IContractRepository {
  findAll(): Promise<ContractAggregate[]>;
  findById(id: string): Promise<ContractAggregate | null>;
  findByNumber(contractNumber: string): Promise<ContractAggregate | null>;
  save(contract: ContractAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}
