import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { AttachmentUploaderService } from '../../../core/services/attachment-uploader.service';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { CommandPaletteService } from '../../../core/services/command-palette.service';
import { ExportSessionService } from '../../../core/services/export-session.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { PromptTemplatesService } from '../../../core/services/prompt-templates.service';
import { RagCitationService } from '../../../core/services/rag-citation.service';
import { ReasoningCanvasService } from '../../../core/services/reasoning-canvas.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ShortcutsService } from '../../../core/services/shortcuts.service';
import { ChatService } from '../../../features/chat/services/chat.service';
import { AiIconComponent, IconName } from '../ai-icon';

export interface CommandItem {
  id: string;
  category: 'Acciones' | 'Conversaciones' | 'Documentos RAG' | 'Sugerencias';
  title: string;
  subtitle?: string;
  icon: IconName;
  shortcut?: string;
  action: () => void;
}

@Component({
  selector: 'ai-command-palette',
  standalone: true,
  imports: [AiIconComponent],
  template: `
    @if (paletteService.isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[12vh] p-4 select-none animate-cascade-in"
        (click)="onBackdropClick($event)"
      >
        <!-- Palette Container -->
        <div
          class="w-full max-w-2xl bg-white border border-[#dbe6f0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header Input -->
          <div class="px-4 py-3.5 border-b border-[#dbe6f0] bg-slate-50/80 flex items-center gap-3">
            <ai-icon name="search" [size]="18" class="text-[#003781] flex-shrink-0" />
            <input
              #searchInput
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Escribe un comando o busca en el Copilot..."
              class="flex-1 bg-transparent border-0 text-sm text-[#002147] placeholder:text-slate-400 focus:outline-none font-medium"
            />
            <kbd class="px-2 py-0.5 text-[10px] font-mono tracking-tight rounded bg-slate-200 text-slate-600 border border-slate-300">
              ESC
            </kbd>
          </div>

          <!-- Command Items List -->
          <div class="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-3 no-scrollbar bg-white">
            @if (filteredItems().length === 0) {
              <div class="py-10 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                <ai-icon name="search" [size]="24" class="text-slate-400" />
                <span class="text-xs font-medium">No se encontraron comandos o documentos coincidentes.</span>
              </div>
            } @else {
              @for (category of categoryKeys(); track category) {
                <div class="flex flex-col gap-1">
                  <span class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {{ category }}
                  </span>

                  <div class="flex flex-col gap-0.5">
                    @for (item of groupedItems()[category]; track item.id) {
                      <div
                        (click)="execute(item)"
                        [class]="getItemClasses(item)"
                        role="button"
                        tabindex="0"
                      >
                        <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#003781] group-hover:bg-blue-100 transition-colors">
                          <ai-icon [name]="item.icon" [size]="14" />
                        </div>

                        <div class="flex-1 min-w-0 flex flex-col">
                          <span class="text-xs font-semibold text-[#002147] truncate group-hover:text-[#003781] transition-colors">
                            {{ item.title }}
                          </span>
                          @if (item.subtitle) {
                            <span class="text-[11px] text-slate-500 truncate">
                              {{ item.subtitle }}
                            </span>
                          }
                        </div>

                        @if (item.shortcut) {
                          <kbd class="ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-slate-500 border border-slate-200 group-hover:text-[#002147]">
                            {{ item.shortcut }}
                          </kbd>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer Keyboard Navigation Hints -->
          <div class="px-4 py-2.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1 rounded bg-slate-200 border border-slate-300 text-slate-700 text-[10px]">↑</kbd>
                <kbd class="px-1 rounded bg-slate-200 border border-slate-300 text-slate-700 text-[10px]">↓</kbd>
                <span>Navegar</span>
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1 rounded bg-slate-200 border border-slate-300 text-slate-700 text-[10px]">↵</kbd>
                <span>Seleccionar</span>
              </span>
            </div>
            <span class="text-[#003781] font-bold font-mono">DOJO 2.0 • Copilot CLI</span>
          </div>
        </div>
      </div>
    }
  `
})
export class AiCommandPaletteComponent {
  protected readonly paletteService = inject(CommandPaletteService);
  private readonly chatState = inject(ChatStateService);
  private readonly chatService = inject(ChatService);
  private readonly ragService = inject(RagCitationService);
  private readonly canvasService = inject(ReasoningCanvasService);
  private readonly uploaderService = inject(AttachmentUploaderService);
  private readonly templatesService = inject(PromptTemplatesService);
  private readonly settingsService = inject(SettingsService);
  private readonly exportService = inject(ExportSessionService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly shortcutsService = inject(ShortcutsService);
  private readonly router = inject(Router);

  protected readonly searchQuery = signal<string>('');
  protected readonly selectedIndex = signal<number>(0);

  protected readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    effect(() => {
      if (this.paletteService.isOpen()) {
        this.searchQuery.set('');
        this.selectedIndex.set(0);
        setTimeout(() => {
          this.searchInputRef()?.nativeElement.focus();
        }, 50);
      }
    });
  }

