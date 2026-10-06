import {
  Component,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { ReasoningCanvasService } from '../../../core/services/reasoning-canvas.service';
import { AiButtonComponent } from '../ai-button';
import { AiIconComponent } from '../ai-icon';
import { AiTooltipDirective } from '../ai-tooltip';

@Component({
  selector: 'ai-reasoning-canvas',
  standalone: true,
  imports: [
    AiButtonComponent,
    AiIconComponent,
    AiTooltipDirective
  ],
  template: `
    @if (canvasService.isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[75] transition-opacity"
        (click)="canvasService.close()"
      ></div>

      <!-- Sliding Reasoning Canvas Panel -->
      <aside
        class="fixed top-0 right-0 h-screen w-full lg:w-[62%] max-w-5xl bg-white border-l border-[#dbe6f0] shadow-2xl z-[80] flex flex-col text-slate-800 select-none animate-cascade-in"
        (click)="$event.stopPropagation()"
      >
        <!-- Canvas Top Toolbar -->
        <div class="px-6 py-3.5 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
          <!-- Left: Title & Mode Indicator -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-[#003781] border border-blue-200 flex items-center justify-center flex-shrink-0">
              <ai-icon name="sparkles" [size]="18" />
            </div>

            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-[#003781]">
                  Reasoning Canvas
                </span>
                <span class="text-slate-400">•</span>
                <span class="text-xs text-slate-500 truncate">
                  {{ canvasService.documentType() }}
                </span>
              </div>
              <h2 class="text-sm sm:text-base font-bold text-[#002147] truncate" [title]="canvasService.title()">
                {{ canvasService.title() }}
              </h2>
            </div>
          </div>

          <!-- Right: Tab Switcher, Actions, Close -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Mode Switcher Tabs -->
            <div class="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                (click)="canvasService.setActiveTab('preview')"
                class="px-2.5 py-1 rounded-md transition-all cursor-pointer font-semibold"
                [class.bg-[#003781]]="canvasService.activeTab() === 'preview'"
                [class.text-white]="canvasService.activeTab() === 'preview'"
                [class.text-slate-600]="canvasService.activeTab() !== 'preview'"
              >
                Vista Previa
              </button>

              <button
                type="button"
                (click)="canvasService.setActiveTab('source')"
                class="px-2.5 py-1 rounded-md transition-all cursor-pointer font-semibold"
                [class.bg-[#003781]]="canvasService.activeTab() === 'source'"
                [class.text-white]="canvasService.activeTab() === 'source'"
                [class.text-slate-600]="canvasService.activeTab() !== 'source'"
              >
                Markdown / Raw
              </button>
            </div>

            <!-- Copy Button -->
            <button
              type="button"
              (click)="copyContent()"
              class="p-2 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer"
              [aiTooltip]="copied() ? '¡Copiado!' : 'Copiar lienzo'"
              tooltipPosition="bottom"
            >
              <ai-icon [name]="copied() ? 'check' : 'copy'" [size]="16" [class.text-[#059669]]="copied()" />
            </button>

            <!-- Export Button -->
            <button
              type="button"
              (click)="exportDocument()"
              class="p-2 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer"
              aiTooltip="Descargar documento (.md / .pdf)"
              tooltipPosition="bottom"
            >
              <ai-icon name="upload" [size]="16" class="rotate-180" />
            </button>

            <!-- Close Button -->
            <button
              type="button"
              (click)="canvasService.close()"
              class="p-2 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer ml-1"
              aiTooltip="Cerrar lienzo (Esc)"
              tooltipPosition="bottom"
            >
              <ai-icon name="x" [size]="18" />
            </button>
          </div>
        </div>

        <!-- Chain-of-Thought (CoT) Reasoning Accordion Banner -->
        <div class="border-b border-[#dbe6f0] bg-slate-50/70">
          <button
            type="button"
            (click)="toggleSteps()"
            class="w-full px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 hover:text-[#002147] transition-colors cursor-pointer select-none"
          >
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#00a887] animate-pulse"></span>
              <span class="font-bold text-[#003781]">Traza de Razonamiento del Copilot (3 pasos completados)</span>
            </div>
            <div class="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span>{{ showSteps() ? 'Ocultar pasos' : 'Ver deducción' }}</span>
              <ai-icon name="chevron-down" [size]="12" [class.rotate-180]="showSteps()" class="transition-transform duration-200" />
            </div>
          </button>

          @if (showSteps()) {
            <div class="px-6 pb-3 pt-1 flex flex-col gap-2 animate-cascade-in">
              @for (step of canvasService.reasoningSteps(); track step.id) {
                <div class="flex items-start gap-2.5 text-xs text-slate-700">
                  <div class="w-4 h-4 rounded-full bg-[#e6f9f3] text-[#059669] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ai-icon name="check" [size]="10" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-[#002147]">{{ step.title }}</span>
                      <span class="text-[10px] font-mono text-slate-500">({{ step.duration }})</span>
                    </div>
                    <p class="text-[11px] text-slate-500 mt-0.5">{{ step.details }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Main Canvas Body -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#f8fafc]">
          @if (canvasService.activeTab() === 'preview') {
            <!-- Executive Document Preview (Paper Style Card) -->
            <div class="max-w-3xl mx-auto flex flex-col gap-6 text-slate-700 font-sans leading-relaxed bg-white border border-[#dbe6f0] rounded-2xl shadow-xs p-6 sm:p-8">
              <!-- Document Title & Header Card -->
              <div class="border-b border-slate-200 pb-4 flex flex-col gap-2">
                <div class="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>EXPEDIENTE CO-2026-Q3</span>
                  <span class="text-[#059669] font-bold">VALIDADO POR COPILOT</span>
                </div>
                <h1 class="text-2xl font-black tracking-tight text-[#002147]">
                  Matriz Comparativa de Riesgos Contractuales & SLA 2026
                </h1>
                <p class="text-xs text-slate-500">
                  Generado automáticamente con base en <strong class="text-slate-700">Contrato_Marco_Operaciones.pdf</strong> y <strong class="text-slate-700">Anexo_SLA_v2.docx</strong>.
                </p>
              </div>

              <!-- Section 1: Executive Summary -->
              <div class="flex flex-col gap-2">
                <h3 class="text-sm font-bold uppercase tracking-wider text-[#003781] flex items-center gap-1.5">
                  <span>1. Diagnóstico Ejecutivo</span>
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  El presente informe sintetiza las condiciones de penalización e indemnización aplicables a los proveedores de infraestructura tecnológica para 2026. Se detecta una alta exposición operativa en caso de caídas de servicio prolongadas que superen las 4 horas en incidentes de Severidad 1.
                </p>
              </div>

              <!-- Section 2: Interactive Comparative Table -->
              <div class="flex flex-col gap-2.5">
                <h3 class="text-sm font-bold uppercase tracking-wider text-[#003781]">
                  2. Tabla Comparativa de Proveedores & SLAs
                </h3>

                <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="bg-slate-50 text-[#002147] font-semibold text-[11px] border-b border-slate-200">
                        <th class="py-2.5 px-3">Proveedor</th>
                        <th class="py-2.5 px-3">SLA Garantizado</th>
                        <th class="py-2.5 px-3">Penalización Indisponibilidad</th>
                        <th class="py-2.5 px-3">Tiempo Respuesta S1</th>
                        <th class="py-2.5 px-3">Nivel Riesgo</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                      <tr class="hover:bg-slate-50/70 transition-colors">
                        <td class="py-3 px-3 font-semibold text-[#002147]">Proveedor Principal (A)</td>
                        <td class="py-3 px-3 font-mono text-[#003781] font-bold">99.9%</td>
                        <td class="py-3 px-3">10% canon / 0.1% caída</td>
                        <td class="py-3 px-3 font-mono">15 min</td>
                        <td class="py-3 px-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e6f9f3] text-[#059669] border border-[#a7f3d0]">
                            Bajo
                          </span>
                        </td>
                      </tr>
                      <tr class="hover:bg-slate-50/70 transition-colors">
                        <td class="py-3 px-3 font-semibold text-[#002147]">Proveedor Secundario (B)</td>
                        <td class="py-3 px-3 font-mono text-amber-600 font-bold">99.5%</td>
                        <td class="py-3 px-3">5% canon / 0.2% caída</td>
                        <td class="py-3 px-3 font-mono">30 min</td>
                        <td class="py-3 px-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Medio
                          </span>
                        </td>
                      </tr>
                      <tr class="hover:bg-slate-50/70 transition-colors">
                        <td class="py-3 px-3 font-semibold text-[#002147]">Servicios Cloud (C)</td>
                        <td class="py-3 px-3 font-mono text-[#003781] font-bold">99.95%</td>
                        <td class="py-3 px-3">Crédito de servicio progresivo</td>
                        <td class="py-3 px-3 font-mono">60 min</td>
                        <td class="py-3 px-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#003781] border border-blue-200">
                            Moderado
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Section 3: Recommendations -->
              <div class="flex flex-col gap-2">
                <h3 class="text-sm font-bold uppercase tracking-wider text-[#003781]">
                  3. Acciones de Mitigación Sugeridas
                </h3>
                <ul class="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                  <li>
                    <strong class="text-[#002147]">Auditoría Técnica Previa a Renovación:</strong> Exigir certificados de disponibilidad auditados por un tercero antes del 15 de Noviembre.
                  </li>
                  <li>
                    <strong class="text-[#002147]">Revisión de Cláusula de Rescisión:</strong> Homogeneizar las causales de resolución anticipada para permitir salida sin penalización ante 2 meses consecutivos de incumplimiento.
                  </li>
                  <li>
                    <strong class="text-[#002147]">Póliza de SLA & Continuidad Cloud:</strong> Comprobar cobertura de respaldo y failover multirregión ante caídas críticas o interrupción operacional.
                  </li>
                </ul>
              </div>
            </div>
          } @else {
            <!-- Raw Markdown / Code Editor Mode -->
            <div class="h-full max-w-3xl mx-auto">
              <textarea
                [value]="canvasService.canvasContent()"
                (input)="onContentChange($event)"
                class="w-full h-[600px] font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:border-[#003781] resize-none leading-relaxed shadow-xs"
              ></textarea>
            </div>
          }
        </div>

        <!-- Canvas Refinement Bottom Bar -->
        <div class="px-6 py-3 border-t border-[#dbe6f0] bg-white flex flex-col gap-2.5">
          <!-- Refinement Pills -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Refinamiento Rápido:
            </span>
            <button
              type="button"
              (click)="applySuggestion('Hacer más conciso el resumen ejecutivo')"
              class="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#003781] border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer"
            >
              ⚡ Resumen conciso
            </button>
            <button
              type="button"
              (click)="applySuggestion('Añadir cláusula de arbitraje en Cámara de Comercio')"
              class="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#003781] border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer"
            >
              ⚖️ Añadir arbitraje
            </button>
            <button
              type="button"
              (click)="applySuggestion('Incluir penalización adicional por pérdida de datos')"
              class="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#003781] border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer"
            >
              🛡️ Fuga de datos
            </button>
          </div>

          <!-- Prompt Input on Canvas -->
          <div class="flex items-center gap-2">
            <input
              type="text"
              [value]="refineInput()"
              (input)="onRefineInput($event)"
              (keydown.enter)="onRefineSubmit()"
              placeholder="Solicita modificaciones al Copilot en este lienzo (ej. 'Añade una columna de costes')..."
              class="flex-1 bg-slate-50 border border-slate-200 text-xs text-[#002147] placeholder:text-slate-400 px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#003781] focus:bg-white transition-colors"
            />
            <ai-button
              variant="primary"
              size="sm"
              [disabled]="!refineInput().trim()"
              (click)="onRefineSubmit()"
            >
              <ai-icon name="sparkles" [size]="14" />
              <span>Aplicar</span>
            </ai-button>
          </div>
        </div>
      </aside>
    }
  `
})
export class AiReasoningCanvasComponent {
  protected readonly canvasService = inject(ReasoningCanvasService);
  protected readonly showSteps = signal<boolean>(false);
  protected readonly copied = signal<boolean>(false);
  protected readonly refineInput = signal<string>('');

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.canvasService.isOpen()) {
      this.canvasService.close();
    }
  }

  protected toggleSteps(): void {
    this.showSteps.update((v) => !v);
  }

  protected copyContent(): void {
    navigator.clipboard?.writeText(this.canvasService.canvasContent());
    this.copied.set(true);
    setTimeout(() => {
      this.copied.set(false);
    }, 2000);
  }

  protected exportDocument(): void {
    alert('Exportando documento del lienzo en formato Markdown / PDF (Mock)...');
  }

  protected onContentChange(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.canvasService.canvasContent.set(text);
  }

  protected onRefineInput(event: Event): void {
    this.refineInput.set((event.target as HTMLInputElement).value);
  }

  protected onRefineSubmit(): void {
    const text = this.refineInput().trim();
    if (!text) return;
    this.canvasService.applyEdit(text);
    this.refineInput.set('');
  }

  protected applySuggestion(text: string): void {
    this.canvasService.applyEdit(text);
  }
}
