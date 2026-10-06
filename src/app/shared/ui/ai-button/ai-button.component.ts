import { booleanAttribute, Component, computed, input } from '@angular/core';
import { AiIconComponent } from '../ai-icon/ai-icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ai-button',
  standalone: true,
  imports: [AiIconComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="isDisabled()"
      [attr.aria-disabled]="isDisabled()"
      [attr.aria-busy]="loading()"
      [class]="buttonClasses()"
    >
      @if (loading()) {
        <ai-icon name="spinner" [size]="iconSize()" class="animate-spin" />
      }
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    :host([fullWidth]),
    :host(.w-full) {
      display: block;
      width: 100%;
    }
  `
})
export class AiButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly fullWidth = input<boolean, boolean | ''>(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 14;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  });

  protected readonly buttonClasses = computed(() => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-border-focus)] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-[#003781] hover:bg-[#002860] text-white shadow-sm hover:shadow-[0_4px_16px_rgba(0,55,129,0.25)] border border-transparent',
      secondary:
        'bg-white hover:bg-slate-50 text-[#002147] border border-[#dbe6f0] hover:border-[#003781]/40 shadow-sm',
      ghost:
        'bg-transparent hover:bg-blue-50/60 text-[#475569] hover:text-[#002147] border border-transparent',
      danger:
        'bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] text-white shadow-sm border border-transparent'
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-md)] gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-[var(--radius-lg)] gap-2',
      lg: 'px-5 py-3 text-base rounded-[var(--radius-xl)] gap-2.5'
    };

    const width = this.fullWidth() ? 'w-full' : '';

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${width}`;
  });
}
