import { RFQAggregate, RFQLineItem, TenantId, Money, Result } from '@inducore/core-domain';
import { CreateRFQDTO, CreateRFQDTOSchema } from '../dtos/CreateRFQDTO.js';
import { IRFQRepository } from '../ports/IRFQRepository.js';
import { IEventOutboxPublisher } from '../ports/IEventOutboxPublisher.js';

export class CreateRFQUseCase {
  constructor(
    private readonly rfqRepo: IRFQRepository,
    private readonly outboxPublisher: IEventOutboxPublisher
  ) {}

  public async execute(rawDto: CreateRFQDTO): Promise<Result<{ rfqId: string }>> {
    const parseResult = CreateRFQDTOSchema.safeParse(rawDto);
    if (!parseResult.success) {
      return Result.fail<{ rfqId: string }>(parseResult.error.errors.map(e => e.message).join(', '));
    }

    const dto = parseResult.data;
    const tenantIdOrError = TenantId.create(dto.tenantId);
    if (tenantIdOrError.isFailure) return Result.fail<{ rfqId: string }>(tenantIdOrError.error!);

    const lineItems: RFQLineItem[] = [];
    for (const itemDto of dto.lineItems) {
      let targetPrice: Money | undefined = undefined;
      if (itemDto.targetPriceAmount !== undefined) {
        const moneyOrError = Money.create(itemDto.targetPriceAmount, itemDto.currency);
        if (moneyOrError.isFailure) return Result.fail<{ rfqId: string }>(moneyOrError.error!);
        targetPrice = moneyOrError.getValue();
      }

      const lineItemOrError = RFQLineItem.create({
        sku: itemDto.sku,
        partName: itemDto.partName,
        quantity: itemDto.quantity,
        targetPrice
      });
      if (lineItemOrError.isFailure) return Result.fail<{ rfqId: string }>(lineItemOrError.error!);
      lineItems.push(lineItemOrError.getValue());
    }

    const rfqOrError = RFQAggregate.create({
      tenantId: tenantIdOrError.getValue(),
      title: dto.title,
      description: dto.description,
      lineItems
    });
    if (rfqOrError.isFailure) return Result.fail<{ rfqId: string }>(rfqOrError.error!);

    const rfq = rfqOrError.getValue();
    const publishResult = rfq.publish();
    if (publishResult.isFailure) return Result.fail<{ rfqId: string }>(publishResult.error!);

    await this.rfqRepo.save(rfq);
    await this.outboxPublisher.publish(rfq.domainEvents, dto.tenantId);
    rfq.clearEvents();

    return Result.ok<{ rfqId: string }>({ rfqId: rfq.id });
  }
}
