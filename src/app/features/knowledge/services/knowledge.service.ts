import { Injectable, computed, inject, signal } from '@angular/core';
import { ChatService } from '../../chat/services/chat.service';
import { environment } from '../../../../environments/environment';
import { KnowledgeCategory, KnowledgeDocument, KnowledgeStats } from '../models/knowledge.model';

export interface RepositoryDocument {
  id: string;
  title: string;
  category: string;
  size: string;
  updatedAt: string;
  chunks: number;
  embeddingModel: string;
  description: string;
}

export interface RepositoryResponse {
  success?: boolean;
  data?: {
    totalDocuments?: number;
    documents?: RepositoryDocument[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {
  private readonly chatService = inject(ChatService);

  readonly documents = signal<KnowledgeDocument[]>([]);
  readonly stats = signal<KnowledgeStats>({
    totalDocuments: 0,
    totalChunks: 0,
    vectorStorageSize: '0 MB',
    embeddingModel: 'text-embedding-004',
    avgQueryLatency: '—',
    indexedDepartments: 0
  });

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('Todos');
  readonly selectedDocForInspection = signal<KnowledgeDocument | null>(null);
  readonly isIndexingModalOpen = signal<boolean>(false);
  readonly isReindexingAll = signal<boolean>(false);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly filteredDocuments = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();
    let list = this.documents();

    if (cat !== 'Todos') {
      list = list.filter((d) => d.category === cat);
    }

    if (query) {
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query) ||
          d.chunks.some((c) => c.content.toLowerCase().includes(query))
      );
    }

    return list;
  });

  constructor() {
    void this.loadRepository();
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  inspectDocument(doc: KnowledgeDocument | null): void {
    this.selectedDocForInspection.set(doc);
  }

  openIndexingModal(): void {
    this.isIndexingModalOpen.set(true);
  }

  closeIndexingModal(): void {
    this.isIndexingModalOpen.set(false);
  }

  toggleActiveInChat(docId: string): void {
    this.documents.update((docs) =>
      docs.map((d) => {
        if (d.id === docId) {
          const nextState = !d.isActiveInChat;
          if (nextState) {
            this.chatService.addAttachedDoc(d.title);
          } else {
            this.chatService.removeAttachedDoc(d.title);
          }
          return { ...d, isActiveInChat: nextState };
        }
        return d;
      })
    );
  }

  reindexDocument(docId: string): void {
    this.documents.update((docs) =>
      docs.map((d) => (d.id === docId ? { ...d, status: 'syncing' } : d))
    );

    setTimeout(() => {
      this.documents.update((docs) =>
        docs.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: 'indexed',
                lastUpdated: 'Ahora',
                avgSimilarity: Number((0.95 + Math.random() * 0.04).toFixed(3))
              }
            : d
        )
      );
    }, 1200);
  }

  reindexAll(): void {
    this.isReindexingAll.set(true);
    this.documents.update((docs) => docs.map((d) => ({ ...d, status: 'syncing' })));

    setTimeout(() => {
      this.documents.update((docs) =>
        docs.map((d) => ({
          ...d,
          status: 'indexed',
          lastUpdated: 'Ahora'
        }))
      );
      this.isReindexingAll.set(false);
    }, 1800);
  }

  deleteDocument(docId: string): void {
    const doc = this.documents().find((d) => d.id === docId);
    if (doc) {
      this.chatService.removeAttachedDoc(doc.title);
    }
    this.documents.update((docs) => docs.filter((d) => d.id !== docId));
    this.stats.update((s) => ({
      ...s,
      totalDocuments: s.totalDocuments - 1
    }));
    if (this.selectedDocForInspection()?.id === docId) {
      this.selectedDocForInspection.set(null);
    }
  }

  indexNewDocument(
    title: string,
    category: KnowledgeCategory,
    fileSize: string,
    totalPages: number,
    initialContent?: string
  ): void {
    const newDocId = `kdoc-${Date.now()}`;
    const chunksCount = Math.max(8, totalPages * 2);

    const newDoc: KnowledgeDocument = {
      id: newDocId,
      title: title.trim(),
      category,
      fileSize,
      totalPages,
      chunksCount,
      embeddingModel: 'text-embedding-004',
      dimension: 768,
      avgSimilarity: 0.978,
      status: 'indexed',
      lastUpdated: 'Ahora',
      isActiveInChat: true,
      chunks: [
        {
          id: `chk-${Date.now()}-1`,
          chunkIndex: 1,
          page: 1,
          tokenCount: 175,
          content:
            initialContent ||
            `Documento corporativo "${title}". Se han extraído e indexado los términos clave con codificación semántica text-embedding-004 y normalización L2.`,
          cosineSimilarity: 0.985,
          vectorPreview: [0.045, -0.162, 0.498, 0.034, 0.812]
        },
        {
          id: `chk-${Date.now()}-2`,
          chunkIndex: 2,
          page: 2,
          tokenCount: 160,
          content:
            'Parámetros y cláusulas de cumplimiento acordadas. El procesamiento garantiza trazabilidad y vinculación directa con el AI Copilot.',
          cosineSimilarity: 0.967,
          vectorPreview: [-0.012, 0.224, 0.388, 0.115, 0.672]
        }
      ]
    };

    this.documents.update((docs) => [newDoc, ...docs]);
    this.chatService.addAttachedDoc(newDoc.title);

    this.stats.update((s) => ({
      ...s,
      totalDocuments: s.totalDocuments + 1,
      totalChunks: s.totalChunks + chunksCount
    }));

    this.closeIndexingModal();
  }

  async loadRepository(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const response = await fetch(`${environment.apiBaseUrl}/api/v1/fuentes`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`No fue posible cargar las fuentes (${response.status}).`);
      }

      const payload = await response.json() as RepositoryDocument[] | RepositoryResponse;
      const repositoryDocs = Array.isArray(payload)
        ? payload
        : payload.data?.documents || [];

      const documents = repositoryDocs.map((doc) => this.normalizeRepositoryDocument(doc));
      this.documents.set(documents);
      this.stats.update((stats) => ({
        ...stats,
        totalDocuments: documents.length,
        totalChunks: documents.reduce((total, doc) => total + doc.chunksCount, 0),
        indexedDepartments: new Set(documents.map((doc) => doc.category)).size,
        embeddingModel: documents[0]?.embeddingModel || 'text-embedding-004'
      }));
    } catch (error) {
      this.loadError.set(error instanceof Error ? error.message : 'Error al cargar las fuentes.');
      this.documents.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private normalizeRepositoryDocument(doc: RepositoryDocument): KnowledgeDocument {
    const category = this.normalizeCategory(doc.category);

    return {
      id: doc.id,
      title: doc.title,
      category,
      fileSize: doc.size,
      totalPages: 1,
      chunksCount: doc.chunks,
      embeddingModel: doc.embeddingModel,
      dimension: 768,
      avgSimilarity: 0,
      status: 'indexed',
      lastUpdated: doc.updatedAt,
      isActiveInChat: false,
      chunks: []
    };
  }

  private normalizeCategory(category: string): KnowledgeCategory {
    const normalized = category.toLowerCase();
    if (normalized.includes('legal') || normalized.includes('sla')) return 'Legal';
    if (normalized.includes('seguridad') || normalized.includes('ciber')) return 'Ciberseguridad';
    if (normalized.includes('oper')) return 'Operaciones';
    if (normalized.includes('finanz')) return 'Finanzas';
    return 'Operaciones';
  }
}
