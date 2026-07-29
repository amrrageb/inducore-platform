import {
  IndustrialNetworkProfileAggregate,
  PartnershipRequestAggregate,
  ProductCatalogItem,
  ServiceMarketplaceItem,
} from '@inducore/core-domain';
import {
  IMarketplaceRepository,
  AISupplierRecommendation,
  AIRFQRecommendation,
} from '@inducore/application';

export class MarketplaceRepository implements IMarketplaceRepository {
  private profiles: Map<string, IndustrialNetworkProfileAggregate> = new Map();
  private partnershipRequests: Map<string, PartnershipRequestAggregate> = new Map();

  constructor() {
    this.seedDefaultMarketplaceData();
  }

  private seedDefaultMarketplaceData(): void {
    // 1. Apex Precision Metallurgy
    const p1 = IndustrialNetworkProfileAggregate.create({
      tenantId: 'tenant-1',
      companyName: 'Apex Precision Metallurgy Ltd',
      logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop&q=80',
      industryCategory: 'Heavy Metallurgy & CNC Machining',
      headquartersCountry: 'Germany',
      operatingLanguages: ['EN', 'DE', 'FR'],
      description: 'Global Tier-1 manufacturer specializing in heavy forged alloy components, high-pressure valve bodies, and subsea manifold assemblies for energy & aerospace sectors.',
      isVerifiedSupplier: true,
      reputationScore: 96.8,
      followersCount: 3420,
      capabilities: [
        '5-Axis CNC Precision Milling',
        'Electron Beam Welding',
        'High-Velocity Oxygen Fuel (HVOF) Cladding',
        'Hydrostatic Pressure Testing (up to 30,000 PSI)',
        'ASNT Level III NDT Inspection',
      ],
      certifications: [
        { name: 'ISO 9001:2015', issuingBody: 'TÜV Süd', certificateNumber: 'TS-9001-88421', validUntil: '2028-12-31', verified: true },
        { name: 'AS9100D Aerospace Standard', issuingBody: 'DEKRA', certificateNumber: 'AS-9100-44912', validUntil: '2027-06-30', verified: true },
        { name: 'API Spec 6D Pipeline Valves', issuingBody: 'American Petroleum Institute', certificateNumber: 'API-6D-0921', validUntil: '2029-01-15', verified: true },
      ],
      products: [
        {
          id: 'prod-101',
          title: 'Class 2500 Forged Inconel 625 Flanged Ball Valve Body',
          category: 'Flow Control & Subsea Valves',
          description: 'High-temperature, anti-corrosive forged nickel alloy valve body engineered for deepwater oil & gas extraction.',
          unitPrice: 5800,
          currency: 'USD',
          specifications: { Material: 'Inconel 625', Rating: 'Class 2500', DesignTemp: '-46°C to +450°C' },
          isAvailable: true,
        },
        {
          id: 'prod-102',
          title: 'Heavy Duty Titanium Grade 5 Turbine Rotor Disk',
          category: 'Aerospace & Turbomachinery',
          description: 'Ultra-lightweight high-tensile rotor disk for power generation turbines.',
          unitPrice: 12400,
          currency: 'USD',
          specifications: { Material: 'Ti-6Al-4V', Balancing: 'ISO 1940 G1.0', SurfaceFinish: 'Ra 0.4µm' },
          isAvailable: true,
        },
      ],
      services: [
        {
          id: 'serv-101',
          title: 'Rapid Prototype 5-Axis Milling & Inspection',
          serviceCategory: 'CNC Custom Manufacturing',
          description: 'Turnkey machining from CAD solid models within 5 business days with CMM dimension report.',
          hourlyRate: 195,
          leadTimeDays: 5,
        },
      ],
      newsPosts: [
        {
          id: 'news-101',
          title: 'Apex Expands 5-Axis Machining Center with 3 New DMG MORI Units',
          content: 'To support accelerating subsea energy projects, Apex has added three DMG MORI 5-axis gantry mills to its Munich facility.',
          category: 'EXPANSION',
          publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          author: 'Chief Operating Officer',
        },
      ],
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    }, 'comp-101');

    // 2. Siemens Heavy Electricals
    const p2 = IndustrialNetworkProfileAggregate.create({
      tenantId: 'tenant-1',
      companyName: 'Siemens Industrial Automation & Drives',
      logoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=120&auto=format&fit=crop&q=80',
      industryCategory: 'Industrial Automation & Robotics',
      headquartersCountry: 'Switzerland',
      operatingLanguages: ['EN', 'DE', 'ZH'],
      description: 'World-leading supplier of programmable logic controllers (PLCs), variable frequency drives (VFDs), and SCADA IoT gateway hardware.',
      isVerifiedSupplier: true,
      reputationScore: 98.4,
      followersCount: 12400,
      capabilities: [
        'Profinet & EtherCAT Network Integration',
        'SIL-3 Safety Instrumented System Design',
        'Edge AI Predictive Vibration Analytics',
        'Robotic Workcell Integration',
      ],
      certifications: [
        { name: 'ISO 14001 Environmental Management', issuingBody: 'BSI', certificateNumber: 'EMS-14001-9921', validUntil: '2028-09-30', verified: true },
        { name: 'IEC 61508 Functional Safety', issuingBody: 'TÜV Rheinland', certificateNumber: 'FS-61508-011', validUntil: '2030-05-15', verified: true },
      ],
      products: [
        {
          id: 'prod-201',
          title: 'S7-1500 Advanced PLC Controller System with Fail-Safe CPU',
          category: 'PLCs & Automation Controllers',
          description: 'High-performance modular controller for complex factory automation and process plants.',
          unitPrice: 3200,
          currency: 'USD',
          specifications: { Memory: '4MB Work', Interfaces: '2x Profinet IRT', Safety: 'SIL 3 / PL e' },
          isAvailable: true,
        },
      ],
      services: [
        {
          id: 'serv-201',
          title: 'SCADA & Industrial IoT System Commissioning',
          serviceCategory: 'System Integration & Software',
          description: 'On-site engineering team to commission factory digital twin monitoring dashboards.',
          hourlyRate: 220,
          leadTimeDays: 14,
        },
      ],
      newsPosts: [
        {
          id: 'news-201',
          title: 'Siemens Launches Industrial AI Copilot for PLC Code Generation',
          content: 'Engineers can now generate structured text and ladder logic automatically using embedded LLM assistants.',
          category: 'PRODUCT_LAUNCH',
          publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          author: 'VP of Software Solutions',
        },
      ],
      createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    }, 'comp-202');

    // 3. Rotork Fluid Controls
    const p3 = IndustrialNetworkProfileAggregate.create({
      tenantId: 'tenant-1',
      companyName: 'Rotork Heavy Actuation Systems',
      logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=120&auto=format&fit=crop&q=80',
      industryCategory: 'Fluid Power & Hydraulic Actuators',
      headquartersCountry: 'United Kingdom',
      operatingLanguages: ['EN', 'AR', 'FR'],
      description: 'Specialists in intelligent electric, electro-hydraulic, and pneumatic valve actuators for critical infrastructure, refineries, and water treatment.',
      isVerifiedSupplier: true,
      reputationScore: 92.1,
      followersCount: 2150,
      capabilities: [
        'Electro-Hydraulic Actuator Manufacturing',
        'ATEX/IECEx Explosion-Proof Enclosures',
        'Modbus/Foundation Fieldbus Protocol Integration',
      ],
      certifications: [
        { name: 'ISO 9001:2015', issuingBody: 'LRQA', certificateNumber: 'LR-9001-3321', validUntil: '2027-11-20', verified: true },
        { name: 'ATEX Zone 1 Explosion Protection', issuingBody: 'Baseefa', certificateNumber: 'ATEX-2026-X', validUntil: '2028-04-10', verified: true },
      ],
      products: [
        {
          id: 'prod-301',
          title: 'IQ3 Multi-Turn Intelligent Electric Actuator',
          category: 'Actuators & Controls',
          description: 'Non-intrusive Bluetooth configured actuator with integrated datalogger and OLED display.',
          unitPrice: 4100,
          currency: 'USD',
          specifications: { Torque: 'up to 3000 Nm', Enclosure: 'IP68 7m/72hrs', TempRange: '-50°C to +70°C' },
          isAvailable: true,
        },
      ],
      services: [],
      newsPosts: [
        {
          id: 'news-301',
          title: 'Rotork Secures Contract for Middle East Seawater Desalination Plant',
          content: 'Providing 450 intelligent actuators with remote telemetry capabilities for new SWRO facility.',
          category: 'CASE_STUDY',
          publishedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          author: 'Regional Director',
        },
      ],
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    }, 'comp-303');

    if (p1.isSuccess) this.profiles.set(p1.getValue().id, p1.getValue());
    if (p2.isSuccess) this.profiles.set(p2.getValue().id, p2.getValue());
    if (p3.isSuccess) this.profiles.set(p3.getValue().id, p3.getValue());

    // 4. Default Partnership Requests
    const pr1 = PartnershipRequestAggregate.create({
      requesterCompanyId: 'comp-202',
      requesterCompanyName: 'Siemens Industrial Automation & Drives',
      targetCompanyId: 'comp-101',
      targetCompanyName: 'Apex Precision Metallurgy Ltd',
      partnershipType: 'PREFERRED_SUPPLIER',
      proposedScope: 'Exclusive master supply agreement for custom milled CNC motor housings',
      message: 'We are evaluating Tier-1 metallurgy suppliers for our 2027 high-efficiency drive line.',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    }, 'req-101');

    if (pr1.isSuccess) this.partnershipRequests.set(pr1.getValue().id, pr1.getValue());
  }

