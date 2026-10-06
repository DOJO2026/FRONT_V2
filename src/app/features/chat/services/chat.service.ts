import { Injectable, computed, inject, signal } from '@angular/core';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { ClaimsService } from '../../claims/services/claims.service';
import { INITIAL_CHAT_MESSAGES_MOCK } from '../mocks/chat-messages.mock';
import { ChatMessage, MessageSource, ScannedAttachment } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly chatState = inject(ChatStateService);
  private readonly claimsService = inject(ClaimsService);

  // Map of conversationId -> ChatMessage[]
  private readonly conversationStore = signal<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES_MOCK);

  // Active generation states
  readonly isThinking = signal<boolean>(false);
  readonly thinkingStep = signal<string>('');
  readonly isStreaming = signal<boolean>(false);
  readonly streamingTokensPerSec = signal<number>(45);

  // Combined flag for active generation
  readonly isGenerating = computed(() => this.isThinking() || this.isStreaming());

  // Contextual attached documents for prompt
  readonly attachedDocs = signal<string[]>([
    'Contrato_Marco_Operaciones.pdf',
    'Anexo_SLA_2026.docx'
  ]);

  // Timers & active state tracking
  private thinkingTimeouts: ReturnType<typeof setTimeout>[] = [];
  private streamingInterval: ReturnType<typeof setInterval> | null = null;
  private activeStreamingMessageId: string | null = null;
  private activePendingSources: MessageSource[] = [];

  // Current conversation messages computed from activeChatId
  readonly activeMessages = computed(() => {
    const activeId = this.chatState.activeChatId();
    return this.conversationStore()[activeId] || [];
  });

  startClaimFlow(): void {
    const activeId = this.chatState.activeChatId();
    this.chatState.renameChat(activeId, 'Diagnóstico de Incidencia #INC-8942');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      conversationId: activeId,
      role: 'user',
      content: 'Reportar una incidencia técnica en producción',
      timestamp: this.getCurrentTimeString(),
      status: 'complete'
    };
    this.appendMessage(activeId, userMsg);

    this.isThinking.set(true);
    this.thinkingStep.set('Iniciando protocolo de atención de incidencias...');

    setTimeout(() => {
      this.isThinking.set(false);
      this.thinkingStep.set('');

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        conversationId: activeId,
        role: 'assistant',
        content: `Con gusto te asisto en el proceso de reporte y diagnóstico de incidencias de sistemas e infraestructura cloud.\n\nPor favor, **describe a continuación el problema técnico**: especifica el servicio o cluster afectado, la hora del fallo, el comportamiento anómalo (códigos 5xx, latencia, OOM) y el impacto operacional.`,
        timestamp: this.getCurrentTimeString(),
        modelUsed: 'Gemini 1.5 Pro • RAG',
        status: 'complete',
        interactiveType: 'claim_prompt_request',
        sources: [
          {
            id: `src-claim-1`,
            title: 'Manual_Operaciones_SRE_Kubernetes.pdf',
            page: 4,
            category: 'Gestión de Incidentes',
            confidence: 99,
            snippet: 'El equipo de operaciones registrará la incidencia consignando cluster, servicio impactado, ventana horaria y evidencias telemétricas.'
          }
        ]
      };
      this.appendMessage(activeId, assistantMsg);
    }, 700);
  }

  sendMessage(content: string): void {
    if (!content.trim() || this.isGenerating()) return;

    const activeId = this.chatState.activeChatId();
    const currentMessages = this.conversationStore()[activeId] || [];
    const lastAssistantMsg = [...currentMessages].reverse().find((m) => m.role === 'assistant');

    const userMsgId = `usr-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      conversationId: activeId,
      role: 'user',
      content: content.trim(),
      timestamp: this.getCurrentTimeString(),
      status: 'complete'
    };

    // Append user message immediately
    this.appendMessage(activeId, userMessage);

    // Detect if user is submitting their claim description
    const isClaimContext =
      lastAssistantMsg?.interactiveType === 'claim_prompt_request' ||
      content.toLowerCase().includes('incidencia') ||
      content.toLowerCase().includes('caída') ||
      content.toLowerCase().includes('error') ||
      content.toLowerCase().includes('latencia') ||
      content.toLowerCase().includes('spanner') ||
      content.toLowerCase().includes('gateway') ||
      content.toLowerCase().includes('cluster') ||
      content.toLowerCase().includes('fallo') ||
      content.toLowerCase().includes('bug');

    if (isClaimContext) {
      this.isThinking.set(true);
      this.thinkingStep.set('Analizando telemetría y diagnosticando impacto en cluster...');

      setTimeout(() => {
        this.isThinking.set(false);
        this.thinkingStep.set('');

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          conversationId: activeId,
          role: 'assistant',
          content: `Hemos recibido y registrado los detalles preliminares de tu incidencia técnica bajo el expediente provisional **#INC-2026-8942-PROD**.\n\nPara que nuestro equipo de **DevOps y SRE** pueda diagnosticar la causa raíz (RCA), aislar el impacto en microservicios y proceder a la mitigación dentro del SLA comprometido, **¿deseas adjuntar telemetría o evidencias de respaldo** (logs de error, volcados de trazas OpenTelemetry o capturas de monitoreo)?`,
          timestamp: this.getCurrentTimeString(),
          modelUsed: 'Gemini 1.5 Pro • RAG',
          status: 'complete',
          interactiveType: 'claim_ask_attachment',
          claimDetails: {
            claimNumber: 'INC-2026-8942-PROD',
            status: 'En Diagnóstico de Telemetría',
            description: content.trim(),
            policyNumber: '#SLA-TI-99421'
          },
          sources: [
            {
              id: `src-claim-evid-1`,
              title: 'Manual_Operaciones_SRE_Kubernetes.pdf',
              page: 11,
              category: 'Gestión de Incidentes Críticos',
              confidence: 97,
              snippet: 'La presentación de logs estructurados y métricas telemétricas con hash de autenticidad reduce el tiempo de resolución (MTTR) de 4 horas a menos de 15 minutos hábiles.'
            }
          ]
        };
        this.appendMessage(activeId, assistantMsg);
      }, 850);
      return;
    }

    // Update conversation title if it was "Nueva conversación"
    const currentChat = this.chatState.conversations().find((c) => c.id === activeId);
    if (currentChat && currentChat.title === 'Nueva conversación') {
      const summaryTitle = content.length > 40 ? content.slice(0, 40) + '...' : content;
      this.chatState.renameChat(activeId, summaryTitle);
    }

    // Start simulated AI Thinking sequence
    this.startThinkingSequence(activeId, content);
  }

  acceptClaimAttachment(messageId: string): void {
    const activeId = this.chatState.activeChatId();
    this.conversationStore.update((store) => {
      const list = store[activeId] || [];
      return {
        ...store,
        [activeId]: list.map((m) =>
          m.id === messageId
            ? {
                ...m,
                interactiveType: 'claim_uploader',
                attachmentState: {
                  isScanning: false,
                  isProcessed: false
                }
              }
            : m
        )
      };
    });
  }

  declineClaimAttachment(messageId: string): void {
    const activeId = this.chatState.activeChatId();
    this.conversationStore.update((store) => {
      const list = store[activeId] || [];
      return {
        ...store,
        [activeId]: list.map((m) =>
          m.id === messageId
            ? {
                ...m,
                interactiveType: undefined
              }
            : m
        )
      };
    });

    const confirmMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      conversationId: activeId,
      role: 'assistant',
      content: `Comprendido. Hemos radicado formalmente tu reclamo bajo el expediente **#REC-2026-8942-ALL** sin documentación adjunta.\n\nEl perito asignado evaluará tu declaración preliminar y, de ser necesario para la liquidación de la indemnización, se comunicará contigo al correo registrado en tu perfil corporativo. Puedes consultar el estado en cualquier momento.`,
      timestamp: this.getCurrentTimeString(),
      modelUsed: 'Gemini 1.5 Pro • RAG',
      status: 'complete'
    };
    this.appendMessage(activeId, confirmMsg);
  }

  finalizeScannedDocument(messageId: string, file: ScannedAttachment): void {
    const activeId = this.chatState.activeChatId();

    // Auto-registrar reclamo en ClaimsService y enviarlo a Power Automate
    const newClaim = this.claimsService.createClaim({
      title: `Reclamo generado por evidencia telemétrica: ${file.name}`,
      category: 'SLA & Infraestructura',
      priority: 'ALTA',
      approverEmail: this.claimsService.config().outlookTriggerEmail || 'diego.bueno@ayesa.com',
      amountOrImpact: file.ocrExtractedData?.declaredAmount || '$2,400 USD / RTO 12 min',
      justification: `Evidencia técnica escaneada y validada en DOJO AI con firma SHA-256 (${file.sha256}). Se requiere aprobación para compensación y remediación de SLA.`,
      autoSend: true
    });

    this.conversationStore.update((store) => {
      const list = store[activeId] || [];
      return {
        ...store,
        [activeId]: list.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: `¡Tu documento **${file.name}** ha sido escaneado, verificado con firma digital y registrado como reclamo oficial!\n\nHemos creado el ticket **#${newClaim.id}** y lo hemos enviado automáticamente a **Power Automate** para aprobación interactiva en Outlook.`,
                interactiveType: 'claim_scanned_result',
                claimDetails: {
                  claimNumber: newClaim.id,
                  status: 'EN_APROBACION_OUTLOOK',
                  description: newClaim.title
                },
                attachmentState: {
                  file,
                  isScanning: false,
                  isProcessed: true
                }
              }
            : m
        )
      };
    });

    if (!this.attachedDocs().includes(file.name)) {
      this.attachedDocs.update((docs) => [file.name, ...docs]);
    }
  }

  startNewCleanChat(): void {
    this.chatState.newChat();
  }

  private startThinkingSequence(conversationId: string, prompt: string): void {
    this.clearAllTimers();
    this.isThinking.set(true);
    this.isStreaming.set(false);
    this.thinkingStep.set('Buscando en base documental y Vector Store...');

    const t1 = setTimeout(() => {
      this.thinkingStep.set('Extrayendo cláusulas relevantes y citas textuales...');
    }, 800);

    const t2 = setTimeout(() => {
      this.thinkingStep.set('Sintetizando análisis ejecutivo con Copilot RAG...');
    }, 1600);

    const t3 = setTimeout(() => {
      this.isThinking.set(false);
      this.thinkingStep.set('');
      this.startStreamingResponse(conversationId, prompt);
    }, 2400);

    this.thinkingTimeouts = [t1, t2, t3];
  }

  private startStreamingResponse(conversationId: string, prompt: string): void {
    const aiMsgId = `ai-${Date.now()}`;
    this.activeStreamingMessageId = aiMsgId;

    // Generate contextual sources based on prompt
    this.activePendingSources = this.createContextualSources(prompt);

    // Target text to stream
    const targetText = this.createContextualAnswer(prompt);
    const words = targetText.split(' ');
    let currentWordIndex = 0;
    let accumulatedContent = '';

    // Create placeholder assistant message with streaming state
    const aiMessage: ChatMessage = {
      id: aiMsgId,
      conversationId,
      role: 'assistant',
      content: '',
      timestamp: this.getCurrentTimeString(),
      modelUsed: 'Gemini 1.5 Pro • RAG',
      status: 'streaming',
      sources: []
    };

    this.appendMessage(conversationId, aiMessage);
    this.isStreaming.set(true);

    // Stream tokens in rapid natural bursts (20-30ms)
    this.streamingInterval = setInterval(() => {
      if (currentWordIndex < words.length) {
        // Take 1 to 2 words per step for smooth reading pace
        const wordsToTake = Math.min(2, words.length - currentWordIndex);
        const chunk = words.slice(currentWordIndex, currentWordIndex + wordsToTake).join(' ');
        accumulatedContent += (accumulatedContent ? ' ' : '') + chunk;
        currentWordIndex += wordsToTake;

        // Update message content in real time
        this.updateMessageContent(conversationId, aiMsgId, accumulatedContent, 'streaming');
      } else {
        // Finished streaming full response
        this.finalizeStreaming(conversationId, aiMsgId, accumulatedContent, this.activePendingSources);
      }
    }, 28);
  }

  stopGeneration(): void {
    if (!this.isGenerating()) return;

    this.clearAllTimers();

    const activeId = this.chatState.activeChatId();
    const msgId = this.activeStreamingMessageId;

    if (msgId) {
      const messages = this.conversationStore()[activeId] || [];
      const current = messages.find((m) => m.id === msgId);
      if (current) {
        const haltedContent = current.content
          ? `${current.content}\n\n*(Generación detenida por el usuario)*`
          : '*(Generación detenida por el usuario)*';
        this.finalizeStreaming(activeId, msgId, haltedContent, this.activePendingSources);
      }
    }

    this.isThinking.set(false);
    this.isStreaming.set(false);
    this.thinkingStep.set('');
    this.activeStreamingMessageId = null;
  }

  private finalizeStreaming(
    conversationId: string,
    messageId: string,
    finalContent: string,
    sources: MessageSource[]
  ): void {
    this.clearAllTimers();
    this.isStreaming.set(false);
    this.activeStreamingMessageId = null;

    this.conversationStore.update((store) => {
      const list = store[conversationId] || [];
      return {
        ...store,
        [conversationId]: list.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: finalContent,
                status: 'complete',
                sources
              }
            : m
        )
      };
    });
  }

  private updateMessageContent(
    conversationId: string,
    messageId: string,
    content: string,
    status: 'streaming' | 'complete'
  ): void {
    this.conversationStore.update((store) => {
      const list = store[conversationId] || [];
      return {
        ...store,
        [conversationId]: list.map((m) =>
          m.id === messageId ? { ...m, content, status } : m
        )
      };
    });
  }

  private clearAllTimers(): void {
    this.thinkingTimeouts.forEach((t) => clearTimeout(t));
    this.thinkingTimeouts = [];
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
  }

  private createContextualSources(prompt: string): MessageSource[] {
    const lower = prompt.toLowerCase();
    const primaryDoc = this.attachedDocs()[0] || 'Base_Conocimiento_Corporativa.pdf';

    if (lower.includes('nosotros') || lower.includes('empresa') || lower.includes('dojo') || lower.includes('sistema')) {
      return [
        {
          id: `src-${Date.now()}-1`,
          title: 'Arquitectura_Plataforma_DOJO_2.0.pdf',
          page: 2,
          category: 'Arquitectura & Sistemas',
          confidence: 99,
          snippet: 'DOJO 2.0 es la plataforma inteligente para gestión de infraestructura cloud, observabilidad y orquestación de microservicios con soporte SLA 99.99%.'
        },
        {
          id: `src-${Date.now()}-2`,
          title: 'Runbook_Operaciones_Cloud_2026.pdf',
          page: 15,
          category: 'DevOps & SRE',
          confidence: 98,
          snippet: 'El copiloto DOJO AI analiza telemetría en tiempo real, correlaciona trazas OpenTelemetry y automatiza el diagnóstico de fallos críticos.'
        }
      ];
    }

    if (lower.includes('sla') || lower.includes('disponibilidad') || lower.includes('tiempo')) {
      return [
        {
          id: `src-${Date.now()}-1`,
          title: 'Anexo_SLA_2026.docx',
          page: 14,
          category: 'Acuerdos Operativos',
          confidence: 98,
          snippet: 'El umbral mínimo de disponibilidad de infraestructura crítica se establece en 99.95%, con un RTO máximo de 15 minutos.'
        },
        {
          id: `src-${Date.now()}-2`,
          title: 'Procedimiento_Escalado_Incidencias.pdf',
          page: 5,
          category: 'Protocolo de Soporte',
          confidence: 93,
          snippet: 'Toda degradación de servicio que supere los 10 minutos activará automáticamente la célula de respuesta de nivel 3.'
        }
      ];
    }

    if (lower.includes('seguridad') || lower.includes('ciberseguridad') || lower.includes('iso')) {
      return [
        {
          id: `src-${Date.now()}-1`,
          title: 'Auditoría_Seguridad_ISO27001.pdf',
          page: 22,
          category: 'Seguridad & Ciberdefensa',
          confidence: 97,
          snippet: 'Las autenticaciones de usuarios privilegiados requieren factores biométricos o llaves FIDO2 conforme a la norma ISO/IEC 27001:2022.'
        },
        {
          id: `src-${Date.now()}-2`,
          title: 'Politica_Retencion_Cero.pdf',
          page: 3,
          category: 'Privacidad de Datos',
          confidence: 94,
          snippet: 'Los registros de inferencia de modelos generativos no serán almacenados para reentrenamiento sin consentimiento expreso.'
        }
      ];
    }

    return [
      {
        id: `src-${Date.now()}-1`,
        title: primaryDoc,
        page: Math.floor(Math.random() * 20) + 1,
        category: 'RAG / Documento Principal',
        confidence: 96,
        snippet: `Sección relevante detectada para la consulta "${prompt.slice(0, 45)}...". Cumple con las normativas corporativas vigentes.`
      },
      {
        id: `src-${Date.now()}-2`,
        title: 'Guia_Cumplimiento_Gobierno_IA.pdf',
        page: 7,
        category: 'Gobierno de Datos',
        confidence: 92,
        snippet: 'Todas las decisiones asistidas por IA deben contar con supervisión humana y trazabilidad documental explícita.'
      }
    ];
  }

  private createContextualAnswer(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('nosotros') || lower.includes('empresa') || lower.includes('dojo') || lower.includes('sistema')) {
      return `### DOJO 2.0 • Plataforma Inteligente de Sistemas & Infraestructura Cloud

**DOJO 2.0** es la solución empresarial de nueva generación diseñada para monitorear, diagnosticar y orquestar ecosistemas tecnológicos de alta escala. Diseñada para arquitectos cloud, ingenieros DevOps y equipos de operaciones críticas (SRE).

### Capacidades Principales de DOJO 2.0
* **Observabilidad Unificada & Telemetría**: Integración en tiempo real con Prometheus, Grafana, OpenTelemetry y Datadog sobre más de **1,200 microservicios** distribuidos en 7 regiones cloud.
* **Diagnóstico Inteligente de Incidentes**: Reducción drástica del MTTR (*Mean Time to Resolution*) de 4 horas a menos de **15 minutos** mediante agentes IA que identifican cuellos de botella, bloqueos en bases de datos y fallos en API Gateways.
* **Garantía y Monitoreo de SLA**: Supervisión continua de umbrales 99.99% con alertas automatizadas y planes de contingencia ante degradación de latencia P99.
* **Arquitectura de Cero Fricción y Seguridad SOC2**: Cifrado AES-256 en reposo, TLS 1.3 en tránsito y cumplimiento exhaustivo de estándares ISO 27001 y SOC2 Tipo II.

¿Deseas consultar el estado de los clusters Kubernetes, revisar las métricas de latencia de bases de datos o reportar un incidente crítico?`;
    }

    if (lower.includes('sla') || lower.includes('disponibilidad')) {
      return `De acuerdo con el **Anexo de Niveles de Servicio (SLA 2026)** y la documentación técnica vinculada, he consolidado las condiciones vigentes:

### Resumen de Compromisos de Disponibilidad
* **Disponibilidad Comprometida**: 99.95% en régimen 24/7/365 para servicios críticos de misión empresarial.
* **Tiempo Objetivo de Recuperación (RTO)**: Menor o igual a **15 minutos** ante fallos de infraestructura en zona primaria.
* **Pérdida de Datos Tolerable (RPO)**: Reducida a **0 segundos** mediante replicación sincrónica multirregión.

### Penalizaciones Contractuales
* En caso de interrupción acumulada superior a 43 minutos en un mismo mes natural, se devengará una penalización automática del **8%** sobre la facturación mensual del módulo afectado.

¿Deseas que genere una matriz comparativa frente al ejercicio anterior o que redacte un correo ejecutivo para el comité de riesgos?`;
    }

    if (lower.includes('seguridad') || lower.includes('iso') || lower.includes('ciberseguridad')) {
      return `He contrastado tu consulta con el manual de **Auditoría de Seguridad y Cumplimiento ISO 27001:2022**:

### Parámetros de Seguridad Obligatorios
* **Cifrado en Tránsito y Reposo**: Todo flujo de telemetría e inferencia emplea AES-256 en reposo y TLS 1.3 con rotación de claves cada 90 días.
* **Control de Identidad SSO/IAM**: Acceso regulado mediante autenticación multifactor estricta (FIDO2) y principio de menor privilegio (*Least Privilege*).
* **Auditoría Inmutable**: Cualquier consulta sobre datos sensibles genera una entrada en el log central con hash SHA-256 indeleble.

### Recomendación Operativa
Se sugiere revisar los permisos de acceso de usuarios temporales antes del cierre de trimestre para evitar observaciones de auditoría externa.`;
    }

    return `He procesado tu consulta analizando los **documentos activos seleccionados** en el repositorio vectorial corporativo:

### Diagnóstico y Puntos Clave
* **Referencia analizada**: Se verificaron los acuerdos vigentes y políticas operacionales aplicables a tu solicitud.
* **Disposiciones principales**: Cualquier requerimiento detectado debe mantener estricto alineamiento con los lineamientos de cumplimiento y trazabilidad.
* **Garantía RAG**: La síntesis proviene directamente de los fragmentos recuperados con similitud de coseno superior a 0.88.

¿Requieres que elabore un desglose específico de las cláusulas citadas o exporte la minuta a PDF / Markdown?`;
  }

  private appendMessage(conversationId: string, msg: ChatMessage): void {
    this.conversationStore.update((store) => {
      const currentList = store[conversationId] || [];
      return {
        ...store,
        [conversationId]: [...currentList, msg]
      };
    });
  }

  provideFeedback(messageId: string, type: 'up' | 'down'): void {
    const activeId = this.chatState.activeChatId();
    this.conversationStore.update((store) => {
      const list = store[activeId] || [];
      return {
        ...store,
        [activeId]: list.map((m) =>
          m.id === messageId ? { ...m, feedback: m.feedback === type ? null : type } : m
        )
      };
    });
  }

  regenerate(messageId: string): void {
    this.stopGeneration();

    const activeId = this.chatState.activeChatId();
    const messages = this.conversationStore()[activeId] || [];
    const index = messages.findIndex((m) => m.id === messageId);
    if (index > 0 && messages[index - 1].role === 'user') {
      const prompt = messages[index - 1].content;
      // Remove old assistant message and trigger re-generation
      this.conversationStore.update((store) => ({
        ...store,
        [activeId]: messages.slice(0, index)
      }));

      this.isThinking.set(true);
      this.thinkingStep.set('Regenerando respuesta con nuevas ponderaciones RAG...');
      const t = setTimeout(() => {
        this.isThinking.set(false);
        this.thinkingStep.set('');
        this.startStreamingResponse(activeId, prompt);
      }, 1400);
      this.thinkingTimeouts = [t];
    }
  }

  addAttachedDoc(name: string): void {
    if (!name.trim() || this.attachedDocs().includes(name.trim())) return;
    this.attachedDocs.update((docs) => [...docs, name.trim()]);
  }

  removeAttachedDoc(name: string): void {
    this.attachedDocs.update((docs) => docs.filter((d) => d !== name));
  }

  private getCurrentTimeString(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
