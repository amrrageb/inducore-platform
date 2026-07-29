import { describe, it, expect } from 'vitest';
import { IndustrialNetworkProfileAggregate } from './IndustrialNetworkProfileAggregate.js';
import { PartnershipRequestAggregate } from './PartnershipRequestAggregate.js';

describe('Industrial Marketplace Network Domain Aggregates', () => {
  it('should create and update IndustrialNetworkProfileAggregate', () => {
    const res = IndustrialNetworkProfileAggregate.create({
      tenantId: 'tenant-1',
      companyName: 'Apex Precision Metallurgy Ltd',
      logoUrl: '/logos/apex.png',
      industryCategory: 'Heavy Metallurgy & CNC Machining',
      headquartersCountry: 'Germany',
      operatingLanguages: ['EN', 'DE'],
      description: 'Global Tier-1 supplier of forged alloy valve bodies and high-pressure turbine housings.',
      isVerifiedSupplier: true,
      reputationScore: 94.5,
      followersCount: 1280,
      capabilities: ['5-Axis Milling', 'Electron Beam Welding', 'NDT Testing'],
      certifications: [
        {
          name: 'ISO 9001:2015',
          issuingBody: 'TÜV Süd',
          certificateNumber: 'DE-9001-4412',
          validUntil: '2028-12-31',
          verified: true,
        },
      ],
      products: [
        {
          id: 'prod-1',
          title: 'Class 2500 Flanged Ball Valve Body (Inconel 625)',
          category: 'Flow Control & Valves',
          description: 'Forged nickel alloy valve casing for high-temperature offshore applications.',
          unitPrice: 4200,
          currency: 'EUR',
          specifications: { Material: 'Inconel 625', Rating: 'Class 2500', Standard: 'API 6D' },
          isAvailable: true,
        },
      ],
      services: [
        {
          id: 'serv-1',
          title: 'High-Velocity Oxygen Fuel (HVOF) Hardfacing Coating',
          serviceCategory: 'Surface Treatment & Cladding',
          description: 'Tungsten carbide coating for severe service abrasive slurries.',
          hourlyRate: 185,
          leadTimeDays: 7,
        },
      ],
      newsPosts: [
        {
          id: 'news-1',
          title: 'Apex Receives AS9100D Aerospace Certification',
          content: 'We are proud to announce our new quality management accreditation for flight-critical components.',
          category: 'CERTIFICATION',
          publishedAt: new Date().toISOString(),
          author: 'Marketing Director',
        },
      ],
      createdAt: new Date().toISOString(),
    });

    expect(res.isSuccess).toBe(true);
    const profile = res.getValue();
    expect(profile.companyName).toBe('Apex Precision Metallurgy Ltd');
    expect(profile.reputationScore).toBe(94.5);
    expect(profile.products.length).toBe(1);

    profile.incrementFollowers();
    expect(profile.followersCount).toBe(1281);

    profile.updateReputation(2.5);
    expect(profile.reputationScore).toBe(97.0);
  });

  it('should create and respond to PartnershipRequestAggregate', () => {
    const res = PartnershipRequestAggregate.create({
      requesterCompanyId: 'comp-101',
      requesterCompanyName: 'Vanguard Industrial Automation',
      targetCompanyId: 'comp-202',
      targetCompanyName: 'Apex Precision Metallurgy Ltd',
      partnershipType: 'PREFERRED_SUPPLIER',
      proposedScope: 'Exclusive supply of forged valve bodies for Q4 pipeline projects',
      message: 'We wish to establish a strategic 3-year master agreement.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });

    expect(res.isSuccess).toBe(true);
    const req = res.getValue();
    expect(req.status).toBe('PENDING');

    req.respond(true);
    expect(req.status).toBe('ACCEPTED');
    expect(req.respondedAt).toBeDefined();
  });
});
