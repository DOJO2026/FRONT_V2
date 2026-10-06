import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { PowerAutomateTriggerMode } from '../../models/claim.model';
import { ClaimsService } from '../../services/claims.service';

@Component({
  selector: 'app-power-automate-banner',
  standalone: true,
  imports: [FormsModule, AiButtonComponent, AiIconComponent],
  template: `
    <div
      class="rounded-2xl border p-5 sm:p-6 transition-all shadow-sm"
      [class]="
        config().triggerMode === 'OUTLOOK_EMAIL'
          ? 'bg-gradient-to-r from-[#e8f2fa] via-white to-[#f0f6fc] border-[#c2d9ee]'
          : config().triggerMode === 'HTTP_WEBHOOK'
            ? 'bg-gradient-to-r from-[#e6f9f3] via-white to-[#f0fdf9] border-[#a7f3d0]'
            : 'bg-gradient-to-r from-[#fbf8ee] via-white to-[#fdfbf7] border-[#f4e2b8]'
      "
    >
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Left: Status Indicator & Info -->
        <div class="flex items-start gap-4">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            [class]="
              config().triggerMode === 'OUTLOOK_EMAIL'
                ? 'bg-[#003781] text-white shadow-md'
                : config().triggerMode === 'HTTP_WEBHOOK'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-amber-600 border border-amber-300'
            "
          >
            @if (config().triggerMode === 'OUTLOOK_EMAIL') {
              <ai-icon name="send" [size]="20" />
            } @else if (config().triggerMode === 'HTTP_WEBHOOK') {
              <ai-icon name="globe" [size]="20" />
            } @else {
              <ai-icon name="sparkles" [size]="20" />
            }
          </div>

          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="text-sm sm:text-base font-bold text-[#002147] tracking-tight">
                Integración con Microsoft Power Automate
              </span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs"
                [class]="
                  config().triggerMode === 'OUTLOOK_EMAIL'
                    ? 'bg-[#003781] text-white border-[#003781]'
                    : config().triggerMode === 'HTTP_WEBHOOK'
                      ? (config().webhookUrl
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-300')
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                "
              >
                {{
                  config().triggerMode === 'OUTLOOK_EMAIL'
                    ? 'Opción 2: Outlook 365 (Gratis)'
                    : config().triggerMode === 'HTTP_WEBHOOK'
                      ? (config().webhookUrl ? 'Webhook HTTP en Vivo' : 'Webhook (Configura URL)')
                      : 'Modo Simulación Local'
                }}
              </span>
            </div>

            <p class="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              @if (config().triggerMode === 'OUTLOOK_EMAIL') {
                Disparador estándar gratuito de Office 365 Outlook. Power Automate escucha correos dirigidos a
                <strong class="text-[#002147] font-semibold underline">{{ config().outlookTriggerEmail }}</strong> con el asunto
                <code class="text-[#003781] bg-white px-1 py-0.5 rounded border border-[#c2d9ee] font-mono font-bold">{{ config().subjectKeyword }}</code>
                e inicia la tarjeta de aprobación sin requerir licencia Premium.
              } @else if (config().triggerMode === 'HTTP_WEBHOOK') {
                @if (config().webhookUrl) {
                  Transmitiendo solicitudes vía HTTP POST real al endpoint de tu flujo en Microsoft Power Automate
                  <span class="font-mono text-[11px] text-[#003781] font-semibold block truncate mt-0.5">
                    {{ config().webhookUrl }}
                  </span>
                } @else {
                  Has seleccionado <strong>Webhook HTTP</strong>. Haz clic en <strong>"Ajustes de Integración"</strong> para pegar la URL de invocación de tu flujo de Power Automate.
                }
              } @else {
                Modo de demostración offline. Simula el disparo, latencia y respuesta interactiva de aprobación en Outlook directamente en la interfaz.
              }
            </p>
          </div>
        </div>

        <!-- Right: Fast Mode Switcher & Settings Toggle -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Fast Mode Pills -->
          <div class="inline-flex rounded-xl bg-white border border-[#dbe6f0] p-1 shadow-2xs">
            <button
              type="button"
              (click)="setMode('OUTLOOK_EMAIL')"
              [class]="
                config().triggerMode === 'OUTLOOK_EMAIL'
                  ? 'bg-[#003781] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#002147] hover:bg-slate-50'
              "
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <ai-icon name="send" [size]="12" />
              <span>Outlook</span>
            </button>

            <button
              type="button"
              (click)="setMode('HTTP_WEBHOOK')"
              [class]="
                config().triggerMode === 'HTTP_WEBHOOK'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#002147] hover:bg-slate-50'
              "
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <ai-icon name="globe" [size]="12" />
              <span>Webhook</span>
            </button>

            <button
              type="button"
              (click)="setMode('SIMULATION')"
              [class]="
                config().triggerMode === 'SIMULATION'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#002147] hover:bg-slate-50'
              "
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <ai-icon name="sparkles" [size]="12" />
              <span>Simulación</span>
            </button>
          </div>

          <button
            type="button"
            (click)="toggleEditSettings()"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#002147] hover:text-[#003781] bg-white hover:bg-slate-50 border border-[#dbe6f0] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ai-icon name="settings" [size]="14" />
            <span>{{ isEditingSettings() ? 'Cerrar Ajustes' : 'Ajustes' }}</span>
          </button>
        </div>
      </div>

      <!-- Expandable Configuration Panel -->
      @if (isEditingSettings()) {
        <div class="mt-4 pt-4 border-t border-[#dbe6f0] grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150 text-xs">
          <!-- Trigger Mode Selector -->
          <div>
            <label class="block font-bold text-[#002147] mb-1.5">
              Modalidad de Integración
            </label>
            <select
              [(ngModel)]="tempMode"
              class="w-full bg-white border border-[#dbe6f0] rounded-xl px-3 py-2 text-xs text-[#002147] font-semibold focus:outline-none focus:border-[#003781]"
            >
              <option value="OUTLOOK_EMAIL">Opción 2: Correo Outlook 365 (Gratis / Sin Premium)</option>
              <option value="HTTP_WEBHOOK">Webhook HTTP (Requiere Licencia Premium)</option>
              <option value="SIMULATION">Simulación Local (Demostración Offline)</option>
            </select>
            <p class="text-[10px] text-slate-500 mt-1">
              Selecciona el mecanismo de comunicación preferido con Power Automate.
            </p>
          </div>

          <!-- DYNAMIC FIELDS ACCORDING TO SELECTED MODE -->
          @if (tempMode === 'HTTP_WEBHOOK') {
            <!-- HTTP Webhook URL Configuration -->
            <div class="col-span-1 md:col-span-2">
              <label class="block font-bold text-[#002147] mb-1.5 flex items-center justify-between">
                <span>URL de HTTP POST de Power Automate (Webhook)</span>
                @if (tempWebhookUrl) {
                  <span class="text-emerald-600 font-semibold text-[10px] flex items-center gap-1">
                    <ai-icon name="check" [size]="12" />
                    <span>URL cargada</span>
                  </span>
                }
              </label>
              <div class="flex gap-2">
                <input
                  type="url"
                  [(ngModel)]="tempWebhookUrl"
                  placeholder="https://prod-XX.logic.azure.com/workflows/.../triggers/manual/paths/invoke?api-version=2016-06-01..."
                  class="flex-1 bg-white border border-[#dbe6f0] rounded-xl px-3 py-2 text-xs font-mono text-[#002147] placeholder-slate-400 focus:outline-none focus:border-[#003781]"
                />
                <ai-button variant="primary" size="sm" (click)="saveSettings()">
                  <ai-icon name="check" [size]="14" />
                  <span>Guardar URL</span>
                </ai-button>
              </div>
              <p class="text-[10px] text-slate-500 mt-1">
                Pega la URL de invocación generada por el disparador <em>"Cuando se recibe una solicitud HTTP"</em> en make.powerautomate.com.
              </p>
            </div>
          } @else if (tempMode === 'OUTLOOK_EMAIL') {
            <!-- Outlook Email -->
            <div>
              <label class="block font-bold text-[#002147] mb-1.5">
                Correo de Outlook (Bandeja M365)
              </label>
              <input
                type="email"
                [(ngModel)]="tempEmail"
                placeholder="diego.bueno@ayesa.com"
                class="w-full bg-white border border-[#dbe6f0] rounded-xl px-3 py-2 text-xs text-[#002147] focus:outline-none focus:border-[#003781]"
              />
              <p class="text-[10px] text-slate-500 mt-1">
                Bandeja donde Power Automate tiene configurado el disparador de llegada.
              </p>
            </div>

            <!-- Subject Keyword -->
            <div>
              <label class="block font-bold text-[#002147] mb-1.5">
                Palabra Clave de Filtro en Asunto
              </label>
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="tempKeyword"
                  placeholder="[RECLAMO DOJO]"
                  class="flex-1 bg-white border border-[#dbe6f0] rounded-xl px-3 py-2 text-xs text-[#002147] font-mono font-bold focus:outline-none focus:border-[#003781]"
                />
                <ai-button variant="primary" size="sm" (click)="saveSettings()">
                  <ai-icon name="check" [size]="14" />
                  <span>Guardar</span>
                </ai-button>
              </div>
              <p class="text-[10px] text-slate-500 mt-1">
                Filtro configurado en el bloque "Cuando llega un nuevo correo electrónico (V3)".
              </p>
            </div>
          } @else {
            <!-- Simulation Description & Confirm -->
            <div class="col-span-1 md:col-span-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
              <div>
                <span class="font-bold text-[#002147] text-xs block">Simulación Local sin Dependencias Externas</span>
                <p class="text-[10px] text-slate-600">
                  Ideal para presentaciones y pruebas offline. Simula latencias de red y permite aprobar o rechazar directamente en pantalla.
                </p>
              </div>
              <ai-button variant="primary" size="sm" (click)="saveSettings()">
                <ai-icon name="check" [size]="14" />
                <span>Aplicar Modo</span>
              </ai-button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PowerAutomateBannerComponent {
  private readonly claimsService = inject(ClaimsService);

  protected readonly config = this.claimsService.config;
  protected readonly isEditingSettings = signal<boolean>(false);

  protected tempMode: PowerAutomateTriggerMode = 'OUTLOOK_EMAIL';
  protected tempEmail = '';
  protected tempKeyword = '';
  protected tempWebhookUrl = '';

  constructor() {
    this.syncTemps();
  }

  protected toggleEditSettings(): void {
    this.isEditingSettings.update((v) => !v);
    this.syncTemps();
  }

  protected setMode(mode: PowerAutomateTriggerMode): void {
    const isSim = mode === 'SIMULATION';
    this.claimsService.updateConfig({
      triggerMode: mode,
      simulationMode: isSim
    });
    this.syncTemps();
  }

  protected saveSettings(): void {
    const isSim = this.tempMode === 'SIMULATION';
    this.claimsService.updateConfig({
      triggerMode: this.tempMode,
      webhookUrl: this.tempWebhookUrl.trim(),
      outlookTriggerEmail: this.tempEmail.trim() || 'diego.bueno@ayesa.com',
      subjectKeyword: this.tempKeyword.trim() || '[RECLAMO DOJO]',
      simulationMode: isSim
    });
    this.isEditingSettings.set(false);
  }

  private syncTemps(): void {
    const c = this.config();
    this.tempMode = c.triggerMode || 'OUTLOOK_EMAIL';
    this.tempEmail = c.outlookTriggerEmail || 'diego.bueno@ayesa.com';
    this.tempKeyword = c.subjectKeyword || '[RECLAMO DOJO]';
    this.tempWebhookUrl = c.webhookUrl || '';
  }
}
