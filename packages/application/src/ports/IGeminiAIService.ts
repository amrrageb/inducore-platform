import { SupplierBid } from '@inducore/core-domain';

export interface IGeminiAIService {
  evaluateBids(bids: SupplierBid[], rfqRequirements: string): Promise<{ supplierId: string; score: number; reasoning: string }[]>;
}
