import { RFQAggregate, RFQProps } from '@inducore/core-domain';
import { IRFQRepository } from '@inducore/application';

export class InMemoryRFQRepository implements IRFQRepository {
  private rfqs: Map<string, RFQAggregate> = new Map();

  constructor() {
    this.seedDefaultRFQs();
  }

  private seedDefaultRFQs() {
    const rfq1Props: RFQProps = {
      title: 'High-Temp Hydrocarbon Pump Seal Replacement (Line B)',
      description: 'Procurement of ISO-certified high-temperature carbon seal assemblies for Line B cracking unit pumps.',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      invitedSupplierIds: ['sup-siemens-01', 'sup-schneider-02'],
      deadline: '2026-08-15T18:00:00Z',
      attachments: [
        {
          id: 'att-101',
          name: 'Hydrocarbon_Seal_TechSpec_v2.pdf',
          url: '/docs/Hydrocarbon_Seal_TechSpec_v2.pdf',
          sizeKb: 1420,
          uploadedAt: '2026-07-27T08:30:00Z',
        },
        {
          id: 'att-102',
          name: 'LineB_Pump_Flange_CAD.step',
          url: '/cad/LineB_Pump_Flange_CAD.step',
          sizeKb: 8900,
          uploadedAt: '2026-07-27T08:35:00Z',
        }
      ],
      clarifications: [
        {
          id: 'clr-1',
          question: 'Are Kalrez O-rings required for secondary containment or is Viton-GF acceptable?',
          askedBy: 'sup-siemens-01 (Siemens Technical Specialist)',
          askedAt: '2026-07-27T10:15:00Z',
          answer: 'Kalrez 6375 or equivalent FFKM is mandatory due to aromatic hydrocarbon vapor exposure above 220°C.',
          answeredAt: '2026-07-27T11:00:00Z',
        },
        {
          id: 'clr-2',
          question: 'What is the maximum allowed lead time for the initial batch of 8 seals?',
          askedBy: 'sup-schneider-02 (Schneider Power Systems)',
          askedAt: '2026-07-27T14:20:00Z',
        }
      ],
      revisions: [
        {
          version: 1,
          title: 'High-Temp Hydrocarbon Pump Seal Replacement',
          description: 'Initial draft requirements for pump seal replacement.',
          deadline: '2026-08-10T18:00:00Z',
          revisedAt: '2026-07-27T08:00:00Z',
          revisionNotes: 'Initial v1 spec created by Procurement Dept.',
        }
      ],
      version: 2,
      lineItems: [
        { id: 'li-1', name: 'Carbon Face Cartridge Mechanical Seal 75mm', quantity: 8, unit: 'units', targetPrice: 2400 },
        { id: 'li-2', name: 'Kalrez FFKM Secondary O-Ring Set', quantity: 16, unit: 'sets', targetPrice: 350 },
        { id: 'li-3', name: 'On-site Installation Supervision & Pressure Test', quantity: 2, unit: 'days', targetPrice: 1500 },
      ],
      bidsCount: 3,
      createdAt: '2026-07-27T08:00:00Z',
      updatedAt: '2026-07-27T11:00:00Z',
    };

    const rfq2Props: RFQProps = {
      title: 'Turbine Vibration Sensor Calibration & Spare Cable Harness',
      description: 'Private procurement invitation for high-frequency piezoelectric accelerometer calibration & Teflon cable assemblies.',
      status: 'PUBLISHED',
      visibility: 'PRIVATE',
      invitedSupplierIds: ['sup-bosch-03'],
      deadline: '2026-08-20T17:00:00Z',
      attachments: [
        {
          id: 'att-201',
          name: 'Vibration_Sensor_Pinout_Diagram.pdf',
          url: '/docs/Vibration_Sensor_Pinout.pdf',
          sizeKb: 640,
          uploadedAt: '2026-07-26T14:15:00Z',
        }
      ],
      clarifications: [],
      revisions: [],
      version: 1,
      lineItems: [
        { id: 'li-20', name: 'Triaxial Accelerometer Calibration (NIST Traceable)', quantity: 12, unit: 'units', targetPrice: 450 },
        { id: 'li-21', name: 'High-Flex Armored Cable Harness 15m', quantity: 6, unit: 'units', targetPrice: 820 },
      ],
      bidsCount: 2,
      createdAt: '2026-07-26T14:15:00Z',
      updatedAt: '2026-07-26T14:15:00Z',
    };

    const rfq3Props: RFQProps = {
      title: 'Substation PLC Controller Expansion Modules (Draft)',
      description: 'Draft specs for expanding 400kV Substation B control system with redundant EtherNet/IP gateways.',
      status: 'DRAFT',
      visibility: 'PUBLIC',
      invitedSupplierIds: [],
      deadline: '2026-09-01T12:00:00Z',
      attachments: [],
      clarifications: [],
      revisions: [],
      version: 1,
      lineItems: [
        { id: 'li-30', name: 'Redundant EtherNet/IP Communication Module', quantity: 4, unit: 'units', targetPrice: 3100 },
        { id: 'li-31', name: '32-Channel Digital Input Card 24VDC', quantity: 8, unit: 'units', targetPrice: 650 },
      ],
      bidsCount: 0,
      createdAt: '2026-07-28T04:10:00Z',
      updatedAt: '2026-07-28T04:10:00Z',
    };

    const rfq1 = RFQAggregate.create(rfq1Props, 'rfq-8841-a9').getValue();
    const rfq2 = RFQAggregate.create(rfq2Props, 'rfq-7712-b3').getValue();
    const rfq3 = RFQAggregate.create(rfq3Props, 'rfq-9904-c5').getValue();

    this.rfqs.set(rfq1.id, rfq1);
    this.rfqs.set(rfq2.id, rfq2);
    this.rfqs.set(rfq3.id, rfq3);
  }

  public async findById(id: string): Promise<RFQAggregate | null> {
    return this.rfqs.get(id) || null;
  }

  public async findAll(filter?: { status?: string; visibility?: string }): Promise<RFQAggregate[]> {
    let list = Array.from(this.rfqs.values());
    if (filter?.status) {
      list = list.filter(r => r.props.status === filter.status);
    }
    if (filter?.visibility) {
      list = list.filter(r => r.props.visibility === filter.visibility);
    }
    return list;
  }

  public async save(rfq: RFQAggregate): Promise<void> {
    this.rfqs.set(rfq.id, rfq);
  }

  public async delete(id: string): Promise<void> {
    this.rfqs.delete(id);
  }
}
