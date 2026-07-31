import { HashingEmbeddingService, tokenize } from "./embeddings";
import { StaticDocumentLoader } from "./document-loader";
import { InMemoryVectorStore } from "./vector-store";
import type {
  IDocumentLoader,
  IEmbeddingService,
  IRetriever,
  IVectorStore,
  RetrievalHit,
} from "./types";

/**
 * Hybrid retriever: dense vector similarity blended with lexical tag/keyword
 * matching. Lazily indexes the corpus on first query.
 *
 * Replace the embedding service and vector store with API/FAISS
 * implementations and this class keeps working unchanged.
 */
export class InMemoryRetriever implements IRetriever {
  private indexed: Promise<void> | null = null;

  constructor(
    private readonly loader: IDocumentLoader = new StaticDocumentLoader(),
    private readonly embeddings: IEmbeddingService = new HashingEmbeddingService(),
    private readonly store: IVectorStore = new InMemoryVectorStore(),
  ) {}

  private ensureIndexed() {
    if (!this.indexed) {
      this.indexed = (async () => {
        const docs = await this.loader.load();
        const vectors = await this.embeddings.embedBatch(
          docs.map((d) => `${d.title} ${d.tags.join(" ")} ${d.content}`),
        );
        await this.store.upsert(docs.map((document, i) => ({ document, vector: vectors[i] })));
      })();
    }
    return this.indexed;
  }

  async retrieve(query: string, topK = 3): Promise<RetrievalHit[]> {
    await this.ensureIndexed();
    if (!query.trim()) return [];

    const vector = await this.embeddings.embed(query);
    const dense = await this.store.query(vector, topK * 3);
    const terms = tokenize(query);

    const reranked = dense.map((hit) => {
      const lexical =
        terms.filter(
          (t) =>
            hit.document.tags.some((tag) => tag.includes(t)) ||
            hit.document.title.toLowerCase().includes(t),
        ).length / Math.max(1, terms.length);
      return { ...hit, score: hit.score * 0.6 + lexical * 0.4 };
    });

    return reranked
      .filter((h) => h.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
