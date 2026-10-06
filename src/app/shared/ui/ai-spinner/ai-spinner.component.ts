import { Component, computed, input } from '@angular/core';

export type SpinnerType = 'circle' | 'dots' | 'pulse';
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'white' | 'muted';

@Component({
  selector: 'ai-spinner',
  standalone: true,
  template: `
    <div
      role="status"
      aria-live="polite"
      [attr.aria-label]="label() || 'Cargando...'"
      [class]="wrapperClasses()"
    >
      @switch (type()) {
        @case ('circle') {
          <svg
            class="animate-spin flex-shrink-0"
            [class]="colorClasses()"
            [attr.width]="numericSize()"
            [attr.height]="numericSize()"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              class="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="3"
            ></circle>
            <path
              class="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        }

        @case ('dots') {
          <!-- 3 Bouncing Dots for AI Thinking / Typing Indicator -->
          <div class="inline-flex items-center gap-1.5 py-1">
            <span
              class="rounded-full animate-bounce"
              [class]="[colorBgClasses(), dotSizeClasses()]"
              style="animation-delay: 0ms; animation-duration: 0.9s;"
            ></span>
            <span
              class="rounded-full animate-bounce"
              [class]="[colorBgClasses(), dotSizeClasses()]"
              style="animation-delay: 180ms; animation-duration: 0.9s;"
            ></span>
            <span
              class="rounded-full animate-bounce"
              [class]="[colorBgClasses(), dotSizeClasses()]"
              style="animation-delay: 360ms; animation-duration: 0.9s;"
            ></span>
          </div>
        }

        @case ('pulse') {
          <div class="relative flex items-center justify-center">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              [class]="colorBgClasses()"
            ></span>
            <span
              class="relative inline-flex rounded-full shadow-md"
              [class]="[colorBgClasses(), dotSizeClasses()]"
            ></span>
          </div>
        }
      }

      @if (label()) {
        <span [class]="labelClasses()">
          {{ label() }}
        </span>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `
})
export class AiSpinnerComponent {
  readonly type = input<SpinnerType>('circle');
  readonly size = input<SpinnerSize>('md');
  readonly color = input<SpinnerColor>('primary');
  readonly label = input<string>('');
  readonly labelPosition = input<'right' | 'bottom'>('right');

  protected readonly numericSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 16;
      case 'lg':
        return 32;
      case 'xl':
        return 44;
      default:
        return 22;
    }
  });

  protected readonly dotSizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'w-1.5 h-1.5';
      case 'lg':
        return 'w-3 h-3';
      case 'xl':
        return 'w-4 h-4';
      default:
        return 'w-2 h-2';
    }
  });

  protected readonly wrapperClasses = computed(() => {
    const isBottom = this.labelPosition() === 'bottom';
    const direction = isBottom ? 'flex-col items-center text-center gap-2' : 'flex-row items-center gap-2.5';
    return `inline-flex ${direction} select-none`;
  });

  protected readonly colorClasses = computed(() => {
    switch (this.color()) {
      case 'white':
        return 'text-white';
      case 'muted':
        return 'text-slate-400';
      default:
        return 'text-[var(--color-primary)]';
    }
  });

  protected readonly colorBgClasses = computed(() => {
    switch (this.color()) {
      case 'white':
        return 'bg-white';
      case 'muted':
        return 'bg-slate-400';
      default:
        return 'bg-[var(--color-primary)] shadow-[0_0_10px_rgba(16,163,127,0.5)]';
    }
  });

  protected readonly labelClasses = computed(() => {
    const sizes: Record<SpinnerSize, string> = {
      sm: 'text-xs',
      md: 'text-sm font-medium',
      lg: 'text-base font-semibold',
      xl: 'text-lg font-bold'
    };
    return `${sizes[this.size()]} text-[var(--color-text-secondary)] tracking-tight`;
  });
}
