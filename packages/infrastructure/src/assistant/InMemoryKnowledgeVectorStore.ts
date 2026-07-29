import { GroundingCitation } from '@inducore/core-domain';

export interface IndexedChunk {
  chunkId: string;
  documentId: string;
  title: string;
  category: string;
  sourceUrlOrName: string;
  content: string;
  tags: string[];
  tokenCount: number;
}

export class InMemoryKnowledgeVectorStore {
  private chunks: IndexedChunk[] = [];

  constructor() {
    this.seedDefaultKnowledgeBase();
  }

  private seedDefaultKnowledgeBase() {
    const defaultDocs: { id: string; title: string; category: string; source: string; content: string; tags: string[] }[] = [
      {
        id: 'DOC-ISO-9001',
        title: 'ISO 9001:2015 Quality Assurance Clause 8.4',
        category: 'iso_standard',
        source: 'ISO_9001_Quality_Standard.pdf',
        tags: ['quality', 'iso9001', 'supplier_control', 'compliance'],
        content: `Clause 8.4.1 General: The organization shall ensure that externally provided processes, products, and services conform to requirements. The organization shall determine the controls to be applied to externally provided processes, products and services when: a) products and services from external providers are intended for incorporation into the organization's own products and services; b) products and services are provided directly to the customer(s) by external providers on behalf of the organization.`,
      },
      {
        id: 'DOC-SPEC-TITANIUM',
        title: 'Ti-6Al-4V Grade 5 Aerospace Titanium Sheet Spec Sheet',
        category: 'technical_spec',
        source: 'Ti6Al4V_Aerospace_Spec_v3.pdf',
        tags: ['titanium', 'aerospace', 'grade5', 'tensile_strength', 'raw_material'],
        content: `Ti-6Al-4V (Grade 5) is an alpha-beta titanium alloy offering high mechanical strength, excellent corrosion resistance, and high strength-to-weight ratio. Tensile strength: 950 MPa (138 ksi) min. Yield strength: 880 MPa (128 ksi) min. Elongation: 14%. Density: 4.43 g/cm³. Operating temperature range: -250°C to +400°C. Standard compliance: AMS 4911, ASTM B265 Grade 5. Suitable for jet engine components, pressure vessels, and high-performance fasteners.`,
      },
      {
        id: 'DOC-SDS-HYDRAULIC',
        title: 'Safety Data Sheet (SDS) - Industrial Hydraulic Pump Fluid ISO VG 46',
        category: 'sds_sheet',
        source: 'SDS_Hydraulic_Fluid_VG46.pdf',
        tags: ['sds', 'safety', 'hydraulic', 'fluid', 'lubricant', 'mro'],
        content: `Hazard Identification: Non-flammable liquid. Flash point: >220°C (Cleveland Open Cup). Viscosity at 40°C: 46 cSt. Viscosity index: 102. Emergency response: In case of skin contact, wash thoroughly with soap and water. If pressurized high-pressure injection occurs, seek immediate surgical evaluation. Disposal: Dispose of in accordance with local environmental regulations (EWC code 13 01 10*).`,
      },
      {
        id: 'DOC-CATALOG-PUMPS',
        title: 'MRO Catalogue: High-Pressure Hydraulic Piston Pump HP-350 Bar',
        category: 'mro_catalogue',
        source: 'InduCore_MRO_Catalogue_2026.pdf',
        tags: ['mro', 'pump', 'hydraulic', '350bar', 'flange_iso4401'],
        content: `Item Code: MRO-PUMP-HP350. Max Operating Pressure: 350 bar (5075 psi). Flow Rate: 120 L/min at 1500 RPM. Mounting Flange: ISO 4401-05. Port Configuration: SAE 1-1/4" Code 61. Compatible with mineral oils and synthetic esters. Standard Lead Time: 14 days. Unit Price: €3,450. Stocked at Hamburg Logistics Hub (WH-HAMBURG-01).`,
      },
      {
        id: 'DOC-SUPPLIER-AUDIT-DE',
        title: 'Supplier Audit Report: Rheinmetall Industrial Fasteners GmbH',
        category: 'supplier_profile',
        source: 'Audit_Rheinmetall_Fasteners_2025.pdf',
        tags: ['supplier', 'audit', 'rheinmetall', 'fasteners', 'high_quality'],
        content: `Rheinmetall Industrial Fasteners GmbH holds valid ISO 9001:2015 and IATF 16949 certifications. Audit score: 94/100 (Class A Supplier). On-time delivery rate: 98.4%. Defect rate (PPM): 12 PPM. Production capacity: 5,000,000 fasteners/month. Approved for nuclear and aerospace critical structural joints.`,
      },
      {
        id: 'DOC-CONTRACT-SLAS',
        title: 'Standard Enterprise Procurement Terms & SLA Clauses',
        category: 'contract_terms',
        source: 'Standard_Procurement_Terms_v2.1.pdf',
        tags: ['contract', 'sla', 'terms', 'payment_net60', 'penalties'],
        content: `Section 12 Liquidated Damages for Late Delivery: Late deliveries shall incur a penalty of 0.5% of the Purchase Order total per business day of delay, up to a maximum cap of 15% of total PO value. Section 15 Payment Terms: Standard payment terms are Net 60 days following receipt of valid VAT invoice and proof of goods inspection clearance at designated plant receiving dock.`,
      },
    ];

    for (const doc of defaultDocs) {
      this.indexDocument(doc);
    }
  }

