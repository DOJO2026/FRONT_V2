import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttachmentUploaderService } from '../../../../core/services/attachment-uploader.service';
import { ExportSessionService } from '../../../../core/services/export-session.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { PromptTemplatesService } from '../../../../core/services/prompt-templates.service';
import { RagCitationService } from '../../../../core/services/rag-citation.service';
import { ReasoningCanvasService } from '../../../../core/services/reasoning-canvas.service';
import { SettingsService } from '../../../../core/services/settings.service';
import { ShortcutsService } from '../../../../core/services/shortcuts.service';
import { AiAvatarComponent } from '../../../../shared/ui/ai-avatar';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiEmptyStateComponent } from '../../../../shared/ui/ai-empty-state';
import { AiIconComponent, IconName } from '../../../../shared/ui/ai-icon';
import { AiInputComponent } from '../../../../shared/ui/ai-input';
import { AiSpinnerComponent } from '../../../../shared/ui/ai-spinner';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [
    RouterLink,
    AiAvatarComponent,
    AiButtonComponent,
    AiCardComponent,
    AiChipComponent,
    AiEmptyStateComponent,
    AiIconComponent,
    AiInputComponent,
    AiSpinnerComponent,
    AiTooltipDirective
  ],
  template: `
    <div class="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-6 sm:p-10 max-w-6xl mx-auto flex flex-col gap-12">
      <!-- Top Navigation / Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
            <span class="text-xs uppercase tracking-widest text-[var(--color-primary)] font-semibold">DOJO 2.0 • UI Library</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mt-1 text-white">Design System Playground</h1>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">
            Catálogo interactivo de componentes visuales, tokens y estados del AI Copilot.
          </p>
        </div>
        <a routerLink="/" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-sm font-medium transition-colors w-fit">
          <ai-icon name="chevron-down" [size]="14" class="rotate-90" />
          <span>Volver a Home</span>
        </a>
      </header>

      <!-- Section: Knowledge Base & Vector Store Hub -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> Base de Conocimiento RAG & Vector Store Hub
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Módulo integral de gestión de documentos corporativos, particionado en chunks, embeddings vectoriales (768d) y vinculación directa con el chat.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            /knowledge
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Hub de Documentos & Fragmentos Vectoriales</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Accede a la vista dedicada para inspeccionar chunks por página, calcular similitud de coseno y activar fuentes para el Copilot.
            </p>
          </div>
          <a routerLink="/knowledge" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <ai-icon name="document" [size]="14" />
            <span>Abrir Base de Conocimiento</span>
          </a>
        </div>
      </section>

      <!-- Section: History Dashboard & Session Audit -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> Historial & Auditoría de Sesiones
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Módulo de gobernanza corporativa para rastrear firmas criptográficas SHA-256, mensajes intercambiados y fuentes RAG citadas.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            /history
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Auditoría Inmutable & Registro de Sesiones</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Inspecciona transcripciones históricas, cuotas consumidas por sesión y abre cualquier chat con un solo clic.
            </p>
          </div>
          <a routerLink="/history" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <ai-icon name="history" [size]="14" />
            <span>Abrir Historial & Auditoría</span>
          </a>
        </div>
      </section>

      <!-- Section: Token Streaming & Stop Generation -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> Token Streaming & Control de Generación
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Simulación de inferencia en tiempo real a ~45 tokens/seg con cursor parpadeante, telemetría de tasa de transferencia y botón de parada inmediata (Stop).
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Streaming & Stop Control
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-3">
            <ai-button variant="primary" (click)="demoStartStreaming()">
              <ai-icon name="sparkles" [size]="16" />
              <span>Iniciar Transmisión Demo</span>
            </ai-button>

            <ai-button variant="danger" [disabled]="!demoIsStreaming()" (click)="demoStopStreaming()">
              <ai-icon name="stop" [size]="14" />
              <span>Detener Generación (Esc)</span>
            </ai-button>

            @if (demoIsStreaming()) {
              <ai-chip variant="primary" size="sm">
                <ai-spinner type="dots" size="sm" class="mr-1 inline-block" />
                Transmitiendo (~45 tok/s)
              </ai-chip>
            } @else if (demoIsStopped()) {
              <ai-chip variant="warning" size="sm">Detenido</ai-chip>
            } @else {
              <ai-chip variant="success" size="sm">Listo para generar</ai-chip>
            }
          </div>

          <!-- Live Output Preview Box -->
          <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed min-h-24">
            <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-2">Respuesta en tiempo real:</span>
            <span>{{ demoStreamText() }}</span>
            @if (demoIsStreaming()) {
              <span class="inline-block w-2 h-4 bg-[var(--color-primary)] ml-1 align-middle animate-pulse rounded-sm shadow-[0_0_10px_var(--color-primary)]"></span>
            }
          </div>
        </div>
      </section>

      <!-- Section: AiFeedbackDialog -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiFeedbackDialog
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Modal de auditoría de calidad de respuestas, reporte de alucinaciones RAG, selección de motivos y telemetría MLOps.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            &lt;ai-feedback-dialog&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Reporte de Alucinaciones & Calidad</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Abre el diálogo de evaluación para reportar errores en citas contractuales, cálculos de SLA o activar el reentrenamiento MLOps.
            </p>
          </div>
          <ai-button variant="secondary" (click)="demoOpenFeedback()">
            <ai-icon name="thumb-down" [size]="16" class="text-amber-400" />
            <span>Abrir Diálogo Feedback</span>
          </ai-button>
        </div>
      </section>

      <!-- Section: AiShortcutsModal -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiShortcutsModal
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Centro de Ayuda corporativo, catálogo interactivo de atajos de teclado, arquitectura de 5 pasos RAG y reglas de oro para prompts.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-shortcuts-modal&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Centro de Ayuda & Atajos de Teclado</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Prueba el modal de atajos interactivos (con filtrado en vivo), la guía visual del pipeline RAG y las mejores prácticas de prompt engineering.
            </p>
          </div>
          <ai-button variant="primary" (click)="demoOpenShortcuts()">
            <ai-icon name="help" [size]="16" />
            <span>Abrir Centro de Ayuda (?)</span>
          </ai-button>
        </div>
      </section>

      <!-- Section: AiExportModal -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiExportModal
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Modal de exportación de informes en PDF corporativo, Markdown o JSON y generador de enlaces seguros con SSO.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-export-modal&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Exportación de Sesión & Enlace Seguro</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Prueba la descarga de informes de auditoría con citas verificadas y la generación de enlaces de lectura corporativos.
            </p>
          </div>
          <ai-button variant="primary" (click)="demoOpenExport()">
            <ai-icon name="upload" [size]="16" />
            <span>Abrir Exportador</span>
          </ai-button>
        </div>
      </section>

      <!-- Section: AiSettingsModal -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiSettingsModal
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Panel modal de configuración de modelos LLM (Gemini 1.5 Pro / Flash, Gemma), parámetros de inferencia, umbrales RAG y cuotas.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-settings-modal&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Preferencias de Inferencia & Sistema</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Abre el modal para configurar sliders de temperatura, profundidad de razonamiento CoT, similitud de embeddings y balance de tokens.
            </p>
          </div>
          <ai-button variant="primary" (click)="demoOpenSettings()">
            <ai-icon name="settings" [size]="16" />
            <span>Abrir Configuración</span>
          </ai-button>
        </div>
      </section>

      <!-- Section: AiPromptTemplatesModal -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiPromptTemplatesModal
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Biblioteca de plantillas de prompts corporativos parametrizados, clasificación por departamentos, favoritos e historial de consultas.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-prompt-templates-modal&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Biblioteca & Plantillas Corporativas</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Abre el catálogo interactivo para explorar prompts de auditoría SLA, análisis de riesgos GDPR, métricas Opex y gestión de favoritos.
            </p>
          </div>
          <ai-button variant="primary" (click)="demoOpenTemplates()">
            <ai-icon name="sparkles" [size]="16" />
            <span>Abrir Plantillas Prompts</span>
          </ai-button>
        </div>
      </section>

      <!-- Section: AiAttachmentUploader -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiAttachmentUploader
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Modal de gestión de fuentes documentales, Drag & Drop de archivos, simulación de vectorización y vinculación al contexto del chat.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-attachment-uploader&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Subida de Documentos & Catálogo RAG</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Abre el modal para probar la zona de carga de archivos (PDF, DOCX, XLSX), ver el progreso de chunking y vincular documentos corporativos.
            </p>
          </div>
          <ai-button variant="primary" (click)="demoOpenUploader()">
            <ai-icon name="upload" [size]="16" />
            <span>Abrir Gestor Documental</span>
          </ai-button>
        </div>
      </section>

      <!-- Section: AiReasoningCanvas -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiReasoningCanvas
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Lienzo interactivo tipo Artifacts / Canvas con desglose de razonamiento (Chain of Thought), vista de documento y refinamiento conversacional.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-reasoning-canvas&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Lienzo de Razonamiento & Artefactos</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Abre el panel lateral deslizante para inspeccionar la traza de pensamiento del Copilot, la matriz SLA 2026 y ejecutar prompts de refinamiento en tiempo real.
            </p>
          </div>
          <ai-button variant="primary" (click)="demoOpenCanvas()">
            <ai-icon name="sparkles" [size]="16" />
            <span>Abrir Lienzo Canvas</span>
          </ai-button>
        </div>
      </section>

      <!-- Section: AiRagCitationViewer -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiRagCitationViewer
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Visor modal para inspección de fuentes, fragmentos RAG destacados y telemetría de embeddings.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-rag-citation-viewer&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-white">Inspección de Cita Contractual</h4>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Haz clic para abrir el visor modal con la simulación del documento oficial y el fragmento resaltado en verde esmeralda.
            </p>
          </div>
          <ai-button variant="primary" (click)="demoOpenRagViewer()">
            <ai-icon name="document" [size]="16" />
            <span>Probar Visor RAG</span>
          </ai-button>
        </div>
      </section>

      <!-- Section: AiTooltip -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiTooltip
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Directiva flotante para botones de acción, atajos de teclado y ayuda contextual con estética glassmorphic.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            [aiTooltip]
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-8">
          <!-- Positions -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
              Posiciones Direccionales (Top, Bottom, Left, Right)
            </h3>
            <div class="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-[var(--color-background)]">
              <ai-button
                variant="secondary"
                aiTooltip="Tooltip en la parte superior"
                tooltipPosition="top"
              >
                Top
              </ai-button>

              <ai-button
                variant="secondary"
                aiTooltip="Tooltip en la parte inferior"
                tooltipPosition="bottom"
              >
                Bottom
              </ai-button>

              <ai-button
                variant="secondary"
                aiTooltip="Tooltip a la izquierda"
                tooltipPosition="left"
              >
                Left
              </ai-button>

              <ai-button
                variant="secondary"
                aiTooltip="Tooltip a la derecha"
                tooltipPosition="right"
              >
                Right
              </ai-button>
            </div>
          </div>

          <!-- Shortcuts & Chat Actions -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Atajos de Teclado & Acciones del Copilot
            </h3>
            <div class="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[var(--color-background)]">
              <button
                type="button"
                class="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-slate-300 hover:text-white hover:border-[var(--color-primary)] transition-all cursor-pointer flex items-center gap-2"
                aiTooltip="Buscar en conversaciones y documentos"
                tooltipShortcut="⌘K"
                tooltipPosition="top"
              >
                <ai-icon name="search" [size]="18" />
                <span class="text-xs">Búsqueda Global</span>
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-slate-300 hover:text-white hover:border-[var(--color-primary)] transition-all cursor-pointer"
                aiTooltip="Copiar respuesta al portapapeles"
                tooltipShortcut="Ctrl+C"
                tooltipPosition="top"
              >
                <ai-icon name="copy" [size]="18" />
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-slate-300 hover:text-white hover:border-[var(--color-primary)] transition-all cursor-pointer"
                aiTooltip="Respuesta útil y precisa"
                tooltipPosition="top"
              >
                <ai-icon name="thumb-up" [size]="18" />
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-slate-300 hover:text-white hover:border-[var(--color-primary)] transition-all cursor-pointer"
                aiTooltip="Respuesta inexacta o incompleta"
                tooltipPosition="top"
              >
                <ai-icon name="thumb-down" [size]="18" />
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-slate-300 hover:text-white hover:border-[var(--color-primary)] transition-all cursor-pointer"
                aiTooltip="Regenerar respuesta con nuevas fuentes"
                tooltipShortcut="⌘R"
                tooltipPosition="top"
              >
                <ai-icon name="refresh" [size]="18" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: AiSpinner -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiSpinner
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              Indicadores de carga y estados de razonamiento ("Thinking") del Copilot con soporte para círculo clásico, puntos animados y pulso.
            </p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-spinner&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-8">
          <!-- Types / Modos -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
              Tipos & Indicadores de Estado
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- 1. Circle Spinner -->
              <div class="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col gap-3">
                <span class="text-xs font-mono text-[var(--color-primary)]">type="circle"</span>
                <div class="py-4 flex items-center justify-center">
                  <ai-spinner type="circle" size="lg" label="Cargando datos..." />
                </div>
                <p class="text-xs text-[var(--color-text-muted)]">Ideal para carga de listas, subida de archivos y llamadas asíncronas.</p>
              </div>

              <!-- 2. Dots (AI Thinking) -->
              <div class="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col gap-3">
                <span class="text-xs font-mono text-[var(--color-primary)]">type="dots" (AI Thinking)</span>
                <div class="py-4 flex items-center justify-center">
                  <ai-spinner type="dots" size="lg" label="Copilot pensando..." />
                </div>
                <p class="text-xs text-[var(--color-text-muted)]">Especial para mensajes del Copilot mientras analiza documentos o genera streaming.</p>
              </div>

              <!-- 3. Pulse Spinner -->
              <div class="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-col gap-3">
                <span class="text-xs font-mono text-[var(--color-primary)]">type="pulse" (Sincronización)</span>
                <div class="py-4 flex items-center justify-center">
                  <ai-spinner type="pulse" size="md" label="Sincronizando vector store..." />
                </div>
                <p class="text-xs text-[var(--color-text-muted)]">Indicador de sincronización en segundo plano o estado de actividad del RAG.</p>
              </div>
            </div>
          </div>

          <!-- Sizes -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Sizes (sm, md, lg, xl)
            </h3>
            <div class="flex flex-wrap items-center gap-8 p-4 rounded-xl bg-[var(--color-background)]">
              <div class="flex items-center gap-2">
                <ai-spinner size="sm" label="sm (16px)" />
              </div>
              <div class="flex items-center gap-2">
                <ai-spinner size="md" label="md (22px)" />
              </div>
              <div class="flex items-center gap-2">
                <ai-spinner size="lg" label="lg (32px)" />
              </div>
              <div class="flex items-center gap-2">
                <ai-spinner size="xl" label="xl (44px)" />
              </div>
            </div>
          </div>

          <!-- Color Variations & Orientation -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Variaciones de Color & Orientación
            </h3>
            <div class="flex flex-wrap items-center gap-8 p-4 rounded-xl bg-[var(--color-background)]">
              <ai-spinner color="primary" label="Primary Glow" />
              <ai-spinner color="white" label="White Contrast" />
              <ai-spinner color="muted" label="Muted Gray" />
              <div class="border-l border-[var(--color-border)] pl-8">
                <ai-spinner type="circle" size="lg" labelPosition="bottom" label="Orientación vertical (bottom)" />
              </div>
            </div>
          </div>

          <!-- AI Chat Bubble Simulation with Dots Spinner -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Simulación de Estado de Pensamiento en Burbuja de Chat
            </h3>
            <div class="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] max-w-lg">
              <ai-avatar role="ai" size="md" status="online" />
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-[var(--color-primary)]">AI Copilot</span>
                  <span class="text-[10px] text-slate-500 font-mono">Generando...</span>
                </div>
                <ai-card variant="accent" padding="sm" class="mt-1">
                  <ai-spinner type="dots" size="md" label="Analizando cláusulas legales y extrayendo referencias..." />
                </ai-card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: AiEmptyState -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiEmptyState
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">Pantallas de bienvenida, estados sin resultados, historial vacío y errores con botón de recuperación.</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-empty-state&gt;
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 1. Chat Welcome Empty State -->
          <ai-card variant="default" padding="sm" class="flex flex-col justify-center">
            <ai-empty-state
              icon="sparkles"
              tone="primary"
              size="md"
              title="¿Cómo puedo ayudarte?"
              description="Puedo ayudarte a analizar contratos, redactar informes y extraer información de tus fuentes."
              actionText="Nuevo Chat"
              actionIcon="plus"
              actionVariant="primary"
              (action)="onNewChatDemo()"
            />
          </ai-card>

          <!-- 2. Search / History Empty State -->
          <ai-card variant="default" padding="sm" class="flex flex-col justify-center">
            <ai-empty-state
              icon="search"
              tone="muted"
              size="md"
              title="Sin resultados"
              description="No encontramos conversaciones ni documentos coincidentes con los filtros seleccionados."
              actionText="Limpiar búsqueda"
              actionVariant="secondary"
              (action)="onClearSearchDemo()"
            />
          </ai-card>

          <!-- 3. Error / Failure State -->
          <ai-card variant="default" padding="sm" class="flex flex-col justify-center">
            <ai-empty-state
              icon="x"
              tone="danger"
              size="md"
              title="Error de procesamiento"
              description="No pudimos extraer las fuentes del archivo debido a un tiempo de espera excedido."
              actionText="Reintentar"
              actionIcon="refresh"
              actionVariant="danger"
              (action)="onRetryDemo()"
            />
          </ai-card>
        </div>
      </section>

      <!-- Section: AiChip -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiChip
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">Etiquetas compactas para filtros, estados de documentos, fuentes y metadatos.</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-chip&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-8">
          <!-- Semantic Status Variants -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Variantes Semánticas & Estados</h3>
            <div class="flex flex-wrap items-center gap-3">
              <ai-chip variant="primary" icon="sparkles">AI Verified</ai-chip>
              <ai-chip variant="success" icon="check">Procesado</ai-chip>
              <ai-chip variant="warning" icon="spinner">Indexando...</ai-chip>
              <ai-chip variant="danger" icon="x">Error de lectura</ai-chip>
              <ai-chip variant="info" icon="document">PDF 2.4 MB</ai-chip>
              <ai-chip variant="default">Metadato general</ai-chip>
            </div>
          </div>

          <!-- Interactive Filters -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Filtros de Conversación Interactivos (Seleccionables)
            </h3>
            <div class="flex flex-wrap items-center gap-2.5">
              @for (cat of categories; track cat) {
                <ai-chip
                  [clickable]="true"
                  [selected]="selectedCategory() === cat"
                  (clicked)="selectCategory(cat)"
                >
                  {{ cat }}
                </ai-chip>
              }
            </div>
            <span class="text-xs text-[var(--color-primary)] mt-1 font-mono">Filtro activo: {{ selectedCategory() }}</span>
          </div>

          <!-- Removable Document Tags -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Etiquetas Removibles (Documentos o Fuentes Adjuntas)
            </h3>
            <div class="flex flex-wrap items-center gap-2.5">
              @for (tag of activeTags(); track tag) {
                <ai-chip
                  variant="default"
                  icon="document"
                  [removable]="true"
                  (removed)="removeTag(tag)"
                >
                  {{ tag }}
                </ai-chip>
              }
              @if (activeTags().length === 0) {
                <span class="text-xs text-slate-500 italic">No quedan etiquetas activas.</span>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Section: AiAvatar -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiAvatar
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">Avatares para el Copilot AI, usuarios empresariales, iniciales dinámicas y estados de conexión.</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-avatar&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-8">
          <!-- Roles & Identidad -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Roles & Identidad de Marca</h3>
            <div class="flex flex-wrap items-center gap-8">
              <!-- AI Copilot Avatar -->
              <div class="flex items-center gap-3">
                <ai-avatar role="ai" size="lg" status="online" />
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-white">AI Copilot</span>
                  <span class="text-xs text-[var(--color-primary)]">Degradado institucional #10A37F</span>
                </div>
              </div>

              <!-- User Initials -->
              <div class="flex items-center gap-3">
                <ai-avatar role="user" name="Diego Bueno" size="lg" status="online" />
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-white">Diego Bueno</span>
                  <span class="text-xs text-[var(--color-text-muted)]">Iniciales auto: "DB"</span>
                </div>
              </div>

              <!-- Second User -->
              <div class="flex items-center gap-3">
                <ai-avatar role="user" name="Ana Martínez" size="lg" status="busy" />
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-white">Ana Martínez</span>
                  <span class="text-xs text-amber-400">Estado: Ocupada</span>
                </div>
              </div>

              <!-- System Role -->
              <div class="flex items-center gap-3">
                <ai-avatar role="system" size="lg" status="offline" />
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-white">Sistema RAG</span>
                  <span class="text-xs text-slate-400">Servicio de indexación</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sizes -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Sizes (xs, sm, md, lg, xl)</h3>
            <div class="flex items-end gap-6">
              <div class="flex flex-col items-center gap-2">
                <ai-avatar role="ai" size="xs" />
                <span class="text-[10px] font-mono text-[var(--color-text-muted)]">xs (24px)</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <ai-avatar role="ai" size="sm" />
                <span class="text-[10px] font-mono text-[var(--color-text-muted)]">sm (32px)</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <ai-avatar role="ai" size="md" status="online" />
                <span class="text-[10px] font-mono text-[var(--color-text-muted)]">md (40px)</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <ai-avatar role="ai" size="lg" status="online" />
                <span class="text-[10px] font-mono text-[var(--color-text-muted)]">lg (48px)</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <ai-avatar role="ai" size="xl" status="online" [bordered]="true" />
                <span class="text-[10px] font-mono text-[var(--color-text-muted)]">xl (64px) + ring</span>
              </div>
            </div>
          </div>

          <!-- Mini Chat Thread Simulation: User vs AI -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Simulación de Hilo de Chat (User vs AI Copilot)
            </h3>
            
            <div class="flex flex-col gap-4 p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
              <!-- User Message -->
              <div class="flex items-start gap-3.5 max-w-2xl ml-auto flex-row-reverse">
                <ai-avatar role="user" name="Diego Bueno" size="md" status="online" />
                <ai-card variant="default" padding="sm" class="bg-slate-800/80">
                  <p class="text-sm text-slate-100">
                    ¿Podrías resumir los puntos principales del contrato de servicios en 3 viñetas?
                  </p>
                  <span class="text-[10px] text-slate-400 mt-1 block text-right">09:24 AM</span>
                </ai-card>
              </div>

              <!-- AI Response Message -->
              <div class="flex items-start gap-3.5 max-w-2xl">
                <ai-avatar role="ai" size="md" status="online" />
                <ai-card variant="accent" padding="md" class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1.5">
                      <ai-icon name="sparkles" [size]="14" />
                      AI Copilot
                    </span>
                    <span class="text-[10px] text-[var(--color-text-muted)]">Ahora</span>
                  </div>
                  <p class="text-sm text-slate-200 leading-relaxed">
                    Con gusto. Analizando las cláusulas del documento proporcionado:
                  </p>
                  <ul class="text-xs text-slate-300 list-disc pl-4 mt-2 space-y-1">
                    <li>Vigencia acordada de 24 meses renovable automáticamente.</li>
                    <li>Nivel de servicio (SLA) comprometido al 99.9%.</li>
                    <li>Penalizaciones específicas por incumplimiento de entrega.</li>
                  </ul>
                  <div class="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                    <button class="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer" title="Útil">
                      <ai-icon name="thumb-up" [size]="14" />
                    </button>
                    <button class="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer" title="No útil">
                      <ai-icon name="thumb-down" [size]="14" />
                    </button>
                    <button class="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer" title="Copiar">
                      <ai-icon name="copy" [size]="14" />
                    </button>
                  </div>
                </ai-card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: AiInput -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiInput
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">Campos de entrada accesibles con soporte para iconos, estados de validación, limpieza y búsqueda.</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-input&gt;
          </span>
        </div>

        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-8">
          <!-- Grid of input variants -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Search Input with Clearable -->
            <div class="flex flex-col gap-2">
              <ai-input
                label="Búsqueda interactiva (con clearable)"
                placeholder="Buscar en historial o documentos..."
                iconPrefix="search"
                [clearable]="true"
                [value]="searchQuery()"
                (valueChange)="searchQuery.set($event)"
                helperText="Presiona Enter o haz clic en la 'x' para limpiar."
              />
              <span class="text-xs font-mono text-[var(--color-primary)]">Valor en tiempo real: "{{ searchQuery() }}"</span>
            </div>

            <!-- Standard Input with Label & Required -->
            <div>
              <ai-input
                label="Nombre de la conversación"
                placeholder="Ej. Auditoría Contratos Q3"
                [required]="true"
                helperText="Identificador breve para el historial."
              />
            </div>

            <!-- Error State -->
            <div>
              <ai-input
                label="Entrada con Estado de Error"
                placeholder="documento-invalido.xyz"
                iconPrefix="document"
                value="archivo_corrupto.exe"
                errorMessage="Formato de archivo no admitido. Solo se admiten PDF, DOCX o TXT."
              />
            </div>

            <!-- Disabled State -->
            <div>
              <ai-input
                label="Entrada Deshabilitada"
                placeholder="Campo bloqueado durante procesamiento..."
                iconPrefix="settings"
                [disabled]="true"
                value="Configuración gestionada por administrador"
              />
            </div>
          </div>

          <!-- Prompt Box Simulation using AiCard + AiInput + AiButton -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Prototipo de Barra de Prompt (AiCard + AiInput + AiButton)
            </h3>
            <ai-card variant="elevated" padding="sm" class="border-emerald-500/30">
              <div class="flex items-center gap-3">
                <button type="button" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer" title="Adjuntar documento">
                  <ai-icon name="paperclip" [size]="20" />
                </button>
                <div class="flex-1">
                  <ai-input
                    placeholder="Escribe tu consulta al AI Copilot empresarial..."
                    [value]="promptQuery()"
                    (valueChange)="promptQuery.set($event)"
                    (enter)="onSendPrompt()"
                  />
                </div>
                <ai-button variant="primary" (click)="onSendPrompt()">
                  <ai-icon name="send" [size]="16" />
                  <span>Enviar</span>
                </ai-button>
              </div>
            </ai-card>
          </div>
        </div>
      </section>

      <!-- Section: AiCard -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiCard
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">Contenedores base para mensajes, sugerencias, fuentes y paneles de control.</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-card&gt;
          </span>
        </div>

        <!-- Variants Showcase -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ai-card variant="default">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-mono text-[var(--color-text-muted)]">variant="default"</span>
              <h4 class="font-semibold text-white">Superficie Base</h4>
              <p class="text-xs text-[var(--color-text-secondary)]">Borde sutil con color de superficie corporativa estándar.</p>
            </div>
          </ai-card>

          <ai-card variant="elevated">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-mono text-[var(--color-text-muted)]">variant="elevated"</span>
              <h4 class="font-semibold text-white">Elevada con Sombra</h4>
              <p class="text-xs text-[var(--color-text-secondary)]">Sombra profunda para destacar paneles y diálogos flotantes.</p>
            </div>
          </ai-card>

          <ai-card variant="glass">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-mono text-[var(--color-text-muted)]">variant="glass"</span>
              <h4 class="font-semibold text-white">Efecto Glassmorphism</h4>
              <p class="text-xs text-[var(--color-text-secondary)]">Fondo translúcido con desenfoque de fondo y borde refinado.</p>
            </div>
          </ai-card>

          <ai-card variant="accent">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-mono text-[var(--color-primary)]">variant="accent"</span>
              <h4 class="font-semibold text-white">Acento Copilot AI</h4>
              <p class="text-xs text-[var(--color-text-secondary)]">Degradado con tonalidad de marca #10A37F para respuestas clave.</p>
            </div>
          </ai-card>
        </div>

        <!-- Interactive Use Cases: SuggestionCard & SourceCard -->
        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Casos de Uso Interactivos (Suggestions & Sources)
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Suggestion Card Example -->
            <ai-card [interactive]="true">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                  <ai-icon name="sparkles" [size]="20" />
                </div>
                <div class="flex-1 flex flex-col gap-1">
                  <span class="text-xs font-medium text-[var(--color-primary)]">Sugerencia rápida</span>
                  <p class="text-sm font-semibold text-white">"¿Cuáles son las cláusulas clave del contrato de arrendamiento 2026?"</p>
                  <span class="text-xs text-[var(--color-text-muted)] mt-1">Haz clic para enviar al Copilot</span>
                </div>
              </div>
            </ai-card>

            <!-- Source Card Example -->
            <ai-card [interactive]="true">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <ai-icon name="document" [size]="20" />
                </div>
                <div class="flex-1 flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-blue-400">Fuente citada (RAG)</span>
                    <span class="text-xs font-mono text-slate-400">Pág. 14</span>
                  </div>
                  <p class="text-sm font-semibold text-white">Contrato_Marco_Operaciones.pdf</p>
                  <p class="text-xs text-slate-400 italic mt-0.5 line-clamp-1">"El trabajador tendrá derecho al descanso computado..."</p>
                </div>
              </div>
            </ai-card>
          </div>
        </div>
      </section>

      <!-- Section: AiButton -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiButton
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">Componente de botón corporativo con soporte para variants, sizes, loading, disabled y fullWidth.</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-button&gt;
          </span>
        </div>

        <!-- Variants Grid -->
        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-6">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Variants</h3>
          <div class="flex flex-wrap gap-4 items-center">
            <ai-button variant="primary">
              <ai-icon name="check" [size]="16" />
              Primary
            </ai-button>
            <ai-button variant="secondary">
              Secondary
            </ai-button>
            <ai-button variant="ghost">
              Ghost
            </ai-button>
            <ai-button variant="danger">
              <ai-icon name="x" [size]="16" />
              Danger
            </ai-button>
          </div>

          <!-- Sizes -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Sizes</h3>
            <div class="flex flex-wrap items-center gap-4">
              <ai-button size="sm">Small (sm)</ai-button>
              <ai-button size="md">Medium (md)</ai-button>
              <ai-button size="lg">Large (lg)</ai-button>
            </div>
          </div>

          <!-- States (Loading, Disabled, Interactive Toggle) -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">States & Controls</h3>
              <button
                (click)="toggleLoading()"
                class="text-xs px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                Alternar Loading: {{ isLoading() ? 'ON' : 'OFF' }}
              </button>
            </div>
            <div class="flex flex-wrap gap-4 items-center">
              <ai-button [loading]="isLoading()">
                {{ isLoading() ? 'Guardando respuesta...' : 'Enviar consulta' }}
              </ai-button>
              <ai-button variant="secondary" [loading]="isLoading()">
                Procesando
              </ai-button>
              <ai-button variant="primary" disabled>
                Disabled
              </ai-button>
              <ai-button variant="danger" disabled>
                Danger Disabled
              </ai-button>
            </div>
          </div>

          <!-- Full Width -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Full Width</h3>
            <ai-button variant="primary" fullWidth>
              <ai-icon name="sparkles" [size]="18" />
              Iniciar nueva conversación con Copilot (Full Width)
            </ai-button>
          </div>
        </div>
      </section>

      <!-- Section: AiIcon -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-[var(--color-primary)]">#</span> AiIcon
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">Iconografía SVG nativa con stroke="currentColor" heredando colores de texto y tokens.</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            &lt;ai-icon name="..."&gt;
          </span>
        </div>

        <!-- Icons Grid -->
        <div class="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            @for (icon of availableIcons; track icon) {
              <div class="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex flex-col items-center justify-center gap-2.5 group cursor-default">
                <div class="text-slate-400 group-hover:text-[var(--color-primary)] transition-colors">
                  <ai-icon [name]="icon" [size]="24" />
                </div>
                <span class="text-xs font-mono text-[var(--color-text-secondary)] group-hover:text-white transition-colors">{{ icon }}</span>
              </div>
            }
          </div>

          <!-- Custom Colors & Sizes Demonstration -->
          <div class="border-t border-[var(--color-border)] pt-6 flex flex-col gap-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Herencia de Color & Tamaños</h3>
            <div class="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-[var(--color-background)]">
              <div class="flex items-center gap-2 text-[var(--color-primary)]">
                <ai-icon name="sparkles" [size]="28" />
                <span class="text-sm font-medium">Primary Brand</span>
              </div>
              <div class="flex items-center gap-2 text-[var(--color-danger)]">
                <ai-icon name="x" [size]="24" />
                <span class="text-sm font-medium">Danger</span>
              </div>
              <div class="flex items-center gap-2 text-[var(--color-info)]">
                <ai-icon name="upload" [size]="24" />
                <span class="text-sm font-medium">Info</span>
              </div>
              <div class="flex items-center gap-2 text-amber-400">
                <ai-icon name="settings" [size]="24" />
                <span class="text-sm font-medium">Warning</span>
              </div>
              <div class="flex items-center gap-2 text-slate-400">
                <ai-icon name="spinner" [size]="24" />
                <span class="text-sm font-medium">Spinner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Brand Tokens -->
      <section class="flex flex-col gap-6">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <span class="text-[var(--color-primary)]">#</span> Design Tokens
          </h2>
          <p class="text-sm text-[var(--color-text-secondary)]">Variables CSS corporativas para colores, superficies y tipografía.</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-2">
            <div class="h-14 rounded-lg bg-[var(--color-primary)] flex items-center justify-center font-bold text-white shadow-md">
              #10A37F
            </div>
            <span class="text-sm font-semibold">Primary</span>
            <span class="text-xs text-[var(--color-text-muted)]">--color-primary</span>
          </div>

          <div class="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-2">
            <div class="h-14 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center font-mono text-xs text-slate-400">
              #0B0F17
            </div>
            <span class="text-sm font-semibold">Background</span>
            <span class="text-xs text-[var(--color-text-muted)]">--color-background</span>
          </div>

          <div class="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-2">
            <div class="h-14 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center font-mono text-xs text-slate-300">
              #111827
            </div>
            <span class="text-sm font-semibold">Surface</span>
            <span class="text-xs text-[var(--color-text-muted)]">--color-surface</span>
          </div>

          <div class="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-2">
            <div class="h-14 rounded-lg bg-[var(--color-danger)] flex items-center justify-center font-bold text-white shadow-md">
              #EF4444
            </div>
            <span class="text-sm font-semibold">Danger</span>
            <span class="text-xs text-[var(--color-text-muted)]">--color-danger</span>
          </div>
        </div>
      </section>
    </div>
  `
})
export class DesignSystemComponent {
  protected readonly isLoading = signal(false);
  protected readonly searchQuery = signal('Informe Financiero');
  protected readonly promptQuery = signal('¿Cuáles son los requisitos de cumplimiento normativo?');

