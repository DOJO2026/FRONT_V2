import { booleanAttribute, Component, computed, input } from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'accent';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardRadius = 'md' | 'lg' | 'xl' | '2xl';

@Component({
  selector: 'ai-card',
  standalone: true,
  template: `
    <div [class]="cardClasses()">
      <ng-content select="[card-header]" />
      <ng-content />
      <ng-content select="[card-footer]" />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class AiCardComponent {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<CardPadding>('md');
  readonly radius = input<CardRadius>('xl');
  readonly interactive = input<boolean, boolean | ''>(false, { transform: booleanAttribute });

  protected readonly cardClasses = computed(() => {
    const base = 'relative text-[var(--color-text)] transition-all duration-200';

    const variants: Record<CardVariant, string> = {
      default: 'bg-white border border-[#dbe6f0] shadow-sm',
      elevated: 'bg-white border border-[#dbe6f0] shadow-xl shadow-blue-950/5',
      glass: 'bg-white/95 backdrop-blur-md border border-[#dbe6f0] shadow-lg shadow-blue-950/5',
      accent: 'bg-white border border-[#003781]/30 shadow-lg shadow-blue-950/5'
    };

    const paddings: Record<CardPadding, string> = {
      none: 'p-0',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-7'
    };

    const radiuses: Record<CardRadius, string> = {
      md: 'rounded-[var(--radius-md)]',
      lg: 'rounded-[var(--radius-lg)]',
      xl: 'rounded-[var(--radius-xl)]',
      '2xl': 'rounded-[var(--radius-2xl)]'
    };

    const interactiveClass = this.interactive()
      ? 'hover:border-[#003781] hover:shadow-[0_8px_24px_rgba(0,55,129,0.12)] hover:-translate-y-0.5 cursor-pointer active:translate-y-0 active:scale-[0.99]'
      : '';

    return `${base} ${variants[this.variant()]} ${paddings[this.padding()]} ${radiuses[this.radius()]} ${interactiveClass}`;
  });
}
