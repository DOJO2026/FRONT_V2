import { Component, ElementRef, HostListener, OnDestroy, effect, inject, signal, viewChild } from '@angular/core';
import { AttachmentUploaderService } from '../../../../core/services/attachment-uploader.service';
import { PromptTemplatesService } from '../../../../core/services/prompt-templates.service';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-prompt-bar',
  standalone: true,
  imports: [AiCardComponent, AiButtonComponent, AiChipComponent, AiIconComponent, AiTooltipDirective],
  template: `
    <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-4 pt-2 select-none">
      <!-- Floating Stop Generation Pill -->
      @if (chatService.isGenerating()) {
        <div class="flex justify-center mb-2 animate-cascade-in">
          <button
            type="button"
            (click)="onStopGeneration()"
            class="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-red-500/60 hover:bg-red-500/10 text-slate-300 hover:text-red-400 text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-md transition-all cursor-pointer group"
            aiTooltip="Detener la transmisión de la respuesta actual"
            tooltipPosition="top"
          >
            <div class="w-2.5 h-2.5 rounded-sm bg-red-400 group-hover:scale-110 transition-transform"></div>
            <span>Detener generación</span>
            <kbd class="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono">Esc</kbd>
          </button>
        </div>
      }

      <ai-card
        variant="elevated"
        padding="sm"
        class="bg-[var(--color-surface)] border-slate-700/80 shadow-2xl shadow-black/80 rounded-2xl flex flex-col gap-2"
      >
        <!-- Attached Documents Context Pills -->
        @if (chatService.attachedDocs().length > 0) {
          <div class="flex flex-wrap items-center gap-2 px-2 pt-1">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1">
              <ai-icon name="document" [size]="12" />
              <span>Fuentes activas:</span>
            </span>

            @for (doc of chatService.attachedDocs(); track doc) {
              <ai-chip
                variant="default"
                size="sm"
                icon="document"
                [removable]="true"
                (removed)="removeDoc(doc)"
              >
                {{ doc }}
              </ai-chip>
            }

            <button
              type="button"
              (click)="openUploader('repository')"
              class="text-[11px] text-[var(--color-primary)] hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
              title="Añadir fuente documental"
            >
              <ai-icon name="plus" [size]="12" />
              <span>Añadir fuente</span>
            </button>
          </div>
        }

        <!-- Voice Dictation Live Equalizer Waveform -->
        @if (isDictating()) {
          <div class="mx-2 mb-1 px-3 py-1.5 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center justify-between text-xs text-red-300 animate-cascade-in">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              <span class="font-semibold text-white">Escuchando dictado de voz...</span>
              <span class="font-mono text-[10px] text-slate-400">00:{{ dictationSeconds() < 10 ? '0' : '' }}{{ dictationSeconds() }}</span>
            </div>
            <div class="flex items-center gap-1 h-3.5 px-2">
              <span class="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:0ms] h-full"></span>
              <span class="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:150ms] h-2"></span>
              <span class="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:300ms] h-3.5"></span>
              <span class="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:450ms] h-2"></span>
              <span class="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:200ms] h-full"></span>
            </div>
            <button
              type="button"
              (click)="stopVoiceDictation()"
              class="text-[11px] text-red-400 hover:text-red-300 hover:underline cursor-pointer font-medium"
            >
              Listo
            </button>
          </div>
        }

        <!-- Input Area & Action Controls -->
        <div class="flex items-end gap-2 px-1">
          <!-- Attach File Button -->
          <button
            type="button"
            (click)="openUploader('upload')"
            class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0 mb-0.5"
            aiTooltip="Subir archivo o adjuntar documento RAG"
            tooltipPosition="top"
          >
            <ai-icon name="paperclip" [size]="20" />
          </button>

          <!-- Prompt Templates Library Button -->
          <button
            type="button"
            (click)="openTemplates()"
            class="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer flex-shrink-0 mb-0.5"
            aiTooltip="Plantillas corporativas & Prompts guardados"
            tooltipPosition="top"
          >
            <ai-icon name="sparkles" [size]="18" />
          </button>

          <!-- Voice Dictation / Microphone Button -->
          <button
            type="button"
            (click)="toggleVoiceDictation()"
            [class]="isDictating() ? 'text-red-400 bg-red-500/15 border-red-500/40 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'"
            class="p-2 rounded-xl transition-all cursor-pointer flex-shrink-0 mb-0.5 border border-transparent"
            [aiTooltip]="isDictating() ? 'Detener dictado por voz' : 'Iniciar dictado por voz'"
            tooltipPosition="top"
          >
            <ai-icon name="mic" [size]="18" />
          </button>

          <!-- Textarea Input (Auto-submit on Enter, Shift+Enter for newline) -->
          <div class="flex-1 min-w-0 py-1">
            <textarea
              #promptInput
              rows="1"
              [value]="promptText()"
              (input)="onTextInput($event)"
              (keydown.enter)="onKeyDownEnter($event)"
              placeholder="Consulta a DOJO AI sobre infraestructura, microservicios, Kubernetes o incidencias..."
              class="w-full bg-transparent border-0 text-sm text-white placeholder:text-slate-500 focus:outline-none resize-none max-h-36 leading-relaxed"
            ></textarea>
          </div>

          <!-- Character / Token Count Indicator -->
          <div class="hidden sm:flex items-center text-[10px] text-slate-500 font-mono pr-1 mb-2">
            {{ promptText().length }} chars
          </div>

          <!-- Submit / Stop Button -->
          <div class="flex-shrink-0 mb-0.5">
            @if (chatService.isGenerating()) {
              <ai-button
                variant="danger"
                size="md"
                (click)="onStopGeneration()"
                aiTooltip="Detener generación (Esc)"
                tooltipPosition="top"
                class="shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                <ai-icon name="stop" [size]="14" />
                <span class="hidden sm:inline">Detener</span>
              </ai-button>
            } @else {
              <ai-button
                variant="primary"
                size="md"
                [disabled]="!promptText().trim()"
                (click)="onSend()"
                class="shadow-[0_0_15px_rgba(16,163,127,0.3)]"
              >
                <ai-icon name="send" [size]="16" />
                <span class="hidden sm:inline">Enviar</span>
              </ai-button>
            }
          </div>
        </div>
      </ai-card>

      <!-- Legal / AI Corporate Disclaimer -->
      <p class="text-center text-[11px] text-[var(--color-text-muted)] mt-2">
        DOJO 2.0 Copilot puede cometer errores. Verifica la información crítica en las fuentes oficiales citadas.
      </p>
    </div>
  `
})
export class PromptBarComponent implements OnDestroy {
  protected readonly chatService = inject(ChatService);
  private readonly uploaderService = inject(AttachmentUploaderService);
  private readonly templatesService = inject(PromptTemplatesService);

