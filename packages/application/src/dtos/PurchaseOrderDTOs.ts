import {
  POStatus,
  POLineItem,
  PODeliverySchedule,
  POShipmentTracking,
  POGoodsReceipt,
  POApprovalLog,
  PORevisionLog,
  POGoodsReceiptItem,
} from '@inducore/core-domain';

export interface CreatePODTO {
  poNumber?: string;
  awardId?: string;
  rfqId?: string;
  supplierId: string;
  supplierName: string;
  currency: string;
  paymentTerms: string;
  incoterm: string;
  lineItems: Omit<POLineItem, 'receivedQuantity' | 'deliveryStatus'>[];
}

export interface ApprovePODTO {
  id: string;
  approverName: string;
  role: string;
  notes: string;
}

export interface AddDeliveryScheduleDTO {
  poId: string;
  lineItemId: string;
  itemName: string;
  expectedDate: string;
  quantity: number;
  destinationAddress: string;
}

export interface AddShipmentDTO {
  poId: string;
  carrier: string;
  trackingNumber: string;
  dispatchedDate: string;
  estimatedArrival: string;
  notes: string;
}

export interface RecordGoodsReceiptDTO {
  poId: string;
  receivedBy: string;
  overallNotes: string;
  items: POGoodsReceiptItem[];
}

export interface RevisePODTO {
  poId: string;
  revisedBy: string;
  reason: string;
  updatedLineItems?: POLineItem[];
}

export interface ClosePODTO {
  poId: string;
  reason: string;
}

export interface PurchaseOrderDTO {
  id: string;
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
