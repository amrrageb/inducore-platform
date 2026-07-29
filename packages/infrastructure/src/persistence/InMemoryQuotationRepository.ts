import { QuotationAggregate } from '@inducore/core-domain';
import { IQuotationRepository } from '@inducore/application';

export class InMemoryQuotationRepository implements IQuotationRepository {
  private store = new Map<string, QuotationAggregate>();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Quote 1: Bosch Rexroth - RFQ-2026-001 (High Pressure Hydraulic Valve Cartridges)
    const quote1 = QuotationAggregate.create(
      {
        rfqId: 'rfq-001',
        rfqTitle: 'High Pressure Hydraulic Valve Cartridges - Line C',
        supplierId: 'sup-bosch-01',
        supplierName: 'Bosch Rexroth Hydraulics GmbH',
        version: 2,
        status: 'SUBMITTED',
        isAlternativeOffer: false,
        isPartialQuotation: false,
        currency: 'USD',
        subtotalPrice: 4800,
        taxVatRatePercentage: 10,
        taxVatAmount: 480,
        totalPrice: 5280,
        incoterms: 'DDP',
        incotermsLocation: 'Apex Manufacturing Plant Site - Houston TX',
        deliveryTimeDays: 21,
        paymentTerms: 'Net 30 Days after Delivery',
        validityUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems: [
          {
            id: 'qli-1',
            rfqLineItemId: 'item-1',
            itemName: 'High Pressure Valve Cartridge 350 Bar',
            quantity: 4,
            unit: 'units',
            unitPrice: 1200,
            totalPrice: 4800,
            isIncluded: true,
            technicalNotes: 'Includes Viton high-temperature seals & ISO 4401 subplate certificate',
          },
        ],
        technicalAttachments: [
          {
            id: 'qatt-1',
            name: 'Bosch_Rexroth_Hydraulic_350Bar_CAD.pdf',
            url: '/docs/Bosch_Rexroth_Hydraulic_350Bar_CAD.pdf',
            type: 'TECHNICAL',
            sizeKb: 2450,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        commercialAttachments: [
          {
            id: 'qatt-2',
            name: 'Commercial_Terms_Price_Breakdown_2026.pdf',
            url: '/docs/Commercial_Terms_Price_Breakdown_2026.pdf',
            type: 'COMMERCIAL',
            sizeKb: 1120,
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        internalNotes: 'Offered 5% volume discount if buyer commits to quarterly re-orders.',
        buyerComments: [
          {
            id: 'cmnt-1',
            author: 'Chief Procurement Officer (Apex)',
            comment: 'Can you confirm if DDP includes import customs clearance fees at Houston port?',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        revisions: [
          {
            version: 1,
            totalPrice: 5600,
            currency: 'USD',
            incoterms: 'FOB',
            deliveryTimeDays: 30,
            submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Initial quotation v1 submitted with FOB Hamburg terms.',
          },
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'quote-101'
    ).getValue();

    // Quote 2: Siemens Energy - Alternative Offer for Actuators
    const quote2 = QuotationAggregate.create(
      {
        rfqId: 'rfq-002',
        rfqTitle: 'Rotary Valve Actuators - Stainless Steel Grade 316',
        supplierId: 'sup-siemens-02',
        supplierName: 'Siemens Industrial Automation SE',
        version: 1,
        status: 'SUBMITTED',
        isAlternativeOffer: true,
        alternativeOfferDetails: 'Offering heavy-duty electric rotary actuators with integrated IoT sensors instead of pneumatic',
        isPartialQuotation: false,
        currency: 'EUR',
        subtotalPrice: 13500,
        taxVatRatePercentage: 19,
        taxVatAmount: 2565,
        totalPrice: 16065,
        incoterms: 'CIF',
        incotermsLocation: 'Port of Rotterdam',
        deliveryTimeDays: 14,
        paymentTerms: '50% Advance, 50% against Bill of Lading',
        validityUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems: [
          {
            id: 'qli-2',
            rfqLineItemId: 'item-2',
            itemName: 'Stainless Steel Rotary Actuator (Alternative Smart Electric)',
            quantity: 10,
            unit: 'units',
            unitPrice: 1350,
            totalPrice: 13500,
            isIncluded: true,
            technicalNotes: 'ATEX Zone 1 Certified, Modbus RTU / PROFINET telemetry interface',
          },
        ],
        technicalAttachments: [
          {
            id: 'qatt-3',
            name: 'Siemens_SmartActuator_ATEX_Cert.pdf',
            url: '/docs/Siemens_SmartActuator_ATEX_Cert.pdf',
            type: 'TECHNICAL',
            sizeKb: 3890,
            uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        commercialAttachments: [
          {
            id: 'qatt-4',
            name: 'Siemens_EUR_Commercial_Proposal.pdf',
            url: '/docs/Siemens_EUR_Commercial_Proposal.pdf',
            type: 'COMMERCIAL',
            sizeKb: 980,
            uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        internalNotes: 'Fast delivery from Stuttgart central logistics hub.',
        buyerComments: [],
        revisions: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'quote-102'
    ).getValue();

    // Quote 3: Partial Quotation from Eaton
    const quote3 = QuotationAggregate.create(
      {
        rfqId: 'rfq-001',
        rfqTitle: 'High Pressure Hydraulic Valve Cartridges - Line C',
        supplierId: 'sup-eaton-03',
        supplierName: 'Eaton Hydraulics Inc.',
        version: 1,
        status: 'SUBMITTED',
        isAlternativeOffer: false,
        isPartialQuotation: true,
        currency: 'USD',
        subtotalPrice: 2200,
        taxVatRatePercentage: 8,
        taxVatAmount: 176,
        totalPrice: 2376,
        incoterms: 'EXW',
        incotermsLocation: 'Eaton Warehouse - Cleveland OH',
        deliveryTimeDays: 10,
        paymentTerms: 'Net 15 Days',
        validityUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems: [
          {
            id: 'qli-3',
            rfqLineItemId: 'item-1',
            itemName: 'High Pressure Valve Cartridge 350 Bar',
            quantity: 2,
            unit: 'units',
            unitPrice: 1100,
            totalPrice: 2200,
            isIncluded: true,
            technicalNotes: 'Partial offer for 2 units currently available in quick-ship stock.',
          },
        ],
        technicalAttachments: [],
        commercialAttachments: [],
        internalNotes: 'Can ship within 48 hours of PO issuance.',
        buyerComments: [],
        revisions: [],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      'quote-103'
    ).getValue();

    this.store.set(quote1.id, quote1);
    this.store.set(quote2.id, quote2);
    this.store.set(quote3.id, quote3);
  }

  async findById(id: string): Promise<QuotationAggregate | null> {
    return this.store.get(id) || null;
  }

  async findByRfqId(rfqId: string): Promise<QuotationAggregate[]> {
    return Array.from(this.store.values()).filter(q => q.props.rfqId === rfqId);
  }

  async findBySupplierId(supplierId: string): Promise<QuotationAggregate[]> {
    return Array.from(this.store.values()).filter(q => q.props.supplierId === supplierId);
  }

  async findAll(): Promise<QuotationAggregate[]> {
    return Array.from(this.store.values());
  }

  async save(quotation: QuotationAggregate): Promise<void> {
    this.store.set(quotation.id, quotation);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
