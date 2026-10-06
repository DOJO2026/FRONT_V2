import { Component, inject, input } from '@angular/core';
import { RagCitationService } from '../../../../core/services/rag-citation.service';
import { TopDocument } from '../../models/analytics.model';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';

@Component({
  selector: 'app-top-documents',
  standalone: true,
  imports: [AiCardComponent, AiChipComponent, AiIconComponent, AiTooltipDirective],
  template: `
    <ai-card variant="default" padding="md" class="h-full flex flex-col justify-between">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <ai-icon name="document" [size]="16" class="text-[var(--color-primary)]" />
            <span>Top Documentos Citados en RAG</span>
          </h4>
          <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Archivos con mayor frecuencia de recuperación en el Vector Store.
          </p>
        </div>
        <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          5 Indexados
        </span>
      </div>

      <!-- Ranked Document Rows -->
      <div class="py-3 flex flex-col gap-2 divide-y divide-white/5">
        @for (doc of documents(); track doc.id; let i = $index) {
          <div
            (click)="onInspectDoc(doc)"
            class="pt-2 first:pt-0 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between gap-3 group select-none"
            [aiTooltip]="'Clic para inspeccionar fragmento en documento oficial'"
            tooltipPosition="top"
          >
            <div class="flex items-center gap-3 min-w-0">
              <!-- Rank Index -->
              <span class="w-5 text-center text-xs font-mono font-bold text-slate-500 group-hover:text-[var(--color-primary)] transition-colors">
                #{{ i + 1 }}
              </span>

              <div class="flex flex-col min-w-0">
                <span class="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate" [title]="doc.title">
                  {{ doc.title }}
                </span>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span class="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300 font-medium">
                    {{ doc.category }}
                  </span>
                  <span>{{ doc.size }}</span>
                  <span>• {{ doc.lastCited }}</span>
                </div>
              </div>
            </div>

            <!-- Stats: Citations & Confidence Match -->
            <div class="flex items-center gap-2.5 flex-shrink-0">
              <div class="flex flex-col items-end text-right">
                <span class="text-xs font-bold font-mono text-white">{{ doc.citationsCount }} citas</span>
                <span class="text-[10px] text-slate-400">recuperaciones</span>
              </div>
              <ai-chip variant="success" size="sm">
                {{ doc.confidenceAvg }}%
              </ai-chip>
            </div>
          </div>
        }
      </div>

      <!-- Footer Action -->
      <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span>Total de documentos en base vectorial: 142</span>
        <button type="button" class="text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer flex items-center gap-1">
          <span>Ver todos los índices</span>
          <ai-icon name="chevron-right" [size]="12" />
        </button>
      </div>
    </ai-card>
  `
})
export class TopDocumentsComponent {
  readonly documents = input.required<TopDocument[]>();

  private readonly ragService = inject(RagCitationService);

  protected onInspectDoc(doc: TopDocument): void {
    this.ragService.open({
      id: doc.id,
      title: doc.title,
      confidence: Math.round(doc.confidenceAvg),
      category: doc.category,
      snippet: `Cláusula de alto impacto recuperada de "${doc.title}". Contenido procesado mediante chunking semántico y validado con 97%+ de similitud en la base vectorial corporativa.`
    });
  }
}
