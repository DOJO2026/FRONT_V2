import { Injectable, computed, inject, signal } from '@angular/core';
import { ChatService } from '../../chat/services/chat.service';
import { INITIAL_KNOWLEDGE_DOCS_MOCK, KNOWLEDGE_STATS_MOCK } from '../mocks/knowledge.mock';
import { KnowledgeCategory, KnowledgeDocument, KnowledgeStats } from '../models/knowledge.model';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {
  private readonly chatService = inject(ChatService);

  readonly documents = signal<KnowledgeDocument[]>(INITIAL_KNOWLEDGE_DOCS_MOCK);
  readonly stats = signal<KnowledgeStats>(KNOWLEDGE_STATS_MOCK);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('Todos');
  readonly selectedDocForInspection = signal<KnowledgeDocument | null>(null);
  readonly isIndexingModalOpen = signal<boolean>(false);
  readonly isReindexingAll = signal<boolean>(false);

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
}
