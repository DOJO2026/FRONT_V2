export type DateGroup = 'Hoy' | 'Ayer' | 'Últimos 7 días' | 'Mes anterior';

export interface ChatConversation {
  id: string;
  title: string;
  updatedAt: string;
  dateGroup: DateGroup;
  pinned?: boolean;
  archived?: boolean;
  messageCount?: number;
  category?: 'Legal' | 'Operaciones' | 'Ciberseguridad' | 'Finanzas' | 'General' | 'Observabilidad' | 'Infraestructura' | 'Bases de Datos';
  modelUsed?: string;
  citedSourcesCount?: number;
  tokensUsed?: number;
  positiveFeedbackCount?: number;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
  status: 'online' | 'busy' | 'offline';
  tokensUsed: number;
  tokenLimit: number;
}
