import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { ClaimItem } from '../../models/claim.model';
import { ClaimsService } from '../../services/claims.service';

@Component({
  selector: 'app-claim-details-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, AiButtonComponent, AiIconComponent],
  template: `
    @if (selectedClaim(); as claim) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[80] flex justify-end transition-opacity animate-in fade-in duration-200"
        (click)="close()"
      >
        <!-- Slide-Over Drawer Container (DOJO 2.0 Light Theme) -->
        <div
          class="w-full max-w-2xl bg-white border-l border-[#dbe6f0] h-full flex flex-col shadow-2xl overflow-hidden z-[85] text-slate-800 animate-in slide-in-from-right duration-300"
          (click)="$event.stopPropagation()"
        >
          <!-- Drawer Header -->
          <div class="px-6 py-4.5 border-b border-[#dbe6f0] flex items-center justify-between bg-white">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-[#003781] bg-[#e8f2fa] px-2.5 py-1 rounded-md border border-[#c2d9ee]">
                {{ claim.id }}
              </span>
              <span
                class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-2xs"
                [class]="statusBadgeClass(claim.status)"
              >
                {{ statusLabel(claim.status) }}
              </span>
            </div>

            <button
              type="button"
              (click)="close()"
              class="text-slate-400 hover:text-[#002147] p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ai-icon name="x" [size]="18" />
            </button>
          </div>

          <!-- Drawer Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Title & Category Info -->
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <span>{{ claim.category }}</span>
                <span>•</span>
                <span [class]="priorityColorClass(claim.priority)">Prioridad {{ claim.priority }}</span>
              </div>
              <h2 class="text-xl font-black text-[#002147] tracking-tight leading-snug">
                {{ claim.title }}
              </h2>
            </div>

            <!-- MULTI-INTEGRATION ACTION CARD DEPENDING ON ACTIVE MODE & STATUS -->
            @if (claim.status === 'EN_APROBACION_OUTLOOK' || claim.status === 'ENVIADO_POWER_AUTOMATE') {
              @if (config().triggerMode === 'HTTP_WEBHOOK') {
                <!-- Webhook HTTP Active Card -->
                <div class="rounded-2xl p-5 bg-[#e6f9f3] border border-[#a7f3d0] space-y-3.5 shadow-sm">
                  <div class="flex items-start gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <ai-icon name="globe" [size]="18" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <h4 class="text-sm font-bold text-emerald-950 flex items-center gap-2">
                          <span>Disparador Webhook HTTP POST</span>
                          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </h4>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          HTTP 200/202
                        </span>
                      </div>
                      <p class="text-xs text-emerald-900 mt-1 leading-relaxed">
                        Reclamo transmitido al webhook de Power Automate. Esperando respuesta de aprobación para <strong class="underline font-semibold">{{ claim.approverEmail }}</strong>.
                      </p>
                    </div>
                  </div>

                  @if (config().webhookUrl) {
                    <div class="bg-white p-2.5 rounded-xl border border-emerald-200 text-[11px] font-mono text-slate-700 truncate">
                      <span class="text-slate-400 select-none">POST </span>{{ config().webhookUrl }}
                    </div>
                  }

                  <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/70">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        [disabled]="isSubmitting()"
                        (click)="onSendToWebhook(claim.id)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <ai-icon [name]="isSubmitting() ? 'spinner' : 'send'" [size]="14" [class.animate-spin]="isSubmitting()" />
                        <span>Reenviar a Webhook HTTP</span>
                      </button>

                      <button
                        type="button"
                        (click)="openOutlookWeb(claim)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#002147] bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                      >
                        <ai-icon name="send" [size]="13" />
                        <span>Abrir en Outlook</span>
                      </button>
                    </div>

                    <!-- Fast Local Decision Controls -->
                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-xs"
                        (click)="onSimulateApproval(claim.id, 'Approve')"
                        title="Simular respuesta APROBADO"
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs"
                        (click)="onSimulateApproval(claim.id, 'Reject')"
                        title="Simular respuesta RECHAZADO"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              } @else {
                <!-- Outlook 365 or Simulation Active Card -->
                <div class="rounded-2xl p-5 bg-[#f0f6fc] border border-[#c2d9ee] space-y-4 shadow-sm">
                  <!-- Status Title -->
                  <div class="flex items-start gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-[#003781] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <ai-icon name="send" [size]="18" />
                    </div>
                    <div>
                      <h4 class="text-sm font-bold text-[#002147] flex items-center gap-2">
                        <span>Disparador Office 365 Outlook (Opción 2)</span>
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </h4>
                      <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                        Envía este correo a tu buzón de Microsoft 365 (<strong class="text-[#002147] underline">{{ claim.approverEmail }}</strong>). Tu flujo de Power Automate detectará la palabra clave <code class="font-bold font-mono text-[#003781] bg-white px-1 py-0.5 rounded border border-[#c2d9ee]">{{ getMailData(claim).subject.split('#')[0].trim() }}</code> y te enviará la tarjeta interactiva de aprobación.
                      </p>
                    </div>
                  </div>

                  <!-- Pre-filled Email Details Strip -->
                  <div class="bg-white p-3.5 rounded-xl border border-[#dbe6f0] text-xs space-y-2 font-mono">
                    <div class="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Para: <strong class="text-[#002147]">{{ getMailData(claim).to }}</strong></span>
                      <span class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Filtro Asunto</span>
                    </div>
                    <div class="text-[#002147] font-bold text-[11px] truncate bg-slate-50 p-2 rounded-lg border border-slate-200">
                      {{ getMailData(claim).subject }}
                    </div>
                  </div>

                  <!-- Live Outlook Action Buttons -->
                  <div class="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      (click)="openOutlookWeb(claim)"
                      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#003781] hover:bg-[#002860] shadow-sm transition-all cursor-pointer"
                    >
                      <ai-icon name="send" [size]="14" />
                      <span>Abrir en Outlook Web</span>
                    </button>

                    <button
                      type="button"
                      (click)="openOutlookMailto(claim)"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#002147] hover:text-[#003781] bg-white hover:bg-slate-50 border border-[#dbe6f0] shadow-xs transition-all cursor-pointer"
                    >
                      <ai-icon name="globe" [size]="14" />
                      <span>Outlook Escritorio</span>
                    </button>

                    <button
                      type="button"
                      (click)="copyEmail(claim)"
                      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#002147] bg-white hover:bg-slate-50 border border-[#dbe6f0] shadow-xs transition-all cursor-pointer"
                    >
                      <ai-icon [name]="copiedEmail() ? 'check' : 'copy'" [size]="14" [class.text-emerald-600]="copiedEmail()" />
                      <span>{{ copiedEmail() ? '¡Copiado!' : 'Copiar Correo' }}</span>
                    </button>
                  </div>

                  <!-- Simulation Controls for immediate demo testing -->
                  <div class="pt-3 border-t border-[#c2d9ee]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span class="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                      <ai-icon name="sparkles" [size]="14" class="text-amber-500" />
                      <span>Prueba Rápida Local (Simular Respuesta):</span>
                    </span>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
                        (click)="onSimulateApproval(claim.id, 'Approve')"
                      >
                        <ai-icon name="check" [size]="14" />
                        <span>Simular: Aprobar</span>
                      </button>

                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all cursor-pointer"
                        (click)="onSimulateApproval(claim.id, 'Reject')"
                      >
                        <ai-icon name="x" [size]="14" />
                        <span>Simular: Rechazar</span>
                      </button>
                    </div>
                  </div>
                </div>
              }
            } @else if (claim.status === 'APROBADO' && claim.approverResponse) {
              <div class="rounded-2xl p-5 bg-emerald-50/90 border border-emerald-200 space-y-2.5 shadow-2xs">
                <div class="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <div class="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <ai-icon name="check" [size]="14" />
                  </div>
                  <span>Reclamo Aprobado por el Supervisor</span>
                </div>
                <p class="text-xs text-slate-700 italic bg-white p-3.5 rounded-xl border border-emerald-200 leading-relaxed shadow-2xs">
                  "{{ claim.approverResponse.comments }}"
                </p>
                <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Aprobador: <strong class="text-emerald-900">{{ claim.approverResponse.approverName }}</strong></span>
                  <span>Canal: {{ claim.approverResponse.channel }}</span>
                </div>
              </div>
            } @else if (claim.status === 'RECHAZADO' && claim.approverResponse) {
              <div class="rounded-2xl p-5 bg-rose-50/90 border border-rose-200 space-y-2.5 shadow-2xs">
                <div class="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <div class="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                    <ai-icon name="x" [size]="14" />
                  </div>
                  <span>Reclamo Rechazado en Outlook</span>
                </div>
                <p class="text-xs text-slate-700 italic bg-white p-3.5 rounded-xl border border-rose-200 leading-relaxed shadow-2xs">
                  "{{ claim.approverResponse.comments }}"
                </p>
                <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Revisado por: <strong class="text-rose-900">{{ claim.approverResponse.approverName }}</strong></span>
                  <span>Canal: {{ claim.approverResponse.channel }}</span>
                </div>
              </div>
            } @else if (claim.status === 'BORRADOR') {
              <div class="rounded-2xl p-4.5 bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <h4 class="text-xs font-bold text-[#002147]">Reclamo en Borrador</h4>
                  <p class="text-[11px] text-slate-600">Listo para transmitir a Power Automate según la modalidad activa.</p>
                </div>
                <div class="flex items-center gap-2">
                  <ai-button
                    variant="primary"
                    size="sm"
                    [loading]="isSubmitting()"
                    (click)="onSendActive(claim.id)"
                  >
                    <ai-icon name="send" [size]="14" />
                    <span>{{ config().triggerMode === 'HTTP_WEBHOOK' ? 'Enviar a Webhook HTTP' : 'Disparar a Outlook' }}</span>
                  </ai-button>
                </div>
              </div>
            }

            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 gap-4 p-4.5 rounded-xl bg-slate-50 border border-[#dbe6f0] text-xs">
              <div>
                <span class="text-slate-500 block text-[11px] font-medium">Solicitante:</span>
                <span class="text-[#002147] font-bold">{{ claim.requestedBy.name }}</span>
                <span class="text-slate-500 block text-[10px]">{{ claim.requestedBy.email }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px] font-medium">Aprobador Designado:</span>
                <span class="text-[#002147] font-bold">{{ claim.approverEmail }}</span>
                <span class="text-slate-500 block text-[10px]">Microsoft Outlook / 365</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px] font-medium">Impacto / Monto:</span>
                <span class="text-[#002147] font-bold">{{ claim.amountOrImpact }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[11px] font-medium">ID de Flujo Power Automate:</span>
                <span class="text-[#003781] font-mono text-[11px] font-semibold truncate block" [title]="claim.flowExecutionId || 'N/A'">
                  {{ claim.flowExecutionId || 'Pendiente' }}
                </span>
              </div>
            </div>

            <!-- Justification Section -->
            <div>
              <h4 class="text-xs font-bold text-[#002147] uppercase tracking-wider mb-2">
                Justificación Técnica & Evidencia
              </h4>
              <div class="p-4 rounded-xl bg-slate-50 border border-[#dbe6f0] text-xs text-slate-700 leading-relaxed">
                {{ claim.justification }}
              </div>
            </div>

            <!-- Timeline of Approval Lifecycle -->
            <div>
              <h4 class="text-xs font-bold text-[#002147] uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Línea de Tiempo del Flujo</span>
                <span class="text-[11px] text-slate-500 font-normal">{{ claim.timeline.length }} eventos</span>
              </h4>

              <div class="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                @for (event of claim.timeline; track event.id) {
                  <div class="relative flex items-start gap-3.5 pl-1">
                    <div
                      class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      [class]="timelineDotClass(event.type)"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </div>

                    <div class="flex-1 bg-white p-3.5 rounded-xl border border-[#dbe6f0] shadow-2xs">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-bold text-[#002147]">{{ event.title }}</span>
                        @if (event.badge) {
                          <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {{ event.badge }}
                          </span>
                        }
                      </div>
                      <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">{{ event.description }}</p>
                      <span class="text-[10px] text-slate-400 mt-1 block font-medium">
                        {{ formatTime(event.timestamp) }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Technical JSON Payload Inspector -->
            <div class="pt-2">
              <button
                type="button"
                (click)="toggleJsonInspector()"
                class="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#dbe6f0] text-xs text-[#002147] font-bold transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <ai-icon name="document" [size]="14" class="text-[#003781]" />
                  <span>Inspector Técnico: Payload JSON de Power Automate</span>
                </div>
                <ai-icon [name]="showJson() ? 'chevron-down' : 'chevron-right'" [size]="14" />
              </button>

              @if (showJson()) {
                <div class="mt-2 p-4 rounded-xl bg-[#00162e] border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner">
                  <pre class="text-[11px] leading-relaxed">{{ getClaimJson(claim) }}</pre>
                </div>
              }
            </div>
          </div>

          <!-- Drawer Footer -->
          <div class="p-4 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between">
            <span class="text-[11px] text-slate-500 font-medium">
              Registrado: {{ formatTime(claim.createdAt) }}
            </span>
            <ai-button variant="secondary" size="sm" (click)="close()">
              <span>Cerrar</span>
            </ai-button>
          </div>
        </div>
      </div>
    }
  `
})
export class ClaimDetailsDrawerComponent {
  private readonly claimsService = inject(ClaimsService);

