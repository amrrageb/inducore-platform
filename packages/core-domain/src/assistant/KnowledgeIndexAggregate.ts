import { AggregateRoot } from '../common/AggregateRoot.js';
import { Result } from '../common/Result.js';

export type KnowledgeCategory =
  | 'technical_spec'
  | 'sds_sheet'
  | 'iso_standard'
  | 'supplier_profile'
  | 'contract_terms'
  | 'mro_catalogue';

export interface KnowledgeChunkProps {
  chunkId: string;
  chunkIndex: number;
  content: string;
  vectorId?: string;
  metadata: {
    sourceTitle: string;
    category: KnowledgeCategory;
    tags: string[];
    authorOrVendor?: string;
  };
}

export interface KnowledgeIndexProps {
  tenantId: string;
  documentId: string;
  title: string;
  category: KnowledgeCategory;
  sourceUrlOrName: string;
  chunks: KnowledgeChunkProps[];
  status: 'INDEXED' | 'INDEXING' | 'ERROR';
  indexedAt: string;
  totalTokens: number;
}

export class KnowledgeIndexAggregate extends AggregateRoot<KnowledgeIndexProps> {
  private constructor(props: KnowledgeIndexProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: Omit<KnowledgeIndexProps, 'indexedAt' | 'chunks' | 'status' | 'totalTokens'>,
    id?: string
  ): Result<KnowledgeIndexAggregate> {
    if (!props.tenantId) {
      return Result.fail<KnowledgeIndexAggregate>('Tenant ID is required.');
    }
    if (!props.title || props.title.trim().length === 0) {
      return Result.fail<KnowledgeIndexAggregate>('Title is required.');
    }

    const aggregate = new KnowledgeIndexAggregate(
      {
        ...props,
        chunks: [],
        status: 'INDEXING',
        indexedAt: new Date().toISOString(),
        totalTokens: 0,
      },
      id
    );

    return Result.ok<KnowledgeIndexAggregate>(aggregate);
  }

  public addChunk(chunk: Omit<KnowledgeChunkProps, 'chunkId'>): Result<void> {
    if (!chunk.content || chunk.content.trim().length === 0) {
      return Result.fail<void>('Chunk content cannot be empty.');
    }

    const chunkId = `chk-${this.props.documentId}-${this.props.chunks.length + 1}`;
    const tokenEstimate = Math.ceil(chunk.content.split(/\s+/).length * 1.3);

    this.props.chunks.push({
      ...chunk,
      chunkId,
    });
    this.props.totalTokens += tokenEstimate;
    return Result.ok<void>();
  }

  public completeIndexing(): void {
    this.props.status = 'INDEXED';
    this.props.indexedAt = new Date().toISOString();
  }

  public markError(): void {
    this.props.status = 'ERROR';
  }
}
