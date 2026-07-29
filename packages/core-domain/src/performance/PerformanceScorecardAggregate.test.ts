import { describe, it, expect } from 'vitest';
import { PerformanceScorecardAggregate } from './PerformanceScorecardAggregate.js';

describe('PerformanceScorecardAggregate', () => {
  it('should create a valid supplier performance scorecard aggregate', () => {
    const res = PerformanceScorecardAggregate.create({
      supplierId: 'sup-101',
      supplierName: 'Titanium Global Corp',
      supplierCode: 'SUP-TITANIUM',
      qualityScore: 98.5,
      deliveryScore: 96.0,
      costScore: 92.0,
      responsivenessScore: 94.0,
      riskLevel: 'LOW',
      tier: 'PREFERRED',
      metrics: {
        defectPpm: 120,
        onTimeDeliveryPct: 97.5,
        costVariancePct: -2.1,
        avgResponseHours: 3.2,
        auditCompliancePct: 98.0,
      },
      blacklist: { isBlacklisted: false },
      preferredStatus: { isPreferred: true, preferredCategory: 'Aerospace Metals' },
      historicalTrends: [],
      evaluatedBy: 'VP of Quality',
    });

    expect(res.isSuccess).toBe(true);
    const scorecard = res.getValue();
    expect(scorecard.props.supplierName).toBe('Titanium Global Corp');
    expect(scorecard.props.overallScore).toBeGreaterThan(90);
    expect(scorecard.props.tier).toBe('PREFERRED');
  });

  it('should handle blacklisting workflow correctly', () => {
    const scorecard = PerformanceScorecardAggregate.create({
      supplierId: 'sup-102',
      supplierName: 'Subpar Components Ltd',
      supplierCode: 'SUP-SUBPAR',
      qualityScore: 55.0,
      deliveryScore: 60.0,
      costScore: 70.0,
      responsivenessScore: 50.0,
      riskLevel: 'HIGH',
      tier: 'UNDER_REVIEW',
      metrics: {
        defectPpm: 1250,
        onTimeDeliveryPct: 65.0,
        costVariancePct: 8.5,
        avgResponseHours: 48.0,
        auditCompliancePct: 58.0,
      },
      blacklist: { isBlacklisted: false },
      preferredStatus: { isPreferred: false },
      historicalTrends: [],
      evaluatedBy: 'Quality Assurance Manager',
    }).getValue();

    const blRes = scorecard.blacklistSupplier('Repeated failure on critical tolerance specifications', 'Quality Board');
    expect(blRes.isSuccess).toBe(true);
    expect(scorecard.props.blacklist.isBlacklisted).toBe(true);
    expect(scorecard.props.tier).toBe('BLACKLISTED');
    expect(scorecard.props.riskLevel).toBe('CRITICAL');

    // Should not allow togglePreferred when blacklisted
    const preferredToggled = scorecard.togglePreferredSupplier('Fasteners', 'Director');
    expect(preferredToggled).toBe(false);

    // Remove blacklist
    scorecard.removeBlacklist('Quality Director');
    expect(scorecard.props.blacklist.isBlacklisted).toBe(false);
  });

  it('should update scores and record historical trends', () => {
    const scorecard = PerformanceScorecardAggregate.create({
      supplierId: 'sup-103',
      supplierName: 'Vortex Fluid Systems',
      supplierCode: 'SUP-VORTEX',
      qualityScore: 88.0,
      deliveryScore: 85.0,
      costScore: 90.0,
      responsivenessScore: 82.0,
      riskLevel: 'MEDIUM',
      tier: 'STANDARD',
      metrics: {
        defectPpm: 320,
        onTimeDeliveryPct: 89.0,
        costVariancePct: 0.5,
        avgResponseHours: 12.0,
        auditCompliancePct: 91.0,
      },
      blacklist: { isBlacklisted: false },
      preferredStatus: { isPreferred: false },
      historicalTrends: [],
      evaluatedBy: 'Lead Auditor',
    }).getValue();

    scorecard.updateScores({
      qualityScore: 95.0,
      deliveryScore: 94.0,
      evaluatedBy: 'Senior Auditor',
    });

    expect(scorecard.props.qualityScore).toBe(95.0);
    expect(scorecard.props.overallScore).toBeGreaterThan(90);

    const trendRes = scorecard.recordHistoricalTrendPoint('Q2 2026', 'Quarterly performance evaluation after lean manufacturing upgrade');
    expect(trendRes.isSuccess).toBe(true);
    expect(scorecard.props.historicalTrends.length).toBe(1);
    expect(scorecard.props.historicalTrends[0].period).toBe('Q2 2026');
  });
});