  protected readonly config = this.claimsService.config;
  protected readonly selectedClaim = this.claimsService.selectedClaim;
  protected readonly isSubmitting = this.claimsService.isSubmitting;
  protected readonly showJson = signal<boolean>(false);
  protected readonly copiedEmail = signal<boolean>(false);

  protected close(): void {
    this.claimsService.selectClaim(null);
  }

  protected toggleJsonInspector(): void {
    this.showJson.update((v) => !v);
  }

  protected getMailData(claim: ClaimItem) {
    return this.claimsService.getOutlookMailData(claim);
  }

  protected openOutlookWeb(claim: ClaimItem): void {
    const data = this.getMailData(claim);
    try {
      window.open(data.webUrl, '_blank');
    } catch {
      window.location.href = data.mailtoUrl;
    }
  }

  protected openOutlookMailto(claim: ClaimItem): void {
    const data = this.getMailData(claim);
    window.location.href = data.mailtoUrl;
  }

  protected async copyEmail(claim: ClaimItem): Promise<void> {
    const ok = await this.claimsService.copyClaimEmailToClipboard(claim.id);
    if (ok) {
      this.copiedEmail.set(true);
      setTimeout(() => this.copiedEmail.set(false), 2500);
    }
  }

  protected onSendActive(claimId: string): void {
    if (this.config().triggerMode === 'OUTLOOK_EMAIL') {
      this.claimsService.dispatchViaOutlookEmail(claimId);
    } else {
      this.claimsService.sendToPowerAutomate(claimId);
    }
  }