  protected readonly promptText = signal<string>('');
  protected readonly promptInputRef = viewChild<ElementRef<HTMLTextAreaElement>>('promptInput');

  // Voice Dictation state
  protected readonly isDictating = signal<boolean>(false);
  protected readonly dictationSeconds = signal<number>(0);
  private dictationTimer: ReturnType<typeof setInterval> | null = null;
  private speechSimulationInterval: ReturnType<typeof setInterval> | null = null;

  @HostListener('window:keydown', ['$event'])
  onWindowKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.chatService.isGenerating()) {
      this.onStopGeneration();
    }
  }

  constructor() {
    effect(() => {
      const promptToFill = this.templatesService.selectedPromptToFill();
      if (promptToFill) {
        this.promptText.set(promptToFill);
        this.templatesService.clearPromptToFill();
        setTimeout(() => {
          this.autoResize();
          this.promptInputRef()?.nativeElement.focus();
        }, 50);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopVoiceDictation();
  }

  protected onTextInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.promptText.set(val);
    this.autoResize();
  }

  protected onKeyDownEnter(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.onSend();
    }
  }

  protected onSend(): void {
    if (this.isDictating()) {
      this.stopVoiceDictation();
    }

    const text = this.promptText().trim();
    if (!text || this.chatService.isGenerating()) return;

    this.chatService.sendMessage(text);
    this.templatesService.recordPromptHistory(text);
    this.promptText.set('');

    const el = this.promptInputRef()?.nativeElement;
    if (el) {
      el.style.height = 'auto';
    }
  }

  protected onStopGeneration(): void {
    this.chatService.stopGeneration();
  }

  protected removeDoc(doc: string): void {
    this.chatService.removeAttachedDoc(doc);
  }

  protected openUploader(tab: 'upload' | 'repository' = 'upload'): void {
    this.uploaderService.open(tab);
  }

  protected openTemplates(): void {
    this.templatesService.open('templates');
  }

  protected toggleVoiceDictation(): void {
    if (this.isDictating()) {
      this.stopVoiceDictation();
    } else {
      this.startVoiceDictation();
    }
  }

  protected startVoiceDictation(): void {
    this.isDictating.set(true);
    this.dictationSeconds.set(0);

    const sampleQueries = [
      '¿Cuáles son los parámetros de autoescalado y throttling en el API Gateway para mitigar picos de latencia P99?',
      'Compara las directrices de ciberseguridad y encriptación mTLS entre las políticas de DOJO 2.0 y la normativa NIST.',
      'Resume las métricas de consumo de CPU, memoria y réplicas del cluster Kubernetes en el último incidente.'
    ];
    const targetQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    const words = targetQuery.split(' ');
    let wordIndex = 0;

    this.dictationTimer = setInterval(() => {
      this.dictationSeconds.update(s => s + 1);
    }, 1000);

    const initialText = this.promptText().trim();
    let currentText = initialText ? initialText + ' ' : '';

    this.speechSimulationInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 && !initialText ? '' : ' ') + words[wordIndex];
        this.promptText.set(currentText.trimStart());
        this.autoResize();
        wordIndex++;
      } else {
        this.stopVoiceDictation();
      }
    }, 320);
  }

  protected stopVoiceDictation(): void {
    if (this.dictationTimer) {
      clearInterval(this.dictationTimer);
      this.dictationTimer = null;
    }
    if (this.speechSimulationInterval) {
      clearInterval(this.speechSimulationInterval);
      this.speechSimulationInterval = null;
    }
    this.isDictating.set(false);
    this.promptInputRef()?.nativeElement.focus();
  }

  private autoResize(): void {
    const el = this.promptInputRef()?.nativeElement;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    }
  }
}
