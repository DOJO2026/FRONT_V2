import { Injectable, computed, signal } from '@angular/core';
import {
  ClaimCategory,
  ClaimItem,
  ClaimPriority,
  ClaimStatus,
  PowerAutomateConfig,
  PowerAutomateTriggerMode
} from '../models/claim.model';

const STORAGE_KEY_CLAIMS = 'dojo_pa_claims_v2';
const STORAGE_KEY_CONFIG = 'dojo_pa_config_v2';

const INITIAL_MOCK_CLAIMS: ClaimItem[] = [
  {
    id: 'REC-2026-0842',
    title: 'Reclamo por degradación de SLA en Cluster EKS Producción',
    category: 'SLA & Infraestructura',
    priority: 'CRITICA',
    requestedBy: {
      name: 'Diego Bueno',
      email: 'diego.bueno@dojo.corp',
      role: 'Arquitecto Cloud & DevOps'
    },
    approverEmail: 'diego.bueno@ayesa.com',
    amountOrImpact: '$3,450 USD de penalización SLA acumulada',
    justification:
      'Incidente P1 con pérdida de paquetes por 42 minutos en nodos Core. Se solicita aprobación para nota de crédito a cliente corporativo y remediación prioritaria de topología.',
    status: 'EN_APROBACION_OUTLOOK',
    createdAt: '2026-10-06T09:15:00.000Z',
    updatedAt: '2026-10-06T09:16:30.000Z',
    flowExecutionId: 'pa-flow-run-8f3b299e-761a-4d32-9cb2-d39b8c04901f',
    timeline: [
      {
        id: 'tl-1',
        title: 'Reclamo Registrado en DOJO 2.0',
        description: 'Creado por Diego Bueno desde el módulo de Operaciones.',
        timestamp: '2026-10-06T09:15:00.000Z',
        type: 'info',
        badge: 'Origen DOJO'
      },
      {
        id: 'tl-2',
        title: 'Correo Disparador Despachado a Outlook',
        description: 'Correo enviado con asunto "[RECLAMO DOJO] #REC-2026-0842".',
        timestamp: '2026-10-06T09:16:20.000Z',
        type: 'info',
        badge: 'Outlook Trigger'
      },
      {
        id: 'tl-3',
        title: 'Esperando Aprobación en Outlook',
        description:
          'Tarjeta de aprobación generada por Power Automate para diego.bueno@ayesa.com.',
        timestamp: '2026-10-06T09:16:30.000Z',
        type: 'warning',
        badge: 'Outlook Approvals'
      }
    ]
  },
  {
    id: 'REC-2026-0791',
    title: 'Ajuste de facturación por over-provisioning en RDS Aurora',
    category: 'Facturación Cloud',
    priority: 'ALTA',
    requestedBy: {
      name: 'Diego Bueno',
      email: 'diego.bueno@dojo.corp',
      role: 'Arquitecto Cloud & DevOps'
    },
    approverEmail: 'diego.bueno@ayesa.com',
    amountOrImpact: '$1,820 USD de sobrecosto en snapshot réplicas',
    justification:
      'Error de retención de copias de seguridad automáticas en ambiente Staging. Se requiere aprobación financiera para compensación.',
    status: 'APROBADO',
    createdAt: '2026-10-05T14:10:00.000Z',
    updatedAt: '2026-10-05T14:45:12.000Z',
    flowExecutionId: 'pa-flow-run-41c09ab2-8812-4fe1-b841-ef12999da002',
    approverResponse: {
      approverName: 'Mariana Ríos (Gerencia Finanzas IT)',
      approverEmail: 'diego.bueno@ayesa.com',
      outcome: 'Approve',
      comments:
        'Aprobado. Se aplicó nota de ajuste contable en el balance mensual de AWS y se redujo la cuota de retención.',
      respondedAt: '2026-10-05T14:45:12.000Z',
      channel: 'Outlook Actionable Message'
    },
    timeline: [
      {
        id: 'tl-10',
        title: 'Reclamo Registrado en DOJO 2.0',
        description: 'Creado por Diego Bueno.',
        timestamp: '2026-10-05T14:10:00.000Z',
        type: 'info'
      },
      {
        id: 'tl-11',
        title: 'Flujo de Power Automate Activado',
        description: 'Flujo iniciado correctamente vía Outlook.',
        timestamp: '2026-10-05T14:10:45.000Z',
        type: 'info'
      },
      {
        id: 'tl-12',
        title: 'Aprobado en Correo Outlook',
        description: 'Aprobado con comentarios contables.',
        timestamp: '2026-10-05T14:45:12.000Z',
        type: 'success',
        badge: 'Aprobado'
      }
    ]
  },
  {
    id: 'REC-2026-0610',
    title: 'Solicitud de acceso de emergencia a Secrets Vault en Prod',
    category: 'Acceso & Seguridad',
    priority: 'MEDIA',
    requestedBy: {
      name: 'Diego Bueno',
      email: 'diego.bueno@dojo.corp',
      role: 'Arquitecto Cloud & DevOps'
    },
    approverEmail: 'diego.bueno@ayesa.com',
    amountOrImpact: 'Acceso temporal de 2 horas sin MFA de hardware',
    justification: 'Depuración de certificados vencidos en ingress gateway fuera de horario hábil.',
    status: 'RECHAZADO',
    createdAt: '2026-10-04T18:20:00.000Z',
    updatedAt: '2026-10-04T18:38:00.000Z',
    flowExecutionId: 'pa-flow-run-198032da-5410-410a-8ca1-9231401f8101',
    approverResponse: {
      approverName: 'Equipo de Ciberseguridad & SOC',
      approverEmail: 'diego.bueno@ayesa.com',
      outcome: 'Reject',
      comments:
        'Rechazado por política de cumplimiento ISO 27001. Debe usarse rotación automatizada mediante KMS sin elevación manual.',
      respondedAt: '2026-10-04T18:38:00.000Z',
      channel: 'Outlook Actionable Message'
    },
    timeline: [
      {
        id: 'tl-20',
        title: 'Reclamo Registrado en DOJO 2.0',
        description: 'Solicitud creada con perfil DevOps.',
        timestamp: '2026-10-04T18:20:00.000Z',
        type: 'info'
      },
      {
        id: 'tl-21',
        title: 'Rechazado en Correo Outlook',
        description: 'El aprobador denegó la solicitud según política de seguridad.',
        timestamp: '2026-10-04T18:38:00.000Z',
        type: 'danger',
        badge: 'Rechazado'
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
  private readonly claimsSignal = signal<ClaimItem[]>(this.loadClaimsFromStorage());
  private readonly configSignal = signal<PowerAutomateConfig>(this.loadConfigFromStorage());
  private readonly selectedClaimSignal = signal<ClaimItem | null>(null);
  private readonly isSubmittingSignal = signal<boolean>(false);
  private readonly filterStatusSignal = signal<string>('ALL');
  private readonly searchQuerySignal = signal<string>('');

  // Public readonly signals
  readonly claims = this.claimsSignal.asReadonly();
  readonly config = this.configSignal.asReadonly();
  readonly selectedClaim = this.selectedClaimSignal.asReadonly();
  readonly isSubmitting = this.isSubmittingSignal.asReadonly();
  readonly filterStatus = this.filterStatusSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();

  // Computed metrics
  readonly totalClaims = computed(() => this.claims().length);
  readonly pendingClaims = computed(
    () =>
      this.claims().filter(
        (c) => c.status === 'EN_APROBACION_OUTLOOK' || c.status === 'ENVIADO_POWER_AUTOMATE'
      ).length
  );
  readonly approvedClaims = computed(
    () => this.claims().filter((c) => c.status === 'APROBADO').length
  );
  readonly rejectedClaims = computed(
    () => this.claims().filter((c) => c.status === 'RECHAZADO').length
  );

  // Filtered claims list
  readonly filteredClaims = computed(() => {
    const list = this.claims();
    const status = this.filterStatusSignal();
    const query = this.searchQuerySignal().trim().toLowerCase();

    return list.filter((item) => {
      const matchesStatus =
        status === 'ALL' ||
        (status === 'PENDING' &&
          (item.status === 'EN_APROBACION_OUTLOOK' || item.status === 'ENVIADO_POWER_AUTOMATE')) ||
        (status === 'APPROVED' && item.status === 'APROBADO') ||
        (status === 'REJECTED' && item.status === 'RECHAZADO') ||
        (status === 'DRAFT' && item.status === 'BORRADOR');

      const matchesQuery =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.approverEmail.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  });

  constructor() {}

  setFilterStatus(status: string): void {
    this.filterStatusSignal.set(status);
  }

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  selectClaim(claim: ClaimItem | null): void {
    this.selectedClaimSignal.set(claim);
  }

  updateConfig(partial: Partial<PowerAutomateConfig>): void {
    const updated: PowerAutomateConfig = {
      ...this.configSignal(),
      ...partial
    };
    this.configSignal.set(updated);
    this.saveConfigToStorage(updated);
  }

  createClaim(input: {
    title: string;
    category: ClaimCategory;
    priority: ClaimPriority;
    approverEmail: string;
    amountOrImpact: string;
    justification: string;
    autoSend?: boolean;
  }): ClaimItem {
    const nextNum = 850 + this.claimsSignal().length;
    const ticketId = `REC-2026-0${nextNum}`;
    const now = new Date().toISOString();

    const newClaim: ClaimItem = {
      id: ticketId,
      title: input.title,
      category: input.category,
      priority: input.priority,
      requestedBy: {
        name: 'Diego Bueno',
        email: 'diego.bueno@dojo.corp',
        role: 'Arquitecto Cloud & DevOps'
      },
      approverEmail: input.approverEmail || this.configSignal().outlookTriggerEmail,
      amountOrImpact: input.amountOrImpact || 'Impacto Operativo Estándar',
      justification: input.justification,
      status: 'BORRADOR',
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          title: 'Reclamo Registrado en DOJO 2.0',
          description: `Creado por Diego Bueno para aprobación de ${input.approverEmail}`,
          timestamp: now,
          type: 'info',
          badge: 'Borrador'
        }
      ]
    };

    const currentList = [newClaim, ...this.claimsSignal()];
    this.claimsSignal.set(currentList);
    this.saveClaimsToStorage(currentList);

    if (input.autoSend) {
      if (this.configSignal().triggerMode === 'OUTLOOK_EMAIL') {
        this.dispatchViaOutlookEmail(newClaim.id);
      } else {
        this.sendToPowerAutomate(newClaim.id);
      }
    } else {
      this.selectedClaimSignal.set(newClaim);
    }

    return newClaim;
  }

  getOutlookMailData(claim: ClaimItem): {
    to: string;
    subject: string;
    body: string;
    webUrl: string;
    mailtoUrl: string;
  } {
    const config = this.configSignal();
    const recipient = config.outlookTriggerEmail || claim.approverEmail || 'diego.bueno@ayesa.com';
    const keyword = config.subjectKeyword || '[RECLAMO DOJO]';
    const subject = `${keyword} #${claim.id}: ${claim.title}`;
    const body = `SOLICITUD DE RECLAMO & APROBACIÓN DOJO 2.0
======================================================
Ticket ID: ${claim.id}
Categoría: ${claim.category}
Prioridad: ${claim.priority}
Impacto Operativo: ${claim.amountOrImpact}
Solicitante: ${claim.requestedBy.name} (${claim.requestedBy.email})

Justificación Técnica:
${claim.justification}

Enlace de Seguimiento en DOJO 2.0:
http://localhost:4200/claims

(Mensaje generado automáticamente para activar el flujo de Power Automate en Office 365 Outlook)`;

    const encTo = encodeURIComponent(recipient);
    const encSub = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);

    const webUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encTo}&subject=${encSub}&body=${encBody}`;
    const mailtoUrl = `mailto:${encTo}?subject=${encSub}&body=${encBody}`;

    return {
      to: recipient,
      subject,
      body,
      webUrl,
      mailtoUrl
    };
  }

  dispatchViaOutlookEmail(claimId: string): void {
    const claim = this.claimsSignal().find((c) => c.id === claimId);
    if (!claim) return;

    const emailData = this.getOutlookMailData(claim);

    // Intentar abrir el compositor web de Outlook en una pestaña nueva o mailto
    try {
      const newWin = window.open(emailData.webUrl, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        window.location.href = emailData.mailtoUrl;
      }
    } catch {
      window.location.href = emailData.mailtoUrl;
    }

    const now = new Date().toISOString();
    const updatedList = this.claimsSignal().map((item) => {
      if (item.id !== claimId) return item;

      const newTimeline = [...item.timeline];
      newTimeline.push({
        id: `tl-${Date.now()}-out`,
        title: 'Correo Disparador Preparado para Outlook',
        description: `Asunto: "${emailData.subject}". Al enviar este correo, tu flujo de Power Automate detectará la palabra clave y generará la tarjeta interactiva de aprobación.`,
        timestamp: now,
        type: 'warning',
        badge: 'Outlook Trigger'
      });

      return {
        ...item,
        status: 'EN_APROBACION_OUTLOOK' as ClaimStatus,
        updatedAt: now,
        timeline: newTimeline
      };
    });

    this.claimsSignal.set(updatedList);
    this.saveClaimsToStorage(updatedList);

    const updatedClaim = updatedList.find((c) => c.id === claimId) || null;
    this.selectedClaimSignal.set(updatedClaim);
  }

  async copyClaimEmailToClipboard(claimId: string): Promise<boolean> {
    const claim = this.claimsSignal().find((c) => c.id === claimId);
    if (!claim) return false;
    const data = this.getOutlookMailData(claim);
    const textToCopy = `Para: ${data.to}\nAsunto: ${data.subject}\n\n${data.body}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        return true;
      }
    } catch {
      // Fallback
    }
    return false;
  }

  async sendToPowerAutomate(claimId: string): Promise<{ success: boolean; message: string }> {
    const claim = this.claimsSignal().find((c) => c.id === claimId);
    if (!claim) {
      return { success: false, message: 'Reclamo no encontrado.' };
    }

    this.isSubmittingSignal.set(true);

    const config = this.configSignal();
    const payload = {
      ticketId: claim.id,
      title: claim.title,
      category: claim.category,
      priority: claim.priority,
      requestedBy: claim.requestedBy,
      approverEmail: claim.approverEmail,
      amountOrImpact: claim.amountOrImpact,
      justification: claim.justification,
      systemSource: 'DOJO 2.0 Frontend - Angular 20',
      timestamp: new Date().toISOString(),
      callbackWebhookUrl: 'https://api.dojo.corp/api/v1/claims/callback'
    };

    try {
      let flowExecutionId = `pa-flow-run-sim-${Date.now().toString(16)}`;
      let liveSuccess = false;

      // Si no estamos en modo simulación y hay una URL válida configurada, intentamos el webhook real
      if (!config.simulationMode && config.webhookUrl && config.webhookUrl.startsWith('http')) {
        try {
          const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (response.ok || response.status === 202 || response.status === 200) {
            liveSuccess = true;
            try {
              const resData = await response.json();
              if (resData.flowExecutionId) {
                flowExecutionId = resData.flowExecutionId;
              }
            } catch {
              // Si no devolvió json pero el status es 200/202
            }
          } else {
            console.warn('Power Automate returned non-200 code:', response.status);
          }
        } catch (fetchErr) {
          console.warn('Live Webhook call failed, falling back to simulated pipeline:', fetchErr);
        }
      } else {
        // Simular latencia de red realista de Power Automate
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const now = new Date().toISOString();
      const updatedList = this.claimsSignal().map((item) => {
        if (item.id !== claimId) return item;

        const newTimeline = [...item.timeline];
        newTimeline.push({
          id: `tl-${Date.now()}-2`,
          title: liveSuccess
            ? 'Enviado a Power Automate (Webhook en Vivo)'
            : 'Enviado al Disparador HTTP de Power Automate (Simulado)',
          description: liveSuccess
            ? `Petición HTTP POST aceptada por el flujo de Microsoft Power Automate.`
            : `Solicitud procesada con el esquema JSON oficial de DOJO 2.0.`,
          timestamp: now,
          type: 'info',
          badge: liveSuccess ? 'En Vivo' : 'Simulación'
        });

        newTimeline.push({
          id: `tl-${Date.now()}-3`,
          title: 'Notificación de Aprobación Enviada a Outlook',
          description: `Tarjeta de acción enviada a ${item.approverEmail}. Esperando decisión de Aprobar/Rechazar.`,
          timestamp: now,
          type: 'warning',
          badge: 'Outlook Actionable'
        });

        return {
          ...item,
          status: 'EN_APROBACION_OUTLOOK' as ClaimStatus,
          updatedAt: now,
          flowExecutionId,
          rawPayload: payload,
          timeline: newTimeline
        };
      });

      this.claimsSignal.set(updatedList);
      this.saveClaimsToStorage(updatedList);

      const updatedClaim = updatedList.find((c) => c.id === claimId) || null;
      this.selectedClaimSignal.set(updatedClaim);

      return {
        success: true,
        message: liveSuccess
          ? `Reclamo enviado con éxito al Webhook real de Power Automate. Correo despachado a ${claim.approverEmail}.`
          : `Reclamo enviado a Power Automate (Modo Simulación). Correo preparado para ${claim.approverEmail}.`
      };
    } finally {
      this.isSubmittingSignal.set(false);
    }
  }

  simulateOutlookDecision(
    claimId: string,
    outcome: 'Approve' | 'Reject',
    comments?: string
  ): void {
    const now = new Date().toISOString();
    const defaultComments =
      outcome === 'Approve'
        ? 'Aprobado desde el correo interactivo de Outlook con confirmación de impacto y SLA.'
        : 'Rechazado tras revisión en Outlook. No cumple con los criterios de excepción.';

    const updatedList = this.claimsSignal().map((item) => {
      if (item.id !== claimId) return item;

      const finalStatus: ClaimStatus = outcome === 'Approve' ? 'APROBADO' : 'RECHAZADO';
      const newTimeline = [...item.timeline];

      newTimeline.push({
        id: `tl-${Date.now()}-dec`,
        title:
          outcome === 'Approve'
            ? 'Aprobación Confirmada en Outlook'
            : 'Rechazo Registrado en Outlook',
        description: comments || defaultComments,
        timestamp: now,
        type: outcome === 'Approve' ? 'success' : 'danger',
        badge: outcome === 'Approve' ? 'Aprobado' : 'Rechazado'
      });

      return {
        ...item,
        status: finalStatus,
        updatedAt: now,
        approverResponse: {
          approverName: `${item.approverEmail.split('@')[0]} (Aprobador M365)`,
          approverEmail: item.approverEmail,
          outcome,
          comments: comments || defaultComments,
          respondedAt: now,
          channel: 'Outlook Actionable Message'
        },
        timeline: newTimeline
      };
    });

    this.claimsSignal.set(updatedList);
    this.saveClaimsToStorage(updatedList);

    const updatedClaim = updatedList.find((c) => c.id === claimId) || null;
    this.selectedClaimSignal.set(updatedClaim);
  }

  resetToMockData(): void {
    this.claimsSignal.set(INITIAL_MOCK_CLAIMS);
    this.saveClaimsToStorage(INITIAL_MOCK_CLAIMS);
    this.selectedClaimSignal.set(INITIAL_MOCK_CLAIMS[0]);
  }

  private loadClaimsFromStorage(): ClaimItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CLAIMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors and fallback
    }
    return INITIAL_MOCK_CLAIMS;
  }

  private saveClaimsToStorage(claims: ClaimItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(claims));
    } catch {
      // Storage quota or privacy mode
    }
  }

  private loadConfigFromStorage(): PowerAutomateConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          triggerMode: parsed.triggerMode || 'OUTLOOK_EMAIL',
          outlookTriggerEmail: parsed.outlookTriggerEmail || 'diego.bueno@ayesa.com',
          subjectKeyword: parsed.subjectKeyword || '[RECLAMO DOJO]',
          webhookUrl: parsed.webhookUrl || '',
          simulationMode: parsed.simulationMode ?? false,
          lastPingSuccess: parsed.lastPingSuccess ?? null,
          lastPingAt: parsed.lastPingAt ?? null
        };
      }
    } catch {
      // Ignore
    }
    return {
      triggerMode: 'OUTLOOK_EMAIL',
      outlookTriggerEmail: 'diego.bueno@ayesa.com',
      subjectKeyword: '[RECLAMO DOJO]',
      webhookUrl: '',
      simulationMode: false,
      lastPingSuccess: null,
      lastPingAt: null
    };
  }

  private saveConfigToStorage(config: PowerAutomateConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // Storage quota
    }
  }
}
