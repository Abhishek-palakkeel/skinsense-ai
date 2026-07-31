/** RAG document contracts. Swap implementations without touching callers. */

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
}

export interface EmbeddedDocument {
  document: KnowledgeDocument;
  vector: number[];
}

export interface RetrievalHit {
  document: KnowledgeDocument;
  score: number;
}

export interface IEmbeddingService {
  readonly dimensions: number;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface IVectorStore {
  upsert(items: EmbeddedDocument[]): Promise<void>;
  query(vector: number[], topK: number): Promise<RetrievalHit[]>;
  size(): number;
}

export interface IDocumentLoader {
  load(): Promise<KnowledgeDocument[]>;
}

export interface IRetriever {
  retrieve(query: string, topK?: number): Promise<RetrievalHit[]>;
}
