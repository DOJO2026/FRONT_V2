import { Component, HostListener, computed, inject } from '@angular/core';
import { ExportSessionService } from '../../../../core/services/export-session.service';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-session-audit-drawer',
  standalone: true,
  imports: [AiButtonComponent, AiChipComponent, AiIconComponent, AiTooltipDirective],
  template: `
    @if (session()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] transition-opacity animate-cascade-in"
        (click)="close()"
      ></div>

      <!-- Slide-Over Drawer Container -->
      <div
        class="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white border-l border-[#dbe6f0] shadow-2xl z-[85] flex flex-col overflow-hidden text-slate-800 animate-slide-in-right"
        (click)="$event.stopPropagation()"
      >
        <!-- Header Bar -->
        <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
              <ai-icon name="history" [size]="20" />
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-[#002147] tracking-tight truncate" [title]="session()!.title">
                  {{ session()!.title }}
                </h3>
                @if (session()!.category) {
                  <ai-chip variant="primary" size="sm">
                    {{ session()!.category }}
                  </ai-chip>
                }
              </div>
              <p class="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                <span>{{ session()!.updatedAt }}</span>
                <span>•</span>
                <span>{{ session()!.messageCount || 10 }} mensajes</span>
                <span>•</span>
                <span>{{ session()!.modelUsed || 'Gemini 1.5 Pro • RAG' }}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="close()"
            class="p-2 rounded-xl text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
            aiTooltip="Cerrar (Esc)"
            tooltipPosition="left"
          >
            <ai-icon name="x" [size]="18" />
          </button>
        </div>

        <!-- Governance & Security Audit Card -->
        <div class="p-6 pb-2 bg-white">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3 font-mono text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 uppercase text-[10px] font-bold">Firma Criptográfica SHA-256</span>
              <ai-chip variant="success" size="sm">Conforme ISO 27001</ai-chip>
            </div>
            <div class="text-[11px] text-slate-700 truncate bg-white p-2 rounded border border-slate-200 shadow-inner">
              sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
            </div>
            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[11px]">
              <div>
                <span class="text-slate-400 block text-[10px]">Tokens Totales</span>
                <span class="text-[#002147] font-bold">{{ (session()!.tokensUsed || 3420).toLocaleString() }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Citas RAG</span>
                <span class="text-[#003781] font-bold">{{ session()!.citedSourcesCount || 4 }} fuentes</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px]">Feedback</span>
                <span class="text-[#003781] font-bold">{{ session()!.positiveFeedbackCount || 3 }} votos positivos</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Transcript Preview Area (Scrollable) -->
        <div class="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-4 no-scrollbar bg-white">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2">
            Registro Histórico de Mensajes
          </span>

          <!-- Simulated User Message -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span class="font-semibold text-[#002147] flex items-center gap-1.5">
                <ai-icon name="user" [size]="12" />
                Diego Bueno (Enterprise Architect)
              </span>
              <span class="font-mono text-[10px]">{{ session()!.updatedAt }}</span>
            </div>
            <p class="text-xs text-slate-700">
              "{{ session()!.title }}. Por favor sintetiza los requisitos normativos y tiempos de respuesta según el marco corporativo."
            </p>
          </div>

          <!-- Simulated Assistant Response -->
          <div class="p-4 rounded-xl bg-blue-50/40 border border-[#003781]/20 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-[11px] text-[#003781]">
              <span class="font-semibold flex items-center gap-1.5">
                <ai-icon name="sparkles" [size]="12" />
                AI Copilot • {{ session()!.modelUsed || 'Gemini 1.5 Pro' }}
              </span>
              <ai-chip variant="primary" size="sm">Citas Validadas</ai-chip>
            </div>
            <p class="text-xs text-slate-700 leading-relaxed">
              He procesado las consultas aplicando las directrices vigentes en el repositorio RAG. Se determinó un umbral de disponibilidad del 99.95% y tiempos máximos de respuesta RTO de 15 minutos para infraestructuras de nivel crítico.
            </p>

            <!-- Cited Sources Snippet -->
            <div class="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shadow-sm">
              <span class="flex items-center gap-1 text-[#002147] font-mono">
                <ai-icon name="document" [size]="12" class="text-[#003781]" />
                Contrato_Marco_Operaciones.pdf (Cláusula 14.2)
              </span>
              <span class="text-emerald-600 font-mono font-semibold">98.4% match</span>
            </div>
          </div>
        </div>

        <!-- Footer Bar -->
        <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <ai-button
              variant="ghost"
              size="sm"
              (click)="onToggleArchive()"
            >
              <ai-icon name="history" [size]="14" />
              <span>{{ session()!.archived ? 'Restaurar Sesión' : 'Archivar' }}</span>
            </ai-button>

            <ai-button
              variant="ghost"
              size="sm"
              (click)="onOpenExport()"
            >
              <ai-icon name="upload" [size]="14" />
              <span>Exportar</span>
            </ai-button>
          </div>

          <ai-button
            variant="primary"
            size="sm"
            (click)="onOpenInChat()"
          >
            <ai-icon name="chat" [size]="14" />
            <span>Abrir en Chat</span>
          </ai-button>
        </div>
      </div>
    }
  `
})
export class SessionAuditDrawerComponent {
  private readonly historyService = inject(HistoryService);
  private readonly exportService = inject(ExportSessionService);

  protected readonly session = computed(() => this.historyService.selectedSessionForAudit());

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.session()) {
      this.close();
    }
  }

  protected close(): void {
    this.historyService.closeAuditDrawer();
  }

  protected onOpenInChat(): void {
    const s = this.session();
    if (s) {
      this.historyService.openInChat(s.id);
    }
  }

  protected onToggleArchive(): void {
    const s = this.session();
    if (s) {
      this.historyService.toggleArchive(s.id);
    }
  }

  protected onOpenExport(): void {
    this.exportService.open('export');
  }
}
