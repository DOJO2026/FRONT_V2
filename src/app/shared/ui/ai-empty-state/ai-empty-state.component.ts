import { Component, computed, input, output } from '@angular/core';
import { ButtonVariant } from '../ai-button/ai-button.component';
import { AiButtonComponent } from '../ai-button/ai-button.component';
import { AiIconComponent, IconName } from '../ai-icon/ai-icon.component';

export type EmptyStateSize = 'sm' | 'md' | 'lg';
export type EmptyStateTone = 'primary' | 'muted' | 'danger' | 'warning';

@Component({
  selector: 'ai-empty-state',
  standalone: true,
  imports: [AiIconComponent, AiButtonComponent],
  template: `
    <div [class]="containerClasses()">
      <!-- Icon Container -->
      <div [class]="iconWrapperClasses()">
        <ng-content select="[empty-icon]">
          <ai-icon [name]="icon()" [size]="iconSize()" />
        </ng-content>
      </div>

      <!-- Text Content -->
      <div class="flex flex-col items-center gap-1.5 max-w-md">
        <h3 [class]="titleClasses()">
          {{ title() }}
        </h3>
        @if (description()) {
          <p class="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {{ description() }}
          </p>
        }
        <ng-content />
      </div>

      <!-- Action Button or Custom Actions Slot -->
      @if (actionText()) {
        <div class="mt-2">
          <ai-button
            [variant]="actionVariant()"
            (click)="onActionClick()"
          >
            @if (actionIcon()) {
              <ai-icon [name]="actionIcon()!" [size]="16" />
            }
            <span>{{ actionText() }}</span>
          </ai-button>
        </div>
      }
      <ng-content select="[empty-actions]" />
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `
})
export class AiEmptyStateComponent {
  readonly icon = input<IconName>('chat');
  readonly title = input<string>('No hay elementos');
  readonly description = input<string>('');
  readonly actionText = input<string>('');
  readonly actionIcon = input<IconName | null>(null);
  readonly actionVariant = input<ButtonVariant>('primary');
  readonly size = input<EmptyStateSize>('md');
  readonly tone = input<EmptyStateTone>('primary');

  readonly action = output<void>();

  protected readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 20;
      case 'lg':
        return 36;
      default:
        return 28;
    }
  });

  protected readonly containerClasses = computed(() => {
    const paddings: Record<EmptyStateSize, string> = {
      sm: 'py-6 px-4 gap-3',
      md: 'py-10 px-6 gap-4',
      lg: 'py-16 px-8 gap-6'
    };
    return `flex flex-col items-center justify-center text-center w-full ${paddings[this.size()]}`;
  });

  protected readonly iconWrapperClasses = computed(() => {
    const boxSizes: Record<EmptyStateSize, string> = {
      sm: 'w-10 h-10 rounded-xl',
      md: 'w-14 h-14 rounded-2xl',
      lg: 'w-20 h-20 rounded-3xl'
    };

    const tones: Record<EmptyStateTone, string> = {
      primary:
        'bg-emerald-500/10 text-[var(--color-primary)] border border-emerald-500/20 shadow-[0_0_20px_rgba(16,163,127,0.2)]',
      muted:
        'bg-slate-800/80 text-slate-400 border border-slate-700',
      danger:
        'bg-red-500/10 text-[var(--color-danger)] border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
      warning:
        'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
    };

    return `flex items-center justify-center transition-all ${boxSizes[this.size()]} ${tones[this.tone()]}`;
  });

  protected readonly titleClasses = computed(() => {
    const sizes: Record<EmptyStateSize, string> = {
      sm: 'text-sm font-bold text-white',
      md: 'text-base sm:text-lg font-bold text-white',
      lg: 'text-xl sm:text-2xl font-bold text-white tracking-tight'
    };
    return sizes[this.size()];
  });

  protected onActionClick(): void {
    this.action.emit();
  }
}
