import { Component, computed, inject } from '@angular/core';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { AiButtonComponent } from '../../../shared/ui/ai-button';
import { AiIconComponent } from '../../../shared/ui/ai-icon';
import { SidebarChatListComponent } from './components/sidebar-chat-list/sidebar-chat-list.component';
import { SidebarFooterComponent } from './components/sidebar-footer/sidebar-footer.component';
import { SidebarLogoComponent } from './components/sidebar-logo/sidebar-logo.component';
import { SidebarSearchComponent } from './components/sidebar-search/sidebar-search.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    SidebarLogoComponent,
    SidebarSearchComponent,
    SidebarChatListComponent,
    SidebarFooterComponent,
    AiButtonComponent,
    AiIconComponent
  ],
  template: `
    <!-- Backdrop Overlay when Drawer is Open -->
    @if (!chatState.sidebarCollapsed() || chatState.mobileMenuOpen()) {
      <div
        class="fixed inset-0 bg-blue-950/30 backdrop-blur-xs z-40 transition-opacity"
        (click)="chatState.toggleSidebar()"
      ></div>
    }

    <!-- Sidebar Container (Drawer style) -->
    <aside [class]="sidebarClasses()">
      <!-- Brand Logo & Header -->
      <app-sidebar-logo />

      <!-- New Chat Button Action -->
      <div class="px-3 pt-3 pb-1">
        <ai-button
          variant="primary"
          fullWidth
          size="md"
          (click)="chatState.newChat()"
          class="shadow-sm transition-all"
        >
          <ai-icon name="plus" [size]="16" />
          <span class="font-semibold tracking-wide">Nuevo Chat</span>
        </ai-button>
      </div>

      <!-- Search Box -->
      <app-sidebar-search />

      <!-- Scrollable History of Chats -->
      <app-sidebar-chat-list />

      <!-- User Profile & Metric Quota Footer -->
      <app-sidebar-footer />
    </aside>
  `
})
export class SidebarComponent {
  protected readonly chatState = inject(ChatStateService);

  protected readonly sidebarClasses = computed(() => {
    const base =
      'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-[#dbe6f0] shadow-2xl transition-all duration-300 ease-in-out flex-shrink-0 w-80';
    const isOpen = !this.chatState.sidebarCollapsed() || this.chatState.mobileMenuOpen();
    return `${base} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
  });
}
