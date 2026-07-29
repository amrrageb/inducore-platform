import { Result, PurchaseOrderAggregate } from '@inducore/core-domain';
import { IPurchaseOrderRepository } from '../../ports/IPurchaseOrderRepository.js';
import {
  CreatePODTO,
  ApprovePODTO,
  AddDeliveryScheduleDTO,
  AddShipmentDTO,
  RecordGoodsReceiptDTO,
  RevisePODTO,
  ClosePODTO,
  PurchaseOrderDTO,
} from '../../dtos/PurchaseOrderDTOs.js';

export class PurchaseOrderUseCases {
  constructor(private poRepo: IPurchaseOrderRepository) {}

  private mapToDTO(po: PurchaseOrderAggregate): PurchaseOrderDTO {
    return {
      id: po.id,
      poNumber: po.props.poNumber,
      awardId: po.props.awardId,
      rfqId: po.props.rfqId,
      supplierId: po.props.supplierId,
      supplierName: po.props.supplierName,
      status: po.props.status,
      version: po.props.version,
      currency: po.props.currency,
      totalAmount: po.props.totalAmount,
      paymentTerms: po.props.paymentTerms,
      incoterm: po.props.incoterm,
      lineItems: po.props.lineItems,
      deliverySchedules: po.props.deliverySchedules,
      shipments: po.props.shipments,
      goodsReceipts: po.props.goodsReceipts,
      approvalWorkflow: po.props.approvalWorkflow,
      revisionHistory: po.props.revisionHistory,
      closureReason: po.props.closureReason,
      createdAt: po.props.createdAt,
      updatedAt: po.props.updatedAt,
    };
  }

  public async getAllPOs(): Promise<Result<PurchaseOrderDTO[]>> {
    const pos = await this.poRepo.findAll();
    return Result.ok<PurchaseOrderDTO[]>(pos.map(po => this.mapToDTO(po)));
  }

  public async getPOById(id: string): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(id);
    if (!po) {
      return Result.fail<PurchaseOrderDTO>('Purchase order not found');
    }
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async createPO(dto: CreatePODTO): Promise<Result<PurchaseOrderDTO>> {
    const poNumber = dto.poNumber || `PO-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const lineItems = dto.lineItems.map(l => ({
      ...l,
      receivedQuantity: 0,
      deliveryStatus: 'PENDING' as const,
    }));

    const poResult = PurchaseOrderAggregate.create({
      poNumber,
      awardId: dto.awardId,
      rfqId: dto.rfqId,
      supplierId: dto.supplierId,
      supplierName: dto.supplierName,
      status: 'DRAFT',
      version: 1,
      currency: dto.currency || 'USD',
      totalAmount: lineItems.reduce((acc, item) => acc + item.totalPrice, 0),
      paymentTerms: dto.paymentTerms || 'NET 30',
      incoterm: dto.incoterm || 'FOB Origin',
      lineItems,
      deliverySchedules: [],
      shipments: [],
      goodsReceipts: [],
      approvalWorkflow: [],
      revisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (poResult.isFailure) {
      return Result.fail<PurchaseOrderDTO>(poResult.errorValue());
    }

    const po = poResult.getValue();
    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async submitPO(id: string): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(id);
    if (!po) return Result.fail<PurchaseOrderDTO>('PO not found');

    const submitRes = po.submitForApproval();
    if (submitRes.isFailure) return Result.fail<PurchaseOrderDTO>(submitRes.errorValue());

    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async approvePO(dto: ApprovePODTO): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(dto.id);
    if (!po) return Result.fail<PurchaseOrderDTO>('PO not found');

    const appRes = po.approve(dto.approverName, dto.role, dto.notes);
    if (appRes.isFailure) return Result.fail<PurchaseOrderDTO>(appRes.errorValue());

    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async issuePO(id: string): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(id);
    if (!po) return Result.fail<PurchaseOrderDTO>('PO not found');

    const issueRes = po.issuePO();
    if (issueRes.isFailure) return Result.fail<PurchaseOrderDTO>(issueRes.errorValue());

    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async addDeliverySchedule(dto: AddDeliveryScheduleDTO): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(dto.poId);
    if (!po) return Result.fail<PurchaseOrderDTO>('PO not found');

    const schedRes = po.addDeliverySchedule({
      lineItemId: dto.lineItemId,
      itemName: dto.itemName,
      expectedDate: dto.expectedDate,
      quantity: dto.quantity,
      destinationAddress: dto.destinationAddress,
      status: 'SCHEDULED',
    });
    if (schedRes.isFailure) return Result.fail<PurchaseOrderDTO>(schedRes.errorValue());

    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async addShipment(dto: AddShipmentDTO): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(dto.poId);
    if (!po) return Result.fail<PurchaseOrderDTO>('PO not found');

    const shipRes = po.addShipment({
      carrier: dto.carrier,
      trackingNumber: dto.trackingNumber,
      dispatchedDate: dto.dispatchedDate,
      estimatedArrival: dto.estimatedArrival,
      status: 'IN_TRANSIT',
      notes: dto.notes,
    });
    if (shipRes.isFailure) return Result.fail<PurchaseOrderDTO>(shipRes.errorValue());

    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async recordGoodsReceipt(dto: RecordGoodsReceiptDTO): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(dto.poId);
    if (!po) return Result.fail<PurchaseOrderDTO>('PO not found');

    const grnRes = po.recordGoodsReceipt({
      receivedBy: dto.receivedBy,
      overallNotes: dto.overallNotes,
      items: dto.items,
    });
    if (grnRes.isFailure) return Result.fail<PurchaseOrderDTO>(grnRes.errorValue());

    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async revisePO(dto: RevisePODTO): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(dto.poId);
    if (!po) return Result.fail<PurchaseOrderDTO>('PO not found');

    const revRes = po.revisePO(dto.revisedBy, dto.reason, dto.updatedLineItems);
    if (revRes.isFailure) return Result.fail<PurchaseOrderDTO>(revRes.errorValue());

    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }

  public async closePO(dto: ClosePODTO): Promise<Result<PurchaseOrderDTO>> {
    const po = await this.poRepo.findById(dto.poId);
    if (!po) return Result.fail<PurchaseOrderDTO>('PO not found');

    const closeRes = po.closePO(dto.reason);
    if (closeRes.isFailure) return Result.fail<PurchaseOrderDTO>(closeRes.errorValue());

    await this.poRepo.save(po);
    return Result.ok<PurchaseOrderDTO>(this.mapToDTO(po));
  }
}
