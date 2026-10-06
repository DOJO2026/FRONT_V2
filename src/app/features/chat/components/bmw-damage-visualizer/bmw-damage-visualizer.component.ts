import { Component, computed, output, signal } from '@angular/core';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../shared/ui/ai-tooltip';

export interface DamageArea {
  id: number;
  name: string;
  severity: 'Moderate' | 'Heavy';
  x: number; // percentage
  y: number; // percentage
  description: string;
}

@Component({
  selector: 'app-bmw-damage-visualizer',
  standalone: true,
  imports: [AiIconComponent, AiTooltipDirective],
  template: `
    <div class="rounded-2xl border border-[#dbe6f0] overflow-hidden bg-white shadow-sm flex flex-col select-none">
      <!-- Dark Navy Assessment Bar -->
      <div class="px-4 py-2.5 bg-[#002b54] text-white flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <ai-icon name="shield" [size]="14" class="text-cyan-300" />
          <span class="font-semibold tracking-wide">Diagnóstico de Infraestructura · Cluster Kubernetes EKS</span>
        </div>
        <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-200 text-[11px] border border-white/10">
          <ai-icon name="sparkles" [size]="11" class="text-cyan-300" />
          <span>Visión IA · 3 anomalías detectadas</span>
        </div>
      </div>

      <!-- Detected Damage Header & 3 Area Chips -->
      <div class="p-3.5 bg-slate-50/70 border-b border-[#e2e8f0] flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            ANOMALÍAS DETECTADAS · 3 COMPONENTES
          </span>
          <span class="px-2.5 py-0.5 rounded-full bg-[#e6f9f3] text-[#059669] text-[10px] font-semibold border border-[#a7f3d0]">
            SLA Protegido · Mitigación activa
          </span>
        </div>

        <!-- 3 Area Chips -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          @for (area of damageAreas; track area.id) {
            <button
              type="button"
              (click)="selectArea(area)"
              class="px-3 py-2 rounded-xl text-left transition-all border flex items-center justify-between gap-2 cursor-pointer"
              [class.bg-white]="selectedArea().id === area.id"
              [class.border-[#007ab3]]="selectedArea().id === area.id"
              [class.ring-2]="selectedArea().id === area.id"
              [class.ring-[#007ab3]/20]="selectedArea().id === area.id"
              [class.shadow-sm]="selectedArea().id === area.id"
              [class.bg-white/60]="selectedArea().id !== area.id"
              [class.border-slate-200]="selectedArea().id !== area.id"
              [class.hover:border-slate-300]="selectedArea().id !== area.id"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  [class.bg-[#003781]]="selectedArea().id === area.id"
                  [class.text-white]="selectedArea().id === area.id"
                  [class.bg-slate-200]="selectedArea().id !== area.id"
                  [class.text-slate-700]="selectedArea().id !== area.id"
                >
                  {{ area.id }}
                </span>
                <div class="flex flex-col truncate">
                  <span class="text-xs font-semibold text-[#002147] truncate">
                    {{ area.name }}
                  </span>
                  <span class="text-[10px] text-slate-500">
                    • {{ area.severity }}
                  </span>
                </div>
              </div>

              <!-- Target Reticle Icon -->
              <div
                class="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0"
                [class.border-[#007ab3]]="selectedArea().id === area.id"
                [class.border-slate-300]="selectedArea().id !== area.id"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  [class.bg-[#007ab3]]="selectedArea().id === area.id"
                  [class.bg-transparent]="selectedArea().id !== area.id"
                ></div>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- 3D Vehicle Viewport on Dark Background -->
      <div class="relative bg-[#001224] p-4 sm:p-6 overflow-hidden min-h-[300px] sm:min-h-[350px] flex flex-col justify-between">
        <!-- Top Overlay Info Bar -->
        <div class="relative z-10 flex items-center justify-between text-xs text-slate-300">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-white tracking-wide text-[11px] sm:text-xs">
              Cluster Kubernetes EKS-PROD-01 · Región US-East
            </span>
            <span class="text-[10px] text-cyan-300">NOC DOJO 2.0</span>
          </div>

          <button
            type="button"
            (click)="toggleOrbit()"
            class="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ai-icon name="refresh" [size]="10" class="text-cyan-300" [class.animate-spin]="orbiting()" />
            <span>Rotar vista 3D</span>
          </button>
        </div>

        <!-- 3D Car Model Visualization Canvas -->
        <div
          class="relative my-3 flex items-center justify-center cursor-grab active:cursor-grabbing group"
          (mousedown)="startDrag()"
          (mouseup)="stopDrag()"
        >
          <!-- Ground Shadow / Ambient Light -->
          <div class="absolute bottom-2 w-4/5 h-12 bg-radial from-black/80 to-transparent blur-md rounded-full pointer-events-none"></div>

          <!-- Realistic Vector 3D BMW X3 Model Profile -->
          <div
            class="relative w-full max-w-xl transition-transform duration-500 ease-out"
            [style.transform]="carTransform()"
          >
            <svg
              viewBox="0 0 800 380"
              class="w-full h-auto drop-shadow-2xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <!-- Metallic Car Paint Gradient -->
                <linearGradient id="bmwSilverPaint" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stop-color="#b0c8dc" />
                  <stop offset="25%" stop-color="#8baec4" />
                  <stop offset="50%" stop-color="#60869e" />
                  <stop offset="75%" stop-color="#7a9fb8" />
                  <stop offset="100%" stop-color="#466479" />
                </linearGradient>

                <!-- Tinted Glass Gradient -->
                <linearGradient id="bmwGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#1a2e3d" stop-opacity="0.9" />
                  <stop offset="50%" stop-color="#0c161e" stop-opacity="0.95" />
                  <stop offset="100%" stop-color="#142633" stop-opacity="0.9" />
                </linearGradient>

                <!-- Wheel Rim Gradient -->
                <radialGradient id="wheelRim" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#111" />
                  <stop offset="55%" stop-color="#333" />
                  <stop offset="75%" stop-color="#888" />
                  <stop offset="90%" stop-color="#222" />
                  <stop offset="100%" stop-color="#111" />
                </radialGradient>

                <!-- Hotspot Orange Pulse Glow Filter -->
                <filter id="orangePulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <!-- Main Chassis Silouette & Shading -->
              <!-- Car Body -->
              <path
                d="M 120 230 C 130 190, 160 160, 240 145 C 310 130, 420 120, 520 125 C 570 128, 620 150, 670 190 C 710 215, 730 240, 725 260 L 710 280 C 690 285, 660 285, 640 285 C 630 240, 570 240, 560 285 L 300 285 C 290 240, 230 240, 220 285 L 140 280 C 120 270, 115 250, 120 230 Z"
                fill="url(#bmwSilverPaint)"
                stroke="#37556a"
                stroke-width="2"
              />

              <!-- Cabin Greenhouse & Windows -->
              <path
                d="M 270 145 C 340 135, 450 130, 530 135 C 570 145, 600 170, 625 195 L 260 195 C 255 175, 260 155, 270 145 Z"
                fill="url(#bmwGlass)"
                stroke="#2a3f4e"
                stroke-width="2"
              />

              <!-- Window B-Pillar & C-Pillar -->
              <line x1="430" y1="133" x2="430" y2="195" stroke="#1e2c36" stroke-width="8" />
              <line x1="535" y1="137" x2="550" y2="195" stroke="#1e2c36" stroke-width="10" />

              <!-- BMW Hofmeister Kink & Chrome Window Trim -->
              <path
                d="M 268 195 L 273 144 C 340 133, 450 128, 532 133 C 575 143, 605 170, 630 195"
                fill="none"
                stroke="#c9dce8"
                stroke-width="2"
              />

              <!-- Character Lines & Door Seams -->
              <!-- Front Door Seam -->
              <path d="M 330 195 L 320 283" stroke="#253a47" stroke-width="2" />
              <path d="M 450 195 L 440 283" stroke="#253a47" stroke-width="2" />
              <path d="M 580 195 L 575 283" stroke="#253a47" stroke-width="2" />

              <!-- Aerodynamic Body Crease Line -->
              <path d="M 160 210 Q 400 195 680 215" stroke="#d4e8f7" stroke-width="1.8" opacity="0.6" fill="none" />
              <path d="M 180 255 Q 400 248 650 258" stroke="#1d2e38" stroke-width="2" opacity="0.7" fill="none" />

              <!-- Headlight & Taillight Accents -->
              <!-- Front Headlight (Left/Front in perspective) -->
              <polygon points="122,232 155,220 160,238 126,242" fill="#e0f7fa" opacity="0.9" />
              <!-- Rear Taillight BMW L-shape (Right/Rear) -->
              <path d="M 685 208 L 722 225 L 718 240 L 675 230 Z" fill="#ef4444" opacity="0.9" />
              <path d="M 690 215 L 715 227" stroke="#ff8585" stroke-width="3" />

              <!-- Front Wheel & Tire -->
              <g transform="translate(255, 275)">
                <circle cx="0" cy="0" r="45" fill="#111820" stroke="#0a0e13" stroke-width="4" />
                <circle cx="0" cy="0" r="32" fill="url(#wheelRim)" />
                <!-- 5-Spoke BMW M-Sport Rim Design -->
                <line x1="0" y1="-26" x2="0" y2="26" stroke="#c0d4e3" stroke-width="5" />
                <line x1="-24" y1="-10" x2="24" y2="10" stroke="#c0d4e3" stroke-width="5" />
                <line x1="-16" y1="20" x2="16" y2="-20" stroke="#c0d4e3" stroke-width="5" />
                <circle cx="0" cy="0" r="8" fill="#003781" stroke="#fff" stroke-width="1.5" />
              </g>

              <!-- Rear Wheel & Tire -->
              <g transform="translate(595, 275)">
                <circle cx="0" cy="0" r="45" fill="#111820" stroke="#0a0e13" stroke-width="4" />
                <circle cx="0" cy="0" r="32" fill="url(#wheelRim)" />
                <!-- 5-Spoke BMW M-Sport Rim Design -->
                <line x1="0" y1="-26" x2="0" y2="26" stroke="#c0d4e3" stroke-width="5" />
                <line x1="-24" y1="-10" x2="24" y2="10" stroke="#c0d4e3" stroke-width="5" />
                <line x1="-16" y1="20" x2="16" y2="-20" stroke="#c0d4e3" stroke-width="5" />
                <circle cx="0" cy="0" r="8" fill="#003781" stroke="#fff" stroke-width="1.5" />
              </g>

              <!-- Rear Exhaust & Bumper Diffuser -->
              <rect x="700" y="270" width="18" height="8" rx="3" fill="#1a1a1a" stroke="#888" stroke-width="1.5" />
            </svg>

            <!-- Interactive Hotspot Markers Positioned Directly Over Car Panels -->
            @for (area of damageAreas; track area.id) {
              <div
                class="absolute cursor-pointer transition-transform duration-300 -translate-x-1/2 -translate-y-1/2"
                [style.left.%]="area.x"
                [style.top.%]="area.y"
                (click)="selectArea(area)"
                [aiTooltip]="area.name + ' • Daño ' + area.severity"
              >
                <!-- Orange Radar Pulse Rings -->
                <div class="relative flex items-center justify-center">
                  <span
                    class="absolute w-10 h-10 rounded-full bg-orange-500/30 animate-ping"
                    [class.w-14]="selectedArea().id === area.id"
                    [class.h-14]="selectedArea().id === area.id"
                  ></span>
                  <span
                    class="absolute w-7 h-7 rounded-full bg-orange-500/50 animate-pulse"
                  ></span>
                  
                  <!-- Hotspot Core Badge with Number -->
                  <div
                    class="relative w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shadow-lg transition-all"
                    [class.bg-orange-500]="selectedArea().id === area.id"
                    [class.text-white]="selectedArea().id === area.id"
                    [class.ring-2]="selectedArea().id === area.id"
                    [class.ring-white]="selectedArea().id === area.id"
                    [class.scale-125]="selectedArea().id === area.id"
                    [class.bg-orange-600/90]="selectedArea().id !== area.id"
                    [class.text-white]="selectedArea().id !== area.id"
                  >
                    {{ area.id }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Bottom Controls & Thumbnails -->
        <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <!-- Helper Prompt Text -->
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400 text-center sm:text-left">
            <ai-icon name="sparkles" [size]="13" class="text-cyan-400" />
            <span>Selecciona un componente del servidor para inspeccionar el diagnóstico telemétrico</span>
          </div>

          <!-- Bottom Right: Photo Thumbnails & Confirm Button -->
          <div class="flex items-center gap-2.5">
            <!-- 3 Photos Analysed Thumbnails -->
            <div class="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
              <div
                class="w-10 h-7 rounded-lg bg-slate-800 border border-slate-600 overflow-hidden flex items-center justify-center text-[8px] text-slate-400 hover:scale-105 transition-transform"
                title="error_trace_gateway.log"
              >
                <div class="w-full h-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-[7px] font-mono text-white">
                  LOG 1
                </div>
              </div>
              <div
                class="w-10 h-7 rounded-lg bg-slate-800 border border-slate-600 overflow-hidden flex items-center justify-center text-[8px] text-slate-400 hover:scale-105 transition-transform"
                title="spanner_deadlock.json"
              >
                <div class="w-full h-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-[7px] font-mono text-white">
                  LOG 2
                </div>
              </div>
              <div
                class="w-10 h-7 rounded-lg bg-slate-800 border border-cyan-500/80 overflow-hidden flex items-center justify-center text-[8px] text-cyan-300 hover:scale-105 transition-transform"
                title="grafana_metrics.png"
              >
                <div class="w-full h-full bg-gradient-to-tr from-cyan-900 to-slate-600 flex items-center justify-center text-[7px] font-mono text-cyan-200">
                  MET 3
                </div>
              </div>
            </div>

            <!-- Confirm Button -->
            <button
              type="button"
              (click)="onConfirm()"
              class="px-4 py-2 rounded-xl bg-[#003781] hover:bg-[#002860] active:scale-98 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ai-icon name="check" [size]="14" />
              <span>Confirmar Diagnóstico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BmwDamageVisualizerComponent {
  readonly confirmed = output<DamageArea>();

  protected readonly damageAreas: DamageArea[] = [
    {
      id: 1,
      name: 'API Gateway & Ingress',
      severity: 'Heavy',
      x: 36,
      y: 53,
      description: 'Latencia P99 > 1,200ms y timeouts HTTP 504 en microservicio de facturación.'
    },
    {
      id: 2,
      name: 'Base de Datos Spanner',
      severity: 'Heavy',
      x: 52,
      y: 53,
      description: 'Pico de locks transaccionales y bloqueo en réplica multirregión.'
    },
    {
      id: 3,
      name: 'Worker Nodes (K8s)',
      severity: 'Moderate',
      x: 72,
      y: 55,
      description: 'Uso de CPU al 94% y memoria en umbral OOMKilled en nodo worker-04.'
    }
  ];

  readonly selectedArea = signal<DamageArea>(this.damageAreas[2]); // Area 3 selected by default as in screenshot
  readonly orbiting = signal<boolean>(false);
  private orbitAngle = signal<number>(0);

  protected readonly carTransform = computed(() => {
    return `rotate(${this.orbitAngle()}deg)`;
  });

  protected selectArea(area: DamageArea): void {
    this.selectedArea.set(area);
  }

  protected toggleOrbit(): void {
    this.orbiting.set(!this.orbiting());
    if (this.orbiting()) {
      this.orbitAngle.update((a) => (a === 0 ? 3 : 0));
    } else {
      this.orbitAngle.set(0);
    }
  }

  protected startDrag(): void {
    this.orbitAngle.update((a) => (a === 0 ? -4 : 0));
  }

  protected stopDrag(): void {
    this.orbitAngle.set(0);
  }

  protected onConfirm(): void {
    this.confirmed.emit(this.selectedArea());
  }
}
