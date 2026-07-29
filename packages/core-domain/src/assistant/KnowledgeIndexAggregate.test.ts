import { describe, it, expect } from 'vitest';
import { KnowledgeIndexAggregate } from './KnowledgeIndexAggregate.js';

describe('KnowledgeIndexAggregate', () => {
  it('should create a knowledge index aggregate and add chunks', () => {
    const res = KnowledgeIndexAggregate.create({
      tenantId: 'TENANT-001',
      documentId: 'DOC-ISO-9001',
      title: 'ISO 9001:2015 Quality Management Standard Specs',
      category: 'iso_standard',
      sourceUrlOrName: 'iso_9001_quality_manual.pdf',
    });

    expect(res.isSuccess).toBe(true);
    const doc = res.getValue();
    expect(doc.props.status).toBe('INDEXING');

    doc.addChunk({
      chunkIndex: 0,
      content: 'Clause 8.4 Control of externally provided processes, products and services.',
      metadata: {
        sourceTitle: doc.props.title,
        category: 'iso_standard',
        tags: ['quality', 'compliance', 'supplier_control'],
      },
    });

    expect(doc.props.chunks).toHaveLength(1);
    doc.completeIndexing();
    expect(doc.props.status).toBe('INDEXED');
  });
});
