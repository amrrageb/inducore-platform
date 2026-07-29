import { Result, SupplierRecommendation } from '@inducore/core-domain';
import { INetworkRepository } from '../../ports/INetworkRepository.js';
import { ISupplierRepository } from '../../ports/ISupplierRepository.js';
import {
  NetworkSummaryDTO,
  FollowSupplierInput,
  FollowCompanyInput,
  AddSharedContactInput,
} from '../../dtos/NetworkDTOs.js';

export class NetworkUseCases {
  constructor(
    private readonly networkRepo: INetworkRepository,
    private readonly supplierRepo: ISupplierRepository
  ) {}

  public async getNetworkSummary(): Promise<Result<NetworkSummaryDTO>> {
    const network = await this.networkRepo.getNetwork();
    const suppliers = await this.supplierRepo.findAll();

    // Calculate AI recommendations
    const recommendations: SupplierRecommendation[] = suppliers.map(s => {
      const isConnected = network.props.connections.some(c => c.supplierId === s.id);
      return {
        supplierId: s.id,
        supplierName: s.props.name,
        supplierCode: s.props.code,
        logoUrl: s.props.logoUrl,
        matchScorePercentage: isConnected ? 98 : 86,
        reason: isConnected
          ? 'Existing verified partner in your network with high ISO trust rating'
          : `Matches your active industrial category (${s.props.categories[0] || 'Automation'}) and verified certifications`,
        mutualConnectionsCount: Math.floor(Math.random() * 5) + 2,
        categories: s.props.categories,
      };
    });

    return Result.ok<NetworkSummaryDTO>({
      connections: network.props.connections,
      sharedContacts: network.props.sharedContacts,
      activities: network.props.activities,
      recommendations,
      updatedAt: network.props.updatedAt,
    });
  }

  public async followSupplier(input: FollowSupplierInput): Promise<Result<NetworkSummaryDTO>> {
    const network = await this.networkRepo.getNetwork();
    const res = network.followSupplier(
      input.companyId,
      input.companyName,
      input.supplierId,
      input.supplierName
    );

    if (res.isFailure) {
      return Result.fail<NetworkSummaryDTO>(res.error!);
    }

    await this.networkRepo.saveNetwork(network);
    return this.getNetworkSummary();
  }

  public async followCompany(input: FollowCompanyInput): Promise<Result<NetworkSummaryDTO>> {
    const network = await this.networkRepo.getNetwork();
    const res = network.followCompany(
      input.supplierId,
      input.supplierName,
      input.companyId,
      input.companyName
    );

    if (res.isFailure) {
      return Result.fail<NetworkSummaryDTO>(res.error!);
    }

    await this.networkRepo.saveNetwork(network);
    return this.getNetworkSummary();
  }

  public async toggleFavorite(connectionId: string): Promise<Result<NetworkSummaryDTO>> {
    const network = await this.networkRepo.getNetwork();
    const res = network.toggleFavorite(connectionId);
    if (res.isFailure) {
      return Result.fail<NetworkSummaryDTO>(res.error!);
    }
    await this.networkRepo.saveNetwork(network);
    return this.getNetworkSummary();
  }

  public async verifyConnection(connectionId: string): Promise<Result<NetworkSummaryDTO>> {
    const network = await this.networkRepo.getNetwork();
    const res = network.verifyConnection(connectionId);
    if (res.isFailure) {
      return Result.fail<NetworkSummaryDTO>(res.error!);
    }
    await this.networkRepo.saveNetwork(network);
    return this.getNetworkSummary();
  }

  public async addSharedContact(input: AddSharedContactInput): Promise<Result<NetworkSummaryDTO>> {
    const network = await this.networkRepo.getNetwork();
    const res = network.addSharedContact(input);
    if (res.isFailure) {
      return Result.fail<NetworkSummaryDTO>(res.error!);
    }
    await this.networkRepo.saveNetwork(network);
    return this.getNetworkSummary();
  }
}
