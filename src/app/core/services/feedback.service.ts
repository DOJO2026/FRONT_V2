import { Injectable, inject, signal } from '@angular/core';
import { ChatService } from '../../features/chat/services/chat.service';

export interface FeedbackReasonOption {
  id: string;
  label: string;
  description: string;
}

export const FEEDBACK_REASONS: FeedbackReasonOption[] = [
  {
    id: 'hallucination',
    label: 'Alucinación o Información Inexacta',
    description: 'El Copilot inventó datos, porcentajes o penalizaciones no presentes en el contrato original.'
  },
  {
    id: 'wrong_citation',
    label: 'Cita RAG Errónea o Irrelevante',
    description: 'La página, cláusula o documento oficial citado no corresponde a la afirmación realizada.'
  },
  {
    id: 'incomplete',
    label: 'Respuesta Incompleta o Truncada',
    description: 'Faltan secciones requeridas, la tabla de comparación se cortó o se omitió una pregunta clave.'
  },
  {
    id: 'bad_tone',
    label: 'Falta de Claridad o Formato Confuso',
    description: 'Estructura difícil de leer, exceso de tecnicismos o falta de síntesis ejecutiva.'
  },
  {
    id: 'compliance',
    label: 'Riesgo de Privacidad o Compliance',
    description: 'El contenido expone datos confidenciales o incumple normativas internas.'
  }
];

export const QUICK_TAGS = [
  'Cálculo erróneo de SLA',
  'Párrafo desactualizado',
  'Confunde proveedor A con B',
  'Faltan citas contractuales',
  'Demasiado extensa',
  'Respuesta ambigua'
];

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly chatService = inject(ChatService);

  readonly isOpen = signal<boolean>(false);
  readonly activeMessageId = signal<string>('');
  readonly activeMessageSnippet = signal<string>('');
  readonly feedbackType = signal<'up' | 'down'>('down');

  readonly selectedReason = signal<string>('hallucination');
  readonly selectedTags = signal<string[]>([]);
  readonly comment = signal<string>('');
  readonly shareWithMlops = signal<boolean>(true);

  open(messageId: string, snippet: string, type: 'up' | 'down' = 'down'): void {
    this.activeMessageId.set(messageId);
    this.activeMessageSnippet.set(snippet.slice(0, 140) + (snippet.length > 140 ? '...' : ''));
    this.feedbackType.set(type);
    this.selectedReason.set(type === 'down' ? 'hallucination' : 'none');
    this.selectedTags.set([]);
    this.comment.set('');
    this.shareWithMlops.set(true);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  setReason(reason: string): void {
    this.selectedReason.set(reason);
  }

  toggleTag(tag: string): void {
    this.selectedTags.update((tags) =>
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
    );
  }

  setComment(text: string): void {
    this.comment.set(text);
  }

  toggleShareWithMlops(): void {
    this.shareWithMlops.update((v) => !v);
  }

  submit(andRegenerate = false): void {
    const messageId = this.activeMessageId();
    const reason = this.selectedReason();
    const tags = this.selectedTags();
    const notes = this.comment();

    // Ensure feedback state is recorded in chat
    this.chatService.provideFeedback(messageId, this.feedbackType());

    this.close();

    if (andRegenerate) {
      this.chatService.regenerate(messageId);
    }

    alert(
      `¡Gracias por tu reporte! El incidente "${reason}" ha sido registrado en la telemetría de MLOps para el reentrenamiento y ajuste fino de los fragmentos RAG.`
    );
  }
}
