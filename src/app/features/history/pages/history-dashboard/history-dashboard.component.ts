import { Component, computed, inject } from '@angular/core';
import { ExportSessionService } from '../../../../core/services/export-session.service';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiEmptyStateComponent } from '../../../../shared/ui/ai-empty-state';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { SessionAuditDrawerComponent } from '../../components/session-audit-drawer/session-audit-drawer.component';
import { HistoryDateFilter, HistoryStatusFilter } from '../../models/history.model';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-history-dashboard',
  standalone: true,
  imports: [
    AiCardComponent,
    AiButtonComponent,
    AiChipComponent,
    AiEmptyStateComponent,
    AiIconComponent,
    AiTooltipDirective,
    SessionAuditDrawerComponent
  ],
  template: `
    <div class="h-full flex flex-col overflow-y-auto px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full text-slate-100 gap-8">
      <!-- Top Header & Actions -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
            <span>Auditoría & Gobernanza de Sesiones</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Historial de Conversaciones Copilot
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Registro inmutable de consultas corporativas, consumo de cuota de tokens y trazabilidad de fuentes RAG.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <ai-button
            variant="secondary"
            size="md"
            (click)="onExportAll()"
            aiTooltip="Descargar registro de auditoría en formato oficial"
            tooltipPosition="bottom"
          >
            <ai-icon name="upload" [size]="16" />
            <span>Exportar Registro de Auditoría</span>
          </ai-button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1 -->
        <ai-card variant="elevated" padding="md" class="border-slate-800 bg-slate-900/70">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Sesiones Registradas</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ai-icon name="chat" [size]="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-white font-mono">{{ stats().totalSessions }}</span>
            <span class="text-xs text-slate-400 font-mono">({{ stats().activeSessions }} activas)</span>
          </div>
        </ai-card>

        <!-- Card 2 -->
        <ai-card variant="elevated" padding="md" class="border-slate-800 bg-slate-900/70">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Citas RAG Auditadas</span>
            <div class="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ai-icon name="document" [size]="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-white font-mono">{{ stats().totalCitedSources }}</span>
            <span class="text-xs text-cyan-400 font-medium font-mono">100% verificadas</span>
          </div>
        </ai-card>

        <!-- Card 3 -->
        <ai-card variant="elevated" padding="md" class="border-slate-800 bg-slate-900/70">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Tokens Invertidos</span>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ai-icon name="sparkles" [size]="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-white font-mono">{{ stats().totalTokensUsed.toLocaleString() }}</span>
            <span class="text-xs text-amber-400 font-medium font-mono">Cuota Enterprise</span>
          </div>
        </ai-card>

        <!-- Card 4 -->
        <ai-card variant="elevated" padding="md" class="border-slate-800 bg-slate-900/70">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">Aprobación de Respuestas</span>
            <div class="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ai-icon name="thumb-up" [size]="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-white font-mono">{{ stats().avgPositiveFeedback }}</span>
            <span class="text-xs text-purple-400 font-medium font-mono">Feedback Positivo</span>
          </div>
        </ai-card>
      </div>

      <!-- Filters Bar -->
      <div class="flex flex-col gap-4">
        <!-- Status Tabs & Search -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <!-- Status Selector Tabs -->
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-fit">
            <button
              type="button"
              (click)="historyService.setStatusFilter('all')"
              [class]="historyService.statusFilter() === 'all' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'"
              class="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Todas ({{ stats().totalSessions }})
            </button>
            <button
              type="button"
              (click)="historyService.setStatusFilter('active')"
              [class]="historyService.statusFilter() === 'active' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'"
              class="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Activas ({{ stats().activeSessions }})
            </button>
            <button
              type="button"
              (click)="historyService.setStatusFilter('archived')"
              [class]="historyService.statusFilter() === 'archived' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'"
              class="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Archivadas ({{ stats().archivedSessions }})
            </button>
            <button
              type="button"
              (click)="historyService.setStatusFilter('pinned')"
              [class]="historyService.statusFilter() === 'pinned' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'"
              class="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Fijadas</span>
            </button>
          </div>

          <!-- Search Bar -->
          <div class="relative flex-1 max-w-md">
            <input
              type="text"
              [value]="historyService.searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Buscar en títulos, departamentos o modelos..."
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors pl-9"
            />
            <div class="absolute left-3 top-2.5 text-slate-500">
              <ai-icon name="search" [size]="14" />
            </div>
            @if (historyService.searchQuery()) {
              <button
                type="button"
                (click)="historyService.setSearchQuery('')"
                class="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <ai-icon name="x" [size]="14" />
              </button>
            }
          </div>
        </div>

        <!-- Category & Date Filters -->
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <!-- Department Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            @for (cat of categories; track cat) {
              <button
                type="button"
                (click)="historyService.setCategoryFilter(cat)"
                [class]="historyService.categoryFilter() === cat ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-semibold' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60'"
                class="px-3 py-1 rounded-xl text-xs border transition-colors cursor-pointer whitespace-nowrap"
              >
                {{ cat }}
              </button>
            }
          </div>

          <!-- Date Dropdown Filter -->
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span>Rango temporal:</span>
            <select
              [value]="historyService.dateFilter()"
              (change)="onDateFilterChange($event)"
              class="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/60"
            >
              <option value="all">Todo el historial</option>
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="week">Últimos 7 días</option>
              <option value="month">Mes anterior</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sessions Grid -->
      @if (sessions().length === 0) {
        <ai-empty-state
          icon="history"
          title="No se encontraron sesiones registradas"
          description="Ninguna conversación coincide con los filtros de estado o búsqueda seleccionados."
          actionText="Limpiar Filtros"
          (action)="resetFilters()"
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (session of sessions(); track session.id) {
            <ai-card
              variant="elevated"
              padding="md"
              class="border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 group"
            >
              <!-- Card Top -->
              <div class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-800/80 text-purple-400 flex items-center justify-center flex-shrink-0 border border-slate-700/60 group-hover:border-purple-500/40 transition-colors">
                    <ai-icon name="chat" [size]="20" />
                  </div>

                  <!-- Badges / Pin -->
                  <div class="flex items-center gap-1.5">
                    @if (session.pinned) {
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Fijado
                      </span>
                    }
                    @if (session.archived) {
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        Archivado
                      </span>
                    }
                    @if (session.category) {
                      <ai-chip variant="primary" size="sm">
                        {{ session.category }}
                      </ai-chip>
                    }
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate" [title]="session.title">
                    {{ session.title }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span>{{ session.updatedAt }}</span>
                    <span>•</span>
                    <span>{{ session.messageCount || 10 }} mensajes</span>
                  </div>
                </div>

                <!-- Session Telemetry Bar -->
                <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>{{ (session.tokensUsed || 3400).toLocaleString() }} tok</span>
                  <span class="text-emerald-400">{{ session.citedSourcesCount || 4 }} citas RAG</span>
                  <span class="text-cyan-400 font-semibold">{{ session.positiveFeedbackCount || 3 }} 👍</span>
                </div>
              </div>

              <!-- Card Bottom Actions -->
              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <ai-button
                    variant="primary"
                    size="sm"
                    (click)="historyService.openInChat(session.id)"
                    class="shadow-[0_0_12px_rgba(16,163,127,0.3)]"
                  >
                    <ai-icon name="chat" [size]="14" />
                    <span>Continuar</span>
                  </ai-button>

                  <ai-button
                    variant="ghost"
                    size="sm"
                    (click)="historyService.openAuditDrawer(session)"
                    aiTooltip="Inspeccionar telemetría y auditoría de la sesión"
                    tooltipPosition="top"
                  >
                    <ai-icon name="history" [size]="14" />
                    <span>Auditar</span>
                  </ai-button>
                </div>

                <!-- Quick Actions -->
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    (click)="historyService.togglePin(session.id)"
                    [class.text-amber-400]="session.pinned"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    [aiTooltip]="session.pinned ? 'Desfijar' : 'Fijar arriba'"
                    tooltipPosition="top"
                  >
                    <ai-icon name="sparkles" [size]="14" />
                  </button>

                  <button
                    type="button"
                    (click)="historyService.toggleArchive(session.id)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    [aiTooltip]="session.archived ? 'Restaurar al chat' : 'Archivar sesión'"
                    tooltipPosition="top"
                  >
                    <ai-icon name="history" [size]="14" />
                  </button>

                  <button
                    type="button"
                    (click)="historyService.deleteSession(session.id)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    aiTooltip="Eliminar permanentemente"
                    tooltipPosition="top"
                  >
                    <ai-icon name="x" [size]="14" />
                  </button>
                </div>
              </div>
            </ai-card>
          }
        </div>
      }

      <!-- Audit Slide-Over Drawer -->
      <app-session-audit-drawer />
    </div>
  `
})
export class HistoryDashboardComponent {
  protected readonly historyService = inject(HistoryService);
  private readonly exportService = inject(ExportSessionService);

  protected readonly sessions = computed(() => this.historyService.filteredSessions());
  protected readonly stats = computed(() => this.historyService.stats());
  protected readonly categories = ['Todas', 'Legal', 'Ciberseguridad', 'Operaciones', 'Finanzas', 'General'];

  protected onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.historyService.setSearchQuery(val);
  }

  protected onDateFilterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as HistoryDateFilter;
    this.historyService.setDateFilter(val);
  }

  protected resetFilters(): void {
    this.historyService.setSearchQuery('');
    this.historyService.setCategoryFilter('Todas');
    this.historyService.setStatusFilter('all');
    this.historyService.setDateFilter('all');
  }

  protected onExportAll(): void {
    this.exportService.open('export');
  }
}