  public async listProfiles(query?: string, category?: string, verifiedOnly?: boolean): Promise<IndustrialNetworkProfileAggregate[]> {
    let list = Array.from(this.profiles.values());
    if (verifiedOnly) {
      list = list.filter(p => p.isVerifiedSupplier);
    }
    if (category && category !== 'ALL') {
      list = list.filter(p => p.industryCategory.toLowerCase().includes(category.toLowerCase()));
    }
    if (query && query.trim() !== '') {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.companyName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.capabilities.some(c => c.toLowerCase().includes(q)) ||
        p.headquartersCountry.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public async getProfileById(id: string): Promise<IndustrialNetworkProfileAggregate | null> {
    return this.profiles.get(id) || null;
  }

  public async saveProfile(profile: IndustrialNetworkProfileAggregate): Promise<void> {
    this.profiles.set(profile.id, profile);
  }

  public async listPartnershipRequests(companyId: string): Promise<PartnershipRequestAggregate[]> {
    return Array.from(this.partnershipRequests.values()).filter(
      r => r.requesterCompanyId === companyId || r.targetCompanyId === companyId
    );
  }

  public async savePartnershipRequest(request: PartnershipRequestAggregate): Promise<void> {
    this.partnershipRequests.set(request.id, request);
  }

  public async getPartnershipRequestById(id: string): Promise<PartnershipRequestAggregate | null> {
    return this.partnershipRequests.get(id) || null;
  }

  public async getAllProducts(): Promise<{ product: ProductCatalogItem; companyName: string; companyId: string }[]> {
    const results: { product: ProductCatalogItem; companyName: string; companyId: string }[] = [];
    this.profiles.forEach(p => {
      p.products.forEach(prod => {
        results.push({ product: prod, companyName: p.companyName, companyId: p.id });
      });
    });
    return results;
  }

  public async getAllServices(): Promise<{ service: ServiceMarketplaceItem; companyName: string; companyId: string }[]> {
    const results: { service: ServiceMarketplaceItem; companyName: string; companyId: string }[] = [];
    this.profiles.forEach(p => {
      p.services.forEach(serv => {
        results.push({ service: serv, companyName: p.companyName, companyId: p.id });
      });
    });
    return results;
  }

  public async getAllNewsPosts(): Promise<{ newsPost: any; companyName: string; companyId: string }[]> {
    const results: { newsPost: any; companyName: string; companyId: string }[] = [];
    this.profiles.forEach(p => {
      p.newsPosts.forEach(post => {
        results.push({ newsPost: post, companyName: p.companyName, companyId: p.id });
      });
    });
    return results.sort((a, b) => new Date(b.newsPost.publishedAt).getTime() - new Date(a.newsPost.publishedAt).getTime());
  }

  public async recommendSuppliers(query: string): Promise<AISupplierRecommendation[]> {
    const all = Array.from(this.profiles.values());
    const q = query.toLowerCase();

    return all.map(p => {
      const matchCaps = p.capabilities.filter(c => c.toLowerCase().includes(q) || q.includes(c.toLowerCase()));
      let score = 70;
      if (p.isVerifiedSupplier) score += 15;
      if (matchCaps.length > 0) score += 10;
      score = Math.min(99, score);

      return {
        profile: p,
        matchScore: score,
        reasoning: `High technical capability alignment for "${query}". Possesses verified ${p.certifications[0]?.name || 'ISO'} certification and ${p.reputationScore}% reputation score.`,
        matchingCapabilities: matchCaps.length > 0 ? matchCaps : p.capabilities.slice(0, 2),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  public async recommendRFQs(_companyId: string): Promise<AIRFQRecommendation[]> {
    return [
      {
        rfqId: 'rfq-881',
        title: 'Precision Machined Forged Inconel Valve Bodies (Qty 450)',
        category: 'Subsea Energy Hardware',
        budgetUsd: 1250000,
        matchScore: 97,
        buyerCompany: 'TotalEnergies Subsea Project Division',
        recommendedReason: 'Direct capability match: 5-Axis Milling, API 6D certification, Inconel forging experience.',
      },
      {
        rfqId: 'rfq-882',
        title: 'SIL-3 Safety PLC & Industrial Edge Gateway Procurement',
        category: 'Industrial Automation',
        budgetUsd: 840000,
        matchScore: 94,
        buyerCompany: 'BASF Chemical Plant Ludwigshafen',
        recommendedReason: 'Match: IEC 61508 safety certification and Profinet network expertise.',
      },
    ];
  }
}
