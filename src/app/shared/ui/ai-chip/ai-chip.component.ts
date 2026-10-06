import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { AiIconComponent, IconName } from '../ai-icon/ai-icon.component';

export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ChipSize = 'sm' | 'md';

@Component({
  selector: 'ai-chip',
  standalone: true,
  imports: [AiIconComponent],
  template: `
    <div
      [class]="chipClasses()"
      (click)="onClick()"
      [attr.role]="isClickable() ? 'button' : null"
      [attr.tabindex]="isClickable() ? 0 : null"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
    >
      @if (icon()) {
        <ai-icon [name]="icon()!" [size]="iconSize()" />
      }

      <span class="truncate">
        @if (label()) {
          {{ label() }}
        } @else {
          <ng-content />
        }
      </span>

      @if (removable()) {
        <button
          type="button"
          (click)="onRemove($event)"
          class="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Eliminar etiqueta"
        >
          <ai-icon name="x" [size]="iconSize()" />
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `
})
export class AiChipComponent {
  readonly label = input<string>('');
  readonly variant = input<ChipVariant>('default');
  readonly size = input<ChipSize>('md');
  readonly icon = input<IconName | null>(null);
  readonly removable = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly selected = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly clickable = input<boolean, boolean | ''>(false, { transform: booleanAttribute });

  readonly removed = output<void>();
  readonly clicked = output<void>();

  protected readonly isClickable = computed(() => this.clickable() || this.selected());

  protected readonly iconSize = computed(() => (this.size() === 'sm' ? 12 : 14));

  protected readonly chipClasses = computed(() => {
    const base = 'inline-flex items-center rounded-full font-medium transition-all select-none';

    const sizes: Record<ChipSize, string> = {
      sm: 'px-2.5 py-0.5 text-xs gap-1',
      md: 'px-3 py-1 text-xs sm:text-sm gap-1.5'
    };

    let colorStyles = '';
    if (this.selected()) {
      colorStyles =
        'bg-[#003781] text-white shadow-sm shadow-blue-900/20 border border-[#003781]';
    } else {
      const variants: Record<ChipVariant, string> = {
        default:
          'bg-white text-[#475569] border border-[#dbe6f0] hover:border-[#003781]/40',
        primary:
          'bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee]',
        success:
          'bg-[#e6f9f3] text-[#059669] border border-[#a7f3d0]',
        warning:
          'bg-amber-50 text-amber-800 border border-amber-200',
        danger:
          'bg-red-50 text-red-700 border border-red-200',
        info:
          'bg-sky-50 text-sky-800 border border-sky-200'
      };
      colorStyles = variants[this.variant()];
    }

    const interactionClass = this.isClickable()
      ? 'cursor-pointer hover:opacity-90 active:scale-95'
      : '';

    return `${base} ${sizes[this.size()]} ${colorStyles} ${interactionClass}`;
  });

  protected onClick(): void {
    if (this.isClickable()) {
      this.clicked.emit();
    }
  }

  protected onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.removed.emit();
  }
}
