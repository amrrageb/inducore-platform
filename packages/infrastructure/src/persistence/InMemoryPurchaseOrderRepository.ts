import { IPurchaseOrderRepository } from '@inducore/application';
import { PurchaseOrderAggregate } from '@inducore/core-domain';

export class InMemoryPurchaseOrderRepository implements IPurchaseOrderRepository {
  private pos: Map<string, PurchaseOrderAggregate> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData(): void {
    const defaultPOs: PurchaseOrderAggregate[] = [
      PurchaseOrderAggregate.create(
        {
          poNumber: 'PO-2026-88001',
          awardId: 'AWD-2026-001',
          rfqId: 'RFQ-2026-891',
          supplierId: 'sup-rexroth',
          supplierName: 'Bosch Rexroth Industry Systems',
          status: 'ISSUED',
          version: 1,
          currency: 'EUR',
          totalAmount: 184500,
          paymentTerms: 'NET 60',
          incoterm: 'DDP Hamburg Yard',
          lineItems: [
            {
              id: 'item-8801-1',
              itemName: 'High-Pressure Hydraulic Actuator 350 Bar',
              orderedQuantity: 20,
              receivedQuantity: 0,
              unit: 'EA',
              unitPrice: 6500,
              totalPrice: 130000,
              deliveryStatus: 'PENDING',
            },
            {
              id: 'item-8801-2',
              itemName: 'Proportional Valve Driver Card Modules',
              orderedQuantity: 35,
              receivedQuantity: 0,
              unit: 'EA',
              unitPrice: 1557,
              totalPrice: 54500,
              deliveryStatus: 'PENDING',
            },
          ],
          deliverySchedules: [
            {
              id: 'sched-8801-1',
              lineItemId: 'item-8801-1',
              itemName: 'High-Pressure Hydraulic Actuator 350 Bar',
              expectedDate: '2026-08-20',
              quantity: 20,
              destinationAddress: 'InduCore Plant 4, Assembly Dock B, Stuttgart',
              status: 'SCHEDULED',
            },
          ],
          shipments: [
            {
              id: 'ship-8801-1',
              carrier: 'DHL Freight Europe',
              trackingNumber: 'DHL-DE-99201948',
              dispatchedDate: '2026-08-01',
              estimatedArrival: '2026-08-19',
              status: 'IN_TRANSIT',
              notes: 'Customs cleared at German border depot',
            },
          ],
          goodsReceipts: [],
          approvalWorkflow: [
            {
              id: 'appr-8801-1',
              approverName: 'Dr. Klaus Weber',
              role: 'VP Procurement',
              status: 'APPROVED',
              notes: 'Approved under FY26 Q3 Capex budget',
              timestamp: '2026-07-25T09:30:00Z',
            },
          ],
          revisionHistory: [],
          createdAt: '2026-07-24T10:00:00Z',
          updatedAt: '2026-07-25T09:30:00Z',
        },
        'po-88001'
      ).getValue(),

      PurchaseOrderAggregate.create(
        {
          poNumber: 'PO-2026-88002',
          awardId: 'AWD-2026-002',
          rfqId: 'RFQ-2026-892',
          supplierId: 'sup-tenaris',
          supplierName: 'Tenaris Tubular Solutions',
          status: 'PARTIALLY_RECEIVED',
          version: 2,
          currency: 'USD',
          totalAmount: 240000,
          paymentTerms: 'NET 45',
          incoterm: 'CIF Houston',
          lineItems: [
            {
              id: 'item-8802-1',
              itemName: 'Seamless Carbon Steel Line Pipe 16 Inch',
              orderedQuantity: 200,
              receivedQuantity: 120,
              unit: 'MTR',
              unitPrice: 1200,
              totalPrice: 240000,
              deliveryStatus: 'PARTIAL',
            },
          ],
          deliverySchedules: [
            {
              id: 'sched-8802-1',
              lineItemId: 'item-8802-1',
              itemName: 'Seamless Carbon Steel Line Pipe 16 Inch',
              expectedDate: '2026-07-20',
              quantity: 100,
              destinationAddress: 'Houston Deepwater Yard 12',
              status: 'DELIVERED',
            },
            {
              id: 'sched-8802-2',
              lineItemId: 'item-8802-1',
              itemName: 'Seamless Carbon Steel Line Pipe 16 Inch',
              expectedDate: '2026-08-10',
              quantity: 100,
              destinationAddress: 'Houston Deepwater Yard 12',
              status: 'SCHEDULED',
            },
          ],
          shipments: [
            {
              id: 'ship-8802-1',
              carrier: 'Kuehne + Nagel Maritime',
              trackingNumber: 'KN-US-8840192',
              dispatchedDate: '2026-07-10',
              estimatedArrival: '2026-07-19',
              status: 'DELIVERED',
              notes: 'Batch 1 delivered via Port of Houston terminal 3',
            },
          ],
          goodsReceipts: [
            {
              id: 'grn-8802-1',
              grnNumber: 'GRN-99104',
              receivedDate: '2026-07-20T14:00:00Z',
              receivedBy: 'Warehouse Sup. Mark Jenkins',
              items: [
                {
                  lineItemId: 'item-8802-1',
                  quantityReceived: 120,
                  discrepancyType: 'NONE',
                  conditionNotes: 'Verified mill certificates; 120 meters inspected with zero defect',
                },
              ],
              overallNotes: 'Batch 1 over-delivered by 20 meters; credited against batch 2 scheduled shipment',
            },
          ],
          approvalWorkflow: [
            {
              id: 'appr-8802-1',
              approverName: 'Elena Rostova',
              role: 'Supply Chain Director',
              status: 'APPROVED',
              notes: 'Contract framework PO approved',
              timestamp: '2026-07-10T11:20:00Z',
            },
          ],
          revisionHistory: [
            {
              version: 2,
              revisedBy: 'Procurement Specialist',
              reason: 'Updated delivery yard address to Deepwater Yard 12',
              previousAmount: 240000,
              newAmount: 240000,
              timestamp: '2026-07-15T08:00:00Z',
            },
          ],
          createdAt: '2026-07-10T10:00:00Z',
          updatedAt: '2026-07-20T14:00:00Z',
        },
        'po-88002'
      ).getValue(),

      PurchaseOrderAggregate.create(
        {
          poNumber: 'PO-2026-88003',
          supplierId: 'sup-siemens',
          supplierName: 'Siemens Industrial Automation',
          status: 'PENDING_APPROVAL',
          version: 1,
          currency: 'EUR',
          totalAmount: 92000,
          paymentTerms: 'NET 30',
          incoterm: 'FCA Nuremberg',
          lineItems: [
            {
              id: 'item-8803-1',
              itemName: 'SIMATIC S7-1500 PLC Main Controller Unit',
              orderedQuantity: 15,
              receivedQuantity: 0,
              unit: 'EA',
              unitPrice: 4800,
              totalPrice: 72000,
              deliveryStatus: 'PENDING',
            },
            {
              id: 'item-8803-2',
              itemName: 'ET200SP I/O Distributed Bus Interfaces',
              orderedQuantity: 20,
              receivedQuantity: 0,
              unit: 'EA',
              unitPrice: 1000,
              totalPrice: 20000,
              deliveryStatus: 'PENDING',
            },
          ],
          deliverySchedules: [],
          shipments: [],
          goodsReceipts: [],
          approvalWorkflow: [],
          revisionHistory: [],
          createdAt: '2026-07-27T16:00:00Z',
          updatedAt: '2026-07-27T16:00:00Z',
        },
        'po-88003'
      ).getValue(),
    ];

    for (const po of defaultPOs) {
      this.pos.set(po.id, po);
    }
  }

  public async findById(id: string): Promise<PurchaseOrderAggregate | null> {
    const po = this.pos.get(id);
    return po || null;
  }

  public async findByPoNumber(poNumber: string): Promise<PurchaseOrderAggregate | null> {
    for (const po of this.pos.values()) {
      if (po.props.poNumber === poNumber) return po;
    }
    return null;
  }

  public async findAll(): Promise<PurchaseOrderAggregate[]> {
    return Array.from(this.pos.values());
  }

  public async save(po: PurchaseOrderAggregate): Promise<void> {
    this.pos.set(po.id, po);
  }
}