  // Global hotkey: Cmd+K or Ctrl+K
  @HostListener('window:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.paletteService.toggle();
      return;
    }

    if (!this.paletteService.isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.paletteService.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const list = this.filteredItems();
      if (list.length > 0) {
        this.selectedIndex.update((i) => (i + 1) % list.length);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const list = this.filteredItems();
      if (list.length > 0) {
        this.selectedIndex.update((i) => (i - 1 + list.length) % list.length);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const list = this.filteredItems();
      const current = list[this.selectedIndex()];
      if (current) {
        this.execute(current);
      }
    }
  }

  // All Available Commands Pool
  private readonly allItems = computed<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Actions
      {
        id: 'act-new-chat',
        category: 'Acciones',
        title: 'Iniciar Nuevo Chat',
        subtitle: 'Crea una conversación vacía con el Copilot',
        icon: 'plus',
        shortcut: '⌘N',
        action: () => {
          this.chatState.newChat();
          this.router.navigate(['/']);
        }
      },
      {
        id: 'act-knowledge',
        category: 'Acciones',
        title: 'Base de Conocimiento RAG & Vector Store',
        subtitle: 'Gestión de documentos vectorizados, chunks e índices semánticos',
        icon: 'document',
        shortcut: '⌘B',
        action: () => this.router.navigate(['/knowledge'])
      },
      {
        id: 'act-history',
        category: 'Acciones',
        title: 'Historial de Conversaciones & Auditoría',
        subtitle: 'Registro de consultas corporativas, firmas criptográficas y trazabilidad',
        icon: 'history',
        shortcut: '⌘H',
        action: () => this.router.navigate(['/history'])
      },
      {
        id: 'act-analytics',
        category: 'Acciones',
        title: 'Ir a Métricas & Analítica',
        subtitle: 'Panel de consumo de tokens, latencias y telemetría',
        icon: 'chart',
        shortcut: '⌘A',
        action: () => this.router.navigate(['/analytics'])
      },
      {
        id: 'act-design-system',
        category: 'Acciones',
        title: 'Ir a Design System Playground',
        subtitle: 'Catálogo de componentes UI y tokens corporativos',
        icon: 'sparkles',
        shortcut: '⌘D',
        action: () => this.router.navigate(['/design-system'])
      },
      {
        id: 'act-canvas',
        category: 'Acciones',
        title: 'Abrir Lienzo de Razonamiento (Canvas)',
        subtitle: 'Espacio de trabajo dividido para matrices de riesgo e informes ejecutivos',
        icon: 'sparkles',
        shortcut: '⌘L',
        action: () => this.canvasService.open()
      },
      {
        id: 'act-upload',
        category: 'Acciones',
        title: 'Gestor Documental & Subir Adjuntos (RAG)',
        subtitle: 'Subir archivos PDF/DOCX o vincular documentos del repositorio empresarial',
        icon: 'paperclip',
        shortcut: '⌘U',
        action: () => this.uploaderService.open()
      },
      {
        id: 'act-templates',
        category: 'Acciones',
        title: 'Biblioteca de Plantillas & Prompts Corporativos',
        subtitle: 'Consultas estandarizadas para Legal, SLAs, Ciberseguridad y Finanzas',
        icon: 'sparkles',
        shortcut: '⌘P',
        action: () => this.templatesService.open()
      },
      {
        id: 'act-settings',
        category: 'Acciones',
        title: 'Configuración & Preferencias del Copilot',
        subtitle: 'Modelos generativos (Gemini/Gemma), temperatura, umbrales RAG y cuotas',
        icon: 'settings',
        shortcut: '⌘,',
        action: () => this.settingsService.open()
      },
      {
        id: 'act-export',
        category: 'Acciones',
        title: 'Exportar Sesión o Compartir Enlace',
        subtitle: 'Generar PDF oficial, Markdown o enlace corporativo seguro',
        icon: 'upload',
        shortcut: '⌘E',
        action: () => this.exportService.open()
      },
      {
        id: 'act-feedback',
        category: 'Acciones',
        title: 'Reportar Incidencia o Alucinación RAG',
        subtitle: 'Auditoría de calidad y evaluación de respuestas para MLOps',
        icon: 'thumb-down',
        shortcut: '⌘F',
        action: () => {
          const msgs = this.chatService.activeMessages();
          const lastMsg = [...msgs].reverse().find((m) => m.role === 'assistant');
          this.feedbackService.open(
            lastMsg?.id || 'msg-manual',
            lastMsg?.content || 'Consulta general del Copilot',
            'down'
          );
        }
      },
      {
        id: 'act-toggle-sidebar',
        category: 'Acciones',
        title: 'Alternar Menú Lateral',
        subtitle: 'Colapsar o expandir la barra lateral',
        icon: 'settings',
        shortcut: '⌘[',
        action: () => this.chatState.toggleSidebar()
      },
      {
        id: 'act-shortcuts',
        category: 'Acciones',
        title: 'Centro de Ayuda & Atajos de Teclado',
        subtitle: 'Guía de productividad, arquitectura RAG y comandos rápidos',
        icon: 'help',
        shortcut: '?',
        action: () => this.shortcutsService.open()
      }
    ];

