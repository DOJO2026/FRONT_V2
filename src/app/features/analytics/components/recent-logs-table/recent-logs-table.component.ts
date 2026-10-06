import { Component, input } from '@angular/core';
import { TelemetryLog } from '../../models/analytics.model';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiChipComponent } from '../../../../shared/ui/ai-chip';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';

@Component({
  selector: 'app-recent-logs-table',
  standalone: true,
  imports: [AiCardComponent, AiChipComponent, AiIconComponent],
  template: `
    <ai-card variant="default" padding="md" class="h-full flex flex-col justify-between">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <ai-icon name="settings" [size]="16" class="text-emerald-400" />
            <span>Telemetría de Consultas en Tiempo Real</span>
          </h4>
          <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Registro de latencias de inferencia, consumo de tokens y estado de ejecución.
          </p>
        </div>
        <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          En vivo (Live)
        </span>
      </div>

      <!-- Logs List -->
      <div class="py-2 flex flex-col gap-2 overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead>
            <tr class="text-[10px] uppercase font-semibold text-slate-400 border-b border-white/5">
              <th class="py-2 pl-1">Consulta</th>
              <th class="py-2">Área</th>
              <th class="py-2">Latencia</th>
              <th class="py-2">Tokens</th>
              <th class="py-2">Estado</th>
              <th class="py-2 pr-1 text-right">Feedback</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            @for (log of logs(); track log.id) {
              <tr class="hover:bg-white/5 transition-colors group">
                <!-- Query Prompt -->
                <td class="py-2.5 pl-1 max-w-[200px] sm:max-w-xs truncate font-medium text-white group-hover:text-emerald-300 transition-colors" [title]="log.prompt">
                  {{ log.prompt }}
                </td>

                <!-- Category -->
                <td class="py-2.5 whitespace-nowrap text-slate-400">
                  <span class="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10">
                    {{ log.category }}
                  </span>
                </td>

                <!-- Latency -->
                <td class="py-2.5 whitespace-nowrap font-mono">
                  <span [class]="log.latencyMs < 1300 ? 'text-emerald-400' : 'text-amber-400'">
                    {{ log.latencyMs }}ms
                  </span>
                </td>

                <!-- Tokens -->
                <td class="py-2.5 whitespace-nowrap font-mono text-slate-300">
                  {{ log.tokens }}
                </td>

                <!-- Status Chip -->
                <td class="py-2.5 whitespace-nowrap">
                  <ai-chip
                    [variant]="log.status === 'success' ? 'success' : 'warning'"
                    size="sm"
                  >
                    {{ log.status === 'success' ? 'OK' : 'Alert' }}
                  </ai-chip>
                </td>

                <!-- Feedback Icon -->
                <td class="py-2.5 pr-1 text-right whitespace-nowrap">
                  @if (log.feedback === 'up') {
                    <span class="text-emerald-400 font-bold inline-flex items-center gap-1">
                      <ai-icon name="thumb-up" [size]="12" />
                    </span>
                  } @else if (log.feedback === 'down') {
                    <span class="text-red-400 font-bold inline-flex items-center gap-1">
                      <ai-icon name="thumb-down" [size]="12" />
                    </span>
                  } @else {
                    <span class="text-slate-600">-</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span>Tasa de éxito del modelo: 99.8%</span>
        <span class="font-mono text-[11px] text-slate-400">Promedio: 1,336ms / query</span>
      </div>
    </ai-card>
  `
})
export class RecentLogsTableComponent {
  readonly logs = input.required<TelemetryLog[]>();
}
