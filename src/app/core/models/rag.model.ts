export interface RagCitation {
  id: string;
  title: string;
  page?: number;
  snippet: string;
  confidence: number;
  category?: string;
  chunkId?: string;
  cosineSimilarity?: number;
  tokensCount?: number;
  embeddingModel?: string;
  totalDocumentPages?: number;
  surroundingContext?: string;
}
