import { Component, computed, inject, input, signal } from '@angular/core';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { RagCitationService } from '../../../../core/services/rag-citation.service';
import { ReasoningCanvasService } from '../../../../core/services/reasoning-canvas.service';
import { AiAvatarComponent } from '../../../../shared/ui/ai-avatar';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiSpinnerComponent } from '../../../../shared/ui/ai-spinner';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { ClaimWorkflowComponent } from '../claim-workflow/claim-workflow.component';
import { ChatMessage, MessageSource } from '../../models/chat-message.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [
    AiAvatarComponent,
    AiCardComponent,
    AiChipComponent,
    AiIconComponent,
    AiSpinnerComponent,
    AiTooltipDirective,
    ClaimWorkflowComponent
  ],
  template: `
    @if (message().role === 'user') {
      <!-- User Message (Deep DOJO Marine Blue with White Text) -->
      <div class="flex items-start gap-3 max-w-2xl ml-auto flex-row-reverse animate-cascade-in">
        <ai-avatar
          role="user"
          [name]="user().name"
          size="md"
          [status]="user().status"
        />

        <div class="flex flex-col items-end gap-1 min-w-0">
          <div class="bg-[#003781] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-sm shadow-blue-900/10">
            <p class="text-sm text-white font-normal whitespace-pre-wrap leading-relaxed">
              {{ message().content }}
            </p>
          </div>
          <span class="text-[10px] text-slate-400 px-1">
            {{ message().timestamp }}
          </span>
        </div>
      </div>
    } @else {
      <!-- Assistant / DOJO AI Message -->
      <div class="flex items-start gap-3 max-w-3xl mr-auto animate-cascade-in">
        <ai-avatar role="ai" size="md" status="online" />

        <div class="flex-1 flex flex-col gap-2 min-w-0">
          <ai-card variant="default" padding="md" class="rounded-2xl rounded-tl-xs border-[#dbe6f0] bg-white shadow-sm">
            <!-- Header: Model, Status & Timestamp -->
            <div class="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-[#002147] flex items-center gap-1.5">
                  <ai-icon name="shield" [size]="14" class="text-[#003781]" />
                  DOJO AI • Agente de Sistemas
                </span>
                @if (message().modelUsed) {
                  <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                    {{ message().modelUsed }}
                  </span>
                }
                @if (isHalted()) {
                  <ai-chip variant="warning" size="sm">Detenido</ai-chip>
                } @else if (message().status === 'streaming') {
                  <ai-chip variant="primary" size="sm">
                    <ai-spinner type="dots" size="sm" class="mr-1 inline-block" />
                    Transmitiendo...
                  </ai-chip>
                }
              </div>
              <span class="text-[10px] text-slate-400">
                {{ message().timestamp }}
              </span>
            </div>

            <!-- Formatted Markdown-like Content -->
            <div class="text-sm text-slate-700 leading-relaxed space-y-3 prose max-w-none">
              @for (section of formattedSections(); track section.id) {
                @if (section.type === 'heading') {
                  <h4 class="text-sm font-bold text-[#002147] mt-3 mb-1.5 flex items-center gap-1.5">
                    <span class="text-[#003781]">›</span>
                    {{ section.text }}
                  </h4>
                } @else if (section.type === 'list') {
                  <ul class="list-disc pl-5 space-y-1 text-xs text-slate-700">
                    @for (item of section.items; track item) {
                      <li [innerHTML]="item"></li>
                    }
                  </ul>
                } @else {
                  <p class="text-xs sm:text-sm text-slate-700 leading-relaxed" [innerHTML]="section.text"></p>
                }
              }

              @if (message().status === 'streaming') {
                <span class="inline-block w-2 h-4.5 bg-[var(--color-primary)] ml-1 align-middle animate-pulse rounded-sm shadow-[0_0_10px_var(--color-primary)]"></span>
              }
            </div>

            <!-- Interactive Claim Workflow Component (if applicable) -->
            @if (message().interactiveType) {
              <app-claim-workflow [message]="message()" />
            }

            @if (message().status === 'streaming') {
              <!-- Streaming Telemetry Live Indicator -->
              <div class="flex items-center justify-between pt-3 mt-2 border-t border-white/5 text-[11px] text-slate-400">
                <div class="flex items-center gap-2 font-mono text-emerald-400">
                  <ai-spinner type="dots" size="sm" />
                  <span>Sintetizando tokens en tiempo real (~45 tok/s)...</span>
                </div>
                <button
                  type="button"
                  (click)="chatService.stopGeneration()"
                  class="text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  aiTooltip="Detener generación (Esc)"
                  tooltipPosition="left"
                >
                  <ai-icon name="stop" [size]="12" />
                  <span>Detener</span>
                </button>
              </div>
            } @else {
              <!-- Cited Sources Accordion (RAG) -->
              @if (message().sources && message().sources!.length > 0) {
                <div class="mt-4 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    (click)="toggleSources()"
                    class="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer select-none py-1"
                  >
                    <span class="flex items-center gap-1.5 text-[var(--color-primary)]">
                      <ai-icon name="document" [size]="14" />
                      <span>Fuentes Oficiales Citadas ({{ message().sources!.length }})</span>
                    </span>
                    <div class="flex items-center gap-1 text-[10px] text-slate-400">
                      <span>{{ showSources() ? 'Ocultar' : 'Ver citas' }}</span>
                      <ai-icon
                        name="chevron-down"
                        [size]="12"
                        [class.rotate-180]="showSources()"
                        class="transition-transform duration-200"
                      />
                    </div>
                  </button>

                  @if (showSources()) {
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 pt-1 animate-cascade-in">
                      @for (source of message().sources; track source.id) {
                        <div
                          (click)="onOpenSource(source)"
                          class="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-[#003781] hover:bg-blue-50/40 transition-all flex flex-col gap-1.5 cursor-pointer group/source shadow-xs"
                          [aiTooltip]="'Clic para inspeccionar fragmento en documento oficial'"
                          tooltipPosition="top"
                        >
                          <div class="flex items-center justify-between gap-1">
                            <span class="text-xs font-semibold text-[#002147] group-hover/source:text-[#003781] transition-colors truncate" [title]="source.title">
                              {{ source.title }}
                            </span>
                            <ai-chip variant="success" size="sm">
                              {{ source.confidence }}% match
                            </ai-chip>
                          </div>

                          <div class="flex items-center justify-between text-[10px] text-slate-500">
                            <div class="flex items-center gap-1.5">
                              @if (source.page) {
                                <span>Pág. {{ source.page }}</span>
                              }
                              @if (source.category) {
                                <span>• {{ source.category }}</span>
                              }
                            </div>
                            <span class="text-[#007ab3] opacity-0 group-hover/source:opacity-100 transition-opacity text-[10px] font-medium flex items-center gap-0.5">
                              <span>Inspeccionar</span>
                              <ai-icon name="chevron-right" [size]="10" />
                            </span>
                          </div>

                          <p class="text-[11px] text-slate-600 italic line-clamp-2 bg-white p-1.5 rounded border border-slate-200">
                            "{{ source.snippet }}"
                          </p>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Bottom Actions: Copy, Thumbs Up/Down, Regenerate -->
              <div class="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5">
                <div class="flex items-center gap-1">
                  <!-- Copy Button -->
                  <button
                    type="button"
                    (click)="copyToClipboard()"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1"
                    [aiTooltip]="copied() ? '¡Copiado!' : 'Copiar respuesta'"
                    tooltipShortcut="Ctrl+C"
                    tooltipPosition="top"
                  >
                    <ai-icon [name]="copied() ? 'check' : 'copy'" [size]="14" [class.text-emerald-400]="copied()" />
                    @if (copied()) {
                      <span class="text-[10px] text-emerald-400 font-medium">Copiado</span>
                    }
                  </button>

                  <!-- Feedback Up -->
                  <button
                    type="button"
                    (click)="onFeedback('up')"
                    class="p-1.5 rounded-lg transition-colors cursor-pointer"
                    [class.text-emerald-400]="message().feedback === 'up'"
                    [class.text-slate-400]="message().feedback !== 'up'"
                    class="hover:text-white hover:bg-white/5"
                    aiTooltip="Respuesta útil y precisa"
                    tooltipPosition="top"
                  >
                    <ai-icon name="thumb-up" [size]="14" />
                  </button>

                  <!-- Feedback Down -->
                  <button
                    type="button"
                    (click)="onFeedback('down')"
                    class="p-1.5 rounded-lg transition-colors cursor-pointer hover:text-white hover:bg-white/5"
                    [class.text-amber-400]="message().feedback === 'down'"
                    [class.text-slate-400]="message().feedback !== 'down'"
                    aiTooltip="Reportar respuesta o alucinación RAG"
                    tooltipPosition="top"
                  >
                    <ai-icon name="thumb-down" [size]="14" />
                  </button>
                </div>

                <!-- Regenerate & Canvas Actions -->
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    (click)="onOpenCanvas()"
                    class="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer flex items-center gap-1 border border-emerald-500/20 shadow-sm"
                    aiTooltip="Abrir análisis en Lienzo de Razonamiento (Canvas)"
                    tooltipShortcut="⌘L"
                    tooltipPosition="top"
                  >
                    <ai-icon name="sparkles" [size]="14" />
                    <span class="text-[11px] font-medium hidden sm:inline">Lienzo Canvas</span>
                  </button>

                  <button
                    type="button"
                    (click)="onRegenerate()"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1"
                    aiTooltip="Regenerar respuesta con nuevas fuentes"
                    tooltipShortcut="⌘R"
                    tooltipPosition="top"
                  >
                    <ai-icon name="refresh" [size]="14" />
                    <span class="text-[11px] hidden sm:inline">Regenerar</span>
                  </button>
                </div>
              </div>
            }
          </ai-card>
        </div>
      </div>
    }
  `
})
export class MessageBubbleComponent {
  readonly message = input.required<ChatMessage>();

