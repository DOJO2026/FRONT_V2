import { Component, computed, inject } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { SidebarChatItemComponent } from '../sidebar-chat-item/sidebar-chat-item.component';
import { AiEmptyStateComponent } from '../../../../../shared/ui/ai-empty-state';

@Component({
  selector: 'app-sidebar-chat-list',
  standalone: true,
  imports: [SidebarChatItemComponent, AiEmptyStateComponent],
  template: `
    <div class="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-4 no-scrollbar">
      @if (chatState.filteredConversations().length === 0) {
        <div class="py-8">
          <ai-empty-state
            icon="search"
            tone="muted"
            size="sm"
            title="Sin coincidencias"
            description="No encontramos chats con ese término."
            actionText="Limpiar"
            actionVariant="secondary"
            (action)="clearSearch()"
          />
        </div>
      } @else {
        @for (group of groupKeys(); track group) {
          <div class="flex flex-col gap-1">
            @if (!chatState.sidebarCollapsed()) {
              <span class="px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] select-none">
                {{ group }}
              </span>
            } @else {
              <div class="w-8 mx-auto border-t border-[var(--color-border)] my-1"></div>
            }

            <div class="flex flex-col gap-0.5">
              @for (chat of chatState.groupedConversations()[group]; track chat.id) {
                <app-sidebar-chat-item [chat]="chat" />
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class SidebarChatListComponent {
  protected readonly chatState = inject(ChatStateService);

  protected readonly groupKeys = computed(() => {
    return Object.keys(this.chatState.groupedConversations());
  });

  protected clearSearch(): void {
    this.chatState.searchQuery.set('');
  }
}
