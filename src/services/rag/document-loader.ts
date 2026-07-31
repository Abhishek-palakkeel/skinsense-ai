import type { IDocumentLoader, KnowledgeDocument } from "./types";
import { KNOWLEDGE_BASE } from "./knowledge-base";

/**
 * Loads dermatology knowledge documents. Currently reads a bundled sample
 * corpus; replace with a filesystem/S3/Notion loader by implementing
 * IDocumentLoader — the retriever and chat layer are unaffected.
 */
export class StaticDocumentLoader implements IDocumentLoader {
  constructor(private readonly documents: KnowledgeDocument[] = KNOWLEDGE_BASE) {}

  async load(): Promise<KnowledgeDocument[]> {
    return this.documents;
  }
}
