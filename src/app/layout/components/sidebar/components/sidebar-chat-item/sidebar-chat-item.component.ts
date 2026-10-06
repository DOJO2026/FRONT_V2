import { Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { ChatConversation } from '../../../../../core/models/chat.model';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { AiIconComponent } from '../../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../../shared/ui/ai-tooltip';

@Component({
  selector: 'app-sidebar-chat-item',
  standalone: true,
  imports: [AiIconComponent, AiTooltipDirective],
  template: `
    @if (!chatState.sidebarCollapsed()) {
      <div
        (click)="onSelect()"
        [class]="itemClasses()"
        role="button"
        tabindex="0"
        (keydown.enter)="onSelect()"
      >
        <!-- Chat icon or Pinned indicator -->
        <div class="flex-shrink-0 text-slate-400 group-hover:text-white transition-colors">
          @if (chat().pinned) {
            <ai-icon name="sparkles" [size]="14" class="text-[var(--color-primary)]" />
          } @else {
            <ai-icon name="chat" [size]="14" />
          }
        </div>

        <!-- Title or Inline Edit Input -->
        @if (isEditing()) {
          <input
            #renameInput
            type="text"
            [value]="editTitle()"
            (click)="$event.stopPropagation()"
            (input)="onEditInput($event)"
            (keydown.enter)="saveRename()"
            (keydown.escape)="cancelRename()"
            (blur)="saveRename()"
            class="flex-1 min-w-0 bg-slate-900 border border-[var(--color-primary)] text-xs text-white px-2 py-0.5 rounded focus:outline-none"
          />
        } @else {
          <span class="flex-1 min-w-0 text-xs truncate" [class.font-medium]="isActive()">
            {{ chat().title }}
          </span>
        }

        <!-- Hover Actions (Pin, Rename, Delete) -->
        @if (!isEditing()) {
          <div class="hidden group-hover:flex items-center gap-0.5 ml-auto flex-shrink-0 text-slate-400">
            <!-- Pin / Unpin -->
            <button
              type="button"
              (click)="onTogglePin($event)"
              class="p-1 rounded hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              [aiTooltip]="chat().pinned ? 'Desfijar chat' : 'Fijar arriba'"
              tooltipPosition="top"
            >
              <ai-icon name="sparkles" [size]="12" [class.text-emerald-400]="chat().pinned" />
            </button>

            <!-- Rename -->
            <button
              type="button"
              (click)="startRename($event)"
              class="p-1 rounded hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aiTooltip="Renombrar"
              tooltipPosition="top"
            >
              <ai-icon name="copy" [size]="12" />
            </button>

            <!-- Delete -->
            <button
              type="button"
              (click)="onDelete($event)"
              class="p-1 rounded hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              aiTooltip="Eliminar chat"
              tooltipPosition="top"
            >
              <ai-icon name="x" [size]="12" />
            </button>
          </div>
        }
      </div>
    } @else {
      <!-- Collapsed Item Icon View -->
      <div
        (click)="onSelect()"
        [class]="collapsedItemClasses()"
        role="button"
        tabindex="0"
        (keydown.enter)="onSelect()"
        [aiTooltip]="chat().title"
        tooltipPosition="right"
      >
        <ai-icon
          [name]="chat().pinned ? 'sparkles' : 'chat'"
          [size]="16"
          [class.text-[var(--color-primary)]]="isActive() || chat().pinned"
        />
      </div>
    }
  `
})
export class SidebarChatItemComponent {
  readonly chat = input.required<ChatConversation>();

  protected readonly chatState = inject(ChatStateService);
  protected readonly isEditing = signal<boolean>(false);
  protected readonly editTitle = signal<string>('');

  protected readonly renameInputRef = viewChild<ElementRef<HTMLInputElement>>('renameInput');

  protected readonly isActive = computed(() => this.chatState.activeChatId() === this.chat().id);

  protected readonly itemClasses = computed(() => {
    const base =
      'group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer select-none';
    const active = this.isActive()
      ? 'bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] shadow-sm font-semibold'
      : 'text-[#475569] hover:text-[#002147] hover:bg-slate-100';

    return `${base} ${active}`;
  });

  protected readonly collapsedItemClasses = computed(() => {
    const base =
      'w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer select-none';
    const active = this.isActive()
      ? 'bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] shadow-sm'
      : 'text-[#475569] hover:text-[#002147] hover:bg-slate-100';

    return `${base} ${active}`;
  });

  protected onSelect(): void {
    if (!this.isEditing()) {
      this.chatState.selectChat(this.chat().id);
    }
  }

  protected onTogglePin(event: MouseEvent): void {
    event.stopPropagation();
    this.chatState.togglePin(this.chat().id);
  }

  protected onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.chatState.deleteChat(this.chat().id);
  }

  protected startRename(event: MouseEvent): void {
    event.stopPropagation();
    this.editTitle.set(this.chat().title);
    this.isEditing.set(true);
    setTimeout(() => {
      this.renameInputRef()?.nativeElement.focus();
    });
  }

  protected onEditInput(event: Event): void {
    this.editTitle.set((event.target as HTMLInputElement).value);
  }

  protected saveRename(): void {
    if (this.isEditing()) {
      this.chatState.renameChat(this.chat().id, this.editTitle());
      this.isEditing.set(false);
    }
  }

  protected cancelRename(): void {
    this.isEditing.set(false);
  }
}
