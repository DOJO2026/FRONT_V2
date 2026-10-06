import { ChatConversation } from '../../../core/models/chat.model';
import { ChatMessage } from '../../chat/models/chat-message.model';

export type HistoryStatusFilter = 'all' | 'active' | 'archived' | 'pinned';
export type HistoryDateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month';

export interface HistoryStats {
  totalSessions: number;
  activeSessions: number;
  archivedSessions: number;
  totalTokensUsed: number;
  totalCitedSources: number;
  avgPositiveFeedback: string;
}

export interface SessionAuditDetail {
  conversation: ChatConversation;
  messages: ChatMessage[];
  totalTokens: number;
  complianceScore: number;
  auditHash: string;
  citedDocuments: string[];
}
