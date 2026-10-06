import {
  Component,
  HostListener,
  inject
} from '@angular/core';
import {
  FEEDBACK_REASONS,
  FeedbackService,
  QUICK_TAGS
} from '../../../core/services/feedback.service';
import { AiButtonComponent } from '../ai-button';
import { AiIconComponent } from '../ai-icon';
import { AiTooltipDirective } from '../ai-tooltip';

@Component({
  selector: 'ai-feedback-dialog',
  standalone: true,
  imports: [
    AiButtonComponent,
    AiIconComponent,
    AiTooltipDirective
  ],
  template: `
    @if (feedbackService.isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 sm:p-6 select-none animate-cascade-in"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Dialog Container -->
        <div
          class="w-full max-w-xl max-h-[88vh] bg-white border border-[#dbe6f0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Header Bar -->
          <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200 shadow-sm">
                <ai-icon name="thumb-down" [size]="18" />
              </div>

              <div>
                <h3 class="text-base font-bold text-[#002147] tracking-tight">
                  Evaluación de Calidad & Reporte RAG
                </h3>
                <p class="text-xs text-slate-500">
                  Identifica alucinaciones, citas incorrectas o falta de completitud en la respuesta.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="feedbackService.close()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer"
              aiTooltip="Cerrar (Esc)"
              tooltipPosition="left"
            >
              <ai-icon name="x" [size]="18" />
            </button>
          </div>

          <!-- Body Content Area (Scrollable) -->
          <div class="p-6 overflow-y-auto max-h-[62vh] flex flex-col gap-5 no-scrollbar bg-white">
            <!-- Message Snippet Reference -->
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col gap-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Respuesta bajo revisión:
              </span>
              <p class="text-slate-700 italic line-clamp-2">
                "{{ feedbackService.activeMessageSnippet() }}"
              </p>
            </div>

            <!-- Reason Selector Cards -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
                ¿Cuál es la causa principal del problema?
              </label>

              <div class="flex flex-col gap-2">
                @for (reason of reasons; track reason.id) {
                  <div
                    (click)="feedbackService.setReason(reason.id)"
                    [class]="feedbackService.selectedReason() === reason.id ? 'border-[#003781] bg-blue-50/50 shadow-sm ring-1 ring-[#003781]/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'"
                    class="p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-0.5"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-[#002147]">{{ reason.label }}</span>
                      <div
                        [class]="feedbackService.selectedReason() === reason.id ? 'border-[#003781] bg-[#003781]' : 'border-slate-300 bg-white'"
                        class="w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors shadow-inner"
                      >
                        @if (feedbackService.selectedReason() === reason.id) {
                          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                        }
                      </div>
                    </div>
                    <p class="text-[11px] text-slate-500 leading-tight">
                      {{ reason.description }}
                    </p>
                  </div>
                }
              </div>
            </div>

            <!-- Quick Descriptive Tags -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Detalles específicos (opcional)
              </label>

              <div class="flex flex-wrap gap-1.5">
                @for (tag of quickTags; track tag) {
                  <button
                    type="button"
                    (click)="feedbackService.toggleTag(tag)"
                    [class]="feedbackService.selectedTags().includes(tag) ? 'bg-blue-100 text-[#003781] border-[#003781] font-bold shadow-sm' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-[#002147] hover:bg-slate-200/60'"
                    class="px-2.5 py-1 rounded-lg text-xs border transition-colors cursor-pointer"
                  >
                    {{ tag }}
                  </button>
                }
              </div>
            </div>

            <!-- Additional Comments Textarea -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-[#002147]">
                Observaciones para el equipo de Ingeniería & Legal
              </label>
              <textarea
                rows="3"
                [value]="feedbackService.comment()"
                (input)="onCommentInput($event)"
                placeholder="Ejemplo: La cláusula 14.2 aplica un 10% de penalización y no un 5% como indicó el modelo..."
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#003781] focus:bg-white transition-colors resize-none leading-relaxed"
              ></textarea>
            </div>

            <!-- MLOps & Privacy Telemetry Switch -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h5 class="text-xs font-semibold text-[#002147]">Telemetría de calibración MLOps</h5>
                <p class="text-[11px] text-slate-500">
                  Permitir que el equipo de ciencia de datos evalúe este caso para refinar los fragmentos vectoriales.
                </p>
              </div>

              <button
                type="button"
                (click)="feedbackService.toggleShareWithMlops()"
                [class]="feedbackService.shareWithMlops() ? 'bg-[#003781]' : 'bg-slate-200'"
                class="w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
              >
                <span
                  [class]="feedbackService.shareWithMlops() ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'"
                  class="inline-block w-4 h-4 rounded-full transition-transform shadow-sm"
                ></span>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between gap-2">
            <ai-button variant="ghost" size="sm" (click)="feedbackService.close()">
              <span>Cancelar</span>
            </ai-button>

            <div class="flex items-center gap-2">
              <ai-button
                variant="secondary"
                size="sm"
                (click)="feedbackService.submit(true)"
              >
                <ai-icon name="refresh" [size]="14" />
                <span>Enviar y Regenerar</span>
              </ai-button>

              <ai-button
                variant="primary"
                size="sm"
                (click)="feedbackService.submit(false)"
              >
                <ai-icon name="check" [size]="14" />
                <span>Enviar Reporte</span>
              </ai-button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AiFeedbackDialogComponent {
  protected readonly feedbackService = inject(FeedbackService);
  protected readonly reasons = FEEDBACK_REASONS;
  protected readonly quickTags = QUICK_TAGS;

  @HostListener('window:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.feedbackService.isOpen()) {
      this.feedbackService.close();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    this.feedbackService.close();
  }

  protected onCommentInput(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.feedbackService.setComment(text);
  }
}
