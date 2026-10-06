import { Component, input } from '@angular/core';
import { DepartmentUsage } from '../../models/analytics.model';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiIconComponent, IconName } from '../../../../shared/ui/ai-icon';

@Component({
  selector: 'app-department-chart',
  standalone: true,
  imports: [AiCardComponent, AiIconComponent],
  template: `
    <ai-card variant="default" padding="md" class="h-full flex flex-col justify-between">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <ai-icon name="user" [size]="16" class="text-sky-400" />
            <span>Adopción por Departamento</span>
          </h4>
          <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Distribución porcentual de consultas según área de negocio.
          </p>
        </div>
        <span class="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
          5 Departamentos
        </span>
      </div>

      <!-- Department List with Progress Bars -->
      <div class="py-4 flex flex-col gap-4">
        @for (item of data(); track item.department) {
          <div class="flex flex-col gap-1.5 group">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-md flex items-center justify-center text-slate-300"
                  [style.background-color]="item.color + '20'"
                  [style.color]="item.color"
                >
                  <ai-icon [name]="getIconName(item.icon)" [size]="12" />
                </div>
                <span class="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {{ item.department }}
                </span>
              </div>

              <div class="flex items-center gap-2 font-mono">
                <span class="text-slate-400">{{ item.queriesCount }} consultas</span>
                <span class="font-bold text-white min-w-[40px] text-right">{{ item.percentage }}%</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                [style.width.%]="item.percentage"
                [style.background-color]="item.color"
                [style.box-shadow]="'0 0 8px ' + item.color + '60'"
              ></div>
            </div>
          </div>
        }
      </div>

      <!-- Footer Insight -->
      <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span class="italic">Mayor tracción en análisis legal y financiero.</span>
        <span class="font-semibold text-slate-300">100% cuota cubierta</span>
      </div>
    </ai-card>
  `
})
export class DepartmentChartComponent {
  readonly data = input.required<DepartmentUsage[]>();

  protected getIconName(icon: string): IconName {
    return icon as IconName;
  }
}
