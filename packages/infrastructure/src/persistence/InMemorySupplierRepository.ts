import { SupplierAggregate } from '@inducore/core-domain';
import { ISupplierRepository, SupplierSearchFilter } from '@inducore/application';

export class InMemorySupplierRepository implements ISupplierRepository {
  private suppliers: Map<string, SupplierAggregate> = new Map();

  constructor() {
    this.seedDefaultSuppliers();
  }

  private seedDefaultSuppliers() {
    // 1. Siemens Industrial Automation
    const s1 = SupplierAggregate.create({
      name: 'Siemens Industrial Automation',
      code: 'SUP-SIEMENS-01',
      logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop',
      website: 'https://www.siemens.com/automation',
      contactEmail: 'industrial.sales@siemens.com',
      contactPhone: '+1 (800) 743-6367',
      address: 'Werner-von-Siemens-Straße 1, Munich, Germany',
      status: 'VERIFIED',
      isFavorite: true,
      categories: ['Automation & PLCs', 'Electric Drives', 'Industrial IoT'],
      tags: ['PLC', 'S7-1500', 'SCADA', 'Profinet', 'High Precision', 'ISO9001'],
      certifications: [
        {
          id: 'cert-101',
          name: 'ISO 9001:2015 Quality Management',
          issuer: 'TÜV Süd',
          certificateNumber: 'TUV-DE-99021',
          issuedDate: '2022-01-15',
          validUntil: '2028-01-15',
          verificationStatus: 'VERIFIED',
        },
        {
          id: 'cert-102',
          name: 'ISO 14001 Environmental Management',
          issuer: 'DEKRA Certification',
          certificateNumber: 'DEKRA-ENV-4410',
          issuedDate: '2023-03-10',
          validUntil: '2029-03-10',
          verificationStatus: 'VERIFIED',
        },
      ],
      documents: [
        {
          id: 'doc-101',
          title: 'SIMATIC S7-1500 Technical Specification Sheet',
          documentType: 'TECHNICAL_SPEC',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileSizeBytes: 2450000,
          uploadedAt: '2024-01-10T10:00:00Z',
        },
        {
          id: 'doc-102',
          title: 'Global Compliance & Environmental Audit Report 2025',
          documentType: 'COMPLIANCE',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileSizeBytes: 5120000,
          uploadedAt: '2025-02-01T14:30:00Z',
        },
      ],
      products: [
        {
          id: 'p-101',
          supplierId: 'sup-siemens-01',
          sku: '6ES7516-3AN02-0AB0',
          name: 'SIMATIC S7-1500 CPU 1516-3 PN/DP',
          category: 'Automation & PLCs',
          description: 'High-performance Programmable Logic Controller with 1 MB work memory for program and 5 MB for data.',
          unitPrice: 3450.00,
          currency: 'USD',
          minOrderQuantity: 1,
          leadTimeDays: 7,
          specifications: {
            'Work Memory': '1 MB Program / 5 MB Data',
            'Processing Speed': '10 ns bit operation',
            'Interfaces': '2x PROFINET, 1x PROFIBUS',
          },
          tags: ['PLC', 'Siemens', 'Profinet'],
          availabilityStatus: 'IN_STOCK',
        },
        {
          id: 'p-102',
          supplierId: 'sup-siemens-01',
          sku: '6SL3210-1KE18-8AF1',
          name: 'SINAMICS G120C Variable Frequency Drive',
          category: 'Electric Drives',
          description: 'Compact inverter 4.0 kW with integrated Safety Integrated and PROFINET communication.',
          unitPrice: 890.00,
          currency: 'USD',
          minOrderQuantity: 2,
          leadTimeDays: 14,
          specifications: {
            'Power Rating': '4.0 kW / 5.5 HP',
            'Supply Voltage': '380-480V 3AC',
            'Protection Class': 'IP20',
          },
          tags: ['VFD', 'Drive', 'Energy Efficient'],
          availabilityStatus: 'IN_STOCK',
        },
      ],
      ratings: [
        {
          id: 'r-1',
          rating: 5,
          reviewerUserId: 'usr-101',
          comment: 'Exceptional build quality and rock-solid Profinet stability for our assembly line.',
          createdAt: '2025-01-10T09:00:00Z',
        },
        {
          id: 'r-2',
          rating: 4,
          reviewerUserId: 'usr-102',
          comment: 'On-time delivery and great technical documentation.',
          createdAt: '2025-03-12T11:20:00Z',
        },
      ],
      averageRating: 4.5,
    }, 'sup-siemens-01').getValue();

    // 2. Schneider Electric Heavy Systems
    const s2 = SupplierAggregate.create({
      name: 'Schneider Electric Power Systems',
      code: 'SUP-SCHNEIDER-02',
      logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop',
      website: 'https://www.se.com',
      contactEmail: 'procurement.support@se.com',
      contactPhone: '+1 (888) 778-2733',
      address: '35 Rue Joseph Monier, Rueil-Malmaison, France',
      status: 'VERIFIED',
      isFavorite: true,
      categories: ['Power Distribution', 'Transformers', 'Circuit Breakers'],
      tags: ['Medium Voltage', 'Substation', 'Energy Efficiency', 'EcoStruxure'],
      certifications: [
        {
          id: 'cert-201',
          name: 'UL 1008 Transfer Switch Equipment',
          issuer: 'Underwriters Laboratories',
          certificateNumber: 'UL-E-88201',
          issuedDate: '2021-06-01',
          validUntil: '2027-06-01',
          verificationStatus: 'VERIFIED',
        },
      ],
      documents: [
        {
          id: 'doc-201',
          title: 'Masterpact MTZ Air Circuit Breaker Manual',
          documentType: 'TECHNICAL_SPEC',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileSizeBytes: 8200000,
          uploadedAt: '2024-05-15T08:00:00Z',
        },
      ],
      products: [
        {
          id: 'p-201',
          supplierId: 'sup-schneider-02',
          sku: 'LV848050',
          name: 'Masterpact MTZ1 16 H1 Air Circuit Breaker',
          category: 'Circuit Breakers',
          description: '3-pole drawout air circuit breaker 1600A with Micrologic 2.0 X control unit.',
          unitPrice: 6200.00,
          currency: 'USD',
          minOrderQuantity: 1,
          leadTimeDays: 21,
          specifications: {
            'Rated Current': '1600 A',
            'Breaking Capacity': '65 kA @ 415V',
            'Poles': '3P',
          },
          tags: ['Breaker', 'Power', 'High Capacity'],
          availabilityStatus: 'MADE_TO_ORDER',
        },
      ],
      ratings: [
        {
          id: 'r-3',
          rating: 5,
          reviewerUserId: 'usr-101',
          comment: 'Top tier circuit breakers with unmatched short-circuit protection capacity.',
          createdAt: '2025-02-18T14:10:00Z',
        },
      ],
      averageRating: 5.0,
    }, 'sup-schneider-02').getValue();

    // 3. Bosch Rexroth Hydraulics
    const s3 = SupplierAggregate.create({
      name: 'Bosch Rexroth Hydraulics & Motion',
      code: 'SUP-BOSCH-03',
      logoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=120&auto=format&fit=crop',
      website: 'https://www.boschrexroth.com',
      contactEmail: 'heavy.hydraulics@boschrexroth.com',
      contactPhone: '+49 9352 18-0',
      address: 'Zum Eisengießer 1, Lohr am Main, Germany',
      status: 'VERIFIED',
      isFavorite: false,
      categories: ['Industrial Hydraulics', 'Linear Motion', 'Pumps & Valves'],
      tags: ['Hydraulic Pump', 'Servo Hydraulics', 'Proportional Valve', 'High Pressure'],
      certifications: [
        {
          id: 'cert-301',
          name: 'ISO 4406 Fluid Cleanliness Standard',
          issuer: 'IFPE Inspection',
          certificateNumber: 'IFPE-HYD-7711',
          issuedDate: '2023-08-01',
          validUntil: '2028-08-01',
          verificationStatus: 'VERIFIED',
        },
      ],
      documents: [],
      products: [
        {
          id: 'p-301',
          supplierId: 'sup-bosch-03',
          sku: 'A10VSO45DFR1/31R-PPA12N00',
          name: 'Axial Piston Variable Pump A10VSO',
          category: 'Industrial Hydraulics',
          description: 'High pressure axial piston pump for industrial open circuit hydraulic drives.',
          unitPrice: 2850.00,
          currency: 'USD',
          minOrderQuantity: 1,
          leadTimeDays: 12,
          specifications: {
            'Displacement': '45 cm³/rev',
            'Nominal Pressure': '280 bar',
            'Max Speed': '2600 rpm',
          },
          tags: ['Hydraulic', 'Pump', 'Axial Piston'],
          availabilityStatus: 'IN_STOCK',
        },
      ],
      ratings: [],
      averageRating: 4.8,
    }, 'sup-bosch-03').getValue();

    this.suppliers.set(s1.id, s1);
    this.suppliers.set(s2.id, s2);
    this.suppliers.set(s3.id, s3);
  }

