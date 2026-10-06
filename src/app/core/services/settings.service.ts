import { Injectable, computed, signal } from '@angular/core';

export interface ModelOption {
  id: string;
  name: string;
  tagline: string;
  contextWindow: string;
  badge: string;
  badgeColor: string;
  isRecommended?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    tagline: 'Razonamiento complejo, diagnóstico de infraestructura y correlación de telemetría RAG.',
    contextWindow: '2M tokens',
    badge: 'Producción',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    isRecommended: true
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    tagline: 'Latencia ultra-baja (<400ms). Ideal para clasificación rápida y extracción de campos.',
    contextWindow: '1M tokens',
    badge: 'Ultra Rápido',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  {
    id: 'gemma-2-27b',
    name: 'Gemma 2 27B (On-Premises)',
    tagline: 'Despliegue soberano en infraestructura privada sin salida a internet público.',
    contextWindow: '128K tokens',
    badge: 'Soberano',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  }
];

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  readonly isOpen = signal<boolean>(false);
  readonly activeTab = signal<'model' | 'rag' | 'profile' | 'security'>('model');

  // Model & Inference Signals
  readonly selectedModel = signal<string>('gemini-1.5-pro');
  readonly temperature = signal<number>(0.2); // 0.0 - 1.0
  readonly reasoningDepth = signal<'disabled' | 'standard' | 'deep'>('standard');
  readonly streamOutput = signal<boolean>(true);

  // RAG & Vector Search Signals
  readonly embeddingModel = signal<string>('text-embedding-004');
  readonly similarityThreshold = signal<number>(0.82); // 0.50 - 0.95
  readonly topKChunks = signal<number>(8); // 3 - 15
  readonly hybridSearch = signal<boolean>(true);

  // User Profile & Quotas Signals
  readonly userName = signal<string>('Diego Bueno');
  readonly userRole = signal<string>('Arquitecto Cloud & DevOps · DOJO 2.0');
  readonly userDepartment = signal<string>('Infraestructura, Cloud & Sistemas TI');
  readonly tokensUsed = signal<number>(64200);
  readonly tokensQuota = signal<number>(100000);
  readonly quotaRequestPending = signal<boolean>(false);

  // Security & Data Privacy
  readonly allowHistory = signal<boolean>(true);
  readonly zeroDataRetention = signal<boolean>(true);

  // Computed properties
  readonly currentModelDetails = computed(() => {
    return AVAILABLE_MODELS.find((m) => m.id === this.selectedModel()) || AVAILABLE_MODELS[0];
  });

  readonly quotaPercent = computed(() => {
    return Math.min(100, Math.round((this.tokensUsed() / this.tokensQuota()) * 100));
  });

  open(tab: 'model' | 'rag' | 'profile' | 'security' = 'model'): void {
    this.activeTab.set(tab);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  setActiveTab(tab: 'model' | 'rag' | 'profile' | 'security'): void {
    this.activeTab.set(tab);
  }

  setModel(modelId: string): void {
    this.selectedModel.set(modelId);
  }

  setTemperature(temp: number): void {
    this.temperature.set(parseFloat(temp.toFixed(2)));
  }

  setReasoningDepth(depth: 'disabled' | 'standard' | 'deep'): void {
    this.reasoningDepth.set(depth);
  }

  setSimilarityThreshold(val: number): void {
    this.similarityThreshold.set(parseFloat(val.toFixed(2)));
  }

  setTopK(k: number): void {
    this.topKChunks.set(k);
  }

  toggleHybridSearch(): void {
    this.hybridSearch.update((v) => !v);
  }

  toggleStreamOutput(): void {
    this.streamOutput.update((v) => !v);
  }

  toggleZeroDataRetention(): void {
    this.zeroDataRetention.update((v) => !v);
  }

  requestQuotaExpansion(): void {
    this.quotaRequestPending.set(true);
    setTimeout(() => {
      this.tokensQuota.update((q) => q + 50000);
      this.quotaRequestPending.set(false);
      alert('Solicitud de ampliación de cuota aprobada automáticamente. Se han añadido 50,000 tokens a tu balance mensual.');
    }, 800);
  }

  resetDefaults(): void {
    this.selectedModel.set('gemini-1.5-pro');
    this.temperature.set(0.2);
    this.reasoningDepth.set('standard');
    this.streamOutput.set(true);
    this.similarityThreshold.set(0.82);
    this.topKChunks.set(8);
    this.hybridSearch.set(true);
    this.zeroDataRetention.set(true);
  }
}
