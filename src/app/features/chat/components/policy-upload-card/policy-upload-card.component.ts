import { Component, output, signal } from '@angular/core';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';

@Component({
  selector: 'app-policy-upload-card',
  standalone: true,
  imports: [AiIconComponent],
  template: `
    <div class="flex flex-col gap-4 select-none">
      <!-- 2x2 Policy Summary Cards Grid -->
      <div class="rounded-2xl border border-[#dbe6f0] bg-white p-4 shadow-sm flex flex-col gap-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Card 1: SLA -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#003781] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <ai-icon name="shield" [size]="16" />
              </div>
              <div>
                <span class="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                  COBERTURA SLA
                </span>
                <span class="text-xs font-bold text-[#002147]">99.99% Alta Disponibilidad</span>
              </div>
            </div>
            <ai-icon name="check" [size]="14" class="text-emerald-500" />
          </div>

          <!-- Card 2: Cluster -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#003781] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <ai-icon name="server" [size]="16" />
              </div>
              <div>
                <span class="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                  INFRAESTRUCTURA
                </span>
                <span class="text-xs font-bold text-[#002147]">Kubernetes EKS-PROD · US-East</span>
              </div>
            </div>
            <ai-icon name="check" [size]="14" class="text-emerald-500" />
          </div>

          <!-- Card 3: Observabilidad -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#003781] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <ai-icon name="sparkles" [size]="16" />
              </div>
              <div>
                <span class="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                  MONITOREO
                </span>
                <span class="text-xs font-bold text-[#002147]">OpenTelemetry & Grafana 24/7</span>
              </div>
            </div>
            <ai-icon name="check" [size]="14" class="text-emerald-500" />
          </div>

          <!-- Card 4: Tiempo RTO -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#003781] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <ai-icon name="credit-card" [size]="16" />
              </div>
              <div>
                <span class="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">
                  TIEMPO RTO
                </span>
                <span class="text-xs font-bold text-[#002147]">< 15 min RTO garantizado</span>
              </div>
            </div>
            <ai-icon name="check" [size]="14" class="text-emerald-500" />
          </div>
        </div>

        <!-- Policy Active Status Badge -->
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#e6f9f3] text-[#059669] text-xs font-medium border border-[#a7f3d0]">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SLA empresarial activo · infraestructura protegida</span>
        </div>
      </div>

      <!-- Assistant Verification Question & Choice Chips -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center gap-2 text-xs text-slate-700">
          <span>Para verificar el alcance de la incidencia, ¿el reporte corresponde al Cluster EKS-PROD de US-East?</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="onConfirmVehicle()"
            class="px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-[#003781] bg-white text-xs font-medium text-[#002147] hover:text-[#003781] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
            [class.border-[#003781]]="vehicleConfirmed()"
            [class.bg-[#e8f2fa]]="vehicleConfirmed()"
          >
            <ai-icon name="check" [size]="13" class="text-emerald-600" />
            <span>Sí, corresponde a este cluster</span>
          </button>

          <button
            type="button"
            class="px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white text-xs font-medium text-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ai-icon name="x" [size]="13" class="text-slate-400" />
            <span>No, corresponde a otro entorno</span>
          </button>
        </div>
      </div>

      <!-- User Confirmation Bubble if Confirmed -->
      @if (vehicleConfirmed()) {
        <div class="flex justify-end animate-cascade-in">
          <div class="bg-[#003781] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-sm shadow-blue-900/10 text-xs font-medium">
            Sí, corresponde al cluster de producción US-East.
          </div>
        </div>

        <!-- Assistant Follow-up & Upload Accident Report Card -->
        <div class="flex flex-col gap-2.5 animate-cascade-in">
          <p class="text-xs text-slate-700 leading-relaxed">
            Excelente. Por favor adjunta el volcado de logs o la telemetría del incidente para proceder con el análisis de causa raíz (RCA).
          </p>

          <!-- Upload Telemetry Card -->
          <div class="rounded-2xl border border-[#dbe6f0] bg-white overflow-hidden shadow-sm flex flex-col">
            <!-- Blue Header -->
            <div class="px-4 py-3 bg-[#003781] text-white flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <ai-icon name="document" [size]="16" class="text-cyan-200" />
                <div class="flex flex-col leading-tight">
                  <span class="text-xs font-bold">Telemetría y Logs del Sistema</span>
                  <span class="text-[10px] text-cyan-200">Archivos .log, stack traces o configuraciones YAML</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
                {{ files.length }} archivos
              </span>
            </div>

            <!-- Attached Files List -->
            <div class="p-3.5 bg-slate-50/60 flex flex-col gap-2">
              <div class="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                <span>Adjuntos</span>
                <button
                  type="button"
                  (click)="addMockFile()"
                  class="text-[#007ab3] hover:underline flex items-center gap-1 normal-case font-medium cursor-pointer"
                >
                  <ai-icon name="plus" [size]="11" />
                  <span>Añadir más</span>
                </button>
              </div>

              @for (file of files; track file.name) {
                <div class="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <ai-icon name="document" [size]="14" class="text-slate-400" />
                    <span class="font-medium text-[#002147]">{{ file.name }}</span>
                  </div>
                  <div class="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <ai-icon name="check" [size]="12" />
                    <span>Listo</span>
                  </div>
                </div>
              }

              <!-- Upload Report Primary Button -->
              <button
                type="button"
                (click)="onProceedToInspection()"
                class="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#002654] hover:bg-[#003781] active:scale-99 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ai-icon name="upload" [size]="14" />
                <span>Examinar Topología 3D</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PolicyUploadCardComponent {
  readonly proceedToInspection = output<void>();

  readonly vehicleConfirmed = signal<boolean>(true); // Confirmed by default as shown in Screenshot 2

  readonly files = [
    { name: 'error_trace_gateway.log', status: 'Listo' },
    { name: 'spanner_deadlock_dump.json', status: 'Listo' }
  ];

  protected onConfirmVehicle(): void {
    this.vehicleConfirmed.set(true);
  }

  protected addMockFile(): void {
    this.files.push({ name: `server_telemetry_${this.files.length + 1}.log`, status: 'Listo' });
  }

  protected onProceedToInspection(): void {
    this.proceedToInspection.emit();
  }
}
