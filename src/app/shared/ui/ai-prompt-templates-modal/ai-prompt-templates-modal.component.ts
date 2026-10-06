import {
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  CorporatePromptTemplate,
  PromptHistoryItem,
  PromptTemplatesService
} from '../../../core/services/prompt-templates.service';
import { AiButtonComponent } from '../ai-button';
import { AiChipComponent } from '../ai-chip';
import { AiIconComponent } from '../ai-icon';
import { AiTooltipDirective } from '../ai-tooltip';

@Component({
  selector: 'ai-prompt-templates-modal',
  standalone: true,
  imports: [
    AiButtonComponent,
    AiIconComponent,
    AiTooltipDirective
  ],
  template: `
    @if (templatesService.isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[85] flex items-center justify-center p-4 sm:p-6 select-none animate-cascade-in"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Dialog Container -->
        <div
          class="w-full max-w-3xl max-h-[88vh] bg-white border border-[#dbe6f0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Header Bar -->
          <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
                <ai-icon name="sparkles" [size]="20" />
              </div>

              <div>
                <h3 class="text-base font-bold text-[#002147] tracking-tight">
                  Biblioteca de Plantillas & Prompts Corporativos
                </h3>
                <p class="text-xs text-slate-500">
                  Estandariza consultas corporativas para auditorías, acuerdos SLA, finanzas y ciberseguridad.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="templatesService.close()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer"
              aiTooltip="Cerrar modal (Esc)"
              tooltipPosition="left"
            >
              <ai-icon name="x" [size]="18" />
            </button>
          </div>

          <!-- Navigation Tabs -->
          <div class="px-6 pt-3 border-b border-[#dbe6f0] bg-slate-50/70 flex items-center gap-2">
            <button
              type="button"
              (click)="templatesService.setActiveTab('templates')"
              [class]="templatesService.activeTab() === 'templates' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ai-icon name="document" [size]="14" />
              <span>Plantillas de Empresa</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#003781] font-bold font-mono">
                {{ templatesService.templates().length }}
              </span>
            </button>

            <button
              type="button"
              (click)="templatesService.setActiveTab('favorites')"
              [class]="templatesService.activeTab() === 'favorites' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ai-icon name="sparkles" [size]="14" />
              <span>Favoritos</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {{ favoriteCount() }}
              </span>
            </button>

            <button
              type="button"
              (click)="templatesService.setActiveTab('history')"
              [class]="templatesService.activeTab() === 'history' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ai-icon name="history" [size]="14" />
              <span>Historial Reciente</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {{ templatesService.promptHistory().length }}
              </span>
            </button>
          </div>

          <!-- Body Content Area (Scrollable) -->
          <div class="p-6 overflow-y-auto max-h-[62vh] flex flex-col gap-5 no-scrollbar bg-white">
            <!-- CATEGORY & SEARCH BAR (Only for templates and favorites tabs) -->
            @if (templatesService.activeTab() !== 'history') {
              <div class="flex flex-col gap-3">
                <!-- Search Box -->
                <div class="relative">
                  <ai-icon
                    name="search"
                    [size]="16"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    [value]="templatesService.searchQuery()"
                    (input)="onSearchInput($event)"
                    placeholder="Buscar por objetivo, departamento o palabras clave..."
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#003781] focus:bg-white transition-colors"
                  />
                </div>

                <!-- Category Pills -->
                <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  @for (cat of categories; track cat) {
                    <button
                      type="button"
                      (click)="templatesService.setSelectedCategory(cat)"
                      [class]="templatesService.selectedCategory() === cat ? 'bg-blue-100 text-[#003781] border-[#003781] font-bold shadow-sm' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-[#002147] hover:bg-slate-200/60'"
                      class="px-3 py-1 rounded-lg text-xs border transition-colors flex-shrink-0 cursor-pointer"
                    >
                      {{ cat }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- TAB 1 & 2: TEMPLATES / FAVORITES LIST -->
            @if (templatesService.activeTab() === 'templates' || templatesService.activeTab() === 'favorites') {
              @if (displayedTemplates().length === 0) {
                <div class="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                  <ai-icon name="search" [size]="28" class="text-slate-400" />
                  <span class="text-xs font-medium">No se encontraron plantillas para este filtro o búsqueda.</span>
                </div>
              } @else {
                <div class="flex flex-col gap-3">
                  @for (item of displayedTemplates(); track item.id) {
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#003781]/40 hover:bg-blue-50/20 transition-colors flex flex-col gap-3 group">
                      <!-- Top Info Bar -->
                      <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2 flex-wrap min-w-0">
                          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#003781] border border-blue-200">
                            {{ item.category }}
                          </span>
                          <span class="text-xs text-slate-400">•</span>
                          <span class="text-xs text-slate-500 font-medium">
                            {{ item.department }}
                          </span>
                        </div>

                        <!-- Favorite Bookmark Button -->
                        <button
                          type="button"
                          (click)="templatesService.toggleFavorite(item.id)"
                          [class]="item.isFavorite ? 'text-amber-500 bg-amber-50 border border-amber-200' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'"
                          class="p-1.5 rounded-lg transition-colors cursor-pointer"
                          aiTooltip="Marcar como favorito"
                          tooltipPosition="left"
                        >
                          <ai-icon name="sparkles" [size]="14" />
                        </button>
                      </div>

                      <!-- Title & Description -->
                      <div>
                        <h4 class="text-sm font-bold text-[#002147] group-hover:text-[#003781] transition-colors">
                          {{ item.title }}
                        </h4>
                        <p class="text-xs text-slate-500 mt-0.5">
                          {{ item.description }}
                        </p>
                      </div>

                      <!-- Prompt Quote Box -->
                      <div class="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed select-text shadow-sm">
                        "{{ item.prompt }}"
                      </div>

                      <!-- Bottom Action Row -->
                      <div class="flex items-center justify-between pt-1 gap-2 flex-wrap">
                        <!-- Variables / Context Tags -->
                        <div class="flex items-center gap-1.5 flex-wrap">
                          @for (v of item.variables; track v) {
                            <span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                              {{ v }}
                            </span>
                          }
                          <span class="text-[10px] text-slate-400 font-mono ml-1">
                            ~{{ item.tokensEstimate }} tokens
                          </span>
                        </div>

                        <!-- Use In Chat Button -->
                        <ai-button
                          variant="primary"
                          size="sm"
                          (click)="templatesService.usePrompt(item.prompt)"
                        >
                          <ai-icon name="send" [size]="12" />
                          <span>Usar en Chat</span>
                        </ai-button>
                      </div>
                    </div>
                  }
                </div>
              }
            }

            <!-- TAB 3: PROMPT HISTORY -->
            @if (templatesService.activeTab() === 'history') {
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-500">
                    Últimas consultas ejecutadas en esta sesión del Copilot:
                  </span>

                  @if (templatesService.promptHistory().length > 0) {
                    <button
                      type="button"
                      (click)="templatesService.clearHistory()"
                      class="text-xs text-rose-600 hover:text-rose-700 transition-colors cursor-pointer font-medium"
                    >
                      Borrar historial
                    </button>
                  }
                </div>

                @if (templatesService.promptHistory().length === 0) {
                  <div class="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                    <ai-icon name="history" [size]="28" class="text-slate-400" />
                    <span class="text-xs font-medium">El historial de prompts recientes está vacío.</span>
                  </div>
                } @else {
                  <div class="flex flex-col gap-2.5">
                    @for (hist of templatesService.promptHistory(); track hist.id) {
                      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                        <div class="flex flex-col gap-1 min-w-0">
                          <p class="text-xs text-[#002147] leading-relaxed select-text font-medium">
                            "{{ hist.prompt }}"
                          </p>
                          <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>{{ hist.timestamp }}</span>
                            <span>•</span>
                            <span>{{ hist.tokenCost }} tokens est.</span>
                            @if (hist.category) {
                              <span>•</span>
                              <span class="text-[#003781] font-semibold">{{ hist.category }}</span>
                            }
                          </div>
                        </div>

                        <ai-button
                          variant="secondary"
                          size="sm"
                          class="flex-shrink-0"
                          (click)="templatesService.usePrompt(hist.prompt)"
                        >
                          <ai-icon name="refresh" [size]="12" />
                          <span>Reutilizar</span>
                        </ai-button>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <ai-icon name="sparkles" [size]="14" class="text-[#003781]" />
              <span>Las plantillas seleccionadas se insertan directamente en el área de prompt del chat.</span>
            </div>

            <ai-button variant="ghost" size="sm" (click)="templatesService.close()">
              <span>Cerrar</span>
            </ai-button>
          </div>
        </div>
      </div>
    }
  `
})
export class AiPromptTemplatesModalComponent {
  protected readonly templatesService = inject(PromptTemplatesService);

  protected readonly categories = [
    'Todas',
    'Legal & Contratos',
    'Operaciones & SLA',
    'Ciberseguridad',
    'Finanzas',
    'RRHH'
  ];

  protected readonly favoriteCount = computed(() => {
    return this.templatesService.templates().filter((t) => t.isFavorite).length;
  });

  protected readonly displayedTemplates = computed<CorporatePromptTemplate[]>(() => {
    const tab = this.templatesService.activeTab();
    const cat = this.templatesService.selectedCategory();
    const query = this.templatesService.searchQuery().trim().toLowerCase();

    let list = this.templatesService.templates();

    if (tab === 'favorites') {
      list = list.filter((t) => t.isFavorite);
    }

    if (cat !== 'Todas') {
      list = list.filter((t) => t.category === cat);
    }

    if (query) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.prompt.toLowerCase().includes(query) ||
          t.department.toLowerCase().includes(query)
      );
    }

    return list;
  });

  @HostListener('window:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.templatesService.isOpen()) {
      this.templatesService.close();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    this.templatesService.close();
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.templatesService.setSearchQuery(target.value);
  }
}