  protected readonly categories = ['Todos', 'Contratos', 'Finanzas', 'Legal', 'Recursos Humanos', 'Auditoría'];
  protected readonly selectedCategory = signal('Contratos');
  protected readonly activeTags = signal(['PDF', 'Finanzas_2026.xlsx', 'Confidencial', 'Auditoría_Externa']);

  protected readonly availableIcons: IconName[] = [
    'chat',
    'send',
    'upload',
    'history',
    'search',
    'plus',
    'settings',
    'user',
    'paperclip',
    'thumb-up',
    'thumb-down',
    'copy',
    'check',
    'document',
    'sparkles',
    'refresh',
    'chevron-down',
    'chevron-right',
    'x',
    'help',
    'spinner'
  ];

  protected toggleLoading(): void {
    this.isLoading.update((v) => !v);
  }

  protected onSendPrompt(): void {
    alert(`Enviando prompt: "${this.promptQuery()}"`);
  }

  protected selectCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  protected removeTag(tag: string): void {
    this.activeTags.update((tags) => tags.filter((t) => t !== tag));
  }

  protected onNewChatDemo(): void {
    alert('Acción del Empty State: Iniciando nueva conversación con el Copilot...');
  }

  protected onClearSearchDemo(): void {
    this.searchQuery.set('');
    alert('Acción del Empty State: Filtros de búsqueda limpiados.');
  }

