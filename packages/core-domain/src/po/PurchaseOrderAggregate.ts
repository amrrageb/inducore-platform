import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type POStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ISSUED'
  | 'IN_TRANSIT'
  | 'PARTIALLY_RECEIVED'
  | 'FULLY_RECEIVED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REVISED';

export type DeliveryDiscrepancyType = 'NONE' | 'OVER' | 'UNDER' | 'DAMAGED';

export interface POLineItem {
  id: string;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  deliveryStatus: 'PENDING' | 'PARTIAL' | 'OVER_DELIVERED' | 'UNDER_DELIVERED' | 'COMPLETED';
}

export interface PODeliverySchedule {
  id: string;
  lineItemId: string;
  itemName: string;
  expectedDate: string;
  quantity: number;
  destinationAddress: string;
  status: 'SCHEDULED' | 'DISPATCHED' | 'DELIVERED' | 'DELAYED';
}

export interface POShipmentTracking {
  id: string;
  carrier: string;
  trackingNumber: string;
  dispatchedDate: string;
  estimatedArrival: string;
  status: 'IN_TRANSIT' | 'CUSTOMS_CLEARANCE' | 'DELIVERED' | 'EXCEPTIONS';
  notes: string;
}

export interface POGoodsReceiptItem {
  lineItemId: string;
  quantityReceived: number;
  discrepancyType: DeliveryDiscrepancyType;
  conditionNotes?: string;
}

export interface POGoodsReceipt {
  id: string;
  grnNumber: string;
  receivedDate: string;
  receivedBy: string;
  items: POGoodsReceiptItem[];
  overallNotes: string;
}

export interface POApprovalLog {
  id: string;
  approverName: string;
  role: string;
  status: 'APPROVED' | 'REJECTED';
  notes: string;
  timestamp: string;
}

export interface PORevisionLog {
  version: number;
  revisedBy: string;
  reason: string;
  previousAmount: number;
  newAmount: number;
  timestamp: string;
}

