import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiSpinnerComponent } from '../../../../shared/ui/ai-spinner';
import {
  ActivityChartComponent,
  DepartmentChartComponent,
  KpiCardComponent,
  RecentLogsTableComponent,
  TopDocumentsComponent
} from '../../components';
import {
  DAILY_ACTIVITY_MOCK,
  DEPARTMENT_USAGE_MOCK,
  KPI_METRICS_MOCK,
  TELEMETRY_LOGS_MOCK,
  TOP_DOCUMENTS_MOCK
} from '../../mocks/analytics.mock';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    AiButtonComponent,
    AiChipComponent,
    AiIconComponent,
    KpiCardComponent,
    ActivityChartComponent,
    DepartmentChartComponent,
    TopDocumentsComponent,
    RecentLogsTableComponent
  ],
  template: `
    <div class="min-h-full bg-[var(--color-background)] text-[var(--color-text)] p-6 sm:p-8 max-w-7xl mx-auto flex flex-col gap-8 select-none animate-cascade-in">
      <!-- Top Dashboard Header & Controls -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-ping"></span>
            <span class="text-xs uppercase tracking-widest text-[var(--color-primary)] font-semibold">
              DOJO 2.0 • AI Observability & Telemetry
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Dashboard de Analítica del Copilot
          </h1>
          <p class="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Monitoreo en tiempo real de consumo de tokens, latencias RAG, satisfacción y documentos citados.
          </p>
        </div>

        <!-- Controls: Timeframe Filter, Export, Refresh -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Time Range Selector Pills -->
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            @for (period of timePeriods; track period) {
              <ai-chip
                [clickable]="true"
                size="sm"
                [selected]="selectedPeriod() === period"
                (clicked)="selectPeriod(period)"
              >
                {{ period }}
              </ai-chip>
            }
          </div>

          <!-- Export Report Button -->
          <ai-button variant="secondary" size="sm" (click)="exportReport()">
            <ai-icon name="upload" [size]="14" class="rotate-180" />
            <span class="hidden sm:inline">Exportar Informe</span>
          </ai-button>

          <!-- Refresh Data Button -->
          <ai-button
            variant="primary"
            size="sm"
            [loading]="isRefreshing()"
            (click)="refreshData()"
          >
            <ai-icon name="refresh" [size]="14" />
            <span>Refrescar</span>
          </ai-button>
        </div>
      </header>

      <!-- KPI Metrics Grid (4 Cards) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis; track kpi.id) {
          <app-kpi-card [metric]="kpi" />
        }
      </section>

      <!-- Charts Row: Activity Chart + Department Usage -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7">
          <app-activity-chart [data]="dailyActivity" />
        </div>
        <div class="lg:col-span-5">
          <app-department-chart [data]="departmentUsage" />
        </div>
      </section>

      <!-- Detailed Row: Top Cited Documents + Telemetry Logs Table -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-5">
          <app-top-documents [documents]="topDocuments" />
        </div>
        <div class="lg:col-span-7">
          <app-recent-logs-table [logs]="telemetryLogs" />
        </div>
      </section>
    </div>
  `
})
export class AnalyticsDashboardComponent {
  protected readonly isRefreshing = signal<boolean>(false);
  protected readonly timePeriods = ['7 Días', 'Este Mes', 'Trimestre', '2026'];
  protected readonly selectedPeriod = signal<string>('Este Mes');

  // Mock data sources
  protected readonly kpis = KPI_METRICS_MOCK;
  protected readonly dailyActivity = DAILY_ACTIVITY_MOCK;
  protected readonly departmentUsage = DEPARTMENT_USAGE_MOCK;
  protected readonly topDocuments = TOP_DOCUMENTS_MOCK;
  protected readonly telemetryLogs = TELEMETRY_LOGS_MOCK;

  protected selectPeriod(period: string): void {
    this.selectedPeriod.set(period);
  }

  protected refreshData(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 800);
  }

  protected exportReport(): void {
    alert('Exportando informe analítico consolidado en formato CSV / PDF (Mock)...');
  }
}
