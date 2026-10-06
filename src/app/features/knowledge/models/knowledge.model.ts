export type KnowledgeCategory = 'Legal' | 'Ciberseguridad' | 'Operaciones' | 'Finanzas' | 'RRHH';

export interface KnowledgeChunk {
  id: string;
  chunkIndex: number;
  page: number;
  tokenCount: number;
  content: string;
  cosineSimilarity: number;
  vectorPreview?: number[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: KnowledgeCategory;
  fileSize: string;
  totalPages: number;
  chunksCount: number;
  embeddingModel: string;
  dimension: number;
  avgSimilarity: number;
  status: 'indexed' | 'syncing' | 'error';
  lastUpdated: string;
  isActiveInChat: boolean;
  chunks: KnowledgeChunk[];
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalChunks: number;
  vectorStorageSize: string;
  embeddingModel: string;
  avgQueryLatency: string;
  indexedDepartments: number;
}
