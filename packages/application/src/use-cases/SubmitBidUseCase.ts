import { SupplierBid, Money, Result } from '@inducore/core-domain';
import { SubmitBidDTO, SubmitBidDTOSchema } from '../dtos/SubmitBidDTO.js';
import { IRFQRepository } from '../ports/IRFQRepository.js';
import { IEventOutboxPublisher } from '../ports/IEventOutboxPublisher.js';

export class SubmitBidUseCase {
  constructor(
    private readonly rfqRepo: IRFQRepository,
    private readonly outboxPublisher: IEventOutboxPublisher
  ) {}

  public async execute(rawDto: SubmitBidDTO): Promise<Result<void>> {
    const parseResult = SubmitBidDTOSchema.safeParse(rawDto);
    if (!parseResult.success) {
      return Result.fail<void>(parseResult.error.errors.map(e => e.message).join(', '));
    }

    const dto = parseResult.data;
    const rfq = await this.rfqRepo.findById(dto.rfqId, dto.tenantId);
    if (!rfq) {
      return Result.fail<void>('RFQ not found or access denied');
    }

    const moneyOrError = Money.create(dto.totalBidAmount, dto.currency);
    if (moneyOrError.isFailure) return Result.fail<void>(moneyOrError.error!);

    const bidOrError = SupplierBid.create({
      supplierId: dto.supplierId,
      supplierName: dto.supplierName,
      totalBidAmount: moneyOrError.getValue(),
      leadTimeDays: dto.leadTimeDays,
      submittedAt: new Date()
    });
    if (bidOrError.isFailure) return Result.fail<void>(bidOrError.error!);

    const bidResult = rfq.submitBid(bidOrError.getValue());
    if (bidResult.isFailure) return Result.fail<void>(bidResult.error!);

    await this.rfqRepo.save(rfq);
    await this.outboxPublisher.publish(rfq.domainEvents, dto.tenantId);
    rfq.clearEvents();

    return Result.ok<void>();
  }
}
