import { describe, it, expect } from 'vitest';
import { AwardAggregate } from './AwardAggregate.js';

describe('AwardAggregate Domain Unit Tests', () => {
  it('should create a full award aggregate successfully', () => {
    const res = AwardAggregate.create({
      rfqId: 'rfq-001',
      rfqTitle: 'Heavy Machinery Hydraulics & Actuators',
      awardType: 'FULL',
      status: 'RECOMMENDED',
      version: 1,
      primarySupplierId: 'sup-001',
      primarySupplierName: 'Bosch Rexroth GmbH',
      totalAwardedAmount: 185000,
      currency: 'EUR',
      lineAllocations: [
        {
          id: 'line-alloc-1',
          rfqLineItemId: 'item-101',
          itemName: 'Hydraulic Cylinder 500mm Stroke',
          requestedQuantity: 20,
          awardedQuantity: 20,
          unit: 'EA',
          unitPrice: 4200,
          totalAmount: 84000,
          supplierId: 'sup-001',
          supplierName: 'Bosch Rexroth GmbH',
        },
      ],
      approvalWorkflow: [],
      revisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(res.isSuccess).toBe(true);
    const agg = res.getValue();
    expect(agg.props.rfqId).toBe('rfq-001');
    expect(agg.props.totalAwardedAmount).toBe(84000); // Recalculated from line allocations
    expect(agg.props.status).toBe('RECOMMENDED');
  });

  it('should handle approval, award letter dispatch, supplier acceptance, and PR generation', () => {
    const agg = AwardAggregate.create({
      rfqId: 'rfq-002',
      rfqTitle: 'High-Pressure Valve Seals',
      awardType: 'PARTIAL',
      status: 'RECOMMENDED',
      version: 1,
      primarySupplierId: 'sup-002',
      primarySupplierName: 'Parker Hannifin Corp',
      totalAwardedAmount: 45000,
      currency: 'USD',
      lineAllocations: [
        {
          id: 'line-alloc-2',
          rfqLineItemId: 'item-201',
          itemName: 'Viton High Temp Seals',
          requestedQuantity: 100,
          awardedQuantity: 100,
          unit: 'SET',
          unitPrice: 450,
          totalAmount: 45000,
          supplierId: 'sup-002',
          supplierName: 'Parker Hannifin Corp',
        },
      ],
      approvalWorkflow: [],
      revisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).getValue();

    // 1. Submit for approval
    const subRes = agg.submitForApproval('Chief Procurement Officer', 'Commercials verified');
    expect(subRes.isSuccess).toBe(true);
    expect(agg.props.status).toBe('PENDING_APPROVAL');

    // 2. Approve
    const appRes = agg.approve('Director Sourcing', 'EXECUTIVE_APPROVER', 'Approved in full');
    expect(appRes.isSuccess).toBe(true);
    expect(agg.props.status).toBe('APPROVED');

    // 3. Send award letter
    const letterRes = agg.dispatchAwardLetter('We are pleased to award contract RFQ-002 to Parker Hannifin.');
    expect(letterRes.isSuccess).toBe(true);
    expect(agg.props.status).toBe('AWARD_LETTER_SENT');

    // 4. Supplier acceptance
    const acceptRes = agg.recordSupplierAcceptance();
    expect(acceptRes.isSuccess).toBe(true);
    expect(agg.props.status).toBe('ACCEPTED_BY_SUPPLIER');

    // 5. Contract preparation
    const contractRes = agg.prepareContract({
      contractNumber: 'CNT-2026-902',
      contractTitle: 'Master Supply Agreement - High Temp Seals',
      governingLaw: 'Delaware, USA',
      startDate: '2026-08-01',
      endDate: '2027-08-01',
      paymentTerms: 'NET 60 Days',
    });
    expect(contractRes.isSuccess).toBe(true);
    expect(agg.props.status).toBe('CONTRACT_PREPARED');

    // 6. Generate Purchase Request
    const prRes = agg.generatePurchaseRequest('CC-MFG-9020', 'System Procurement Bot');
    expect(prRes.isSuccess).toBe(true);
    expect(agg.props.status).toBe('PURCHASE_REQUEST_GENERATED');
    expect(agg.props.purchaseRequest?.prNumber).toContain('PR-');
  });

  it('should support revisions and cancellations', () => {
    const agg = AwardAggregate.create({
      rfqId: 'rfq-003',
      rfqTitle: 'Turbine Blades',
      awardType: 'MULTI_SUPPLIER',
      status: 'APPROVED',
      version: 1,
      primarySupplierId: 'sup-003',
      primarySupplierName: 'Siemens Energy',
      totalAwardedAmount: 500000,
      currency: 'EUR',
      lineAllocations: [
        {
          id: 'line-alloc-3',
          rfqLineItemId: 'item-301',
          itemName: 'Titanium Rotor Blades',
          requestedQuantity: 50,
          awardedQuantity: 50,
          unit: 'EA',
          unitPrice: 10000,
          totalAmount: 500000,
          supplierId: 'sup-003',
          supplierName: 'Siemens Energy',
        },
      ],
      approvalWorkflow: [],
      revisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).getValue();

    // Revise award quantity
    const reviseRes = agg.reviseAward('Sourcing Lead', 'Scope reduced by client request', [
      {
        id: 'line-alloc-3',
        rfqLineItemId: 'item-301',
        itemName: 'Titanium Rotor Blades',
        requestedQuantity: 50,
        awardedQuantity: 30,
        unit: 'EA',
        unitPrice: 10000,
        totalAmount: 300000,
        supplierId: 'sup-003',
        supplierName: 'Siemens Energy',
      },
    ]);

    expect(reviseRes.isSuccess).toBe(true);
    expect(agg.props.version).toBe(2);
    expect(agg.props.status).toBe('REVISED');
    expect(agg.props.totalAwardedAmount).toBe(300000);
    expect(agg.props.revisionHistory.length).toBe(1);

    // Cancel award
    const cancelRes = agg.cancelAward('Budget reallocated');
    expect(cancelRes.isSuccess).toBe(true);
    expect(agg.props.status).toBe('CANCELLED');
  });
});
