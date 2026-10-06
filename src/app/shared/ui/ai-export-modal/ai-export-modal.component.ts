import {
  Component,
  HostListener,
  inject
} from '@angular/core';
import { ExportSessionService } from '../../../core/services/export-session.service';
import { AiButtonComponent } from '../ai-button';
import { AiIconComponent } from '../ai-icon';
import { AiTooltipDirective } from '../ai-tooltip';

@Component({
  selector: 'ai-export-modal',
  standalone: true,
  imports: [
    AiButtonComponent,
    AiIconComponent,
    AiTooltipDirective
  ],
  template: `
    @if (exportService.isOpen()) {
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
                <ai-icon name="upload" [size]="20" />
              </div>

              <div>
                <h3 class="text-base font-bold text-[#002147] tracking-tight">
                  Exportar & Compartir Sesión
                </h3>
                <p class="text-xs text-slate-500">
                  Descarga informes certificados o comparte un enlace corporativo seguro.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="exportService.close()"
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
              (click)="exportService.setActiveTab('export')"
              [class]="exportService.activeTab() === 'export' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ai-icon name="document" [size]="14" />
              <span>Descargar Informe</span>
            </button>

            <button
              type="button"
              (click)="exportService.setActiveTab('share')"
              [class]="exportService.activeTab() === 'share' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ai-icon name="sparkles" [size]="14" />
              <span>Enlace Seguro Corporativo</span>
            </button>
          </div>

          <!-- Body Content Area (Scrollable) -->
          <div class="p-6 overflow-y-auto max-h-[62vh] flex flex-col gap-6 no-scrollbar bg-white">
            <!-- Active Conversation Snapshot -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#003781]">
                Sesión Activa
              </span>

              <h4 class="text-sm font-bold text-[#002147] truncate">
                {{ exportService.sessionSummary().title }}
              </h4>

              <div class="flex items-center gap-3 text-xs text-slate-500 flex-wrap font-mono pt-1">
                <span>{{ exportService.sessionSummary().messageCount }} mensajes</span>
                <span>•</span>
                <span>~{{ exportService.sessionSummary().estimatedTokens }} tokens</span>
                <span>•</span>
                <span class="text-[#003781] font-semibold">{{ exportService.sessionSummary().modelName }}</span>
              </div>
            </div>

            <!-- TAB 1: EXPORT FILE -->
            @if (exportService.activeTab() === 'export') {
              <div class="flex flex-col gap-5">
                <!-- Format Cards -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Formato de Archivo
                  </label>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <!-- PDF Option -->
                    <div
                      (click)="exportService.setFormat('pdf')"
                      [class]="exportService.selectedFormat() === 'pdf' ? 'border-[#003781] bg-blue-50/50 shadow-sm ring-1 ring-[#003781]/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'"
                      class="p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-[#002147]">PDF Ejecutivo</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                          .pdf
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-tight">
                        Informe formal con membrete y citas oficiales.
                      </p>
                    </div>

                    <!-- Markdown Option -->
                    <div
                      (click)="exportService.setFormat('markdown')"
                      [class]="exportService.selectedFormat() === 'markdown' ? 'border-[#003781] bg-blue-50/50 shadow-sm ring-1 ring-[#003781]/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'"
                      class="p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-[#002147]">Markdown</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-[#003781] border border-blue-200">
                          .md
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-tight">
                        Texto estructurado para Notion, GitHub o Wikis.
                      </p>
                    </div>

                    <!-- JSON Option -->
                    <div
                      (click)="exportService.setFormat('json')"
                      [class]="exportService.selectedFormat() === 'json' ? 'border-[#003781] bg-blue-50/50 shadow-sm ring-1 ring-[#003781]/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'"
                      class="p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-[#002147]">JSON Auditoría</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          .json
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-tight">
                        Estructura cruda con telemetría de embeddings.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Export Options Toggles -->
                <div class="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <h5 class="text-xs font-semibold text-[#002147]">Incluir citas y fragmentos RAG</h5>
                      <p class="text-[11px] text-slate-500">
                        Añade los fragmentos textuales citados con su porcentaje de confianza.
                      </p>
                    </div>

                    <button
                      type="button"
                      (click)="exportService.toggleIncludeCitations()"
                      [class]="exportService.includeCitations() ? 'bg-[#003781]' : 'bg-slate-200'"
                      class="w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
                    >
                      <span
                        [class]="exportService.includeCitations() ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'"
                        class="inline-block w-4 h-4 rounded-full transition-transform shadow-sm"
                      ></span>
                    </button>
                  </div>

                  <div class="border-t border-slate-200 pt-3 flex items-center justify-between gap-4">
                    <div>
                      <h5 class="text-xs font-semibold text-[#002147]">Anonimizar datos personales (PII)</h5>
                      <p class="text-[11px] text-slate-500">
                        Oculta direcciones de email, teléfonos y DNI para cumplimiento GDPR.
                      </p>
                    </div>

                    <button
                      type="button"
                      (click)="exportService.toggleAnonymizePii()"
                      [class]="exportService.anonymizePii() ? 'bg-[#003781]' : 'bg-slate-200'"
                      class="w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
                    >
                      <span
                        [class]="exportService.anonymizePii() ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'"
                        class="inline-block w-4 h-4 rounded-full transition-transform shadow-sm"
                      ></span>
                    </button>
                  </div>
                </div>

                <!-- Download Action Button -->
                <ai-button
                  variant="primary"
                  size="md"
                  fullWidth
                  (click)="exportService.downloadExport()"
                >
                  <ai-icon name="upload" [size]="16" class="rotate-180" />
                  <span class="font-semibold">Descargar {{ exportService.selectedFormat().toUpperCase() }}</span>
                </ai-button>
              </div>
            }

            <!-- TAB 2: SECURE SHARE LINK -->
            @if (exportService.activeTab() === 'share') {
              <div class="flex flex-col gap-5">
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Enlace de Acceso Privado
                  </h4>

                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 min-w-0 font-mono text-xs text-[#003781] truncate font-semibold">
                      <ai-icon name="sparkles" [size]="14" class="flex-shrink-0" />
                      <span class="truncate">{{ exportService.shareUrl() }}</span>
                    </div>

                    <ai-button
                      variant="primary"
                      size="sm"
                      class="flex-shrink-0"
                      (click)="exportService.copyShareLink()"
                    >
                      <ai-icon [name]="exportService.isCopied() ? 'check' : 'copy'" [size]="14" />
                      <span>{{ exportService.isCopied() ? '¡Copiado!' : 'Copiar' }}</span>
                    </ai-button>
                  </div>
                </div>

                <!-- Link Security Features -->
                <div class="flex flex-col gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div class="flex items-center gap-2 text-slate-600">
                    <ai-icon name="check" [size]="14" class="text-emerald-600" />
                    <span>Requiere inicio de sesión corporativo SSO (Google / Microsoft Entra).</span>
                  </div>

                  <div class="flex items-center gap-2 text-slate-600">
                    <ai-icon name="check" [size]="14" class="text-emerald-600" />
                    <span>El enlace caduca automáticamente a los 30 días de inactividad.</span>
                  </div>

                  <div class="flex items-center gap-2 text-slate-600">
                    <ai-icon name="check" [size]="14" class="text-emerald-600" />
                    <span>Trazabilidad de auditoría activa: se registra quién accede a la sesión.</span>
                  </div>
                </div>

                <!-- Regenerate link button -->
                <div class="flex justify-end">
                  <button
                    type="button"
                    (click)="exportService.generateShareLink()"
                    class="text-xs text-slate-500 hover:text-[#003781] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <ai-icon name="refresh" [size]="12" />
                    <span>Regenerar enlace único</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Certificado bajo directivas de cumplimiento SOC2 Tipo II & GDPR.</span>
            <ai-button variant="ghost" size="sm" (click)="exportService.close()">
              <span>Cerrar</span>
            </ai-button>
          </div>
        </div>
      </div>
    }
  `
})
export class AiExportModalComponent {
  protected readonly exportService = inject(ExportSessionService);

  @HostListener('window:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.exportService.isOpen()) {
      this.exportService.close();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    this.exportService.close();
  }
}