  public async save(supplier: SupplierAggregate): Promise<void> {
    this.suppliers.set(supplier.id, supplier);
  }

  public async findById(id: string): Promise<SupplierAggregate | null> {
    return this.suppliers.get(id) || null;
  }

  public async findByCode(code: string): Promise<SupplierAggregate | null> {
    for (const sup of this.suppliers.values()) {
      if (sup.props.code.toLowerCase() === code.toLowerCase()) {
        return sup;
      }
    }
    return null;
  }

  public async findAll(filter?: SupplierSearchFilter): Promise<SupplierAggregate[]> {
    let list = Array.from(this.suppliers.values());

    if (!filter) return list;

    if (filter.query && filter.query.trim().length > 0) {
      const q = filter.query.toLowerCase();
      list = list.filter(s =>
        s.props.name.toLowerCase().includes(q) ||
        s.props.code.toLowerCase().includes(q) ||
        s.props.categories.some(c => c.toLowerCase().includes(q)) ||
        s.props.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter.category && filter.category !== 'ALL') {
      const cat = filter.category.toLowerCase();
      list = list.filter(s => s.props.categories.some(c => c.toLowerCase() === cat));
    }

    if (filter.tag) {
      const t = filter.tag.toLowerCase();
      list = list.filter(s => s.props.tags.some(tag => tag.toLowerCase() === t));
    }

    if (filter.favoriteOnly) {
      list = list.filter(s => s.props.isFavorite);
    }

    if (filter.minRating) {
      list = list.filter(s => s.props.averageRating >= filter.minRating!);
    }

    return list;
  }
}
