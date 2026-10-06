import {
  AfterViewChecked,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { AiAvatarComponent } from '../../../../shared/ui/ai-avatar';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiSpinnerComponent } from '../../../../shared/ui/ai-spinner';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { BmwDamageVisualizerComponent, DamageArea } from '../../components/bmw-damage-visualizer/bmw-damage-visualizer.component';
import { MessageBubbleComponent } from '../../components/message-bubble/message-bubble.component';
import { PolicyUploadCardComponent } from '../../components/policy-upload-card/policy-upload-card.component';
import { ClaimsService } from '../../../claims/services/claims.service';
import { ChatService } from '../../services/chat.service';

export type AssistantViewMode = 'damage' | 'policy' | 'chat';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    MessageBubbleComponent,
    BmwDamageVisualizerComponent,
    PolicyUploadCardComponent,
    AiAvatarComponent,
    AiIconComponent,
    AiSpinnerComponent,
    AiTooltipDirective
  ],
  template: `
    <!-- DOJO 2.0 Ambient Background Container -->
    <div class="min-h-full w-full bg-[#edf3f8] px-4 sm:px-6 lg:px-10 py-6 lg:py-8 flex flex-col justify-start select-none">
      <div class="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        <!-- =================================================================== -->
        <!-- LEFT COLUMN: DOJO 2.0 HERO & QUICK NAVIGATION (Sistemas en Español) -->
        <!-- =================================================================== -->
        <div class="lg:col-span-5 flex flex-col gap-5 pt-2">
          <!-- AI Assistant Pill Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] text-xs font-bold tracking-wide w-fit">
            <ai-icon name="sparkles" [size]="13" class="text-[#003781]" />
            <span>DOJO 2.0 · COPILOTO DE SISTEMAS</span>
          </div>

          <!-- Hero Headline -->
          <h1 class="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#002147] leading-[1.12]">
            Hola Diego.<br>
            Conoce a <span class="text-[#003781]">DOJO AI</span>,<br>
            tu copiloto de<br>
            sistemas.
          </h1>

          <!-- Hero Description Paragraph -->
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
            Soy DOJO AI, tu copiloto inteligente de infraestructura, observabilidad y cloud. Consulta métricas de clusters, topología de microservicios, bases de datos o reporta incidentes técnicos de principio a fin.
          </p>

          <!-- Social Proof / Trust Badge -->
          <div class="flex items-center gap-2 text-xs font-medium text-slate-600 pt-1">
            <ai-icon name="globe" [size]="16" class="text-[#007ab3]" />
            <span>Monitoreando <strong>+1,200 microservicios</strong> en 7 regiones cloud</span>
          </div>

          <!-- 3 Quick Access Cards -->
          <div class="flex flex-col gap-2.5 pt-3">
            <!-- Card 1: Arquitectura Cloud & Topología -->
            <button
              type="button"
              (click)="toggleMode('damage')"
              class="group p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-[#dbe6f0] hover:border-[#003781] shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between gap-3 cursor-pointer"
              [class.border-[#003781]]="activeMode() === 'damage'"
              [class.bg-white]="activeMode() === 'damage'"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-[#e8f2fa] text-[#003781] group-hover:bg-[#003781] group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                  <ai-icon name="shield" [size]="18" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-[#002147] group-hover:text-[#003781] transition-colors">
                    Arquitectura Cloud & Topología
                  </h3>
                  <p class="text-[11px] text-slate-500">
                    Estado de clusters, microservicios y balanceadores
                  </p>
                </div>
              </div>
              <ai-icon name="chevron-right" [size]="14" class="text-slate-400 group-hover:text-[#003781] group-hover:translate-x-0.5 transition-all" />
            </button>

            <!-- Card 2: Gestión de Incidencias & SLA -->
            <button
              type="button"
              (click)="setMode('chat')"
              class="group p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-[#dbe6f0] hover:border-[#003781] shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between gap-3 cursor-pointer"
              [class.border-[#003781]]="activeMode() === 'chat'"
              [class.bg-white]="activeMode() === 'chat'"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-[#e8f2fa] text-[#003781] group-hover:bg-[#003781] group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                  <ai-icon name="car" [size]="18" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-[#002147] group-hover:text-[#003781] transition-colors">
                    Gestión de Incidencias & SLA
                  </h3>
                  <p class="text-[11px] text-slate-500">
                    Reporta, mitiga y rastrea incidencias técnicas en minutos
                  </p>
                </div>
              </div>
              <ai-icon name="chevron-right" [size]="14" class="text-slate-400 group-hover:text-[#003781] group-hover:translate-x-0.5 transition-all" />
            </button>

            <!-- Card 3: Auditoría SOC2 & Telemetría -->
            <button
              type="button"
              (click)="toggleMode('policy')"
              class="group p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-[#dbe6f0] hover:border-[#003781] shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between gap-3 cursor-pointer"
              [class.border-[#003781]]="activeMode() === 'policy'"
              [class.bg-white]="activeMode() === 'policy'"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-[#e8f2fa] text-[#003781] group-hover:bg-[#003781] group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                  <ai-icon name="credit-card" [size]="18" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-[#002147] group-hover:text-[#003781] transition-colors">
                    Auditoría SOC2 & Telemetría
                  </h3>
                  <p class="text-[11px] text-slate-500">
                    Logs de observabilidad, trazas distribuidas y SLA
                  </p>
                </div>
              </div>
              <ai-icon name="chevron-right" [size]="14" class="text-slate-400 group-hover:text-[#003781] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- RIGHT COLUMN: THE DOJO 2.0 SYSTEMS ASSISTANT CARD -->
        <!-- =================================================================== -->
        <div class="lg:col-span-7 flex flex-col">
          <div class="rounded-3xl border border-[#dbe6f0] bg-white shadow-xl shadow-blue-950/5 overflow-hidden flex flex-col min-h-[640px] max-h-[82vh]">
            
            <!-- Card Top Header -->
            <div class="px-5 py-3.5 bg-white border-b border-[#e2e8f0] flex items-center justify-between gap-3 select-none">
              <!-- Left: DOJO AI Avatar & Agent Tag -->
              <div class="flex items-center gap-3 min-w-0">
                <!-- Circle Navy Avatar 'D' -->
                <ai-avatar role="ai" size="sm" />

                <div class="flex flex-col leading-tight min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-[#002147]">DOJO AI</span>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] text-[10px] font-semibold">
                      <ai-icon name="shield" [size]="10" />
                      <span>AGENTE DE SISTEMAS</span>
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-500 truncate">
                    Cluster Kubernetes · Incidente INC-2026-8942-PROD
                  </span>
                </div>
              </div>

              <!-- Right: Mode Switcher Pills & Menu Dots -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <!-- Screen 1: Topología 3D -->
                <button
                  type="button"
                  (click)="toggleMode('damage')"
                  class="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer"
                  [class.bg-[#003781]]="activeMode() === 'damage'"
                  [class.text-white]="activeMode() === 'damage'"
                  [class.bg-slate-100]="activeMode() !== 'damage'"
                  [class.text-slate-600]="activeMode() !== 'damage'"
                  aiTooltip="Ver análisis visual 3D de servidores y clusters"
                >
                  Topología 3D
                </button>

                <!-- Screen 2: Logs & SLA -->
                <button
                  type="button"
                  (click)="toggleMode('policy')"
                  class="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer"
                  [class.bg-[#003781]]="activeMode() === 'policy'"
                  [class.text-white]="activeMode() === 'policy'"
                  [class.bg-slate-100]="activeMode() !== 'policy'"
                  [class.text-slate-600]="activeMode() !== 'policy'"
                  aiTooltip="Ver resumen de SLA y subida de telemetría"
                >
                  Logs & SLA
                </button>

                <!-- Menu Dots -->
                <button
                  type="button"
                  class="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
                  title="Opciones de incidencia"
                >
                  <ai-icon name="more-horizontal" [size]="16" />
                </button>
              </div>
            </div>

            <!-- Deep Corporate Navy Accent Line (Below Header) -->
            <div class="h-1 w-full bg-[#002b66]"></div>

            <!-- Scrollable Content Body Area -->
            <div
              #scrollContainer
              class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 bg-white"
            >
              <!-- ========================================================= -->
              <!-- VIEW 1: TOPOLOGY & CLUSTER ASSESSMENT VIEW -->
              <!-- ========================================================= -->
              @if (activeMode() === 'damage') {
                <div class="flex flex-col gap-3.5 animate-cascade-in">
                  <!-- Progress Bar: Detectando anomalías... 100% -->
                  <div class="flex flex-col gap-1.5 px-1 pt-1">
                    <div class="flex items-center justify-center gap-2 text-xs font-semibold text-[#002147]">
                      <ai-icon name="refresh" [size]="12" class="text-[#00a887] animate-spin" />
                      <span>Detectando anomalías en microservicios... 100 %</span>
                    </div>
                    <!-- Teal / Mint Gradient Progress Bar -->
                    <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div class="h-full w-full bg-gradient-to-r from-[#00a887] via-[#00c9a7] to-[#0284c7] rounded-full"></div>
                    </div>
                  </div>

                  <!-- Assistant Message from DOJO AI -->
                  <div class="flex items-start gap-3 max-w-xl">
                    <ai-avatar role="ai" size="xs" />
                    <div class="p-3 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-xs">
                      Análisis telemétrico completado. Se detectó degradación en API Gateway, bloqueos en Cloud Spanner y saturación de nodos. Selecciona un componente para inspeccionar el diagnóstico.
                    </div>
                  </div>

                  <!-- 3D Infrastructure Visualizer Card Component -->
                  <app-bmw-damage-visualizer
                    (confirmed)="onDamageConfirmed($event)"
                  />
                </div>
              }

              <!-- ========================================================= -->
              <!-- VIEW 2: SLA & LOGS UPLOAD -->
              <!-- ========================================================= -->
              @if (activeMode() === 'policy') {
                <div class="flex flex-col gap-3.5 animate-cascade-in">
                  <!-- Assistant Message from DOJO AI -->
                  <div class="flex items-start gap-3 max-w-xl">
                    <ai-avatar role="ai" size="xs" />
                    <div class="p-3 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-xs">
                      SLA corporativo 99.99% activo y garantizado para tu entorno, Diego.
                    </div>
                  </div>

                  <!-- Policy & Upload Report Component -->
                  <app-policy-upload-card
                    (proceedToInspection)="setMode('damage')"
                  />
                </div>
              }

              <!-- ========================================================= -->
              <!-- VIEW 3: LIVE CONVERSATION THREAD (When in chat mode) -->
              <!-- ========================================================= -->
              @if (activeMode() === 'chat') {
                <div class="flex flex-col gap-4 animate-cascade-in">
                  @for (msg of messages(); track msg.id) {
                    <app-message-bubble [message]="msg" />
                  }

                  <!-- AI Thinking State Indicator -->
                  @if (chatService.isThinking()) {
                    <div class="flex items-start gap-3 max-w-md animate-cascade-in">
                      <ai-avatar role="ai" size="xs" />
                      <div class="p-3 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                        <ai-spinner type="dots" size="sm" />
                        <span class="animate-pulse">{{ chatService.thinkingStep() || 'DOJO AI analizando telemetría del sistema...' }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Card Bottom Floating Input Bar matching screenshots -->
            <div class="p-3 bg-white border-t border-[#e2e8f0]">
              <form (submit)="onSendPrompt($event)" class="relative flex items-center">
                <div class="absolute left-3.5 text-slate-400 flex items-center pointer-events-none">
                  <ai-icon name="sparkles" [size]="15" class="text-[#007ab3]" />
                </div>

                <input
                  type="text"
                  [(ngModel)]="promptText"
                  name="userPrompt"
                  [placeholder]="activeMode() === 'damage' ? 'Selecciona un componente del servidor para continuar...' : 'Escribe tu consulta sobre infraestructura o reporte para DOJO AI...'"
                  class="w-full pl-9 pr-12 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-[#002147] placeholder-slate-400 focus:outline-none focus:border-[#003781] focus:bg-white transition-all shadow-xs"
                />

                <button
                  type="submit"
                  [disabled]="!promptText.trim()"
                  class="absolute right-1.5 w-7 h-7 rounded-full bg-[#003781] hover:bg-[#002860] disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Enviar mensaje"
                >
                  <ai-icon name="send" [size]="12" />
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class HomeComponent implements AfterViewChecked {
  protected readonly chatService = inject(ChatService);
  protected readonly chatState = inject(ChatStateService);
  protected readonly claimsService = inject(ClaimsService);

  readonly activeMode = signal<AssistantViewMode>('chat'); // Defaults to Chat view as requested
  promptText = '';

  protected readonly messages = computed(() => this.chatService.activeMessages());
  protected readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  private shouldScrollToBottom = false;

  constructor() {
    effect(() => {
      this.messages();
      this.chatService.isThinking();
      this.chatService.isStreaming();
      this.activeMode();
      this.shouldScrollToBottom = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  protected setMode(mode: AssistantViewMode): void {
    this.activeMode.set(mode);
  }

  protected toggleMode(mode: AssistantViewMode): void {
    if (this.activeMode() === mode) {
      this.activeMode.set('chat');
    } else {
      this.activeMode.set(mode);
    }
  }

  protected onDamageConfirmed(area: DamageArea): void {
    // Auto-registrar reclamo en ClaimsService y enviarlo a Power Automate
    const claim = this.claimsService.createClaim({
      title: `Reclamo por fallo detectado en ${area.name} (${area.severity})`,
      category: 'SLA & Infraestructura',
      priority: area.severity === 'Heavy' ? 'CRITICA' : 'ALTA',
      approverEmail: 'supervisor.ti@dojo.corp',
      amountOrImpact: `Afectación en ${area.name} - ${area.description}`,
      justification: `Detectado mediante escáner de visión 3D de infraestructura de DOJO AI. ${area.description}. Se solicita aprobación para remediación técnica y compensación SLA.`,
      autoSend: true
    });

    this.chatService.sendMessage(
      `Confirmo el diagnóstico del componente ${area.name} (${area.severity}). Se ha radicado el reclamo #${claim.id} y disparado el flujo a Power Automate para aprobación en Outlook.`
    );
    this.setMode('chat');
  }

  protected onSendPrompt(event: Event): void {
    event.preventDefault();
    const txt = this.promptText.trim();
    if (!txt) return;
    this.chatService.sendMessage(txt);
    this.promptText = '';
    this.setMode('chat');
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
