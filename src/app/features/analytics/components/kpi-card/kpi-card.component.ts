import { Component, computed, input } from '@angular/core';
import { KpiMetric } from '../../models/analytics.model';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiIconComponent, IconName } from '../../../../shared/ui/ai-icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [AiCardComponent, AiIconComponent],
  template: `
    <ai-card variant="default" padding="md" class="relative overflow-hidden group hover:border-slate-600 transition-all">
      <!-- Glow effect top border -->
      <div [class]="accentLineClasses()"></div>

      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {{ metric().title }}
          </span>
          <div class="flex items-baseline gap-2.5 mt-1.5">
            <h3 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {{ metric().value }}
            </h3>
            <span [class]="changeBadgeClasses()">
              {{ metric().change }}
            </span>
          </div>
          <p class="text-[11px] text-[var(--color-text-secondary)] mt-1.5">
            {{ metric().subtitle }}
          </p>
        </div>

        <div [class]="iconWrapperClasses()">
          <ai-icon [name]="iconName()" [size]="20" />
        </div>
      </div>
    </ai-card>
  `
})
export class KpiCardComponent {
  readonly metric = input.required<KpiMetric>();

  protected get iconName(): () => IconName {
    return () => this.metric().icon as IconName;
  }

  protected readonly accentLineClasses = computed(() => {
    const base = 'absolute top-0 left-0 right-0 h-1 transition-all duration-300';
    switch (this.metric().color) {
      case 'primary':
        return `${base} bg-[var(--color-primary)] shadow-[0_0_12px_rgba(16,163,127,0.8)]`;
      case 'info':
        return `${base} bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]`;
      case 'success':
        return `${base} bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]`;
      case 'warning':
        return `${base} bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]`;
    }
  });

  protected readonly iconWrapperClasses = computed(() => {
    const base = 'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110';
    switch (this.metric().color) {
      case 'primary':
        return `${base} bg-emerald-500/10 text-[var(--color-primary)]`;
      case 'info':
        return `${base} bg-sky-500/10 text-sky-400`;
      case 'success':
        return `${base} bg-emerald-500/10 text-emerald-400`;
      case 'warning':
        return `${base} bg-amber-500/10 text-amber-400`;
    }
  });

  protected readonly changeBadgeClasses = computed(() => {
    return 'px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  });
}
