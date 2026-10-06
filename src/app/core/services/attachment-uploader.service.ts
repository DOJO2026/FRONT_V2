import { Injectable, inject, signal } from '@angular/core';
import { ChatService } from '../../features/chat/services/chat.service';

export interface UploadQueueItem {
  id: string;
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  type: string;
  progress: number;
  status: 'uploading' | 'vectorizing' | 'ready' | 'error';
  chunksCount?: number;
  embeddingModel: string;
  errorMessage?: string;
  autoAttach: boolean;
}

export interface RepositoryDocItem {
  id: string;
  title: string;
  category: string;
  size: string;
  updatedAt: string;
  chunks: number;
  embeddingModel: string;
  description: string;
}

const INITIAL_REPOSITORY_DOCS: RepositoryDocItem[] = [
  {
    id: 'rep-1',
    title: 'Contrato_Marco_Operaciones_2026.pdf',
    category: 'Legal & Opex',
    size: '14.2 MB',
    updatedAt: '02 Sep 2026',
    chunks: 184,
    embeddingModel: 'text-embedding-004',
    description: 'Bases contractuales generales, acuerdos de confidencialidad y cláusulas de penalización por disponibilidad.'
  },
  {
    id: 'rep-2',
    title: 'Anexo_SLA_2026.docx',
    category: 'Operaciones',
    size: '3.8 MB',
    updatedAt: '01 Sep 2026',
    chunks: 56,
    embeddingModel: 'text-embedding-004',
    description: 'Niveles de servicio acordados, tiempos de resolución por severidad y métricas MTTR/MTBF.'
  },
  {
    id: 'rep-3',
    title: 'Normativa_Ciberseguridad_ISO27001.pdf',
    category: 'Seguridad & Cloud',
    size: '8.1 MB',
    updatedAt: '28 Ago 2026',
    chunks: 128,
    embeddingModel: 'text-embedding-004',
    description: 'Lineamientos de cifrado en reposo, auditoría de accesos privileged y cumplimiento SOC2 Tipo II.'
  },
  {
    id: 'rep-4',
    title: 'Poliza_Salud_Directivos_2026.pdf',
    category: 'Recursos Humanos',
    size: '2.4 MB',
    updatedAt: '15 Ago 2026',
    chunks: 82,
    embeddingModel: 'text-embedding-004',
    description: 'Cuadro médico nacional, coberturas dentales y reembolsos de farmacia para directores corporativos.'
  },
  {
    id: 'rep-5',
    title: 'Tarifario_Operaciones_Cloud_Q3.xlsx',
    category: 'Finanzas & Opex',
    size: '1.2 MB',
    updatedAt: '10 Ago 2026',
    chunks: 34,
    embeddingModel: 'text-embedding-004',
    description: 'Desglose de costes por compute unit, almacenamiento SSD y transferencia egress multinube.'
  },
  {
    id: 'rep-6',
    title: 'Politica_Privacidad_GDPR.pdf',
    category: 'Compliance & Privacidad',
    size: '4.5 MB',
    updatedAt: '05 Jul 2026',
    chunks: 92,
    embeddingModel: 'text-embedding-004',
    description: 'Protocolo de tratamiento de datos personales, derechos ARCO y transferencias internacionales.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AttachmentUploaderService {
  private readonly chatService = inject(ChatService);

  readonly isOpen = signal<boolean>(false);
  readonly activeTab = signal<'upload' | 'repository'>('upload');
  readonly searchQuery = signal<string>('');

  readonly repositoryDocs = signal<RepositoryDocItem[]>(INITIAL_REPOSITORY_DOCS);
  readonly uploadQueue = signal<UploadQueueItem[]>([]);

  open(tab: 'upload' | 'repository' = 'upload'): void {
    this.activeTab.set(tab);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  setActiveTab(tab: 'upload' | 'repository'): void {
    this.activeTab.set(tab);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  // Check if a document is already attached in chat
  isAttached(title: string): boolean {
    return this.chatService.attachedDocs().includes(title);
  }

  toggleAttach(title: string): void {
    if (this.isAttached(title)) {
      this.chatService.removeAttachedDoc(title);
    } else {
      this.chatService.addAttachedDoc(title);
    }
  }

  // Handle local file uploads with simulated progress & vectorization
  handleFiles(files: FileList | File[]): void {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      const newItem: UploadQueueItem = {
        id: `upl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        sizeFormatted: this.formatBytes(file.size),
        sizeBytes: file.size,
        type: file.type || 'application/pdf',
        progress: 10,
        status: 'uploading',
        embeddingModel: 'text-embedding-004',
        chunksCount: Math.max(12, Math.round(file.size / (1024 * 32))),
        autoAttach: true
      };

      this.uploadQueue.update((q) => [newItem, ...q]);
      this.simulateUpload(newItem.id, file.name);
    }

    this.activeTab.set('upload');
  }

  // Simulated upload with a preset mock file for quick demo
  uploadSampleMockFile(name = 'Manual_Procedimientos_Operativos_2026.pdf', size = 5242880): void {
    const newItem: UploadQueueItem = {
      id: `upl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      sizeFormatted: this.formatBytes(size),
      sizeBytes: size,
      type: 'application/pdf',
      progress: 15,
      status: 'uploading',
      embeddingModel: 'text-embedding-004',
      chunksCount: 68,
      autoAttach: true
    };

    this.uploadQueue.update((q) => [newItem, ...q]);
    this.simulateUpload(newItem.id, name);
    this.activeTab.set('upload');
  }

  removeUpload(id: string): void {
    const item = this.uploadQueue().find((q) => q.id === id);
    if (item && this.isAttached(item.name)) {
      this.chatService.removeAttachedDoc(item.name);
    }
    this.uploadQueue.update((q) => q.filter((item) => item.id !== id));
  }

  clearCompleted(): void {
    this.uploadQueue.update((q) => q.filter((item) => item.status !== 'ready'));
  }

  private simulateUpload(id: string, fileName: string): void {
    let currentProgress = 15;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 15;

      if (currentProgress >= 100) {
        clearInterval(interval);
        // Set vectorizing state
        this.uploadQueue.update((q) =>
          q.map((item) =>
            item.id === id
              ? { ...item, progress: 100, status: 'vectorizing' }
              : item
          )
        );

        // Vectorization completes after 1.2s
        setTimeout(() => {
          this.uploadQueue.update((q) =>
            q.map((item) =>
              item.id === id
                ? { ...item, status: 'ready' }
                : item
            )
          );

          // Add to repository list as well
          const newDoc: RepositoryDocItem = {
            id: `rep-custom-${Date.now()}`,
            title: fileName,
            category: 'Documentos Usuario',
            size: '5.2 MB',
            updatedAt: 'Hoy',
            chunks: 68,
            embeddingModel: 'text-embedding-004',
            description: 'Documento indexado en la base vectorial con text-embedding-004.'
          };
          this.repositoryDocs.update((docs) => [newDoc, ...docs]);

          // Automatically attach to chat
          this.chatService.addAttachedDoc(fileName);
        }, 1200);
      } else {
        this.uploadQueue.update((q) =>
          q.map((item) =>
            item.id === id
              ? { ...item, progress: Math.min(95, currentProgress) }
              : item
          )
        );
      }
    }, 280);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
