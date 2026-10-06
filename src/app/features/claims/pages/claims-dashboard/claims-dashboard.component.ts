import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiEmptyStateComponent } from '../../../../shared/ui/ai-empty-state';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';
import { ClaimItem } from '../../models/claim.model';
import { ClaimsService } from '../../services/claims.service';
import { ClaimDetailsDrawerComponent } from '../../components/claim-details-drawer/claim-details-drawer.component';
import { NewClaimModalComponent } from '../../components/new-claim-modal/new-claim-modal.component';
import { PowerAutomateBannerComponent } from '../../components/power-automate-banner/power-automate-banner.component';

@Component({
  selector: 'app-claims-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AiButtonComponent,
    AiEmptyStateComponent,
    AiIconComponent,
    AiTooltipDirective,
    PowerAutomateBannerComponent,
    NewClaimModalComponent,
    ClaimDetailsDrawerComponent
  ],
  template: `
    <div class="min-h-full bg-[var(--color-background)] text-[#002147] px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 select-none">
      <!-- Top Header & Actions -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#dbe6f0]">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] text-xs font-bold tracking-wide w-fit">
            <ai-icon name="sparkles" [size]="13" class="text-[#003781]" />
            <span>DOJO 2.0 • AUTOMATIZACIÓN DE PROCESOS IT</span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-[#002147] tracking-tight mt-2">
            Reclamos & Aprobaciones Power Automate
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Gestión y seguimiento en tiempo real de reclamos operacionales integrados con tarjetas interactivas de Outlook.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <ai-button
            variant="secondary"
            size="md"
            (click)="toggleGuideModal()"
            aiTooltip="Ver instrucciones paso a paso para configurar el flujo en make.powerautomate.com"
            tooltipPosition="bottom"
            class="shadow-xs"
          >
            <ai-icon name="document" [size]="16" />
            <span>Guía Power Automate</span>
          </ai-button>

          <ai-button
            variant="ghost"
            size="md"
            (click)="claimsService.resetToMockData()"
            aiTooltip="Restablecer reclamos a los datos de ejemplo iniciales"
            tooltipPosition="bottom"
          >
            <ai-icon name="refresh" [size]="16" />
            <span>Reiniciar Demo</span>
          </ai-button>

          <ai-button
            variant="primary"
            size="md"
            (click)="openNewClaimModal()"
            aiTooltip="Crear y enviar un nuevo reclamo a Power Automate"
            tooltipPosition="bottom"
            class="shadow-sm"
          >
            <ai-icon name="plus" [size]="16" />
            <span>Nuevo Reclamo</span>
          </ai-button>
        </div>
      </div>

      <!-- KPI Stat Cards (DOJO 2.0 Light Design) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Reclamos -->
        <div class="bg-white border border-[#dbe6f0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-[#003781]"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reclamos</span>
            <div class="w-9 h-9 rounded-xl bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] flex items-center justify-center">
              <ai-icon name="document" [size]="18" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-black text-[#002147] tracking-tight">
              {{ claimsService.totalClaims() }}
            </span>
            <span class="text-xs text-slate-500 font-medium">tickets registrados</span>
          </div>
        </div>

        <!-- Card 2: En Aprobación en Outlook -->
        <div class="bg-white border border-[#dbe6f0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-700 uppercase tracking-wider">En Aprobación Outlook</span>
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center animate-pulse">
              <ai-icon name="spinner" [size]="18" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-black text-amber-600 tracking-tight">
              {{ claimsService.pendingClaims() }}
            </span>
            <span class="text-xs text-slate-500 font-medium">esperando respuesta</span>
          </div>
        </div>

        <!-- Card 3: Aprobados -->
        <div class="bg-white border border-[#dbe6f0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Aprobados</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <ai-icon name="check" [size]="18" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-black text-emerald-600 tracking-tight">
              {{ claimsService.approvedClaims() }}
            </span>
            <span class="text-xs text-slate-500 font-medium">confirmados</span>
          </div>
        </div>

        <!-- Card 4: Rechazados -->
        <div class="bg-white border border-[#dbe6f0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div class="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-rose-700 uppercase tracking-wider">Rechazados</span>
            <div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <ai-icon name="x" [size]="18" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-black text-rose-600 tracking-tight">
              {{ claimsService.rejectedClaims() }}
            </span>
            <span class="text-xs text-slate-500 font-medium">denegados</span>
          </div>
        </div>
      </div>

      <!-- Power Automate Connection & Mode Banner -->
      <app-power-automate-banner />

      <!-- Filter Tabs & Search Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            (click)="onSetFilter('ALL')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            [class]="claimsService.filterStatus() === 'ALL' ? 'bg-[#003781] text-white' : 'bg-white text-slate-600 hover:text-[#003781] hover:bg-slate-50 border border-[#dbe6f0]'"
          >
            Todos ({{ claimsService.totalClaims() }})
          </button>
          <button
            type="button"
            (click)="onSetFilter('PENDING')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            [class]="claimsService.filterStatus() === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:text-amber-700 hover:bg-slate-50 border border-[#dbe6f0]'"
          >
            En Aprobación ({{ claimsService.pendingClaims() }})
          </button>
          <button
            type="button"
            (click)="onSetFilter('APPROVED')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            [class]="claimsService.filterStatus() === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-[#dbe6f0]'"
          >
            Aprobados ({{ claimsService.approvedClaims() }})
          </button>
          <button
            type="button"
            (click)="onSetFilter('REJECTED')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            [class]="claimsService.filterStatus() === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:text-rose-700 hover:bg-slate-50 border border-[#dbe6f0]'"
          >
            Rechazados ({{ claimsService.rejectedClaims() }})
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-80">
          <input
            type="text"
            [ngModel]="claimsService.searchQuery()"
            (ngModelChange)="claimsService.setSearchQuery($event)"
            placeholder="Buscar por ticket, título o correo..."
            class="w-full bg-white border border-[#dbe6f0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#002147] placeholder-slate-400 focus:outline-none focus:border-[#003781] focus:ring-1 focus:ring-[#003781] shadow-2xs"
          />
          <div class="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
            <ai-icon name="search" [size]="14" />
          </div>
        </div>
      </div>

      <!-- Claims Cards Grid -->
      @if (claimsService.filteredClaims().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (claim of claimsService.filteredClaims(); track claim.id) {
            <div
              (click)="onSelectClaim(claim)"
              class="group relative bg-white hover:bg-slate-50/60 border border-[#dbe6f0] hover:border-[#003781]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <!-- Top Card Meta -->
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="text-xs font-mono font-bold text-[#003781] bg-[#e8f2fa] px-2.5 py-0.5 rounded border border-[#c2d9ee]">
                    {{ claim.id }}
                  </span>
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs"
                    [class]="statusBadgeClass(claim.status)"
                  >
                    {{ statusLabel(claim.status) }}
                  </span>
                </div>

                <!-- Title & Category -->
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <span>{{ claim.category }}</span>
                  <span>•</span>
                  <span [class]="priorityColorClass(claim.priority)">{{ claim.priority }}</span>
                </div>
                <h3 class="text-sm font-bold text-[#002147] group-hover:text-[#003781] transition-colors line-clamp-2 leading-snug">
                  {{ claim.title }}
                </h3>

                <!-- Justification Snippet -->
                <p class="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {{ claim.justification }}
                </p>
              </div>

              <!-- Card Bottom Info -->
              <div class="mt-5 pt-3.5 border-t border-[#eaf0f6] flex flex-col gap-2.5 text-xs">
                <div class="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Aprobador:</span>
                  <span class="text-[#002147] font-medium truncate max-w-[170px]">{{ claim.approverEmail }}</span>
                </div>

                <div class="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Impacto:</span>
                  <span class="text-[#002147] font-bold">{{ claim.amountOrImpact }}</span>
                </div>

                <!-- Action Button in Card -->
                <div class="pt-1.5 flex items-center justify-between gap-2 border-t border-dashed border-[#eaf0f6]">
                  <span class="text-[10px] text-slate-400 font-medium">
                    {{ formatDate(claim.createdAt) }}
                  </span>
                  <span class="text-xs font-bold text-[#003781] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Gestionar</span>
                    <ai-icon name="chevron-right" [size]="14" />
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="bg-white border border-[#dbe6f0] rounded-2xl p-8 text-center shadow-sm">
          <ai-empty-state
            icon="document"
            title="No se encontraron reclamos"
            description="No hay solicitudes que coincidan con los filtros o la búsqueda seleccionada."
          >
            <ai-button variant="secondary" size="sm" (click)="onClearFilters()" class="mt-3">
              <span>Limpiar Filtros</span>
            </ai-button>
          </ai-empty-state>
        </div>
      }

      <!-- Modals and Drawers -->
      @if (showNewModal()) {
        <app-new-claim-modal (close)="showNewModal.set(false)" />
      }

      <!-- Side Drawer -->
      <app-claim-details-drawer />

      <!-- Guide Modal (Light Theme) -->
      @if (showGuideModal()) {
        <div
          class="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          (click)="toggleGuideModal()"
        >
          <div
            class="bg-white border border-[#dbe6f0] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8"
            (click)="$event.stopPropagation()"
          >
            <div class="px-6 py-4 border-b border-[#dbe6f0] flex items-center justify-between bg-slate-50">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] flex items-center justify-center shadow-2xs">
                  <ai-icon name="document" [size]="18" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-[#002147] tracking-tight">Guía de Configuración Power Automate</h3>
                  <p class="text-xs text-slate-500">Cómo conectar este módulo con tu cuenta de Microsoft 365</p>
                </div>
              </div>
              <button
                type="button"
                (click)="toggleGuideModal()"
                class="text-slate-400 hover:text-[#002147] p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <ai-icon name="x" [size]="18" />
              </button>
            </div>

            <div class="p-6 overflow-y-auto max-h-[70vh] space-y-4 text-xs text-slate-700 leading-relaxed">
              <!-- Card 1: Webhook HTTP -->
              <div class="p-4 rounded-xl bg-[#e6f9f3] border border-[#a7f3d0] text-emerald-950 space-y-2">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-700 text-white">Opción 1: Webhook HTTP (Directo)</span>
                  <h4 class="font-bold text-sm text-emerald-900">Disparador "Cuando se recibe una solicitud HTTP"</h4>
                </div>
                <p>1. En Power Automate, agrega el disparador <strong>"Cuando se recibe una solicitud HTTP"</strong> (Método POST).</p>
                <p>2. Pega el esquema JSON de DOJO 2.0 que figura abajo en <em>"Esquema JSON del cuerpo"</em>.</p>
                <p>3. Guarda el flujo, copia la <strong>URL de HTTP POST generada</strong> y pégala en los <strong>Ajustes de Integración</strong> de DOJO.</p>
              </div>

              <!-- JSON Schema Accordion / Block -->
              <div>
                <h5 class="text-xs font-bold text-[#002147] mb-1">Esquema JSON para el Disparador Webhook HTTP:</h5>
                <div class="bg-[#00162e] p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner">
<pre>{{ guideJsonSchema }}</pre>
                </div>
              </div>

              <!-- Card 2: Outlook 365 Email -->
              <div class="p-4 rounded-xl bg-[#e8f2fa] border border-[#c2d9ee] text-[#002147] space-y-2">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#003781] text-white">Opción 2: Correo Outlook (Gratis)</span>
                  <h4 class="font-bold text-sm text-[#003781]">Disparador Office 365 Outlook (Sin Licencia Premium)</h4>
                </div>
                <p>1. Disparador: <code>Office 365 Outlook</code> &gt; <em>"Cuando llega un nuevo correo electrónico (V3)"</em>.</p>
                <p>• Filtro de Asunto: <code class="font-bold font-mono text-[#003781] bg-white px-1 py-0.5 rounded border border-[#c2d9ee]">[RECLAMO DOJO]</code></p>
                <p>2. Acción: <code>Aprobaciones</code> &gt; <em>"Iniciar y esperar una aprobación"</em> (Aprobar/Rechazar en Outlook con tarjeta interactiva).</p>
                <p>3. Condición: Si <code>Resultado</code> == <code>Approve</code> ➔ Enviar confirmación; Si no ➔ Notificar rechazo.</p>
              </div>

              <div class="pt-1 text-slate-600 bg-slate-50 p-3 rounded-xl border border-[#dbe6f0]">
                La guía paso a paso completa está en:
                <code class="text-[#003781] font-bold bg-white px-1.5 py-0.5 rounded border border-[#c2d9ee]">estructura/power-automate/GUIA_POWER_AUTOMATE_PASO_A_PASO.md</code>
              </div>
            </div>

            <div class="p-4 border-t border-[#dbe6f0] bg-slate-50 flex justify-end">
              <ai-button variant="primary" size="sm" (click)="toggleGuideModal()">
                <span>Entendido</span>
              </ai-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ClaimsDashboardComponent {
  protected readonly claimsService = inject(ClaimsService);

  protected readonly showNewModal = signal<boolean>(false);
  protected readonly showGuideModal = signal<boolean>(false);

  protected readonly guideJsonSchema = `{
  "type": "object",
  "properties": {
    "ticketId": { "type": "string" },
    "title": { "type": "string" },
    "category": { "type": "string" },
    "priority": { "type": "string" },
    "requestedBy": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string" },
        "role": { "type": "string" }
      }
    },
    "approverEmail": { "type": "string" },
    "amountOrImpact": { "type": "string" },
    "justification": { "type": "string" },
    "timestamp": { "type": "string" }
  },
  "required": ["ticketId", "title", "approverEmail", "justification"]
}`;

  protected onSetFilter(status: string): void {
    this.claimsService.setFilterStatus(status);
  }

  protected onClearFilters(): void {
    this.claimsService.setFilterStatus('ALL');
    this.claimsService.setSearchQuery('');
  }

  protected openNewClaimModal(): void {
    this.showNewModal.set(true);
  }

  protected toggleGuideModal(): void {
    this.showGuideModal.update((v) => !v);
  }

  protected onSelectClaim(claim: ClaimItem): void {
    this.claimsService.selectClaim(claim);
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
        return 'Enviado';
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

  protected formatDate(iso: string): string {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  }
}
