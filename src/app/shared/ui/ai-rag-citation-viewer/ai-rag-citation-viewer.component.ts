import { Component, HostListener, inject, signal } from '@angular/core';
import { RagCitationService } from '../../../core/services/rag-citation.service';
import { AiButtonComponent } from '../ai-button';
import { AiChipComponent } from '../ai-chip';
import { AiIconComponent } from '../ai-icon';
import { AiTooltipDirective } from '../ai-tooltip';

@Component({
  selector: 'ai-rag-citation-viewer',
  standalone: true,
  imports: [
    AiButtonComponent,
    AiChipComponent,
    AiIconComponent,
    AiTooltipDirective
  ],
  template: `
    @if (ragService.isOpen() && citation()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-cascade-in"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Content Container -->
        <div
          class="w-full max-w-5xl max-h-[90vh] bg-white border border-[#dbe6f0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Modal Header -->
          <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
                <ai-icon name="document" [size]="22" />
              </div>

              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-[#002147] truncate" [title]="citation()!.title">
                    {{ citation()!.title }}
                  </h3>
                  <ai-chip variant="success" size="sm">
                    {{ citation()!.confidence }}% match
                  </ai-chip>
                </div>
                <span class="text-xs text-slate-500 truncate">
                  {{ citation()!.category || 'Documentación Empresarial' }}
                </span>
              </div>
            </div>

            <!-- Header Actions & Close Button -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="close()"
                class="p-2 rounded-xl text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
                aiTooltip="Cerrar visor (Esc)"
                tooltipPosition="bottom"
              >
                <ai-icon name="x" [size]="18" />
              </button>
            </div>
          </div>

          <!-- Modal Body (2 Columns: Document Page + Vector Metadata) -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
            <!-- Left: Simulated Document Page (7 cols) -->
            <div class="lg:col-span-7 flex flex-col gap-3">
              <!-- Page Toolbar -->
              <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-600 shadow-sm">
                <div class="flex items-center gap-2">
                  <ai-icon name="document" [size]="14" class="text-slate-400" />
                  <span>Página {{ citation()!.page || 1 }} de {{ citation()!.totalDocumentPages || 32 }}</span>
                </div>
                <div class="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span>Zoom: 100%</span>
                  <span class="text-[#003781] font-bold">• Fragmento Localizado</span>
                </div>
              </div>

              <!-- Document Sheet Simulation -->
              <div class="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4 text-xs leading-relaxed text-slate-700 font-serif">
                <!-- Header of Document -->
                <div class="border-b border-slate-200 pb-3 flex items-center justify-between text-[11px] font-mono text-slate-400 not-italic">
                  <span class="font-bold text-[#002147] uppercase tracking-wider">DOJO 2.0 • EXPEDIENTE TÉCNICO OFICIAL</span>
                  <span>CONFIDENCIAL TI</span>
                </div>

                <!-- Surrounding preceding context -->
                <p class="text-slate-500">
                  {{ citation()!.surroundingContext }}
                </p>

                <!-- Highlighted RAG Chunk Box -->
                <div class="relative p-4 rounded-xl bg-blue-50/70 border-2 border-[#003781]/40 shadow-sm my-1">
                  <!-- Tag -->
                  <div class="absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#003781] text-white shadow-sm">
                    Cita Textual RAG
                  </div>

                  <p class="text-sm font-sans font-medium text-[#002147] italic leading-relaxed">
                    "{{ citation()!.snippet }}"
                  </p>
                </div>

                <!-- Surrounding following context -->
                <p class="text-slate-500">
                  Los registros de auditoría y telemetría de sistemas son resguardados en cumplimiento de los estándares de observabilidad y continuidad operativa DOJO 2.0.
                </p>
              </div>
            </div>

            <!-- Right: Vector Telemetry & Actions Panel (5 cols) -->
            <div class="lg:col-span-5 flex flex-col gap-4">
              <!-- Telemetry Card -->
              <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ai-icon name="sparkles" [size]="14" class="text-[#003781]" />
                  <span>Telemetría Vectorial RAG</span>
                </h4>

                <div class="flex flex-col gap-2.5 text-xs">
                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 font-mono">
                    <span class="text-slate-500">Chunk ID</span>
                    <span class="text-[#002147] font-semibold">{{ citation()!.chunkId }}</span>
                  </div>

                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 font-mono">
                    <span class="text-slate-500">Similitud Coseno</span>
                    <span class="text-[#003781] font-bold">{{ citation()!.cosineSimilarity?.toFixed(3) }}</span>
                  </div>

                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 font-mono">
                    <span class="text-slate-500">Longitud Chunk</span>
                    <span class="text-[#002147]">{{ citation()!.tokensCount }} tokens</span>
                  </div>

                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 font-mono">
                    <span class="text-slate-500">Modelo Embeddings</span>
                    <span class="text-[#002147]">{{ citation()!.embeddingModel }}</span>
                  </div>

                  <div class="flex items-center justify-between font-mono">
                    <span class="text-slate-500">Base Vectorial</span>
                    <span class="text-emerald-600 font-bold">VectorDB: Active</span>
                  </div>
                </div>
              </div>

              <!-- Quick Actions Card -->
              <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2.5">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Acciones del Investigador
                </h4>

                <ai-button
                  variant="secondary"
                  fullWidth
                  size="sm"
                  (click)="copySnippet()"
                >
                  <ai-icon [name]="copied() ? 'check' : 'copy'" [size]="14" [class.text-emerald-600]="copied()" />
                  <span>{{ copied() ? '¡Cita Copiada!' : 'Copiar Cita Textual' }}</span>
                </ai-button>

                <ai-button
                  variant="primary"
                  fullWidth
                  size="sm"
                  (click)="close()"
                >
                  <ai-icon name="chat" [size]="14" />
                  <span>Volver a la Conversación</span>
                </ai-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AiRagCitationViewerComponent {
  protected readonly ragService = inject(RagCitationService);
  protected readonly citation = this.ragService.activeCitation;
  protected readonly copied = signal<boolean>(false);

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.ragService.isOpen()) {
      this.close();
    }
  }

  protected close(): void {
    this.ragService.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected copySnippet(): void {
    const text = this.citation()?.snippet;
    if (text) {
      navigator.clipboard?.writeText(text);
      this.copied.set(true);
      setTimeout(() => {
        this.copied.set(false);
      }, 2000);
    }
  }
}
