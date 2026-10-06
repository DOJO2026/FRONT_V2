import { Injectable, signal } from '@angular/core';
import { RagCitation } from '../models/rag.model';

@Injectable({
  providedIn: 'root'
})
export class RagCitationService {
  readonly isOpen = signal<boolean>(false);
  readonly activeCitation = signal<RagCitation | null>(null);

  open(citation: RagCitation): void {
    // Fill in default vector telemetry values if missing
    const enriched: RagCitation = {
      ...citation,
      chunkId: citation.chunkId || `chk_${Math.floor(Math.random() * 8000) + 1000}`,
      cosineSimilarity: citation.cosineSimilarity || (citation.confidence / 100),
      tokensCount: citation.tokensCount || Math.floor(Math.random() * 80) + 90,
      embeddingModel: citation.embeddingModel || 'text-embedding-004',
      totalDocumentPages: citation.totalDocumentPages || (citation.page ? citation.page + 14 : 32),
      surroundingContext: citation.surroundingContext ||
        'El presente apartado regula las condiciones de prestación de servicios y los niveles de calidad exigibles entre las partes contratantes conforme a la normativa vigente.'
    };

    this.activeCitation.set(enriched);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