    // Chats
    for (const chat of this.chatState.conversations()) {
      items.push({
        id: `chat-${chat.id}`,
        category: 'Conversaciones',
        title: chat.title,
        subtitle: `${chat.dateGroup} • ${chat.updatedAt}`,
        icon: 'chat',
        action: () => {
          this.chatState.selectChat(chat.id);
          this.router.navigate(['/']);
        }
      });
    }

    // Top RAG Documents
    const docs = [
      { title: 'Contrato_Marco_Operaciones_2026.pdf', category: 'Legal', confidence: 98 },
      { title: 'Anexo_SLA_Tecnologico_v2.docx', category: 'Operaciones', confidence: 95 },
      { title: 'Balance_Financiero_Consolidado_Q3.xlsx', category: 'Finanzas', confidence: 97 },
      { title: 'Politica_Seguridad_Terceros_SOC2.pdf', category: 'Seguridad', confidence: 93 }
    ];

    for (const doc of docs) {
      items.push({
        id: `doc-${doc.title}`,
        category: 'Documentos RAG',
        title: doc.title,
        subtitle: `${doc.category} • ${doc.confidence}% match semántico`,
        icon: 'document',
        action: () => {
          this.ragService.open({
            id: `doc-${doc.title}`,
            title: doc.title,
            confidence: doc.confidence,
            category: doc.category,
            snippet: `Documento "${doc.title}" disponible en la base de conocimiento vectorial de DOJO 2.0.`
          });
        }
      });
    }

    // Quick Prompt Suggestions
    // Corporate Prompt Templates as Suggestions
    for (const tmpl of this.templatesService.templates()) {
      items.push({
        id: `tmpl-${tmpl.id}`,
        category: 'Sugerencias',
        title: tmpl.title,
        subtitle: `${tmpl.category} • ${tmpl.department}`,
        icon: 'sparkles',
        action: () => {
          this.router.navigate(['/']);
          this.templatesService.usePrompt(tmpl.prompt);
        }
      });
    }

    return items;
  });

  protected readonly filteredItems = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.allItems();
    if (!query) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  });

  protected readonly groupedItems = computed(() => {
    const list = this.filteredItems();
    const groups: Record<string, CommandItem[]> = {};
    for (const item of list) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  });

  protected readonly categoryKeys = computed(() => Object.keys(this.groupedItems()));

  protected onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.selectedIndex.set(0);
  }

  protected execute(item: CommandItem): void {
    this.paletteService.close();
    item.action();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.paletteService.close();
    }
  }

  protected getItemClasses(item: CommandItem): string {
    const list = this.filteredItems();
    const isSelected = list[this.selectedIndex()]?.id === item.id;
    const base =
      'group flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer select-none';
    const activeClass = isSelected
      ? 'bg-blue-50/80 border-l-2 border-[#003781] text-[#003781] font-semibold pl-2.5 shadow-sm'
      : 'text-slate-700 hover:bg-slate-50 hover:text-[#002147]';

    return `${base} ${activeClass}`;
  }
}
