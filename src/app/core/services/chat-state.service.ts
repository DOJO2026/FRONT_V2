import { Injectable, computed, signal } from '@angular/core';
import { ChatConversation, UserProfile } from '../models/chat.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  readonly sidebarCollapsed = signal<boolean>(true);
  readonly mobileMenuOpen = signal<boolean>(false);

  readonly userProfile = signal<UserProfile>({
    name: 'Diego Bueno',
    role: 'Arquitecto Cloud & DevOps · DOJO 2.0',
    email: 'diego.bueno@dojo.corp',
    status: 'online',
    tokensUsed: 42350,
    tokenLimit: 100000
  });

  readonly searchQuery = signal<string>('');
  readonly activeChatId = signal<string>('chat-1');

  readonly conversations = signal<ChatConversation[]>([]);
  readonly isLoadingConversations = signal(false);
  readonly conversationsError = signal<string | null>(null);

  readonly filteredConversations = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.conversations().filter((c) => !c.archived);
    if (!query) return list;
    return list.filter((c) => c.title.toLowerCase().includes(query));
  });

  readonly groupedConversations = computed(() => {
    const list = this.filteredConversations();
    const groups: { [key: string]: ChatConversation[] } = {};

    // Prioritize pinned if no search
    const isSearching = !!this.searchQuery().trim();

    for (const chat of list) {
      const groupKey = !isSearching && chat.pinned ? 'Fijados' : chat.dateGroup;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(chat);
    }

    return groups;
  });

  constructor() {
    void this.loadConversations({ archived: false });
  }

  async loadConversations(query: ConversationsQuery = {}): Promise<void> {
    this.isLoadingConversations.set(true);
    this.conversationsError.set(null);

    try {
      const params = new URLSearchParams();
      if (query.archived !== undefined) params.set('archived', String(query.archived));
      if (query.category?.trim()) params.set('category', query.category.trim());
      if (query.title?.trim()) params.set('title', query.title.trim());

      const queryString = params.toString();
      const url = `${environment.apiBaseUrl}/api/v1/chat/conversations${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 422) {
          const validation = await response.json() as ConversationValidationError;
          const message = validation.detail?.map((item) =>
            `${item.loc?.join('.') || 'Parámetro'}: ${item.msg}`
          ).join('\n') || 'Los parámetros de consulta no son válidos.';
          throw new Error(message);
        }
        throw new Error(`No fue posible cargar las conversaciones (${response.status}).`);
      }

      const payload = await response.json() as ChatConversation[] | { data?: ChatConversation[]; conversations?: ChatConversation[] };
      const conversations = Array.isArray(payload)
        ? payload
        : payload.data || payload.conversations || [];

      this.conversations.set(conversations.map((conversation) => this.normalizeConversation(conversation)));
      if (!this.conversations().some((conversation) => conversation.id === this.activeChatId())) {
        const first = this.conversations()[0];
        if (first) this.activeChatId.set(first.id);
      }
    } catch (error) {
      this.conversationsError.set(error instanceof Error ? error.message : 'Error al cargar las conversaciones.');
      this.conversations.set([]);
    } finally {
      this.isLoadingConversations.set(false);
    }
  }

  private normalizeConversation(conversation: ChatConversation): ChatConversation {
    return {
      ...conversation,
      id: String(conversation.id),
      title: conversation.title || 'Conversación sin título',
      updatedAt: conversation.updatedAt || 'Ahora',
      dateGroup: conversation.dateGroup || 'Hoy',
      archived: conversation.archived ?? false
    };
  }

  toggleArchive(id: string): void {
    this.conversations.update((list) =>
      list.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c))
    );
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  selectChat(id: string): void {
    this.activeChatId.set(id);
    this.closeMobileMenu();
  }

  newChat(): void {
    const newId = `chat-${Date.now()}`;
    const newChat: ChatConversation = {
      id: newId,
      title: 'Nueva conversación',
      updatedAt: 'Ahora',
      dateGroup: 'Hoy',
      messageCount: 0
    };

    this.conversations.update((list) => [newChat, ...list]);
    this.activeChatId.set(newId);
    this.closeMobileMenu();
  }

  togglePin(id: string): void {
    this.conversations.update((list) =>
      list.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }

  deleteChat(id: string): void {
    this.conversations.update((list) => list.filter((c) => c.id !== id));
    if (this.activeChatId() === id) {
      const remaining = this.conversations();
      if (remaining.length > 0) {
        this.activeChatId.set(remaining[0].id);
      } else {
        this.newChat();
      }
    }
  }

  renameChat(id: string, newTitle: string): void {
    if (!newTitle.trim()) return;
    this.conversations.update((list) =>
      list.map((c) => (c.id === id ? { ...c, title: newTitle.trim() } : c))
    );
  }
}

export interface ConversationsQuery {
  archived?: boolean;
  category?: string;
  title?: string;
}

export interface ConversationValidationError {
  detail: Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
  }>;
}
