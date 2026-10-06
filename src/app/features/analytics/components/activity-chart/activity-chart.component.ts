import { Component, computed, input } from '@angular/core';
import { DailyActivity } from '../../models/analytics.model';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [AiCardComponent, AiIconComponent],
  template: `
    <ai-card variant="default" padding="md" class="h-full flex flex-col justify-between">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <ai-icon name="history" [size]="16" class="text-[var(--color-primary)]" />
            <span>Actividad Semanal & Volumen de Consultas</span>
          </h4>
          <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Distribución diaria de consultas y demanda computacional en los últimos 7 días.
          </p>
        </div>
        <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          +22% pico en Jueves
        </span>
      </div>

      <!-- Visual Bar Chart -->
      <div class="pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56">
        @for (item of data(); track item.day) {
          <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <!-- Tooltip on hover -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-center bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap mb-1">
              <span class="text-white font-bold">{{ item.queries }} consultas</span>
              <span class="text-slate-400 block">{{ item.tokensK }}k tokens</span>
            </div>

            <!-- Bar Container -->
            <div class="w-full max-w-[36px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end h-full relative">
              <!-- Queries bar fill -->
              <div
                class="w-full rounded-t-lg bg-gradient-to-t from-[var(--color-primary)] to-emerald-300 transition-all duration-500 group-hover:brightness-125 shadow-[0_0_10px_rgba(16,163,127,0.3)]"
                [style.height.%]="getBarHeight(item.queries)"
              ></div>
            </div>

            <!-- Labels -->
            <div class="flex flex-col items-center select-none">
              <span class="text-xs font-semibold text-slate-200">{{ item.day }}</span>
              <span class="text-[10px] text-slate-500 font-mono">{{ item.date }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Footer Legend -->
      <div class="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-[var(--color-primary)]"></span>
            <span>Volumen de consultas</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/40"></span>
            <span>Tokens proporcionales</span>
          </div>
        </div>
        <span class="font-mono text-[11px] text-emerald-400 font-semibold">Total: 1,482 ops</span>
      </div>
    </ai-card>
  `
})
export class ActivityChartComponent {
  readonly data = input.required<DailyActivity[]>();

  private readonly maxQueries = computed(() => {
    const list = this.data();
    return Math.max(...list.map((d) => d.queries), 350);
  });

  protected getBarHeight(queries: number): number {
    return Math.round((queries / this.maxQueries()) * 100);
  }
}
