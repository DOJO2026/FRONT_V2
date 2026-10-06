import {
  Component,
  HostListener,
  inject
} from '@angular/core';
import { AVAILABLE_MODELS, SettingsService } from '../../../core/services/settings.service';
import { AiAvatarComponent } from '../ai-avatar';
import { AiButtonComponent } from '../ai-button';
import { AiIconComponent } from '../ai-icon';
import { AiTooltipDirective } from '../ai-tooltip';

@Component({
  selector: 'ai-settings-modal',
  standalone: true,
  imports: [
    AiAvatarComponent,
    AiButtonComponent,
    AiIconComponent,
    AiTooltipDirective
  ],
  template: `
    @if (settingsService.isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 sm:p-6 select-none animate-cascade-in"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Dialog Container -->
        <div
          class="w-full max-w-2xl max-h-[88vh] bg-white border border-[#dbe6f0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Header Bar -->
          <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
                <ai-icon name="settings" [size]="20" />
              </div>

              <div>
                <h3 class="text-base font-bold text-[#002147] tracking-tight">
                  Configuración & Preferencias
                </h3>
                <p class="text-xs text-slate-500">
                  Modelos generativos, parámetros de inferencia, umbrales RAG y cuotas.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="settingsService.close()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer"
              aiTooltip="Cerrar modal (Esc)"
              tooltipPosition="left"
            >
              <ai-icon name="x" [size]="18" />
            </button>
          </div>

          <!-- Navigation Tabs -->
          <div class="px-6 pt-3 border-b border-[#dbe6f0] bg-slate-50/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              (click)="settingsService.setActiveTab('model')"
              [class]="settingsService.activeTab() === 'model' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <ai-icon name="sparkles" [size]="14" />
              <span>Modelo & Inferencia</span>
            </button>

            <button
              type="button"
              (click)="settingsService.setActiveTab('rag')"
              [class]="settingsService.activeTab() === 'rag' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <ai-icon name="document" [size]="14" />
              <span>Búsqueda RAG</span>
            </button>

            <button
              type="button"
              (click)="settingsService.setActiveTab('profile')"
              [class]="settingsService.activeTab() === 'profile' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <ai-icon name="user" [size]="14" />
              <span>Perfil & Cuotas</span>
            </button>

            <button
              type="button"
              (click)="settingsService.setActiveTab('security')"
              [class]="settingsService.activeTab() === 'security' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <ai-icon name="check" [size]="14" />
              <span>Seguridad & Privacidad</span>
            </button>
          </div>

          <!-- Body Content Area (Scrollable) -->
          <div class="p-6 overflow-y-auto max-h-[62vh] flex flex-col gap-6 no-scrollbar bg-white">
            <!-- TAB 1: MODEL & INFERENCE -->
            @if (settingsService.activeTab() === 'model') {
              <div class="flex flex-col gap-5">
                <!-- Model Selection Cards -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Modelo LLM Fundacional
                  </label>

                  <div class="flex flex-col gap-2.5">
                    @for (model of availableModels; track model.id) {
                      <div
                        (click)="settingsService.setModel(model.id)"
                        [class]="settingsService.selectedModel() === model.id ? 'border-[#003781] bg-blue-50/50 shadow-sm ring-1 ring-[#003781]/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'"
                        class="p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5"
                      >
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-[#002147]">{{ model.name }}</span>
                            <span [class]="model.badgeColor" class="px-2 py-0.5 rounded text-[10px] font-semibold border">
                              {{ model.badge }}
                            </span>
                          </div>

                          <span class="text-xs text-slate-400 font-mono">
                            {{ model.contextWindow }}
                          </span>
                        </div>

                        <p class="text-xs text-slate-500">
                          {{ model.tagline }}
                        </p>
                      </div>
                    }
                  </div>
                </div>

                <!-- Temperature Slider -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-semibold text-[#002147]">Temperatura de Inferencia</h4>
                      <p class="text-[11px] text-slate-500">
                        Valores bajos (0.1 - 0.3) garantizan respuestas determinísticas y estrictas para Legal.
                      </p>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-blue-100 text-[#003781] border border-blue-200 font-mono text-xs font-bold">
                      {{ settingsService.temperature() }}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    [value]="settingsService.temperature()"
                    (input)="onTempChange($event)"
                    class="w-full accent-[#003781] cursor-pointer"
                  />

                  <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.0 (Preciso / Auditoría)</span>
                    <span>0.5 (Equilibrado)</span>
                    <span>1.0 (Creativo)</span>
                  </div>
                </div>

                <!-- Reasoning Depth (CoT) -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div>
                    <h4 class="text-xs font-semibold text-[#002147]">Profundidad de Razonamiento (Chain of Thought)</h4>
                    <p class="text-[11px] text-slate-500">
                      Controla el número de pasos intermedios de verificación lógica antes de emitir conclusiones.
                    </p>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      (click)="settingsService.setReasoningDepth('disabled')"
                      [class]="settingsService.reasoningDepth() === 'disabled' ? 'bg-blue-100 border-[#003781] text-[#003781] font-bold' : 'bg-white border-slate-200 text-slate-600 hover:text-[#002147] hover:bg-slate-50'"
                      class="p-2 rounded-lg border text-xs text-center transition-colors cursor-pointer"
                    >
                      Rápido (Directo)
                    </button>

                    <button
                      type="button"
                      (click)="settingsService.setReasoningDepth('standard')"
                      [class]="settingsService.reasoningDepth() === 'standard' ? 'bg-blue-100 border-[#003781] text-[#003781] font-bold' : 'bg-white border-slate-200 text-slate-600 hover:text-[#002147] hover:bg-slate-50'"
                      class="p-2 rounded-lg border text-xs text-center transition-colors cursor-pointer"
                    >
                      Estándar (Recomendado)
                    </button>

                    <button
                      type="button"
                      (click)="settingsService.setReasoningDepth('deep')"
                      [class]="settingsService.reasoningDepth() === 'deep' ? 'bg-blue-100 border-[#003781] text-[#003781] font-bold' : 'bg-white border-slate-200 text-slate-600 hover:text-[#002147] hover:bg-slate-50'"
                      class="p-2 rounded-lg border text-xs text-center transition-colors cursor-pointer"
                    >
                      Exhaustivo (Deep CoT)
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 2: RAG & SEARCH -->
            @if (settingsService.activeTab() === 'rag') {
              <div class="flex flex-col gap-5">
                <!-- Embedding Model Info -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 class="text-xs font-semibold text-[#002147]">Modelo de Embedding Activo</h4>
                    <p class="text-[11px] text-slate-500">
                      Espacio vectorial denso de 768 dimensiones optimizado para lenguaje normativo y contractual.
                    </p>
                  </div>
                  <span class="px-2.5 py-1 rounded bg-white border border-slate-200 text-[#003781] font-mono text-xs font-bold shadow-sm">
                    {{ settingsService.embeddingModel() }}
                  </span>
                </div>

                <!-- Similarity Threshold Slider -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-semibold text-[#002147]">Umbral de Similitud Coseno Mínima</h4>
                      <p class="text-[11px] text-slate-500">
                        Fragmentos con puntuación menor son descartados para evitar alucinaciones.
                      </p>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-blue-100 text-[#003781] border border-blue-200 font-mono text-xs font-bold">
                      {{ settingsService.similarityThreshold() }}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.02"
                    [value]="settingsService.similarityThreshold()"
                    (input)="onThresholdChange($event)"
                    class="w-full accent-[#003781] cursor-pointer"
                  />

                  <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.50 (Permisivo)</span>
                    <span>0.82 (Recomendado)</span>
                    <span>0.95 (Estricto)</span>
                  </div>
                </div>

                <!-- Top-K Chunks Selection -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 class="text-xs font-semibold text-[#002147]">Fragmentos Recuperados (Top-K Chunks)</h4>
                    <p class="text-[11px] text-slate-500">
                      Cantidad de fragmentos inyectados en la ventana de contexto del LLM por cada consulta.
                    </p>
                  </div>

                  <div class="flex items-center gap-1.5">
                    @for (k of [3, 5, 8, 12]; track k) {
                      <button
                        type="button"
                        (click)="settingsService.setTopK(k)"
                        [class]="settingsService.topKChunks() === k ? 'bg-blue-100 text-[#003781] border-[#003781] font-bold shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:text-[#002147]'"
                        class="w-8 h-8 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-center font-mono"
                      >
                        {{ k }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Hybrid Search Toggle -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 class="text-xs font-semibold text-[#002147]">Búsqueda Híbrida (Dense Vector + BM25 Lexical)</h4>
                    <p class="text-[11px] text-slate-500">
                      Combina similitud semántica con coincidencia exacta de referencias legales y códigos de artículo.
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="settingsService.toggleHybridSearch()"
                    [class]="settingsService.hybridSearch() ? 'bg-[#003781]' : 'bg-slate-200'"
                    class="w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
                  >
                    <span
                      [class]="settingsService.hybridSearch() ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'"
                      class="inline-block w-4 h-4 rounded-full transition-transform shadow-sm"
                    ></span>
                  </button>
                </div>
              </div>
            }

            <!-- TAB 3: USER PROFILE & QUOTAS -->
            @if (settingsService.activeTab() === 'profile') {
              <div class="flex flex-col gap-5">
                <!-- User Profile Header -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                  <ai-avatar
                    role="user"
                    [name]="settingsService.userName()"
                    size="lg"
                    status="online"
                  />

                  <div class="flex flex-col min-w-0">
                    <h4 class="text-base font-bold text-[#002147] truncate">
                      {{ settingsService.userName() }}
                    </h4>
                    <p class="text-xs text-[#003781] font-bold">
                      {{ settingsService.userRole() }}
                    </p>
                    <p class="text-[11px] text-slate-500">
                      {{ settingsService.userDepartment() }} • diego.bueno&#64;dojo.corp
                    </p>
                  </div>
                </div>

                <!-- Monthly Quota Card -->
                <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Consumo Mensual de Tokens (Agosto - Septiembre 2026)
                      </h4>
                      <p class="text-sm font-mono text-[#002147] font-bold mt-1">
                        {{ settingsService.tokensUsed().toLocaleString() }} / {{ settingsService.tokensQuota().toLocaleString() }} tokens
                        <span class="text-[#003781] text-xs font-semibold">({{ settingsService.quotaPercent() }}%)</span>
                      </p>
                    </div>

                    <span class="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-[#003781] border border-blue-200">
                      Plan Enterprise
                    </span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-[#003781] to-[#0066cc] transition-all duration-500"
                      [style.width.%]="settingsService.quotaPercent()"
                    ></div>
                  </div>

                  <!-- Quota Action -->
                  <div class="flex items-center justify-between pt-1">
                    <span class="text-xs text-slate-500">
                      Tu cuota se renueva el primer día hábil del mes.
                    </span>

                    <ai-button
                      variant="secondary"
                      size="sm"
                      (click)="settingsService.requestQuotaExpansion()"
                    >
                      <ai-icon name="plus" [size]="14" />
                      <span>Solicitar Ampliación (+50K)</span>
                    </ai-button>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 4: SECURITY & PRIVACY -->
            @if (settingsService.activeTab() === 'security') {
              <div class="flex flex-col gap-5">
                <!-- Zero Data Retention Policy -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 class="text-xs font-semibold text-[#002147]">Política Estricta Zero-Data Retention</h4>
                    <p class="text-[11px] text-slate-500">
                      Los prompts y fragmentos vectorizados no se persisten en proveedores externos ni se utilizan para entrenamiento.
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="settingsService.toggleZeroDataRetention()"
                    [class]="settingsService.zeroDataRetention() ? 'bg-[#003781]' : 'bg-slate-200'"
                    class="w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
                  >
                    <span
                      [class]="settingsService.zeroDataRetention() ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'"
                      class="inline-block w-4 h-4 rounded-full transition-transform shadow-sm"
                    ></span>
                  </button>
                </div>

                <!-- Compliance Badges -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1">
                    <ai-icon name="check" [size]="16" class="text-emerald-600" />
                    <span class="text-xs font-bold text-[#002147]">ISO 27001</span>
                    <span class="text-[10px] text-slate-400">Certificado</span>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1">
                    <ai-icon name="check" [size]="16" class="text-emerald-600" />
                    <span class="text-xs font-bold text-[#002147]">SOC2 Tipo II</span>
                    <span class="text-[10px] text-slate-400">Auditoría 2026</span>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1">
                    <ai-icon name="check" [size]="16" class="text-emerald-600" />
                    <span class="text-xs font-bold text-[#002147]">GDPR & LOPD</span>
                    <span class="text-[10px] text-slate-400">Conforme UE</span>
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-1">
                    <ai-icon name="check" [size]="16" class="text-emerald-600" />
                    <span class="text-xs font-bold text-[#002147]">AES-256</span>
                    <span class="text-[10px] text-slate-400">Cifrado Reposo</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between text-xs">
            <button
              type="button"
              (click)="settingsService.resetDefaults()"
              class="text-slate-500 hover:text-[#002147] transition-colors cursor-pointer"
            >
              Restablecer valores predeterminados
            </button>

            <ai-button variant="primary" size="sm" (click)="settingsService.close()">
              <span>Guardar & Aplicar</span>
            </ai-button>
          </div>
        </div>
      </div>
    }
  `
})
export class AiSettingsModalComponent {
  protected readonly settingsService = inject(SettingsService);
  protected readonly availableModels = AVAILABLE_MODELS;

  @HostListener('window:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.settingsService.isOpen()) {
      this.settingsService.close();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    this.settingsService.close();
  }

  protected onTempChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.settingsService.setTemperature(val);
  }

  protected onThresholdChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.settingsService.setSimilarityThreshold(val);
  }
}
