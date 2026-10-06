import { booleanAttribute, Component, computed, input, signal } from '@angular/core';
import { AiIconComponent } from '../ai-icon/ai-icon.component';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarRole = 'user' | 'ai' | 'system';
export type AvatarStatus = 'online' | 'busy' | 'offline';

@Component({
  selector: 'ai-avatar',
  standalone: true,
  imports: [AiIconComponent],
  template: `
    <div class="relative inline-flex flex-shrink-0 select-none items-center justify-center">
      <div [class]="avatarClasses()" [attr.aria-label]="name() || role()">
        @if (src() && !imageError()) {
          <img
            [src]="src()"
            [alt]="name() || 'Avatar'"
            (error)="onImageError()"
            class="w-full h-full object-cover rounded-full"
          />
        } @else if (role() === 'ai') {
          <div class="flex items-center justify-center text-white font-bold select-none">
            <span class="tracking-normal text-center leading-none font-bold">D</span>
          </div>
        } @else if (initials()) {
          <span class="font-semibold text-white uppercase tracking-tight">
            {{ initials() }}
          </span>
        } @else {
          <div class="text-white flex items-center justify-center">
            <ai-icon name="user" [size]="iconSize()" />
          </div>
        }
      </div>

      <!-- Status indicator dot -->
      @if (status()) {
        <span
          class="absolute bottom-0 right-0 rounded-full ring-2 ring-[var(--color-surface)]"
          [class]="statusClasses()"
          [attr.title]="'Estado: ' + status()"
        ></span>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }
  `
})
export class AiAvatarComponent {
  readonly src = input<string | null>(null);
  readonly name = input<string>('');
  readonly role = input<AvatarRole>('user');
  readonly size = input<AvatarSize>('md');
  readonly status = input<AvatarStatus | null>(null);
  readonly bordered = input<boolean, boolean | ''>(false, { transform: booleanAttribute });

  protected readonly imageError = signal(false);

  protected onImageError(): void {
    this.imageError.set(true);
  }

  protected readonly initials = computed(() => {
    const raw = this.name().trim();
    if (!raw) return 'DB';
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.substring(0, 2).toUpperCase();
  });

  protected readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'xs':
        return 12;
      case 'sm':
        return 14;
      case 'md':
        return 18;
      case 'lg':
        return 22;
      case 'xl':
        return 28;
    }
  });

  protected readonly avatarClasses = computed(() => {
    const base = 'rounded-full flex items-center justify-center overflow-hidden transition-all';

    const sizes: Record<AvatarSize, string> = {
      xs: 'w-6 h-6 text-[11px]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm font-semibold',
      lg: 'w-12 h-12 text-base font-bold',
      xl: 'w-16 h-16 text-xl font-bold'
    };

    let roleBg = '';
    if (this.role() === 'ai') {
      roleBg = 'bg-[#002654] text-white shadow-sm';
    } else if (this.role() === 'system') {
      roleBg = 'bg-blue-100 border border-blue-300 text-blue-800';
    } else {
      roleBg = 'bg-[#003781] text-white shadow-sm';
    }

    const borderClass = this.bordered()
      ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-surface)]'
      : '';

    return `${base} ${sizes[this.size()]} ${roleBg} ${borderClass}`;
  });

  protected readonly statusClasses = computed(() => {
    const dotSizes: Record<AvatarSize, string> = {
      xs: 'w-1.5 h-1.5 translate-x-0.5 translate-y-0.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4'
    };

    const statusColors: Record<AvatarStatus, string> = {
      online: 'bg-[var(--color-success)] shadow-[0_0_6px_rgba(16,185,129,0.8)]',
      busy: 'bg-[var(--color-danger)]',
      offline: 'bg-slate-500'
    };

    const st = this.status();
    return st ? `${dotSizes[this.size()]} ${statusColors[st]}` : '';
  });
}
