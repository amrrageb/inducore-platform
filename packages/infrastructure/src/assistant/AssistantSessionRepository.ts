import { AIAssistantSessionAggregate } from '@inducore/core-domain';

export class AssistantSessionRepository {
  private sessions: Map<string, AIAssistantSessionAggregate> = new Map();

  constructor() {
    this.seedDefaultSessions();
  }

  private seedDefaultSessions() {
    const s1 = AIAssistantSessionAggregate.create(
      {
        tenantId: 'TENANT-001',
        title: 'Aerospace Grade Titanium Sourcing Strategy',
        mode: 'procurement_advisor',
      },
      'session-001'
    ).getValue();

    s1.addMessage({
      role: 'user',
      content: 'What are the key compliance requirements when issuing RFQs for Ti-6Al-4V Grade 5 titanium sheets?',
    });

    s1.addMessage({
      role: 'assistant',
      content: `When sourcing **Ti-6Al-4V Grade 5** aerospace titanium sheets:

1. **Material Standard**: Mandate compliance with **AMS 4911** or **ASTM B265 Grade 5**.
2. **Certification**: Require **EN 10204 3.1** mill test certificates with every batch to verify tensile strength (≥ 950 MPa) and chemical analysis.
3. **Traceability**: Heat lot traceability from raw ingot melt to final sheet rolling.
4. **Audited Suppliers**: Select suppliers with active ISO 9001:2015 and AS9100D quality management certifications.`,
      citations: [
        {
          sourceTitle: 'Ti-6Al-4V Grade 5 Aerospace Titanium Sheet Spec Sheet',
          sourceType: 'doc',
          snippet: 'Ti-6Al-4V (Grade 5) tensile strength 950 MPa min. Standard compliance: AMS 4911.',
          confidenceScore: 0.95,
        },
      ],
      tokensUsed: 210,
    });

    this.sessions.set('session-001', s1);

    const s2 = AIAssistantSessionAggregate.create(
      {
        tenantId: 'TENANT-001',
        title: 'Supplier Evaluation & Fastener Audit',
        mode: 'supplier_matcher',
      },
      'session-002'
    ).getValue();

    s2.addMessage({
      role: 'user',
      content: 'Which supplier is best for high-precision structural fasteners in Germany?',
    });

    s2.addMessage({
      role: 'assistant',
      content: `**Top Recommendation**: Rheinmetall Industrial Fasteners GmbH

- **Audit Score**: 94/100 (Class A Supplier)
- **Certifications**: ISO 9001:2015, IATF 16949
- **Performance**: 98.4% On-Time Delivery, 12 PPM Defect Rate
- **Capacity**: 5M fasteners/month`,
      citations: [
        {
          sourceTitle: 'Supplier Audit Report: Rheinmetall Industrial Fasteners GmbH',
          sourceType: 'supplier',
          snippet: 'Rheinmetall holds ISO 9001:2015. Audit score: 94/100 (Class A Supplier). On-time delivery: 98.4%.',
          confidenceScore: 0.98,
        },
      ],
      tokensUsed: 180,
    });

    this.sessions.set('session-002', s2);
  }

  public async getById(id: string): Promise<AIAssistantSessionAggregate | null> {
    return this.sessions.get(id) || null;
  }

  public async getAll(tenantId: string): Promise<AIAssistantSessionAggregate[]> {
    return Array.from(this.sessions.values()).filter(
      s => s.props.tenantId === tenantId && !s.props.isArchived
    );
  }

  public async save(session: AIAssistantSessionAggregate): Promise<void> {
    this.sessions.set(session.id, session);
  }

  public async delete(id: string): Promise<boolean> {
    const s = this.sessions.get(id);
    if (!s) return false;
    s.archive();
    return true;
  }
}