  protected onRetryDemo(): void {
    alert('Acción del Empty State: Reintentando procesamiento de documentos...');
  }

  private readonly ragService = inject(RagCitationService);
  private readonly canvasService = inject(ReasoningCanvasService);
  private readonly uploaderService = inject(AttachmentUploaderService);
  private readonly templatesService = inject(PromptTemplatesService);
  private readonly settingsService = inject(SettingsService);
  private readonly exportService = inject(ExportSessionService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly shortcutsService = inject(ShortcutsService);

  protected readonly demoIsStreaming = signal<boolean>(false);
  protected readonly demoIsStopped = signal<boolean>(false);
  protected readonly demoStreamText = signal<string>(
    'Haz clic en "Iniciar Transmisión Demo" para ver el flujo de tokens en tiempo real...'
  );
  private demoInterval: ReturnType<typeof setInterval> | null = null;

  protected demoStartStreaming(): void {
    if (this.demoInterval) clearInterval(this.demoInterval);
    this.demoIsStreaming.set(true);
    this.demoIsStopped.set(false);
    this.demoStreamText.set('');

    const text = 'Analizando requerimientos de cumplimiento normativo ISO/IEC 27001... Se confirman políticas de cifrado AES-256 en reposo, retención cero para entrenamiento público y auditoría criptográfica SHA-256 en todos los accesos con privilegios elevados.';
    const words = text.split(' ');
    let idx = 0;
    let accumulated = '';

    this.demoInterval = setInterval(() => {
      if (idx < words.length) {
        accumulated += (accumulated ? ' ' : '') + words[idx];
        this.demoStreamText.set(accumulated);
        idx++;
      } else {
        if (this.demoInterval) clearInterval(this.demoInterval);
        this.demoInterval = null;
        this.demoIsStreaming.set(false);
      }
    }, 45);
  }

  protected demoStopStreaming(): void {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    this.demoIsStreaming.set(false);
    this.demoIsStopped.set(true);
    this.demoStreamText.update((t) => `${t}\n\n*(Generación detenida por el usuario)*`);
  }

  protected demoOpenFeedback(): void {
    this.feedbackService.open(
      'demo-msg-eval',
      'Las penalizaciones por indisponibilidad se computarán mensualmente aplicando un 10% de descuento por cada 0.1% de caída...',
      'down'
    );
  }

  protected demoOpenExport(): void {
    this.exportService.open('export');
  }

  protected demoOpenShortcuts(): void {
    this.shortcutsService.open('shortcuts');
  }

  protected demoOpenSettings(): void {
    this.settingsService.open('model');
  }

  protected demoOpenTemplates(): void {
    this.templatesService.open('templates');
  }

  protected demoOpenUploader(): void {
    this.uploaderService.open('upload');
  }

  protected demoOpenCanvas(): void {
    this.canvasService.open();
  }

  protected demoOpenRagViewer(): void {
    this.ragService.open({
      id: 'demo-rag-1',
      title: 'Contrato_Marco_Operaciones_2026.pdf',
      page: 18,
      category: 'Legal / Cláusula 14.2',
      confidence: 98,
      snippet: 'Las penalizaciones por indisponibilidad se computarán mensualmente aplicando un 10% de descuento por cada 0.1% de caída por debajo del 99.5% acordado...',
      chunkId: 'chk_4192',
      cosineSimilarity: 0.984,
      tokensCount: 142,
      embeddingModel: 'text-embedding-004'
    });
  }
}
