import { describe, it, expect } from 'vitest';
import { ContractAggregate } from './ContractAggregate.js';

describe('ContractAggregate', () => {
  it('should create a valid contract aggregate', () => {
    const res = ContractAggregate.create({
      contractNumber: 'CTR-2026-001',
      title: 'Master Strategic Metals Supply Agreement',
      contractType: 'FRAMEWORK_AGREEMENT',
      supplierId: 'sup-101',
      supplierName: 'Titanium Global Corp',
      status: 'ACTIVE',
      version: 1,
      startDate: '2026-01-01',
      endDate: '2027-12-31',
      autoRenew: true,
      noticePeriodDays: 60,
      currency: 'USD',
      totalValueCap: 5000000,
      currentSpend: 1250000,
      governingLaw: 'Delaware, USA',
      attachments: [],
      signatures: [],
      kpis: {
        slaAdherenceScorePct: 98.5,
        qualityPassRatePct: 99.1,
        onTimeDeliveryRatePct: 97.4,
        spendAgainstCapAmount: 1250000,
        contractValueCap: 5000000,
      },
      versionHistory: [
        {
          version: 1,
          modifiedBy: 'Legal Operations',
          changeSummary: 'Initial execution',
          effectiveDate: '2026-01-01',
          timestamp: '2026-01-01T09:00:00Z',
        },
      ],
      createdAt: '2026-01-01T09:00:00Z',
      updatedAt: '2026-01-01T09:00:00Z',
    });

    expect(res.isSuccess).toBe(true);
    const contract = res.getValue();
    expect(contract.props.contractNumber).toBe('CTR-2026-001');
    expect(contract.props.contractType).toBe('FRAMEWORK_AGREEMENT');
  });

  it('should handle digital signature workflow and contract activation', () => {
    const contract = ContractAggregate.create({
      contractNumber: 'CTR-2026-002',
      title: 'Precision Fasteners Supply Contract',
      contractType: 'SUPPLY_CONTRACT',
      supplierId: 'sup-102',
      supplierName: 'Apex Fasteners Ltd',
      status: 'DRAFT',
      version: 1,
      startDate: '2026-02-01',
      endDate: '2027-01-31',
      autoRenew: false,
      noticePeriodDays: 30,
      currency: 'USD',
      totalValueCap: 750000,
      currentSpend: 0,
      governingLaw: 'New York, USA',
      attachments: [],
      signatures: [],
      kpis: {
        slaAdherenceScorePct: 100,
        qualityPassRatePct: 100,
        onTimeDeliveryRatePct: 100,
        spendAgainstCapAmount: 0,
        contractValueCap: 750000,
      },
      versionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).getValue();

    contract.requestSignature('Sarah Jenkins', 'sarah@inducore.com', 'BUYER');
    expect(contract.props.status).toBe('PENDING_SIGNATURE');
    const sigId = contract.props.signatures[0].id;

    contract.signContract(sigId, 'Sarah Jenkins', '192.168.1.45');
    expect(contract.props.signatures[0].status).toBe('SIGNED');
    expect(contract.props.status).toBe('ACTIVE');
  });

  it('should execute renewal and log version history', () => {
    const contract = ContractAggregate.create({
      contractNumber: 'CTR-2026-003',
      title: 'Hydraulic Components Supply Contract',
      contractType: 'SUPPLY_CONTRACT',
      supplierId: 'sup-103',
      supplierName: 'Vortex Fluid Systems',
      status: 'ACTIVE',
      version: 1,
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      autoRenew: true,
      noticePeriodDays: 30,
      currency: 'USD',
      totalValueCap: 1200000,
      currentSpend: 950000,
      governingLaw: 'Germany',
      attachments: [],
      signatures: [],
      kpis: {
        slaAdherenceScorePct: 96.0,
        qualityPassRatePct: 98.0,
        onTimeDeliveryRatePct: 95.0,
        spendAgainstCapAmount: 950000,
        contractValueCap: 1200000,
      },
      versionHistory: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }).getValue();

    contract.initiateRenewal('Annual volume expansion agreed.');
    expect(contract.props.status).toBe('UNDER_RENEWAL');

    contract.executeRenewal('2027-12-31', 1800000, 'Renewed for 12 months with 500k cap expansion', 'Chief Procurement Officer');
    expect(contract.props.version).toBe(2);
    expect(contract.props.endDate).toBe('2027-12-31');
    expect(contract.props.totalValueCap).toBe(1800000);
    expect(contract.props.status).toBe('ACTIVE');
    expect(contract.props.versionHistory.length).toBe(1);
  });
});
