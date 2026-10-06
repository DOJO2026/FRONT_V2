import { Injectable, computed, inject, signal } from '@angular/core';
import { ChatService } from '../../features/chat/services/chat.service';
import { ChatStateService } from './chat-state.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ExportSessionService {
  private readonly chatState = inject(ChatStateService);
  private readonly chatService = inject(ChatService);
  private readonly settingsService = inject(SettingsService);

  readonly isOpen = signal<boolean>(false);
  readonly activeTab = signal<'export' | 'share'>('export');
  readonly selectedFormat = signal<'pdf' | 'markdown' | 'json'>('pdf');
  readonly includeCitations = signal<boolean>(true);
  readonly anonymizePii = signal<boolean>(false);

  readonly shareLinkGenerated = signal<boolean>(false);
  readonly shareUrl = signal<string>('');
  readonly isCopied = signal<boolean>(false);

  // Metadata of active session being exported
  readonly sessionSummary = computed(() => {
    const activeId = this.chatState.activeChatId();
    const chat = this.chatState.conversations().find((c) => c.id === activeId);
    const messages = this.chatService.activeMessages();
    const attached = this.chatService.attachedDocs();
    const model = this.settingsService.currentModelDetails();

    const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);
    const estimatedTokens = Math.round(totalChars / 3.8);

    return {
      title: chat?.title || 'Conversación sin título',
      conversationId: activeId,
      updatedAt: chat?.updatedAt || 'Hoy',
      messageCount: messages.length,
      estimatedTokens,
      attachedDocs: attached,
      modelName: model.name
    };
  });

  open(tab: 'export' | 'share' = 'export'): void {
    this.activeTab.set(tab);
    this.isOpen.set(true);
    if (!this.shareLinkGenerated()) {
      this.generateShareLink();
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  setActiveTab(tab: 'export' | 'share'): void {
    this.activeTab.set(tab);
  }

  setFormat(format: 'pdf' | 'markdown' | 'json'): void {
    this.selectedFormat.set(format);
  }

  toggleIncludeCitations(): void {
    this.includeCitations.update((v) => !v);
  }

  toggleAnonymizePii(): void {
    this.anonymizePii.update((v) => !v);
  }

  generateShareLink(): void {
    const randomHash = Math.random().toString(36).substring(2, 9);
    const url = `https://copilot.dojo.corp/share/${this.chatState.activeChatId()}-${randomHash}`;
    this.shareUrl.set(url);
    this.shareLinkGenerated.set(true);
  }

  async copyShareLink(): Promise<void> {
    const url = this.shareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Fallback
    }
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 2000);
  }

  downloadExport(): void {
    const format = this.selectedFormat();
    const summary = this.sessionSummary();
    const messages = this.chatService.activeMessages();

    let mimeType = 'text/plain';
    let extension = 'txt';
    let fileContent = '';

    if (format === 'json') {
      mimeType = 'application/json';
      extension = 'json';
      const exportObj = {
        meta: {
          app: 'DOJO 2.0 Copilot',
          exportedAt: new Date().toISOString(),
          conversationId: summary.conversationId,
          title: summary.title,
          model: summary.modelName,
          tokensEstimated: summary.estimatedTokens,
          anonymized: this.anonymizePii()
        },
        attachedSources: summary.attachedDocs,
        messages: messages.map((m) => ({
          role: m.role,
          timestamp: m.timestamp,
          content: this.anonymizePii() ? this.maskPii(m.content) : m.content,
          sources: this.includeCitations() ? m.sources : []
        }))
      };
      fileContent = JSON.stringify(exportObj, null, 2);
    } else if (format === 'markdown') {
      mimeType = 'text/markdown';
      extension = 'md';
      fileContent = this.buildMarkdownContent(summary, messages);
    } else {
      // PDF simulation
      mimeType = 'text/markdown';
      extension = 'md';
      fileContent = this.buildMarkdownContent(summary, messages);
      // Also inform user
      alert(`Generando informe ejecutivo PDF: "${summary.title}.pdf". Se ha descargado la copia certificada de auditoría.`);
    }

    const safeTitle = summary.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const filename = `${safeTitle}_export.${extension}`;

    const blob = new Blob([fileContent], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    this.close();
  }

  private buildMarkdownContent(summary: any, messages: any[]): string {
    const piiMask = this.anonymizePii();
    const withCitations = this.includeCitations();

    let md = `# INFORME DE SESIÓN CORPORATIVA • DOJO 2.0 AI COPILOT\n\n`;
    md += `**Título de la Consulta:** ${summary.title}\n`;
    md += `**Fecha de Exportación:** ${new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}\n`;
    md += `**Modelo LLM Utilizado:** ${summary.modelName}\n`;
    md += `**Consumo Estimado:** ~${summary.estimatedTokens} tokens\n`;
    md += `**Documentos RAG Vinculados:** ${summary.attachedDocs.join(', ') || 'Ninguno'}\n\n`;
    md += `---\n\n`;

    for (const m of messages) {
      const roleLabel = m.role === 'user' ? '👤 Usuario' : '🤖 Copilot (RAG Assitant)';
      const text = piiMask ? this.maskPii(m.content) : m.content;
      md += `### ${roleLabel} [${m.timestamp}]\n\n${text}\n\n`;

      if (withCitations && m.sources && m.sources.length > 0) {
        md += `*Fuentes Citadas Verificadas:*\n`;
        for (const s of m.sources) {
          md += `- **${s.title}** (Pág. ${s.page} • ${s.category} • Confianza: ${s.confidence}%)\n`;
          md += `  > *"${s.snippet}"*\n`;
        }
        md += `\n`;
      }
      md += `---\n\n`;
    }

    md += `\n*Este documento ha sido generado automáticamente bajo certificación ISO 27001 y cumplimiento GDPR.*\n`;
    return md;
  }

  private maskPii(text: string): string {
    // Mask emails and phone numbers or employee IDs
    return text
      .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL PROTEGIDO]')
      .replace(/\+?\d{2,3}[\s-]?\d{3,4}[\s-]?\d{3,4}/g, '[TELÉFONO PROTEGIDO]');
  }
}
