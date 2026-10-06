import { Component, inject } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { AiIconComponent } from '../../../../../shared/ui/ai-icon';

@Component({
  selector: 'app-sidebar-search',
  standalone: true,
  imports: [AiIconComponent],
  template: `
    @if (!chatState.sidebarCollapsed()) {
      <div class="px-3 pt-2 pb-1">
        <div class="relative flex items-center">
          <ai-icon
            name="search"
            [size]="14"
            class="absolute left-2.5 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            [value]="chatState.searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Buscar conversaciones..."
            class="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          @if (chatState.searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute right-2 text-slate-400 hover:text-white p-0.5 cursor-pointer flex items-center justify-center"
              aria-label="Limpiar búsqueda"
            >
              <ai-icon name="x" [size]="12" />
            </button>
          }
        </div>
      </div>
    }
  `
})
export class SidebarSearchComponent {
  protected readonly chatState = inject(ChatStateService);

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.chatState.searchQuery.set(value);
  }

  protected clearSearch(): void {
    this.chatState.searchQuery.set('');
  }
}