  public indexDocument(doc: {
    id: string;
    title: string;
    category: string;
    source: string;
    content: string;
    tags: string[];
  }): void {
    // Break document into ~150 word chunks
    const words = doc.content.split(/\s+/);
    const chunkSize = 150;

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunkText = words.slice(i, i + chunkSize).join(' ');
      const chunkId = `chk-${doc.id}-${Math.floor(i / chunkSize) + 1}`;
      this.chunks.push({
        chunkId,
        documentId: doc.id,
        title: doc.title,
        category: doc.category,
        sourceUrlOrName: doc.source,
        content: chunkText,
        tags: doc.tags,
        tokenCount: Math.ceil(chunkText.split(/\s+/).length * 1.3),
      });
    }
  }

  public search(query: string, topK = 4, categoryFilter?: string): GroundingCitation[] {
    const queryTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    if (queryTerms.length === 0) return [];

    const scored = this.chunks
      .filter(chunk => !categoryFilter || chunk.category === categoryFilter)
      .map(chunk => {
        const text = (chunk.title + ' ' + chunk.content + ' ' + chunk.tags.join(' ')).toLowerCase();
        let score = 0;
        for (const term of queryTerms) {
          if (text.includes(term)) {
            score += 1;
            // Boost if in title or tags
            if (chunk.title.toLowerCase().includes(term)) score += 2;
            if (chunk.tags.some(t => t.toLowerCase().includes(term))) score += 1.5;
          }
        }
        // Normalize score between 0 and 1
        const maxPossible = queryTerms.length * 4.5;
        const confidenceScore = Math.min(1.0, Math.round((score / maxPossible) * 100) / 100);
        return { chunk, confidenceScore };
      })
      .filter(item => item.confidenceScore > 0.05)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, topK);

    return scored.map(item => ({
      sourceTitle: item.chunk.title,
      sourceType: (item.chunk.category.includes('supplier')
        ? 'supplier'
        : item.chunk.category.includes('contract')
        ? 'contract'
        : item.chunk.category.includes('catalogue')
        ? 'product'
        : 'doc') as any,
      snippet: item.chunk.content,
      confidenceScore: Math.max(0.72, item.confidenceScore),
    }));
  }

  public getStats() {
    return {
      totalDocuments: new Set(this.chunks.map(c => c.documentId)).size,
      totalChunks: this.chunks.length,
      totalTokensIndexed: this.chunks.reduce((acc, c) => acc + c.tokenCount, 0),
      categories: Array.from(new Set(this.chunks.map(c => c.category))),
    };
  }

  public getAllChunks(): IndexedChunk[] {
    return this.chunks;
  }
}
