import { describe, it, expect } from 'vitest';
import { PurchaseOrderAggregate } from './PurchaseOrderAggregate.js';

describe('PurchaseOrderAggregate Domain Unit Tests', () => {
  it('should create a Purchase Order successfully and calculate total amount', () => {
    const res = PurchaseOrderAggregate.create({
      poNumber: 'PO-2026-901',
      supplierId: 'sup-001',
      supplierName: 'Bosch Rexroth AG',
      status: 'DRAFT',
      version: 1,
      currency: 'EUR',
      totalAmount: 0,
      paymentTerms: 'NET 60',
      incoterm: 'DDP Frankfurt',
      lineItems: [
        {
          id: 'line-1',
          itemName: 'Hydraulic Cylinder 500mm Stroke',
          orderedQuantity: 10,
          receivedQuantity: 0,
          unit: 'EA',
          unitPrice: 4200,
          totalPrice: 42000,
          deliveryStatus: 'PENDING',
        },
      ],
      deliverySchedules: [],
      shipments: [],
      goodsReceipts: [],
      approvalWorkflow: [],
      revisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(res.isSuccess).toBe(true);
    const po = res.getValue();
    expect(po.props.totalAmount).toBe(42000);
    expect(po.props.status).toBe('DRAFT');
  });

  it('should process approval, delivery schedule, shipment, partial, over, and under delivery receipts', () => {
    const po = PurchaseOrderAggregate.create({
      poNumber: 'PO-2026-902',
      supplierId: 'sup-002',
      supplierName: 'Tenaris S.A.',
      status: 'DRAFT',
      version: 1,
      currency: 'USD',
      totalAmount: 100000,
      paymentTerms: 'NET 45',
      incoterm: 'CIF Houston',
      lineItems: [
        {
          id: 'line-pipe',
          itemName: 'Seamless Alloy Steel Pipe 12 Inch',
          orderedQuantity: 100,
          receivedQuantity: 0,
          unit: 'MTR',
          unitPrice: 1000,
          totalPrice: 100000,
          deliveryStatus: 'PENDING',
        },
      ],
      deliverySchedules: [],
      shipments: [],
      goodsReceipts: [],
      approvalWorkflow: [],
      revisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).getValue();

    // 1. Submit & Approve
    po.submitForApproval();
    expect(po.props.status).toBe('PENDING_APPROVAL');

    po.approve('Chief Procurement Officer', 'CPO', 'Approved budget');
    expect(po.props.status).toBe('APPROVED');

    // 2. Issue PO
    po.issuePO();
    expect(po.props.status).toBe('ISSUED');

    // 3. Add Delivery Schedule
    po.addDeliverySchedule({
      lineItemId: 'line-pipe',
      itemName: 'Seamless Alloy Steel Pipe 12 Inch',
      expectedDate: '2026-08-15',
      quantity: 100,
      destinationAddress: 'Houston Warehouse Yard 4',
      status: 'SCHEDULED',
    });
    expect(po.props.deliverySchedules.length).toBe(1);

    // 4. Add Shipment
    po.addShipment({
      carrier: 'Maersk Logistics',
      trackingNumber: 'MAEU-9920194',
      dispatchedDate: '2026-08-01',
      estimatedArrival: '2026-08-14',
      status: 'IN_TRANSIT',
      notes: 'Vessel en route to Port of Houston',
    });
    expect(po.props.status).toBe('IN_TRANSIT');

    // 5. Record Goods Receipt 1 (Partial Delivery: 40 units)
    const grn1 = po.recordGoodsReceipt({
      receivedBy: 'Yard Supervisor John',
      overallNotes: 'First batch delivered',
      items: [
        {
          lineItemId: 'line-pipe',
          quantityReceived: 40,
          discrepancyType: 'NONE',
        },
      ],
    });
    expect(grn1.isSuccess).toBe(true);
    expect(po.props.status).toBe('PARTIALLY_RECEIVED');
    expect(po.props.lineItems[0].receivedQuantity).toBe(40);
    expect(po.props.lineItems[0].deliveryStatus).toBe('PARTIAL');

    // 6. Record Goods Receipt 2 (Over delivery: 65 units received, bringing total to 105)
    const grn2 = po.recordGoodsReceipt({
      receivedBy: 'Yard Supervisor John',
      overallNotes: 'Final batch delivered with 5 extra length meters',
      items: [
        {
          lineItemId: 'line-pipe',
          quantityReceived: 65,
          discrepancyType: 'OVER',
        },
      ],
    });
    expect(grn2.isSuccess).toBe(true);
    expect(po.props.lineItems[0].receivedQuantity).toBe(105);
    expect(po.props.lineItems[0].deliveryStatus).toBe('OVER_DELIVERED');
    expect(po.props.status).toBe('FULLY_RECEIVED');

    // 7. Revision & Closure
    po.revisePO('Procurement Lead', 'Price adjustment after bonus length', [
      {
        id: 'line-pipe',
        itemName: 'Seamless Alloy Steel Pipe 12 Inch',
        orderedQuantity: 105,
        receivedQuantity: 105,
        unit: 'MTR',
        unitPrice: 1000,
        totalPrice: 105000,
        deliveryStatus: 'COMPLETED',
      },
    ]);
    expect(po.props.version).toBe(2);
    expect(po.props.status).toBe('REVISED');

    po.closePO('Order fully delivered and closed by procurement manager');
    expect(po.props.status).toBe('CLOSED');
    expect(po.props.closureReason).toBe('Order fully delivered and closed by procurement manager');
  });
});
