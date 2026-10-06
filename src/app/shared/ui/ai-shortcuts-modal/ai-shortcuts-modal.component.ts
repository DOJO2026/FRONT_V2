import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { AttachmentUploaderService } from '../../../core/services/attachment-uploader.service';
import { CommandPaletteService } from '../../../core/services/command-palette.service';
import { ExportSessionService } from '../../../core/services/export-session.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { PromptTemplatesService } from '../../../core/services/prompt-templates.service';
import { ReasoningCanvasService } from '../../../core/services/reasoning-canvas.service';
import { SettingsService } from '../../../core/services/settings.service';
import { HelpCenterTab, ShortcutsService } from '../../../core/services/shortcuts.service';
import { ChatService } from '../../../features/chat/services/chat.service';
import { AiButtonComponent } from '../ai-button';
import { AiIconComponent, IconName } from '../ai-icon';

export interface ShortcutItem {
  id: string;
  category: 'Globales' | 'Chat & Copilot' | 'Módulos';
  title: string;
  description: string;
  keys: string[];
  icon: IconName;
  action?: () => void;
}

@Component({
  selector: 'ai-shortcuts-modal',
  standalone: true,
  imports: [AiIconComponent, AiButtonComponent],
  template: `
    @if (shortcutsService.isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 select-none animate-cascade-in"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Card Container -->
        <div
          class="w-full max-w-3xl max-h-[85vh] bg-white border border-[#dbe6f0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#003781] flex items-center justify-center">
                <ai-icon name="help" [size]="20" />
              </div>
              <div>
                <h2 class="text-base font-bold text-[#002147] flex items-center gap-2">
                  <span>Centro de Ayuda & Atajos de Teclado</span>
                  <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                    DOJO 2.0
                  </span>
                </h2>
                <p class="text-xs text-slate-500">
                  Optimiza tu productividad con comandos rápidos, arquitectura RAG y buenas prácticas
                </p>
              </div>
            </div>

            <!-- Close Button -->
            <button
              type="button"
              (click)="shortcutsService.close()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <ai-icon name="x" [size]="20" />
            </button>
          </div>

          <!-- Navigation Tabs -->
          <div class="px-6 border-b border-[#dbe6f0] bg-slate-50/70 flex items-center gap-2">
            <button
              type="button"
              (click)="shortcutsService.setTab('shortcuts')"
              [class]="shortcutsService.activeTab() === 'shortcuts'
                ? 'border-[#003781] text-[#003781] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="px-3 py-3 border-b-2 text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ai-icon name="sparkles" [size]="14" />
              <span>Atajos de Teclado</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px] text-slate-700 font-mono font-semibold">
                {{ allShortcuts.length }}
              </span>
            </button>

            <button
              type="button"
              (click)="shortcutsService.setTab('rag-guide')"
              [class]="shortcutsService.activeTab() === 'rag-guide'
                ? 'border-[#003781] text-[#003781] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="px-3 py-3 border-b-2 text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ai-icon name="document" [size]="14" />
              <span>Arquitectura RAG Empresarial</span>
            </button>

            <button
              type="button"
              (click)="shortcutsService.setTab('best-practices')"
              [class]="shortcutsService.activeTab() === 'best-practices'
                ? 'border-[#003781] text-[#003781] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="px-3 py-3 border-b-2 text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ai-icon name="chat" [size]="14" />
              <span>Mejores Prácticas de Prompts</span>
            </button>
          </div>

          <!-- Content Body -->
          <div class="flex-1 overflow-y-auto p-6 max-h-[60vh]">
            <!-- TAB 1: SHORTCUTS -->
            @if (shortcutsService.activeTab() === 'shortcuts') {
              <div class="flex flex-col gap-5">
                <!-- Search Bar -->
                <div class="relative">
                  <ai-icon
                    name="search"
                    [size]="16"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    #filterInput
                    type="text"
                    [value]="searchFilter()"
                    (input)="onSearchInput($event)"
                    placeholder="Filtrar atajos por acción, tecla o módulo..."
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#003781] focus:bg-white transition-colors"
                  />
                  @if (searchFilter()) {
                    <button
                      type="button"
                      (click)="clearFilter()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002147] text-xs cursor-pointer"
                    >
                      <ai-icon name="x" [size]="14" />
                    </button>
                  }
                </div>

                <!-- Shortcuts List by Category -->
                @for (category of categories(); track category) {
                  @if (groupedShortcuts()[category]?.length) {
                    <div class="flex flex-col gap-2">
                      <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
                        <span>{{ category }}</span>
                        <span class="text-[10px] font-mono text-slate-400">({{ groupedShortcuts()[category].length }})</span>
                      </h3>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        @for (sc of groupedShortcuts()[category]; track sc.id) {
                          <div
                            (click)="executeShortcut(sc)"
                            class="group p-3 rounded-xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200 hover:border-[#003781]/40 transition-all flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div class="flex items-center gap-2.5 min-w-0">
                              <div class="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-[#003781] group-hover:border-blue-200 transition-colors flex-shrink-0">
                                <ai-icon [name]="sc.icon" [size]="16" />
                              </div>
                              <div class="min-w-0">
                                <h4 class="text-xs font-semibold text-[#002147] truncate group-hover:text-[#003781] transition-colors">
                                  {{ sc.title }}
                                </h4>
                                <p class="text-[11px] text-slate-500 truncate">
                                  {{ sc.description }}
                                </p>
                              </div>
                            </div>

                            <!-- Key Badges -->
                            <div class="flex items-center gap-1 flex-shrink-0">
                              @for (k of sc.keys; track k) {
                                <kbd class="px-2 py-1 text-[10px] font-mono font-medium rounded-md bg-white border border-slate-300 text-slate-700 shadow-xs">
                                  {{ k }}
                                </kbd>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                }

                @if (filteredShortcuts().length === 0) {
                  <div class="py-12 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
                    <ai-icon name="search" [size]="28" class="text-slate-400" />
                    <span class="text-xs">No se encontraron atajos para "{{ searchFilter() }}".</span>
                  </div>
                }
              </div>
            }

            <!-- TAB 2: RAG GUIDE -->
            @if (shortcutsService.activeTab() === 'rag-guide') {
              <div class="flex flex-col gap-6">
                <!-- RAG Flow Overview Banner -->
                <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col gap-2">
                  <div class="flex items-center gap-2 text-[#003781] font-bold text-xs">
                    <ai-icon name="sparkles" [size]="16" />
                    <span>Pipeline de Inferencia RAG (Retrieval-Augmented Generation)</span>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    DOJO 2.0 conecta tus consultas directamente a la base de conocimiento de infraestructura, arquitectura Cloud y sistemas TI. Cada respuesta generada incluye verificación de similitud vectorial y citas documentales exactas.
                  </p>
                </div>

                <!-- 4 Pipeline Stages -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <!-- Step 1 -->
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-mono text-[#003781] font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">Paso 01</span>
                      <ai-icon name="document" [size]="16" class="text-slate-400" />
                    </div>
                    <h4 class="text-xs font-bold text-[#002147]">Ingesta & Tokenización</h4>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                      Los archivos PDF, DOCX y contratos se dividen en fragmentos semánticos (chunks) de 512 tokens con un solapamiento del 15% para no perder contexto entre bordes de párrafo.
                    </p>
                  </div>

                  <!-- Step 2 -->
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-mono text-[#003781] font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">Paso 02</span>
                      <ai-icon name="chart" [size]="16" class="text-slate-400" />
                    </div>
                    <h4 class="text-xs font-bold text-[#002147]">Embeddings Vectoriales</h4>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                      Cada fragmento es convertido en un vector continuo de 768 dimensiones mediante <code class="text-[#003781] font-bold">text-embedding-004</code> con normalización L2 para búsqueda ultra-rápida.
                    </p>
                  </div>

                  <!-- Step 3 -->
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-mono text-amber-700 font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">Paso 03</span>
                      <ai-icon name="search" [size]="16" class="text-slate-400" />
                    </div>
                    <h4 class="text-xs font-bold text-[#002147]">Similitud Coseno & Rerank</h4>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                      La consulta del usuario se vectoriza en tiempo real y se calcula la distancia coseno. Solo los fragmentos con similitud &ge; 72% son inyectados al contexto del modelo.
                    </p>
                  </div>

                  <!-- Step 4 -->
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-mono text-[#059669] font-bold px-2 py-0.5 rounded bg-[#e6f9f3] border border-[#a7f3d0]">Paso 04</span>
                      <ai-icon name="sparkles" [size]="16" class="text-slate-400" />
                    </div>
                    <h4 class="text-xs font-bold text-[#002147]">Inferencia Grounded</h4>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                      El modelo LLM genera la respuesta con instrucciones estrictas de anclaje contextual, citando con precisión la sección, página y cláusula del documento fuente.
                    </p>
                  </div>
                </div>

                <!-- Governance Note -->
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div class="p-2 rounded-lg bg-[#e6f9f3] text-[#059669] flex-shrink-0 mt-0.5">
                    <ai-icon name="check" [size]="18" />
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-[#002147]">Firma Criptográfica Inmutable (SHA-256)</h4>
                    <p class="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      Todas las sesiones auditables en <a (click)="goTo('/history')" class="text-[#003781] underline cursor-pointer font-semibold">Historial & Auditoría</a> cuentan con un hash SHA-256 verificado que garantiza la integridad no repudiable de las citas y la respuesta generada.
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 3: PROMPT BEST PRACTICES -->
            @if (shortcutsService.activeTab() === 'best-practices') {
              <div class="flex flex-col gap-5">
                <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col gap-2">
                  <h3 class="text-xs font-bold text-[#002147] flex items-center gap-2">
                    <ai-icon name="sparkles" [size]="16" class="text-[#003781]" />
                    <span>Reglas de Oro para Respuestas Precisas y sin Alucinaciones</span>
                  </h3>
                  <p class="text-xs text-slate-600">
                    Sigue estas directrices para obtener respuestas de nivel ejecutivo con citas documentales exactas:
                  </p>
                </div>

                <!-- Best Practice Cards -->
                <div class="flex flex-col gap-3">
                  <!-- Tip 1 -->
                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-blue-50 text-[#003781] border border-blue-200 font-bold text-[10px] flex items-center justify-center font-mono">1</span>
                      <h4 class="text-xs font-bold text-[#002147]">Especifica el Rol y Contexto Corporativo</h4>
                    </div>
                    <p class="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Define claramente el perfil del análisis: <span class="text-[#002147] font-semibold">"Actúa como auditor financiero senior..."</span> o <span class="text-[#002147] font-semibold">"Como asesor legal de cumplimiento normativo..."</span>. Esto enfoca la jerga técnica y el rigor del razonamiento.
                    </p>
                  </div>

                  <!-- Tip 2 -->
                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-blue-50 text-[#003781] border border-blue-200 font-bold text-[10px] flex items-center justify-center font-mono">2</span>
                      <h4 class="text-xs font-bold text-[#002147]">Adjunta o Cita los Documentos Oficiales Relevantes</h4>
                    </div>
                    <p class="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Usa el botón de clip (<kbd class="text-[10px] bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-slate-700">Alt+U</kbd>) para añadir el contrato o informe deseado al prompt. El Copilot priorizará esos textos frente al corpus general.
                    </p>
                  </div>

                  <!-- Tip 3 -->
                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-blue-50 text-[#003781] border border-blue-200 font-bold text-[10px] flex items-center justify-center font-mono">3</span>
                      <h4 class="text-xs font-bold text-[#002147]">Solicita Salidas Estructuradas (Tablas, Métricas, Riesgos)</h4>
                    </div>
                    <p class="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Pide al Copilot: <span class="text-[#002147] font-semibold">"Presenta los hallazgos en una tabla con columnas: Cláusula, Riesgo, Nivel de Impacto y Recomendación"</span> o <span class="text-[#002147] font-semibold">"Resume en 3 puntos clave ejecutivos"</span>.
                    </p>
                  </div>

                  <!-- Tip 4 -->
                  <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full bg-blue-50 text-[#003781] border border-blue-200 font-bold text-[10px] flex items-center justify-center font-mono">4</span>
                      <h4 class="text-xs font-bold text-[#002147]">Usa la Biblioteca de Plantillas Guardadas</h4>
                    </div>
                    <p class="text-[11px] text-slate-600 leading-relaxed pl-7">
                      Pulsa <kbd class="text-[10px] bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-slate-700">⌘P</kbd> para acceder a prompts pre-aprobados para análisis de SLAs, solvencia II, y auditorías técnicas.
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Footer with quick tip -->
          <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <div class="flex items-center gap-2">
              <span class="text-[#003781] font-bold">Tip:</span>
              <span>Puedes presionar <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-700">?</kbd> o <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-700">F1</kbd> en cualquier momento para volver a abrir esta guía.</span>
            </div>

            <ai-button
              variant="primary"
              size="sm"
              (click)="shortcutsService.close()"
            >
              Entendido
            </ai-button>
          </div>
        </div>
      </div>
    }
  `
})
export class AiShortcutsModalComponent {
  protected readonly shortcutsService = inject(ShortcutsService);
  private readonly router = inject(Router);
  private readonly commandPalette = inject(CommandPaletteService);
  private readonly canvasService = inject(ReasoningCanvasService);
  private readonly templatesService = inject(PromptTemplatesService);
  private readonly settingsService = inject(SettingsService);
  private readonly exportService = inject(ExportSessionService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly uploaderService = inject(AttachmentUploaderService);
  private readonly chatService = inject(ChatService);

  protected readonly searchFilter = signal<string>('');
  protected readonly categories = signal<Array<'Globales' | 'Chat & Copilot' | 'Módulos'>>([
    'Globales',
    'Chat & Copilot',
    'Módulos'
  ]);

  // All Available Shortcuts Definition
  readonly allShortcuts: ShortcutItem[] = [
    // Global Actions
    {
      id: 'sc-cmd-k',
      category: 'Globales',
      title: 'Paleta de Comandos Global',
      description: 'Buscar conversaciones, documentos RAG y ejecutar acciones rápidas',
      keys: ['⌘', 'K'],
      icon: 'search',
      action: () => this.commandPalette.open()
    },
    {
      id: 'sc-canvas',
      category: 'Globales',
      title: 'Lienzo de Razonamiento CoT',
      description: 'Abrir workspace dividido para razonamiento profundo y matrices',
      keys: ['⌘', 'L'],
      icon: 'sparkles',
      action: () => this.canvasService.open()
    },
    {
      id: 'sc-templates',
      category: 'Globales',
      title: 'Plantillas & Prompts Guardados',
      description: 'Biblioteca corporativa de prompts pre-aprobados por departamento',
      keys: ['⌘', 'P'],
      icon: 'sparkles',
      action: () => this.templatesService.open()
    },
    {
      id: 'sc-export',
      category: 'Globales',
      title: 'Exportar Sesión & Auditoría',
      description: 'Generar reporte en PDF corporativo, Markdown, JSON o enlace SSO',
      keys: ['⌘', 'E'],
      icon: 'upload',
      action: () => this.exportService.open()
    },
    {
      id: 'sc-settings',
      category: 'Globales',
      title: 'Configuración LLM & Parámetros',
      description: 'Selector de modelos (Gemini/Gemma), temperatura y umbrales RAG',
      keys: ['⌘', ','],
      icon: 'settings',
      action: () => this.settingsService.open()
    },
    {
      id: 'sc-help',
      category: 'Globales',
      title: 'Centro de Ayuda & Atajos',
      description: 'Abrir esta guía interactiva y documentación RAG',
      keys: ['?'],
      icon: 'help',
      action: () => this.shortcutsService.open()
    },

    // Chat & Copilot
    {
      id: 'sc-send',
      category: 'Chat & Copilot',
      title: 'Enviar Mensaje al Copilot',
      description: 'Ejecutar consulta con recuperación de conocimiento RAG',
      keys: ['Enter'],
      icon: 'send'
    },
    {
      id: 'sc-newline',
      category: 'Chat & Copilot',
      title: 'Salto de Línea en Prompt',
      description: 'Insertar nueva línea sin enviar el mensaje',
      keys: ['Shift', 'Enter'],
      icon: 'chat'
    },
    {
      id: 'sc-stop',
      category: 'Chat & Copilot',
      title: 'Detener Transmisión de Respuesta',
      description: 'Pausa inmediata de la generación de tokens del modelo',
      keys: ['Esc'],
      icon: 'stop',
      action: () => this.chatService.stopGeneration()
    },
    {
      id: 'sc-voice',
      category: 'Chat & Copilot',
      title: 'Dictado por Voz (Speech-to-Text)',
      description: 'Iniciar o detener transcripción de voz en el prompt bar',
      keys: ['Alt', 'V'],
      icon: 'mic'
    },
    {
      id: 'sc-attach',
      category: 'Chat & Copilot',
      title: 'Subir Archivos & Adjuntos RAG',
      description: 'Subir nuevo PDF/DOCX o vincular documentos del repositorio',
      keys: ['Alt', 'U'],
      icon: 'paperclip',
      action: () => this.uploaderService.open()
    },
    {
      id: 'sc-feedback',
      category: 'Chat & Copilot',
      title: 'Reportar Alucinación / Feedback',
      description: 'Enviar reporte MLOps de calidad o corrección de respuesta',
      keys: ['⌘', 'F'],
      icon: 'thumb-down',
      action: () => {
        const msgs = this.chatService.activeMessages();
        const lastMsg = [...msgs].reverse().find((m) => m.role === 'assistant');
        this.feedbackService.open(
          lastMsg?.id || 'msg-manual',
          lastMsg?.content || 'Consulta general del Copilot',
          'down'
        );
      }
    },

    // Modules Navigation
    {
      id: 'sc-mod-chat',
      category: 'Módulos',
      title: 'Copilot Chat Principal',
      description: 'Pantalla principal de interacción con el asistente',
      keys: ['Alt', '1'],
      icon: 'chat',
      action: () => this.router.navigate(['/'])
    },
    {
      id: 'sc-mod-rag',
      category: 'Módulos',
      title: 'Base de Conocimiento RAG & Vector Store',
      description: 'Explorador de documentos vectorizados y chunks semánticos',
      keys: ['Alt', '2'],
      icon: 'document',
      action: () => this.router.navigate(['/knowledge'])
    },
    {
      id: 'sc-mod-hist',
      category: 'Módulos',
      title: 'Historial & Auditoría de Sesiones',
      description: 'Trazabilidad criptográfica SHA-256 y auditoría corporativa',
      keys: ['Alt', '3'],
      icon: 'history',
      action: () => this.router.navigate(['/history'])
    },
    {
      id: 'sc-mod-analytics',
      category: 'Módulos',
      title: 'Analítica & Telemetría MLOps',
      description: 'Métricas de adopción, latencia y documentos más consultados',
      keys: ['Alt', '4'],
      icon: 'chart',
      action: () => this.router.navigate(['/analytics'])
    },
    {
      id: 'sc-mod-ds',
      category: 'Módulos',
      title: 'Design System Playground',
      description: 'Galería interactiva de componentes UI y tokens corporativos',
      keys: ['Alt', '5'],
      icon: 'sparkles',
      action: () => this.router.navigate(['/design-system'])
    }
  ];

  // Filtered list based on search
  protected readonly filteredShortcuts = computed(() => {
    const filter = this.searchFilter().trim().toLowerCase();
    if (!filter) return this.allShortcuts;

    return this.allShortcuts.filter(
      (s) =>
        s.title.toLowerCase().includes(filter) ||
        s.description.toLowerCase().includes(filter) ||
        s.category.toLowerCase().includes(filter) ||
        s.keys.some((k) => k.toLowerCase().includes(filter))
    );
  });

  // Grouped by category
  protected readonly groupedShortcuts = computed(() => {
    const list = this.filteredShortcuts();
    const groups: Record<string, ShortcutItem[]> = {
      'Globales': [],
      'Chat & Copilot': [],
      'Módulos': []
    };

    for (const item of list) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  });

  // Global Hotkey Listener: '?' or 'F1'
  @HostListener('window:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    // Escape closes modal if open
    if (event.key === 'Escape' && this.shortcutsService.isOpen()) {
      event.preventDefault();
      this.shortcutsService.close();
      return;
    }

    // F1 or '?' opens shortcuts modal if not typing in text field
    const activeEl = document.activeElement;
    const isEditingText =
      activeEl instanceof HTMLInputElement ||
      activeEl instanceof HTMLTextAreaElement ||
      (activeEl as HTMLElement)?.isContentEditable;

    if (!isEditingText) {
      if (event.key === '?' || (event.shiftKey && event.key === '/') || event.key === 'F1') {
        event.preventDefault();
        this.shortcutsService.toggle();
        return;
      }

      // Alt + 1..5 for module navigation
      if (event.altKey && ['1', '2', '3', '4', '5'].includes(event.key)) {
        event.preventDefault();
        const map: Record<string, string> = {
          '1': '/',
          '2': '/knowledge',
          '3': '/history',
          '4': '/analytics',
          '5': '/design-system'
        };
        this.router.navigate([map[event.key]]);
      }
    }
  }

  protected onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchFilter.set(val);
  }

  protected clearFilter(): void {
    this.searchFilter.set('');
  }

  protected executeShortcut(sc: ShortcutItem): void {
    if (sc.action) {
      this.shortcutsService.close();
      sc.action();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.shortcutsService.close();
    }
  }

  protected goTo(path: string): void {
    this.shortcutsService.close();
    this.router.navigate([path]);
  }
}
