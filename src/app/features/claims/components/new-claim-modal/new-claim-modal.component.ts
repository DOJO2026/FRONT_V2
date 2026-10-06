import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { ClaimCategory, ClaimPriority } from '../../models/claim.model';
import { ClaimsService } from '../../services/claims.service';

@Component({
  selector: 'app-new-claim-modal',
  standalone: true,
  imports: [FormsModule, AiButtonComponent, AiIconComponent],
  template: `
    <!-- Backdrop Overlay -->
    <div
      class="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      (click)="onCancel()"
    >
      <!-- Modal Box (DOJO 2.0 Light Theme) -->
      <div
        class="bg-white border border-[#dbe6f0] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8 text-slate-800"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-[#dbe6f0] flex items-center justify-between bg-slate-50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] flex items-center justify-center shadow-2xs">
              <ai-icon name="plus" [size]="16" />
            </div>
            <div>
              <h3 class="text-base font-bold text-[#002147] tracking-tight">Nuevo Reclamo & Solicitud</h3>
              <p class="text-xs text-slate-500">Genera una solicitud para el flujo de aprobación interactivo de Outlook</p>
            </div>
          </div>

          <button
            type="button"
            (click)="onCancel()"
            class="text-slate-400 hover:text-[#002147] p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <ai-icon name="x" [size]="18" />
          </button>
        </div>

        <!-- Form Body -->
        <form (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-xs font-bold text-[#002147] mb-1.5">
              Título del Reclamo <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              [(ngModel)]="form.title"
              required
              placeholder="Ej: Reclamo por corte en latencia de API Gateway EKS"
              class="w-full bg-white border border-[#dbe6f0] rounded-xl px-3.5 py-2.5 text-xs text-[#002147] placeholder-slate-400 focus:outline-none focus:border-[#003781] focus:ring-1 focus:ring-[#003781] shadow-2xs"
            />
          </div>

          <!-- Category & Priority Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#002147] mb-1.5">
                Categoría
              </label>
              <select
                name="category"
                [(ngModel)]="form.category"
                class="w-full bg-white border border-[#dbe6f0] rounded-xl px-3.5 py-2.5 text-xs text-[#002147] focus:outline-none focus:border-[#003781] cursor-pointer shadow-2xs"
              >
                <option value="SLA & Infraestructura">SLA & Infraestructura</option>
                <option value="Facturación Cloud">Facturación Cloud</option>
                <option value="Acceso & Seguridad">Acceso & Seguridad</option>
                <option value="Pase a Producción Urgente">Pase a Producción Urgente</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#002147] mb-1.5">
                Prioridad
              </label>
              <select
                name="priority"
                [(ngModel)]="form.priority"
                class="w-full bg-white border border-[#dbe6f0] rounded-xl px-3.5 py-2.5 text-xs text-[#002147] focus:outline-none focus:border-[#003781] cursor-pointer shadow-2xs"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica (P1)</option>
              </select>
            </div>
          </div>

          <!-- Approver Email & Impact -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#002147] mb-1.5">
                Correo del Aprobador (Outlook M365) <span class="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="approverEmail"
                [(ngModel)]="form.approverEmail"
                required
                placeholder="supervisor.ti@dojo.corp"
                class="w-full bg-white border border-[#dbe6f0] rounded-xl px-3.5 py-2.5 text-xs text-[#002147] placeholder-slate-400 focus:outline-none focus:border-[#003781] focus:ring-1 focus:ring-[#003781] shadow-2xs"
              />
              <p class="text-[10px] text-slate-500 mt-1">
                Recibirá la tarjeta interactiva de Aprobar/Rechazar en Outlook.
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#002147] mb-1.5">
                Impacto o Monto Estimado
              </label>
              <input
                type="text"
                name="amountOrImpact"
                [(ngModel)]="form.amountOrImpact"
                placeholder="Ej: $2,800 USD / 45 min indisponibilidad"
                class="w-full bg-white border border-[#dbe6f0] rounded-xl px-3.5 py-2.5 text-xs text-[#002147] placeholder-slate-400 focus:outline-none focus:border-[#003781] focus:ring-1 focus:ring-[#003781] shadow-2xs"
              />
            </div>
          </div>

          <!-- Justification -->
          <div>
            <label class="block text-xs font-bold text-[#002147] mb-1.5">
              Justificación y Detalle Técnico <span class="text-rose-500">*</span>
            </label>
            <textarea
              name="justification"
              [(ngModel)]="form.justification"
              required
              rows="3"
              placeholder="Detalla los motivos, contexto y motivo por el cual se requiere la aprobación..."
              class="w-full bg-white border border-[#dbe6f0] rounded-xl px-3.5 py-2.5 text-xs text-[#002147] placeholder-slate-400 focus:outline-none focus:border-[#003781] focus:ring-1 focus:ring-[#003781] resize-none shadow-2xs"
            ></textarea>
          </div>

          <!-- Options -->
          <div class="pt-2">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="autoSend"
                [(ngModel)]="form.autoSend"
                class="w-4 h-4 rounded border-[#dbe6f0] text-[#003781] focus:ring-[#003781]"
              />
              <span class="text-xs text-slate-700 font-medium">
                @if (config().triggerMode === 'HTTP_WEBHOOK') {
                  Disparar inmediatamente vía <strong>Webhook HTTP POST</strong> a Power Automate tras guardar
                } @else if (config().triggerMode === 'OUTLOOK_EMAIL') {
                  Abrir inmediatamente en <strong>Office 365 Outlook</strong> con el asunto [RECLAMO DOJO] tras guardar
                } @else {
                  Disparar inmediatamente en el <strong>Simulador Local</strong> tras guardar
                }
              </span>
            </label>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-[#dbe6f0] flex items-center justify-end gap-2.5">
            <ai-button variant="ghost" size="md" (click)="onCancel()" type="button">
              <span>Cancelar</span>
            </ai-button>

            <ai-button
              variant="primary"
              size="md"
              type="submit"
              [disabled]="!isFormValid() || isSubmitting()"
              [loading]="isSubmitting()"
              class="shadow-xs"
            >
              <ai-icon name="send" [size]="14" />
              <span>{{ form.autoSend ? 'Registrar y Disparar' : 'Guardar Borrador' }}</span>
            </ai-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class NewClaimModalComponent {
  private readonly claimsService = inject(ClaimsService);

  @Output() close = new EventEmitter<void>();

  protected readonly isSubmitting = this.claimsService.isSubmitting;
  protected readonly config = this.claimsService.config;

  protected form = {
    title: '',
    category: 'SLA & Infraestructura' as ClaimCategory,
    priority: 'ALTA' as ClaimPriority,
    approverEmail: this.claimsService.config().outlookTriggerEmail || 'diego.bueno@ayesa.com',
    amountOrImpact: '',
    justification: '',
    autoSend: true
  };

  protected isFormValid(): boolean {
    return (
      this.form.title.trim().length > 3 &&
      this.form.approverEmail.trim().length > 5 &&
      this.form.justification.trim().length > 5
    );
  }

  protected onSubmit(): void {
    if (!this.isFormValid()) return;

    this.claimsService.createClaim({
      title: this.form.title.trim(),
      category: this.form.category,
      priority: this.form.priority,
      approverEmail: this.form.approverEmail.trim(),
      amountOrImpact: this.form.amountOrImpact.trim(),
      justification: this.form.justification.trim(),
      autoSend: this.form.autoSend
    });

    this.close.emit();
  }

  protected onCancel(): void {
    this.close.emit();
  }
}
