import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChatConversation } from '../../../core/models/chat.model';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { ChatService } from '../../chat/services/chat.service';
import { HistoryDateFilter, HistoryStats, HistoryStatusFilter } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly chatState = inject(ChatStateService);
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);

  readonly statusFilter = signal<HistoryStatusFilter>('all');
  readonly categoryFilter = signal<string>('Todas');
  readonly searchQuery = signal<string>('');
  readonly dateFilter = signal<HistoryDateFilter>('all');
  readonly selectedSessionForAudit = signal<ChatConversation | null>(null);

  readonly allSessions = computed(() => this.chatState.conversations());

  readonly filteredSessions = computed(() => {
    let list = this.allSessions();
    const status = this.statusFilter();
    const cat = this.categoryFilter();
    const q = this.searchQuery().trim().toLowerCase();
    const date = this.dateFilter();

    // Status filter
    if (status === 'active') {
      list = list.filter((c) => !c.archived);
    } else if (status === 'archived') {
      list = list.filter((c) => !!c.archived);
    } else if (status === 'pinned') {
      list = list.filter((c) => !!c.pinned);
    }

    // Category filter
    if (cat !== 'Todas') {
      list = list.filter((c) => c.category === cat);
    }

    // Date group filter
    if (date === 'today') {
      list = list.filter((c) => c.dateGroup === 'Hoy');
    } else if (date === 'yesterday') {
      list = list.filter((c) => c.dateGroup === 'Ayer');
    } else if (date === 'week') {
      list = list.filter((c) => c.dateGroup === 'Últimos 7 días' || c.dateGroup === 'Hoy' || c.dateGroup === 'Ayer');
    } else if (date === 'month') {
      list = list.filter((c) => c.dateGroup === 'Mes anterior');
    }

    // Search query
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.modelUsed?.toLowerCase().includes(q)
      );
    }

    return list;
  });

  readonly stats = computed<HistoryStats>(() => {
    const list = this.allSessions();
    const total = list.length;
    const archived = list.filter((c) => c.archived).length;
    const active = total - archived;
    const totalTokens = list.reduce((acc, c) => acc + (c.tokensUsed || 2400), 0);
    const totalSources = list.reduce((acc, c) => acc + (c.citedSourcesCount || 3), 0);
    const positiveVotes = list.reduce((acc, c) => acc + (c.positiveFeedbackCount || 2), 0);

    return {
      totalSessions: total,
      activeSessions: active,
      archivedSessions: archived,
      totalTokensUsed: totalTokens,
      totalCitedSources: totalSources,
      avgPositiveFeedback: '96.8%'
    };
  });

  setStatusFilter(status: HistoryStatusFilter): void {
    this.statusFilter.set(status);
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter.set(category);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setDateFilter(date: HistoryDateFilter): void {
    this.dateFilter.set(date);
  }

  openAuditDrawer(conv: ChatConversation): void {
    this.selectedSessionForAudit.set(conv);
  }

  closeAuditDrawer(): void {
    this.selectedSessionForAudit.set(null);
  }

  openInChat(convId: string): void {
    this.chatState.selectChat(convId);
    this.closeAuditDrawer();
    this.router.navigate(['/']);
  }

  toggleArchive(convId: string): void {
    this.chatState.toggleArchive(convId);
    if (this.selectedSessionForAudit()?.id === convId) {
      const updated = this.allSessions().find((c) => c.id === convId);
      if (updated) this.selectedSessionForAudit.set(updated);
    }
  }

  togglePin(convId: string): void {
    this.chatState.togglePin(convId);
  }

  deleteSession(convId: string): void {
    this.chatState.deleteChat(convId);
    if (this.selectedSessionForAudit()?.id === convId) {
      this.closeAuditDrawer();
    }
  }
}
