import { Injectable, computed, signal } from '@angular/core';
import { ChatConversation, UserProfile } from '../models/chat.model';

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

  readonly conversations = signal<ChatConversation[]>([
    {
      id: 'chat-1',
      title: 'Diagnóstico de Caída en API Gateway y Spanner',
      updatedAt: '10:42 AM',
      dateGroup: 'Hoy',
      pinned: true,
      archived: false,
      messageCount: 14,
      category: 'Operaciones',
      modelUsed: 'Gemini 1.5 Pro • RAG',
      citedSourcesCount: 5,
      tokensUsed: 4210,
      positiveFeedbackCount: 4
    },
    {
      id: 'chat-2',
      title: 'Extracción de Métricas y Latencia P99 de Microservicios',
      updatedAt: '08:15 AM',
      dateGroup: 'Hoy',
      pinned: true,
      archived: false,
      messageCount: 8,
      category: 'Observabilidad',
      modelUsed: 'Gemini 1.5 Pro • RAG',
      citedSourcesCount: 3,
      tokensUsed: 2150,
      positiveFeedbackCount: 2
    },
    {
      id: 'chat-3',
      title: 'Auditoría de Cumplimiento Normativo SOC2 en Kubernetes',
      updatedAt: 'Ayer',
      dateGroup: 'Ayer',
      archived: false,
      messageCount: 22,
      category: 'Ciberseguridad',
      modelUsed: 'Gemini 1.5 Pro • RAG',
      citedSourcesCount: 7,
      tokensUsed: 6840,
      positiveFeedbackCount: 5
    },
    {
      id: 'chat-4',
      title: 'Resumen de Políticas de Ciberseguridad y WAF',
      updatedAt: 'Ayer',
      dateGroup: 'Ayer',
      archived: false,
      messageCount: 5,
      category: 'Ciberseguridad',
      modelUsed: 'Gemini 1.5 Flash',
      citedSourcesCount: 2,
      tokensUsed: 1420,
      positiveFeedbackCount: 1
    },
    {
      id: 'chat-5',
      title: 'Revisión de SLA de Infraestructura Cloud y Concurrencia',
      updatedAt: '3 días atrás',
      dateGroup: 'Últimos 7 días',
      archived: false,
      messageCount: 17,
      category: 'Infraestructura',
      modelUsed: 'Gemini 1.5 Pro • RAG',
      citedSourcesCount: 6,
      tokensUsed: 5120,
      positiveFeedbackCount: 4
    },
    {
      id: 'chat-6',
      title: 'Estrategia de Migración Multi-Cloud 2026',
      updatedAt: '5 días atrás',
      dateGroup: 'Últimos 7 días',
      archived: false,
      messageCount: 31,
      category: 'Operaciones',
      modelUsed: 'Gemini 1.5 Pro • RAG',
      citedSourcesCount: 8,
      tokensUsed: 9420,
      positiveFeedbackCount: 7
    },
    {
      id: 'chat-7',
      title: 'Optimización de Consultas BigQuery y Réplicas',
      updatedAt: '18 Feb',
      dateGroup: 'Mes anterior',
      archived: false,
      messageCount: 12,
      category: 'Bases de Datos',
      modelUsed: 'Gemini 1.5 Pro • RAG',
      citedSourcesCount: 4,
      tokensUsed: 3880,
      positiveFeedbackCount: 3
    },
    {
      id: 'chat-archived-1',
      title: 'Auditoría Anual de Privacidad GDPR 2025',
      updatedAt: '12 Ene',
      dateGroup: 'Mes anterior',
      archived: true,
      messageCount: 19,
      category: 'Legal',
      modelUsed: 'Gemini 1.5 Pro • RAG',
      citedSourcesCount: 6,
      tokensUsed: 5900,
      positiveFeedbackCount: 4
    },
    {
      id: 'chat-archived-2',
      title: 'Auditoría Forense de Logs y Acceso a Servidores',
      updatedAt: '05 Ene',
      dateGroup: 'Mes anterior',
      archived: true,
      messageCount: 10,
      category: 'Ciberseguridad',
      modelUsed: 'Gemma 2 27B',
      citedSourcesCount: 2,
      tokensUsed: 2750,
      positiveFeedbackCount: 2
    }
  ]);

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
