import { RelationshipNetworkAggregate } from '@inducore/core-domain';

export interface INetworkRepository {
  getNetwork(): Promise<RelationshipNetworkAggregate>;
  saveNetwork(network: RelationshipNetworkAggregate): Promise<void>;
}
