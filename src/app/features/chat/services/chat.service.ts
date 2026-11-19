import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { SettingsService } from '../../../core/services/settings.service';
import {
  ChatMessage,
  ChatMessageApiResponse,
  ChatMessagesRequest,
  ChatValidationError,
  MessageSource,
  ScannedAttachment
} from '../models/chat-message.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly chatState = inject(ChatStateService);
  private readonly settingsService = inject(SettingsService);

  // Map of conversationId -> ChatMessage[]
  private readonly conversationStore = signal<Record<string, ChatMessage[]>>({});

  // Active generation states
  readonly isThinking = signal<boolean>(false);
  readonly thinkingStep = signal<string>('');
  readonly isStreaming = signal<boolean>(false);
  readonly streamingTokensPerSec = signal<number>(45);

  // Combined flag for active generation
  readonly isGenerating = computed(() => this.isThinking() || this.isStreaming());

  // Contextual attached documents for prompt
  readonly attachedDocs = signal<string[]>([]);

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

  // Loading and error state for messages
  readonly isLoadingMessages = signal(false);
  readonly messagesError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const conversationId = this.chatState.activeChatId();
      if (conversationId) {
        void this.loadConversationMessages(conversationId);
      }
    });
  }

  startClaimFlow(): void {
    const activeId = this.chatState.activeChatId();
    this.chatState.renameChat(activeId, 'Diagnóstico de Incidencia #INC-8942');
    this.sendMessage('Reportar una incidencia técnica en producción');
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

    // Detect and preserve existing claim workflow behavior locally.
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

    // The backend owns claim decisions and interactive response metadata.
    // Keep the local naming behavior, but remove mock response generation.
    const currentChat = this.chatState.conversations().find((c) => c.id === activeId);
    if (currentChat && currentChat.title === 'Nueva conversación') {
      const summaryTitle = content.length > 40 ? content.slice(0, 40) + '...' : content;
      this.chatState.renameChat(activeId, summaryTitle);
    }

    void this.postMessage(activeId, content.trim(), isClaimContext);
  }

  private async postMessage(conversationId: string, content: string, _isClaimContext: boolean): Promise<void> {
    const requestAttachedDocs = [...this.attachedDocs()];
    const request: ChatMessagesRequest = {
      conversationId,
      content,
      modelId: this.settingsService.selectedModel(),
      temperature: this.settingsService.temperature(),
      reasoningDepth: this.settingsService.reasoningDepth(),
      stream: this.settingsService.streamOutput(),
      attachedDocs: requestAttachedDocs
    };
    this.attachedDocs.set([]);

    this.isThinking.set(true);
    this.thinkingStep.set('Enviando consulta al agente...');

    try {
      const response = await fetch(`/api/v1/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': request.stream ? 'text/event-stream' : 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        await this.handleApiError(response);
        return;
      }

      if (request.stream) {
        await this.consumeStreamingResponse(conversationId, response);
      } else {
        const payload = await response.json() as ChatMessageApiResponse | { success?: boolean; data?: { message?: ChatMessageApiResponse } };
        const message = 'data' in payload && payload.data?.message
          ? payload.data.message
          : payload as ChatMessageApiResponse;
        this.isThinking.set(false);
        this.thinkingStep.set('');
        this.appendApiMessage(conversationId, message);
      }
    } catch (error) {
      this.appendApiError(conversationId, error instanceof Error ? error.message : 'No fue posible conectar con el agente.');
    } finally {
      if (!this.isStreaming()) {
        this.isThinking.set(false);
        this.thinkingStep.set('');
      }
    }
  }

  private async handleApiError(response: Response): Promise<void> {
    this.isThinking.set(false);
    this.thinkingStep.set('');

    if (response.status === 422) {
      try {
        const validation = await response.json() as ChatValidationError;
        const details = validation.detail?.map((item) => {
          const field = item.loc?.length ? item.loc.join('.') : 'Solicitud';
          return `${field}: ${item.msg}`;
        }).join('\n') || 'Los datos enviados no son válidos.';
        this.appendApiError(this.chatState.activeChatId(), `Error 422 — Datos inválidos\n${details}`);
        return;
      } catch {
        // Fall through to generic handling.
      }
    }

    let message = `El agente respondió con un error (${response.status}).`;
    try {
      const errorPayload = await response.json() as { detail?: unknown; error?: { message?: string }; message?: string };
      if (typeof errorPayload.detail === 'string') message = errorPayload.detail;
      if (errorPayload.error?.message) message = errorPayload.error.message;
      if (errorPayload.message) message = errorPayload.message;
    } catch {
      // Preserve the generic status message.
    }
    this.appendApiError(this.chatState.activeChatId(), message);
  }

  private appendApiError(conversationId: string, message: string): void {
    this.appendMessage(conversationId, {
      id: `ai-error-${Date.now()}`,
      conversationId,
      role: 'assistant',
      content: `⚠️ ${message}`,
      timestamp: this.getCurrentTimeString(),
      status: 'error'
    });
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

    this.conversationStore.update((store) => {
      const list = store[activeId] || [];
      return {
        ...store,
        [activeId]: list.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: `Documento adjunto preparado: **${file.name}**`,
                interactiveType: 'claim_scanned_result',
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

    this.attachedDocs.set([file.name]);
  }

  startNewCleanChat(): void {
    this.chatState.newChat();
  }

  private startThinkingSequence(_conversationId: string, _prompt: string): void {
    this.isThinking.set(true);
    this.thinkingStep.set('Enviando consulta al agente...');
  }

  private startStreamingResponse(_conversationId: string, _prompt: string): void {
    // Streaming is handled by consumeStreamingResponse() using the Azure backend SSE.
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
      void this.postMessage(activeId, prompt, false);
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

  private async consumeStreamingResponse(conversationId: string, response: Response): Promise<void> {
    if (!response.body) {
      this.appendApiError(conversationId, 'La respuesta streaming no contiene datos.');
      return;
    }

    const aiMsgId = `ai-${Date.now()}`;
    let accumulatedContent = '';
    let sources: MessageSource[] = [];

    this.isThinking.set(false);
    this.thinkingStep.set('');
    this.isStreaming.set(true);
    this.activeStreamingMessageId = aiMsgId;

    this.appendMessage(conversationId, {
      id: aiMsgId,
      conversationId,
      role: 'assistant',
      content: '',
      timestamp: this.getCurrentTimeString(),
      modelUsed: this.settingsService.currentModelDetails().name,
      status: 'streaming',
      sources: []
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let eventName = 'message';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      let dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        } else if (line === '') {
          if (dataLines.length) {
            const rawData = dataLines.join('\n');
            this.processStreamEvent(conversationId, aiMsgId, eventName, rawData,
              (delta) => { accumulatedContent += delta; },
              (nextSources) => { sources = nextSources; });
            dataLines = [];
            eventName = 'message';
          }
        }
      }
    }

    this.finalizeStreaming(conversationId, aiMsgId, accumulatedContent, sources);
  }

  private processStreamEvent(
    conversationId: string,
    aiMsgId: string,
    eventName: string,
    rawData: string,
    appendDelta: (delta: string) => void,
    setSources: (sources: MessageSource[]) => void
  ): void {
    try {
      const data = JSON.parse(rawData) as unknown;

      if (eventName === 'thinking') {
        const payload = data as { step?: string };
        if (payload.step) {
          this.thinkingStep.set(payload.step);
          this.isThinking.set(true);
          this.isStreaming.set(false);
        }
      } else if (eventName === 'sources') {
        const payload = Array.isArray(data) ? data : [];
        const mapped = payload.map((source: { title?: string; url?: string; id?: string; page?: number; snippet?: string; confidence?: number; category?: string }, index: number) => ({
          id: source.id || `src-api-${index}-${Date.now()}`,
          title: source.title || 'Fuente documental',
          url: source.url,
          page: source.page,
          snippet: source.snippet || '',
          confidence: source.confidence ?? 0,
          category: source.category
        }));
        setSources(mapped);
        this.updateMessageSources(conversationId, aiMsgId, mapped);
      } else if (eventName === 'token') {
        const payload = data as { delta?: string };
        if (payload.delta) {
          this.isThinking.set(false);
          this.isStreaming.set(true);
          appendDelta(payload.delta);
          const messages = this.conversationStore()[conversationId] || [];
          const current = messages.find((m) => m.id === aiMsgId)?.content || '';
          this.updateMessageContent(conversationId, aiMsgId, current + payload.delta, 'streaming');
        }
      } else if (eventName === 'done') {
        // Finalize after the stream loop completes so remaining chunks are preserved.
        this.isStreaming.set(false);
      }
    } catch {
      // Ignore malformed SSE events and continue consuming the stream.
    }
  }

  private appendApiMessage(conversationId: string, message: ChatMessageApiResponse): void {
    if (message.role === 'assistant') {
      this.appendMessage(conversationId, {
        id: `ai-${Date.now()}`,
        conversationId: message.conversationId || conversationId,
        role: 'assistant',
        content: message.content,
        timestamp: message.timestamp || this.getCurrentTimeString(),
        sources: message.sources?.map((source, index) => ({
          id: `src-api-${index}-${Date.now()}`,
          title: source.title,
          url: source.url,
          snippet: '',
          confidence: 0
        })) || [],
        status: message.status === 'error' ? 'error' : 'complete',
        feedback: message.feedback,
        modelUsed: message.modelUsed,
        interactiveType: message.interactiveType,
        claimDetails: message.claimDetails
      });
    }
  }

  private updateMessageSources(conversationId: string, messageId: string, sources: MessageSource[]): void {
    this.conversationStore.update((store) => {
      const list = store[conversationId] || [];
      return {
        ...store,
        [conversationId]: list.map((message) =>
          message.id === messageId ? { ...message, sources } : message
        )
      };
    });
  }

  async loadConversationMessages(conversationId: string): Promise<void> {
    this.isLoadingMessages.set(true);
    this.messagesError.set(null);

    try {
      const response = await fetch(
        `${environment.apiBaseUrl}/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        if (response.status === 422) {
          const validation = await response.json() as ChatValidationError;
          const details = validation.detail?.map((item) =>
            `${item.loc?.join('.') || 'id'}: ${item.msg}`
          ).join('\n') || 'El identificador de conversación no es válido.';
          throw new Error(`Error 422 — ${details}`);
        }
        throw new Error(`No fue posible cargar los mensajes (${response.status}).`);
      }

      const payload = await response.json() as ChatMessage[] | { data?: { messages?: ChatMessage[] }; messages?: ChatMessage[] };
      let messages: ChatMessage[];

      if (Array.isArray(payload)) {
        messages = payload;
      } else if (payload.data?.messages) {
        messages = payload.data.messages;
      } else {
        messages = payload.messages || [];
      }

      this.conversationStore.update((store) => ({
        ...store,
        [conversationId]: messages.map((message) => this.normalizeApiMessage(conversationId, message))
      }));
    } catch (error) {
      this.messagesError.set(error instanceof Error ? error.message : 'Error al cargar los mensajes.');
    } finally {
      this.isLoadingMessages.set(false);
    }
  }

  private normalizeApiMessage(conversationId: string, message: ChatMessage): ChatMessage {
    return {
      ...message,
      id: message.id || `msg-${Date.now()}-${Math.random()}`,
      conversationId: message.conversationId || conversationId,
      role: message.role === 'assistant' ? 'assistant' : 'user',
      timestamp: message.timestamp || this.getCurrentTimeString(),
      status: message.status || 'complete',
      sources: message.sources?.map((source, index) => ({
        id: source.id || `src-api-${index}-${Date.now()}`,
        title: source.title || 'Fuente documental',
        url: source.url,
        page: source.page,
        snippet: source.snippet || '',
        confidence: source.confidence ?? 0,
        category: source.category
      })) || []
    };
  }
}
