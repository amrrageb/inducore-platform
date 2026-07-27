import { Result } from '@inducore/core-domain';
import { IRFQRepository } from '../ports/IRFQRepository.js';
import { IGeminiAIService } from '../ports/IGeminiAIService.js';

export class EvaluateBidsWithAIUseCase {
  constructor(
    private readonly rfqRepo: IRFQRepository,
    private readonly geminiService: IGeminiAIService
  ) {}

  public async execute(rfqId: string, tenantId: string): Promise<Result<{ supplierId: string; score: number; reasoning: string }[]>> {
    const rfq = await this.rfqRepo.findById(rfqId, tenantId);
    if (!rfq) {
      return Result.fail('RFQ not found');
    }

    if (rfq.bids.length === 0) {
      return Result.fail('No bids submitted for evaluation');
    }

    const evaluationResults = await this.geminiService.evaluateBids(rfq.bids, rfq.description || rfq.title);

    for (const evalResult of evaluationResults) {
      const bid = rfq.bids.find(b => b.supplierId === evalResult.supplierId);
      if (bid) {
        bid.assignScore(evalResult.score);
      }
    }

    await this.rfqRepo.save(rfq);
    return Result.ok(evaluationResults);
  }
}
