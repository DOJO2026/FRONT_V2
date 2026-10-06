import { Component, computed, input } from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'ai-tooltip-content',
  standalone: true,
  template: `
    <div
      role="tooltip"
      [class]="tooltipClasses()"
      [style.top.px]="top()"
      [style.left.px]="left()"
    >
      <span class="truncate">{{ text() }}</span>

      @if (shortcut()) {
        <kbd class="ml-1 px-1.5 py-0.5 text-[10px] font-mono tracking-tight rounded bg-white/10 text-slate-300 border border-white/10 shadow-inner">
          {{ shortcut() }}
        </kbd>
      }

      <!-- Notch Arrow -->
      <span [class]="arrowClasses()"></span>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
  `
})
export class AiTooltipComponent {
  readonly text = input<string>('');
  readonly shortcut = input<string>('');
  readonly position = input<TooltipPosition>('top');
  readonly top = input<number>(0);
  readonly left = input<number>(0);
  readonly visible = input<boolean>(false);

  protected readonly tooltipClasses = computed(() => {
    const base =
      'fixed z-[9999] pointer-events-none px-2.5 py-1 text-xs font-medium text-slate-100 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl shadow-black/60 flex items-center gap-1 transition-all duration-150 ease-out whitespace-nowrap';
    const state = this.visible()
      ? 'opacity-100 scale-100'
      : 'opacity-0 scale-95';

    return `${base} ${state}`;
  });

  protected readonly arrowClasses = computed(() => {
    const base = 'absolute w-2 h-2 bg-slate-900 border-slate-700/80 transform rotate-45 pointer-events-none';
    switch (this.position()) {
      case 'top':
        return `${base} -bottom-1 left-1/2 -translate-x-1/2 border-r border-b`;
      case 'bottom':
        return `${base} -top-1 left-1/2 -translate-x-1/2 border-l border-t`;
      case 'left':
        return `${base} -right-1 top-1/2 -translate-y-1/2 border-t border-r`;
      case 'right':
        return `${base} -left-1 top-1/2 -translate-y-1/2 border-b border-l`;
    }
  });
}
