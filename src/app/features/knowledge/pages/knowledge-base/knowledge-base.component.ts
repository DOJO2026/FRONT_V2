import { Component, computed, inject, signal } from '@angular/core';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiEmptyStateComponent } from '../../../../shared/ui/ai-empty-state';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiSpinnerComponent } from '../../../../shared/ui/ai-spinner';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { ChunkInspectorDrawerComponent } from '../../components/chunk-inspector-drawer/chunk-inspector-drawer.component';
import { IndexingModalComponent } from '../../components/indexing-modal/indexing-modal.component';
import { KnowledgeDocument } from '../../models/knowledge.model';
import { KnowledgeService } from '../../services/knowledge.service';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [
    AiCardComponent,
    AiButtonComponent,
    AiChipComponent,
    AiEmptyStateComponent,
    AiIconComponent,
    AiSpinnerComponent,
    AiTooltipDirective,
    ChunkInspectorDrawerComponent,
    IndexingModalComponent
  ],
  template: `
    <div class="h-full flex flex-col overflow-y-auto px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full text-slate-100 gap-8">
      <!-- Top Header & Actions -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
            <span>RAG Vector Store Hub</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Base de Conocimiento Corporativa
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Repositorio vectorial indexado con text-embedding-004 para el grounding y citas del AI Copilot.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <ai-button
            variant="secondary"
            size="md"
            [disabled]="knowledgeService.isReindexingAll()"
            (click)="knowledgeService.reindexAll()"
            aiTooltip="Sincronizar y recomputar embeddings vectoriales de toda la base"
            tooltipPosition="bottom"
          >
            @if (knowledgeService.isReindexingAll()) {
              <ai-spinner type="dots" size="sm" class="mr-1.5" />
              <span>Sincronizando...</span>
            } @else {
              <ai-icon name="refresh" [size]="16" />
              <span>Reindexar Todo</span>
            }
          </ai-button>

          <ai-button
            variant="primary"
            size="md"
            (click)="knowledgeService.openIndexingModal()"
            class="shadow-[0_0_15px_rgba(16,163,127,0.3)]"
          >
            <ai-icon name="plus" [size]="16" />
            <span>+ Indexar Documento</span>
          </ai-button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1 -->
        <ai-card variant="elevated" padding="md" class="border-slate-800 bg-slate-900/70">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Documentos Indexados</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ai-icon name="document" [size]="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-white font-mono">{{ stats().totalDocuments }}</span>
            <span class="text-xs text-emerald-400 font-medium font-mono">100% operativos</span>
          </div>
        </ai-card>

        <!-- Card 2 -->
        <ai-card variant="elevated" padding="md" class="border-slate-800 bg-slate-900/70">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Fragmentos Vectoriales</span>
            <div class="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ai-icon name="sparkles" [size]="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-white font-mono">{{ stats().totalChunks }}</span>
            <span class="text-xs text-cyan-400 font-medium font-mono">768 dimensiones</span>
          </div>
        </ai-card>

        <!-- Card 3 -->
        <ai-card variant="elevated" padding="md" class="border-slate-800 bg-slate-900/70">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Almacenamiento Vector DB</span>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ai-icon name="history" [size]="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-white font-mono">{{ stats().vectorStorageSize }}</span>
            <span class="text-xs text-slate-400 font-medium font-mono">HNSW Index</span>
          </div>
        </ai-card>

        <!-- Card 4 -->
        <ai-card variant="elevated" padding="md" class="border-slate-800 bg-slate-900/70">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Latencia RAG Promedio</span>
            <div class="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ai-icon name="refresh" [size]="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-white font-mono">{{ stats().avgQueryLatency }}</span>
            <span class="text-xs text-purple-400 font-medium font-mono">text-embedding-004</span>
          </div>
        </ai-card>
      </div>

      <!-- Search, Categories & View Mode Bar -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- Search Bar -->
        <div class="relative flex-1 max-w-md">
          <input
            type="text"
            [value]="knowledgeService.searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Buscar por documento, cláusula o concepto RAG..."
            class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors pl-9"
          />
          <div class="absolute left-3 top-3 text-slate-500">
            <ai-icon name="search" [size]="14" />
          </div>
          @if (knowledgeService.searchQuery()) {
            <button
              type="button"
              (click)="knowledgeService.setSearchQuery('')"
              class="absolute right-3 top-3 text-slate-500 hover:text-white"
            >
              <ai-icon name="x" [size]="14" />
            </button>
          }
        </div>

        <!-- Category Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          @for (cat of categories; track cat) {
            <button
              type="button"
              (click)="knowledgeService.setCategory(cat)"
              [class]="knowledgeService.selectedCategory() === cat ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-semibold' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60'"
              class="px-3 py-1.5 rounded-xl text-xs border transition-colors cursor-pointer whitespace-nowrap"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>

      <!-- Document Cards Grid -->
      @if (documents().length === 0) {
        <ai-empty-state
          icon="document"
          title="No se encontraron documentos"
          description="No hay fuentes indexadas que coincidan con los criterios de búsqueda o categoría seleccionada."
          actionText="Limpiar Filtros"
          (action)="resetFilters()"
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (doc of documents(); track doc.id) {
            <ai-card
              variant="elevated"
              padding="md"
              class="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 group"
            >
              <!-- Card Top -->
              <div class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-800/80 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-slate-700/60 group-hover:border-emerald-500/40 transition-colors">
                    <ai-icon name="document" [size]="20" />
                  </div>

                  <!-- Active In Chat Toggle -->
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-400 font-medium">Activo en Chat</span>
                    <button
                      type="button"
                      (click)="knowledgeService.toggleActiveInChat(doc.id)"
                      [class]="doc.isActiveInChat ? 'bg-[var(--color-primary)] text-white shadow-[0_0_10px_rgba(16,163,127,0.4)]' : 'bg-slate-800 text-slate-500'"
                      class="w-10 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
                      [aiTooltip]="doc.isActiveInChat ? 'Documento activo para el Copilot' : 'Clic para activar en el Copilot'"
                      tooltipPosition="left"
                    >
                      <span
                        [class]="doc.isActiveInChat ? 'translate-x-5 bg-white' : 'translate-x-1 bg-slate-400'"
                        class="inline-block w-3.5 h-3.5 rounded-full transition-transform mt-0.5"
                      ></span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate" [title]="doc.title">
                    {{ doc.title }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1.5">
                    <ai-chip variant="primary" size="sm">
                      {{ doc.category }}
                    </ai-chip>
                    <span class="text-[11px] text-slate-500 font-mono">{{ doc.fileSize }}</span>
                    <span class="text-[11px] text-slate-500">•</span>
                    <span class="text-[11px] text-slate-500">{{ doc.totalPages }} pág.</span>
                  </div>
                </div>

                <!-- Chunks & Vector Stats -->
                <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>{{ doc.chunksCount }} chunks</span>
                  <span class="text-emerald-400 font-semibold">{{ (doc.avgSimilarity * 100).toFixed(1) }}% match</span>
                  <span class="text-slate-500">{{ doc.lastUpdated }}</span>
                </div>
              </div>

              <!-- Card Bottom Actions -->
              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <ai-button
                  variant="ghost"
                  size="sm"
                  (click)="knowledgeService.inspectDocument(doc)"
                  aiTooltip="Inspeccionar fragmentos vectoriales y contenido detallado"
                  tooltipPosition="top"
                >
                  <ai-icon name="search" [size]="14" />
                  <span>Inspeccionar Chunks</span>
                </ai-button>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    (click)="knowledgeService.reindexDocument(doc.id)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    aiTooltip="Reindexar documento"
                    tooltipPosition="top"
                  >
                    @if (doc.status === 'syncing') {
                      <ai-icon name="spinner" [size]="14" class="animate-spin text-emerald-400" />
                    } @else {
                      <ai-icon name="refresh" [size]="14" />
                    }
                  </button>

                  <button
                    type="button"
                    (click)="knowledgeService.deleteDocument(doc.id)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    aiTooltip="Eliminar del Vector Store"
                    tooltipPosition="top"
                  >
                    <ai-icon name="x" [size]="14" />
                  </button>
                </div>
              </div>
            </ai-card>
          }
        </div>
      }

      <!-- Modals & Slide-Overs -->
      <app-chunk-inspector-drawer />
      <app-indexing-modal />
    </div>
  `
})
export class KnowledgeBaseComponent {
  protected readonly knowledgeService = inject(KnowledgeService);

  protected readonly documents = computed(() => this.knowledgeService.filteredDocuments());
  protected readonly stats = computed(() => this.knowledgeService.stats());
  protected readonly categories = ['Todos', 'Legal', 'Ciberseguridad', 'Operaciones', 'Finanzas', 'RRHH'];

  protected onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.knowledgeService.setSearchQuery(val);
  }

  protected resetFilters(): void {
    this.knowledgeService.setSearchQuery('');
    this.knowledgeService.setCategory('Todos');
  }
}
