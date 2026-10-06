import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { KnowledgeCategory } from '../../models/knowledge.model';
import { KnowledgeService } from '../../services/knowledge.service';

@Component({
  selector: 'app-indexing-modal',
  standalone: true,
  imports: [AiButtonComponent, AiIconComponent, AiTooltipDirective],
  template: `
    @if (isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 sm:p-6 select-none animate-cascade-in"
        (click)="close()"
      >
        <!-- Modal Dialog Container -->
        <div
          class="w-full max-w-lg bg-white border border-[#dbe6f0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Header Bar -->
          <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
                <ai-icon name="plus" [size]="18" />
              </div>

              <div>
                <h3 class="text-base font-bold text-[#002147] tracking-tight">
                  Indexar Documento en Base Vectorial
                </h3>
                <p class="text-xs text-slate-500">
                  Segmentación automática en chunks y vectorización con text-embedding-004.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="close()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer"
              aiTooltip="Cerrar (Esc)"
              tooltipPosition="left"
            >
              <ai-icon name="x" [size]="18" />
            </button>
          </div>

          <!-- Form Body -->
          <div class="p-6 flex flex-col gap-5 overflow-y-auto max-h-[65vh] bg-white">
            <!-- Document Title -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-[#002147]">
                Nombre del Documento o Archivo
              </label>
              <input
                type="text"
                [value]="title()"
                (input)="onTitleInput($event)"
                placeholder="Ej. Procedimiento_Operativo_Auditoria.pdf"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#003781] focus:bg-white transition-colors"
              />
            </div>

            <!-- Category Selector -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-[#002147]">
                Departamento / Categoría
              </label>
              <div class="flex flex-wrap gap-2">
                @for (cat of categories; track cat) {
                  <button
                    type="button"
                    (click)="selectedCategory.set(cat)"
                    [class]="selectedCategory() === cat ? 'bg-blue-100 text-[#003781] border-[#003781] font-bold shadow-sm' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-[#002147] hover:bg-slate-200/60'"
                    class="px-3 py-1.5 rounded-xl text-xs border transition-colors cursor-pointer"
                  >
                    {{ cat }}
                  </button>
                }
              </div>
            </div>

            <!-- Total Pages & File Size Simulation -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-[#002147]">
                  Número de Páginas
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  [value]="pages()"
                  (input)="onPagesInput($event)"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#002147] focus:outline-none focus:border-[#003781] focus:bg-white"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-[#002147]">
                  Tamaño Estimado
                </label>
                <input
                  type="text"
                  [value]="fileSize()"
                  (input)="onFileSizeInput($event)"
                  placeholder="Ej. 2.5 MB"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#002147] focus:outline-none focus:border-[#003781] focus:bg-white"
                />
              </div>
            </div>

            <!-- Initial Text Snippet -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-[#002147]">
                Resumen o Fragmento Inicial Clave (Opcional)
              </label>
              <textarea
                rows="3"
                [value]="initialText()"
                (input)="onInitialTextInput($event)"
                placeholder="Extracto o cláusula principal para indexación semántica prioritaria..."
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#003781] focus:bg-white transition-colors resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between">
            <ai-button variant="ghost" size="sm" (click)="close()">
              <span>Cancelar</span>
            </ai-button>

            <ai-button
              variant="primary"
              size="sm"
              [disabled]="!title().trim()"
              (click)="onSubmit()"
            >
              <ai-icon name="plus" [size]="14" />
              <span>Indexar y Vectorizar</span>
            </ai-button>
          </div>
        </div>
      </div>
    }
  `
})
export class IndexingModalComponent {
  private readonly knowledgeService = inject(KnowledgeService);

  protected readonly isOpen = computed(() => this.knowledgeService.isIndexingModalOpen());
  protected readonly categories: KnowledgeCategory[] = [
    'Legal',
    'Ciberseguridad',
    'Operaciones',
    'Finanzas',
    'RRHH'
  ];

  protected readonly title = signal<string>('');
  protected readonly selectedCategory = signal<KnowledgeCategory>('Legal');
  protected readonly pages = signal<number>(12);
  protected readonly fileSize = signal<string>('2.2 MB');
  protected readonly initialText = signal<string>('');

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  }

  protected close(): void {
    this.knowledgeService.closeIndexingModal();
    this.title.set('');
    this.initialText.set('');
  }

  protected onTitleInput(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected onPagesInput(event: Event): void {
    this.pages.set(Number((event.target as HTMLInputElement).value) || 1);
  }

  protected onFileSizeInput(event: Event): void {
    this.fileSize.set((event.target as HTMLInputElement).value || '1.0 MB');
  }

  protected onInitialTextInput(event: Event): void {
    this.initialText.set((event.target as HTMLTextAreaElement).value);
  }

  protected onSubmit(): void {
    const t = this.title().trim();
    if (!t) return;

    this.knowledgeService.indexNewDocument(
      t,
      this.selectedCategory(),
      this.fileSize(),
      this.pages(),
      this.initialText()
    );

    this.close();
  }
}
