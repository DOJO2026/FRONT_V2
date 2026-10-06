import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { KnowledgeService } from '../../services/knowledge.service';

@Component({
  selector: 'app-chunk-inspector-drawer',
  standalone: true,
  imports: [AiButtonComponent, AiChipComponent, AiIconComponent, AiTooltipDirective],
  template: `
    @if (doc()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] transition-opacity animate-cascade-in"
        (click)="close()"
      ></div>

      <!-- Slide-Over Drawer Container -->
      <div
        class="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white border-l border-[#dbe6f0] shadow-2xl z-[85] flex flex-col overflow-hidden text-slate-800 animate-slide-in-right"
        (click)="$event.stopPropagation()"
      >
        <!-- Header Bar -->
        <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
              <ai-icon name="document" [size]="20" />
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-[#002147] tracking-tight truncate" [title]="doc()!.title">
                  {{ doc()!.title }}
                </h3>
                <ai-chip variant="primary" size="sm">
                  {{ doc()!.category }}
                </ai-chip>
              </div>
              <p class="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                <span>{{ doc()!.totalPages }} pág.</span>
                <span>•</span>
                <span>{{ doc()!.chunksCount }} chunks</span>
                <span>•</span>
                <span>{{ doc()!.embeddingModel }} ({{ doc()!.dimension }}d)</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="close()"
            class="p-2 rounded-xl text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
            aiTooltip="Cerrar (Esc)"
            tooltipPosition="left"
          >
            <ai-icon name="x" [size]="18" />
          </button>
        </div>

        <!-- Telemetry & Vector Health KPI Bar -->
        <div class="px-6 py-3 bg-slate-50 border-b border-[#dbe6f0] grid grid-cols-3 gap-3 text-center">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-500 uppercase font-semibold">Similitud Cos.</span>
            <span class="text-sm font-bold text-[#003781] font-mono">{{ doc()!.avgSimilarity * 100 }}%</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-500 uppercase font-semibold">Tamaño Vectorial</span>
            <span class="text-sm font-bold text-[#002147] font-mono">{{ doc()!.fileSize }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-500 uppercase font-semibold">Estado RAG</span>
            <span class="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sincronizado
            </span>
          </div>
        </div>

        <!-- In-Document Semantic Filter Input -->
        <div class="p-6 pb-3 bg-white">
          <div class="relative">
            <input
              type="text"
              [value]="chunkFilter()"
              (input)="onFilterInput($event)"
              placeholder="Filtrar fragmentos por palabra clave o concepto..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#003781] focus:bg-white transition-colors pl-9"
            />
            <div class="absolute left-3 top-2.5 text-slate-400">
              <ai-icon name="search" [size]="14" />
            </div>
            @if (chunkFilter()) {
              <button
                type="button"
                (click)="chunkFilter.set('')"
                class="absolute right-3 top-2.5 text-slate-400 hover:text-[#002147]"
              >
                <ai-icon name="x" [size]="14" />
              </button>
            }
          </div>
        </div>

        <!-- Chunks List Area (Scrollable) -->
        <div class="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-3.5 no-scrollbar bg-white">
          @if (filteredChunks().length === 0) {
            <div class="p-8 text-center text-slate-400 text-xs">
              No se encontraron fragmentos que coincidan con "{{ chunkFilter() }}".
            </div>
          } @else {
            @for (chunk of filteredChunks(); track chunk.id) {
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#003781]/40 hover:bg-blue-50/20 transition-all flex flex-col gap-2.5 group">
                <!-- Chunk Header -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-[#003781] border border-blue-200 font-bold">
                      Chunk #{{ chunk.chunkIndex }}
                    </span>
                    <span class="text-xs text-slate-500">Pág. {{ chunk.page }}</span>
                    <span class="text-xs text-slate-300">•</span>
                    <span class="text-xs text-slate-500 font-mono">{{ chunk.tokenCount }} tokens</span>
                  </div>

                  <ai-chip variant="success" size="sm">
                    {{ (chunk.cosineSimilarity * 100).toFixed(1) }}% match
                  </ai-chip>
                </div>

                <!-- Chunk Text Snippet -->
                <p class="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 font-sans shadow-sm">
                  "{{ chunk.content }}"
                </p>

                <!-- Vector Embedding Mini-Telemetry -->
                @if (chunk.vectorPreview) {
                  <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200">
                    <span>Embeddings (L2-norm):</span>
                    <span class="text-slate-600 truncate max-w-xs">
                      [{{ chunk.vectorPreview.join(', ') }}...]
                    </span>
                  </div>
                }
              </div>
            }
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between">
          <ai-button variant="ghost" size="sm" (click)="close()">
            <span>Cerrar</span>
          </ai-button>

          <div class="flex items-center gap-2">
            <ai-button
              variant="secondary"
              size="sm"
              (click)="onReindex()"
            >
              <ai-icon name="refresh" [size]="14" />
              <span>Reindexar Chunks</span>
            </ai-button>
          </div>
        </div>
      </div>
    }
  `
})
export class ChunkInspectorDrawerComponent {
  private readonly knowledgeService = inject(KnowledgeService);

  protected readonly doc = computed(() => this.knowledgeService.selectedDocForInspection());
  protected readonly chunkFilter = signal<string>('');

  protected readonly filteredChunks = computed(() => {
    const d = this.doc();
    if (!d) return [];
    const query = this.chunkFilter().trim().toLowerCase();
    if (!query) return d.chunks;
    return d.chunks.filter((c) => c.content.toLowerCase().includes(query));
  });

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.doc()) {
      this.close();
    }
  }

  protected close(): void {
    this.knowledgeService.inspectDocument(null);
    this.chunkFilter.set('');
  }

  protected onFilterInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.chunkFilter.set(val);
  }

  protected onReindex(): void {
    const d = this.doc();
    if (d) {
      this.knowledgeService.reindexDocument(d.id);
      this.close();
    }
  }
}