  protected onSendToWebhook(claimId: string): void {
    this.claimsService.sendToPowerAutomate(claimId);
  }

  protected onSimulateApproval(claimId: string, outcome: 'Approve' | 'Reject'): void {
    this.claimsService.simulateOutlookDecision(claimId, outcome);
  }

  protected statusBadgeClass(status: string): string {
    switch (status) {
      case 'APROBADO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RECHAZADO':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'EN_APROBACION_OUTLOOK':
      case 'ENVIADO_POWER_AUTOMATE':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  protected statusLabel(status: string): string {
    switch (status) {
      case 'APROBADO':
        return 'Aprobado';
      case 'RECHAZADO':
        return 'Rechazado';
      case 'EN_APROBACION_OUTLOOK':
        return 'En Aprobación';
      case 'ENVIADO_POWER_AUTOMATE':
        return 'Enviado a Flow';
      default:
        return 'Borrador';
    }
  }

  protected priorityColorClass(priority: string): string {
    switch (priority) {
      case 'CRITICA':
        return 'text-rose-600 font-bold';
      case 'ALTA':
        return 'text-amber-600 font-semibold';
      case 'MEDIA':
        return 'text-blue-600 font-medium';
      default:
        return 'text-slate-500 font-medium';
    }
  }

  protected timelineDotClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 ring-4 ring-emerald-100';
      case 'danger':
        return 'bg-rose-500 ring-4 ring-rose-100';
      case 'warning':
        return 'bg-amber-500 ring-4 ring-amber-100';
      default:
        return 'bg-[#003781] ring-4 ring-blue-100';
    }
  }

  protected formatTime(iso: string): string {
    try {
      const date = new Date(iso);
      return date.toLocaleString('es-ES', {
        dateStyle: 'short',
        timeStyle: 'medium'
      });
    } catch {
      return iso;
    }
  }

  protected getClaimJson(claim: ClaimItem): string {
    const payload = claim.rawPayload || {
      ticketId: claim.id,
      title: claim.title,
      category: claim.category,
      priority: claim.priority,
      requestedBy: claim.requestedBy,
      approverEmail: claim.approverEmail,
      amountOrImpact: claim.amountOrImpact,
      justification: claim.justification,
      systemSource: 'DOJO 2.0 Frontend',
      timestamp: claim.createdAt
    };
    return JSON.stringify(payload, null, 2);
  }
}