  protected readonly chatService = inject(ChatService);
  private readonly chatState = inject(ChatStateService);
  private readonly ragService = inject(RagCitationService);
  private readonly canvasService = inject(ReasoningCanvasService);
  private readonly feedbackService = inject(FeedbackService);

  protected readonly user = this.chatState.userProfile;
  protected readonly showSources = signal<boolean>(true);
  protected readonly copied = signal<boolean>(false);
  protected readonly isHalted = computed(() => this.message().content.includes('(Generación detenida'));

  protected readonly formattedSections = computed(() => {
    const raw = this.message().content;
    const lines = raw.split('\n');
    const sections: Array<{ id: number; type: 'heading' | 'list' | 'text'; text?: string; items?: string[] }> = [];
    let currentList: string[] = [];
    let idCounter = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
        if (currentList.length > 0) {
          sections.push({ id: idCounter++, type: 'list', items: [...currentList] });
          currentList = [];
        }
        sections.push({ id: idCounter++, type: 'heading', text: trimmed.replace(/^#+\s*/, '') });
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        const itemText = trimmed.replace(/^(\*|-|\d+\.)\s*/, '');
        // simple bold formatting
        const formattedItem = itemText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        currentList.push(formattedItem);
      } else if (trimmed.length > 0) {
        if (currentList.length > 0) {
          sections.push({ id: idCounter++, type: 'list', items: [...currentList] });
          currentList = [];
        }
        const formattedText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        sections.push({ id: idCounter++, type: 'text', text: formattedText });
      }
    }

    if (currentList.length > 0) {
      sections.push({ id: idCounter++, type: 'list', items: [...currentList] });
    }

    return sections;
  });

  protected toggleSources(): void {
    this.showSources.update((v) => !v);
  }

  protected copyToClipboard(): void {
    navigator.clipboard?.writeText(this.message().content);
    this.copied.set(true);
    setTimeout(() => {
      this.copied.set(false);
    }, 2000);
  }

  protected onFeedback(type: 'up' | 'down'): void {
    if (type === 'down') {
      this.feedbackService.open(this.message().id, this.message().content, 'down');
    } else {
      this.chatService.provideFeedback(this.message().id, type);
    }
  }

  protected onRegenerate(): void {
    this.chatService.regenerate(this.message().id);
  }

  protected onOpenSource(source: MessageSource): void {
    this.ragService.open(source);
  }

  protected onOpenCanvas(): void {
    this.canvasService.open();
  }
}
