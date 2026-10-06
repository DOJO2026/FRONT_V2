export type ClaimStatus =
  | 'BORRADOR'
  | 'ENVIADO_POWER_AUTOMATE'
  | 'EN_APROBACION_OUTLOOK'
  | 'APROBADO'
  | 'RECHAZADO';

export type ClaimPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type ClaimCategory =
  | 'SLA & Infraestructura'
  | 'Facturación Cloud'
  | 'Acceso & Seguridad'
  | 'Pase a Producción Urgente';

export type PowerAutomateTriggerMode = 'OUTLOOK_EMAIL' | 'HTTP_WEBHOOK' | 'SIMULATION';

export interface ClaimUser {
  name: string;
  email: string;
  role: string;
}

export interface ClaimApproverResponse {
  approverName: string;
  approverEmail: string;
  outcome: 'Approve' | 'Reject';
  comments: string;
  respondedAt: string;
  channel: string;
}

export interface ClaimTimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  badge?: string;
}

export interface ClaimItem {
  id: string;
  title: string;
  category: ClaimCategory;
  priority: ClaimPriority;
  requestedBy: ClaimUser;
  approverEmail: string;
  amountOrImpact: string;
  justification: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  flowExecutionId?: string;
  approverResponse?: ClaimApproverResponse;
  timeline: ClaimTimelineItem[];
  rawPayload?: Record<string, unknown>;
}

export interface PowerAutomateConfig {
  triggerMode: PowerAutomateTriggerMode;
  outlookTriggerEmail: string;
  subjectKeyword: string;
  webhookUrl: string;
  simulationMode: boolean;
  lastPingSuccess: boolean | null;
  lastPingAt: string | null;
}