export interface PurchaseOrderProps {
  poNumber: string;
  awardId?: string;
  rfqId?: string;
  supplierId: string;
  supplierName: string;
  status: POStatus;
  version: number;
  currency: string;
  totalAmount: number;
  paymentTerms: string;
  incoterm: string;
  lineItems: POLineItem[];
  deliverySchedules: PODeliverySchedule[];
  shipments: POShipmentTracking[];
  goodsReceipts: POGoodsReceipt[];
  approvalWorkflow: POApprovalLog[];
  revisionHistory: PORevisionLog[];
  closureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export class PurchaseOrderAggregate extends AggregateRoot<PurchaseOrderProps> {
  private constructor(props: PurchaseOrderProps, id?: string) {
    super(props, id);
  }

  public static create(props: PurchaseOrderProps, id?: string): Result<PurchaseOrderAggregate> {
    if (!props.poNumber) {
      return Result.fail<PurchaseOrderAggregate>('PO Number is required');
    }
    if (!props.supplierId || !props.supplierName) {
      return Result.fail<PurchaseOrderAggregate>('Supplier information is required');
    }
    if (!props.lineItems || props.lineItems.length === 0) {
      return Result.fail<PurchaseOrderAggregate>('Purchase Order must contain at least one line item');
    }

    // Auto-calculate total amount
    const calcTotal = props.lineItems.reduce((acc, l) => acc + l.totalPrice, 0);
    props.totalAmount = calcTotal > 0 ? calcTotal : props.totalAmount;

    return Result.ok<PurchaseOrderAggregate>(new PurchaseOrderAggregate(props, id));
  }

  public submitForApproval(): Result<void> {
    if (this.props.status === 'CANCELLED' || this.props.status === 'CLOSED') {
      return Result.fail<void>('Cannot submit a closed or cancelled PO for approval');
    }
    this.props.status = 'PENDING_APPROVAL';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public approve(approverName: string, role: string, notes: string): Result<void> {
    if (this.props.status === 'CANCELLED') {
      return Result.fail<void>('Cannot approve a cancelled PO');
    }
    this.props.status = 'APPROVED';
    this.props.approvalWorkflow.push({
      id: `appr-po-${Date.now()}`,
      approverName,
      role,
      status: 'APPROVED',
      notes,
      timestamp: new Date().toISOString(),
    });
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public issuePO(): Result<void> {
    if (this.props.status !== 'APPROVED') {
      return Result.fail<void>('Purchase order must be APPROVED before issuing to supplier');
    }
    this.props.status = 'ISSUED';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public addDeliverySchedule(schedule: Omit<PODeliverySchedule, 'id'>): Result<void> {
    const newSchedule: PODeliverySchedule = {
      ...schedule,
      id: `sched-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    this.props.deliverySchedules.push(newSchedule);
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public addShipment(shipment: Omit<POShipmentTracking, 'id'>): Result<void> {
    const newShipment: POShipmentTracking = {
      ...shipment,
      id: `ship-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    this.props.shipments.push(newShipment);
    this.props.status = 'IN_TRANSIT';
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public recordGoodsReceipt(receipt: {
    receivedBy: string;
    overallNotes: string;
    items: POGoodsReceiptItem[];
  }): Result<POGoodsReceipt> {
    if (this.props.status === 'CANCELLED' || this.props.status === 'CLOSED') {
      return Result.fail<POGoodsReceipt>('Cannot receive goods against a closed or cancelled PO');
    }

    const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;
    const grn: POGoodsReceipt = {
      id: `grn-${Date.now()}`,
      grnNumber,
      receivedDate: new Date().toISOString(),
      receivedBy: receipt.receivedBy,
      items: receipt.items,
      overallNotes: receipt.overallNotes,
    };

    // Update line items received quantity & status (Handling Partial, Over, and Under deliveries)
    for (const rItem of receipt.items) {
      const line = this.props.lineItems.find(l => l.id === rItem.lineItemId);
      if (line) {
        line.receivedQuantity += rItem.quantityReceived;
        if (line.receivedQuantity > line.orderedQuantity) {
          line.deliveryStatus = 'OVER_DELIVERED';
        } else if (line.receivedQuantity === line.orderedQuantity) {
          line.deliveryStatus = 'COMPLETED';
        } else if (line.receivedQuantity < line.orderedQuantity) {
          line.deliveryStatus = rItem.discrepancyType === 'UNDER' ? 'UNDER_DELIVERED' : 'PARTIAL';
        }
      }
    }

    this.props.goodsReceipts.push(grn);

    // Evaluate PO overall fulfillment status
    const allCompletedOrOver = this.props.lineItems.every(
      l => l.deliveryStatus === 'COMPLETED' || l.deliveryStatus === 'OVER_DELIVERED'
    );
    const anyReceived = this.props.lineItems.some(l => l.receivedQuantity > 0);

    if (allCompletedOrOver) {
      this.props.status = 'FULLY_RECEIVED';
    } else if (anyReceived) {
      this.props.status = 'PARTIALLY_RECEIVED';
    }

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<POGoodsReceipt>(grn);
  }

  public revisePO(revisedBy: string, reason: string, updatedLineItems?: POLineItem[]): Result<void> {
    if (this.props.status === 'CANCELLED' || this.props.status === 'CLOSED') {
      return Result.fail<void>('Cannot revise a closed or cancelled PO');
    }

    const prevTotal = this.props.totalAmount;
    if (updatedLineItems && updatedLineItems.length > 0) {
      this.props.lineItems = updatedLineItems;
      this.props.totalAmount = updatedLineItems.reduce((acc, l) => acc + l.totalPrice, 0);
    }

    this.props.version += 1;
    this.props.status = 'REVISED';
    this.props.revisionHistory.push({
      version: this.props.version,
      revisedBy,
      reason,
      previousAmount: prevTotal,
      newAmount: this.props.totalAmount,
      timestamp: new Date().toISOString(),
    });

    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }

  public closePO(reason: string): Result<void> {
    this.props.status = 'CLOSED';
    this.props.closureReason = reason;
    this.props.updatedAt = new Date().toISOString();
    return Result.ok<void>();
  }
}
