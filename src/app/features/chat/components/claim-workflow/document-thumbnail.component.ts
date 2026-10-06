import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { ScannedAttachment } from '../../models/chat-message.model';

@Component({
  selector: 'app-document-thumbnail',
  standalone: true,
  imports: [AiIconComponent],
  template: `
    <!-- MAIN DOCUMENT THUMBNAIL CONTAINER -->
    <div
      class="relative group cursor-pointer select-none transition-all duration-300"
      [class.w-full]="mode() === 'scanning'"
      [class.max-w-[280px]]="mode() === 'scanning'"
      (click)="toggleEnlarge()"
    >
      <!-- Real Paper / Sheet Geometry Container -->
      <div
        class="relative w-full aspect-[1/1.38] rounded-xl overflow-hidden shadow-xs border transition-all duration-300 bg-white"
        [class]="containerClasses()"
      >
        <!-- Folded Corner Effect (Top Right) -->
        <div class="absolute top-0 right-0 w-5 h-5 pointer-events-none z-20">
          <div class="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-slate-200 border-l-[20px] border-l-transparent"></div>
          <div class="absolute top-0 right-0 w-0 h-0 border-b-[20px] border-b-slate-300 border-r-[20px] border-r-transparent shadow-xs"></div>
        </div>

        <!-- ========================================================= -->
        <!-- CASE 1: REAL ATTACHED IMAGE (Uploaded by user or photo preset) -->
        <!-- ========================================================= -->
        @if (isPhoto()) {
          <div class="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
            @if (file()?.previewUrl) {
              <!-- ACTUAL USER-UPLOADED IMAGE -->
              <img
                [src]="file()!.previewUrl"
                [alt]="file()?.name || 'Evidencia adjunta'"
                class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            } @else {
              <!-- Fallback High-Quality Photographic Evidence for Presets -->
              <div class="relative w-full h-full overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1543393470-b2c833b98dce?auto=format&fit=crop&w=600&q=80"
                  alt="Evidencia telemétrica de incidencia"
                  class="w-full h-full object-cover object-center opacity-90"
                />
              </div>
            }

            <!-- Real-time Camera HUD Telemetry Ribbon -->
            <div class="absolute inset-x-0 top-0 p-2 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent flex items-center justify-between text-[7.5px] font-mono text-cyan-300 z-10">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span class="font-bold">TELEMETRÍA REAL</span>
              </div>
              <span class="text-slate-300 font-mono">{{ file()?.size }}</span>
            </div>

            <!-- Bottom Reticle Telemetry Ribbon -->
            <div class="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex items-center justify-between text-[7px] font-mono text-slate-400 z-10">
              <span class="text-cyan-300 truncate max-w-[110px]">{{ file()?.name }}</span>
              <span class="text-emerald-400 font-bold">NOC VERIF</span>
            </div>
          </div>
        }

        <!-- ========================================================= -->
        <!-- CASE 2: REAL FACTURA (PDF/Comprobante) -->
        <!-- ========================================================= -->
        @else if (isInvoice()) {
          <div class="w-full h-full bg-white p-3 flex flex-col justify-between text-slate-800 font-sans relative overflow-hidden">
            <!-- Background Watermark -->
            <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span class="text-4xl font-black font-mono rotate-[-35deg] text-[#003781] tracking-widest">FACTURA</span>
            </div>

            <!-- Invoice Header -->
            <div class="relative z-10 flex items-start justify-between border-b border-slate-200 pb-2">
              <div>
                <div class="flex items-center gap-1.5">
                  <div class="w-4 h-4 rounded bg-blue-50 border border-blue-200 text-[#003781] flex items-center justify-center text-[9px] font-bold">
                    F
                  </div>
                  <span class="text-[9px] font-bold text-[#002147] tracking-wider">DATACENTER NOC • DOJO 2.0</span>
                </div>
                <div class="text-[7px] text-slate-500 font-mono mt-0.5">RUC: 20491823091 • SERIE F-0028</div>
              </div>
              <div class="text-right">
                <span class="text-[8px] font-mono font-bold text-[#003781]">#F-8942-A</span>
              </div>
            </div>

            <!-- Itemized Table -->
            <div class="relative z-10 flex flex-col gap-1.5 my-2 text-[7px]">
              <div class="flex justify-between font-mono text-slate-400 border-b border-slate-200 pb-0.5">
                <span>CONCEPTO</span>
                <span>SUBTOTAL</span>
              </div>

              <div class="flex justify-between items-center py-0.5">
                <span class="truncate max-w-[130px] text-slate-700">Mano de obra y calibración</span>
                <span class="font-mono text-[#002147] font-semibold">$850.00</span>
              </div>

              <div class="flex justify-between items-center py-0.5">
                <span class="truncate max-w-[130px] text-slate-700">Repuestos originales OEM</span>
                <span class="font-mono text-[#002147] font-semibold">$1,420.00</span>
              </div>

              <div class="flex justify-between items-center py-0.5">
                <span class="truncate max-w-[130px] text-slate-700">Pintura poliuretano bicapa</span>
                <span class="font-mono text-[#002147] font-semibold">$620.00</span>
              </div>

              <!-- Total Highlight Box -->
              <div class="mt-1 p-1.5 rounded bg-blue-50 border border-blue-200 flex justify-between items-center">
                <span class="text-[8px] font-bold text-[#003781]">TOTAL FACTURADO</span>
                <span class="text-[10px] font-mono font-black text-[#003781]">$2,890.00 USD</span>
              </div>
            </div>

            <!-- Footer: Seal & Barcode -->
            <div class="relative z-10 flex items-center justify-between pt-2 border-t border-slate-200">
              <!-- Digital Seal -->
              <div class="w-9 h-9 rounded-full border border-dashed border-[#003781]/60 flex flex-col items-center justify-center rotate-[-12deg] bg-blue-50/60">
                <span class="text-[5px] font-mono text-[#003781] font-bold uppercase">AUTORIZADO</span>
                <span class="text-[7px] text-[#003781]">✓</span>
              </div>

              <!-- Barcode Stripes -->
              <div class="flex items-end gap-[1.5px] h-5 opacity-70">
                <div class="w-[2px] h-full bg-slate-700"></div>
                <div class="w-[1px] h-full bg-slate-700"></div>
                <div class="w-[3px] h-full bg-slate-700"></div>
                <div class="w-[1px] h-full bg-slate-700"></div>
                <div class="w-[2px] h-full bg-slate-700"></div>
                <div class="w-[4px] h-full bg-slate-700"></div>
                <div class="w-[1px] h-full bg-slate-700"></div>
                <div class="w-[2px] h-full bg-slate-700"></div>
              </div>
            </div>
          </div>
        }

        <!-- ========================================================= -->
        <!-- CASE 3: REAL DOCUMENTO / INFORME OFICIAL (PDF/DOC) -->
        <!-- ========================================================= -->
        @else {
          <div class="w-full h-full bg-white p-3 flex flex-col justify-between text-slate-800 relative overflow-hidden">
            <!-- Background Watermark -->
            <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span class="text-4xl font-black font-mono rotate-[-30deg] text-[#003781] tracking-widest">OFICIAL</span>
            </div>

            <!-- Document Official Header with Real File Name -->
            <div class="relative z-10 pb-2 border-b border-slate-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5 min-w-0">
                  <div class="w-4 h-4 rounded bg-blue-50 border border-blue-200 text-[#003781] flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                    🛡
                  </div>
                  <div class="min-w-0">
                    <h6 class="text-[8px] font-bold text-[#002147] uppercase tracking-wider truncate">DOJO 2.0 SISTEMAS</h6>
                    <span class="text-[6px] text-slate-500 block font-mono">OPERACIONES CLOUD & SRE</span>
                  </div>
                </div>

                <!-- Folio Badge -->
                <div class="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[6px] font-mono text-[#003781] font-semibold flex-shrink-0">
                  EXP-8942
                </div>
              </div>

              <!-- Display Actual Uploaded Document Title -->
              <div class="mt-2 text-[7.5px] font-bold text-[#002147] truncate" [title]="file()?.name">
                {{ file()?.name || 'INFORME TÉCNICO DE EVALUACIÓN' }}
              </div>
              <div class="text-[6.5px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <span>SLA: #SLA-TI-99421</span>
                <span>•</span>
                <span>{{ file()?.size || '1.8 MB' }}</span>
              </div>
            </div>

            <!-- Simulated Text Paragraphs & Data Section -->
            <div class="relative z-10 flex flex-col gap-1.5 my-2">
              <!-- Micro Text Paragraph Simulation -->
              <div class="flex flex-col gap-1">
                <div class="h-1 bg-slate-200 rounded w-[92%]"></div>
                <div class="h-1 bg-slate-200 rounded w-[84%]"></div>
                <div class="h-1 bg-slate-200 rounded w-[76%]"></div>
                <div class="h-1 bg-slate-200 rounded w-[60%]"></div>
              </div>

              <!-- Mini Structured Table -->
              <div class="p-1.5 rounded bg-slate-50 border border-slate-200 flex flex-col gap-1 text-[6.5px]">
                <div class="flex justify-between text-slate-500 font-mono">
                  <span>RUBRO PERITADO</span>
                  <span>MONTO</span>
                </div>
                <div class="flex justify-between text-slate-700">
                  <span>Daño estructural carrocería</span>
                  <span class="font-mono text-[#002147] font-semibold">$2,100.00</span>
                </div>
                <div class="flex justify-between text-slate-700">
                  <span>Mano de obra y reposición</span>
                  <span class="font-mono text-[#002147] font-semibold">$1,350.00</span>
                </div>
                <div class="flex justify-between font-bold text-[#059669] border-t border-slate-200 pt-0.5">
                  <span>TOTAL ESTIMADO</span>
                  <span class="font-mono font-black text-[#002147]">$3,450.00 USD</span>
                </div>
              </div>
            </div>

            <!-- Footer: Stamp, Signature & Barcode -->
            <div class="relative z-10 flex items-center justify-between pt-2 border-t border-slate-200">
              <!-- Official Stamp -->
              <div class="w-8 h-8 rounded-full border-2 border-[#059669]/60 flex flex-col items-center justify-center rotate-[-15deg] bg-[#e6f9f3]">
                <span class="text-[5px] font-mono font-bold text-[#059669]">AUDITADO</span>
                <span class="text-[6px] font-bold text-[#059669]">★ DOJO 2.0 ★</span>
              </div>

              <!-- Signature Doodle -->
              <div class="flex flex-col items-center">
                <svg class="w-12 h-4 text-slate-500" viewBox="0 0 100 30" fill="none" stroke="currentColor">
                  <path d="M10,20 Q30,5 40,15 T60,25 Q70,5 90,20" stroke-width="2" stroke-linecap="round" />
                </svg>
                <span class="text-[5px] text-slate-500 font-mono">Firma Validador</span>
              </div>

              <!-- Barcode Stripes -->
              <div class="flex items-end gap-[1px] h-4 opacity-70">
                <div class="w-[2px] h-full bg-slate-700"></div>
                <div class="w-[1px] h-full bg-slate-700"></div>
                <div class="w-[2px] h-full bg-slate-700"></div>
                <div class="w-[3px] h-full bg-slate-700"></div>
                <div class="w-[1px] h-full bg-slate-700"></div>
              </div>
            </div>
          </div>
        }

        <!-- ========================================================= -->
        <!-- SCANNING OVERLAYS & HOLOGRAPHIC RECOGNITION BOXES -->
        <!-- ========================================================= -->
        @if (mode() === 'scanning') {
          <!-- Holographic Cyber Grid Mesh Overlay -->
          <div class="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.15)_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none z-30"></div>

          <!-- Dynamic OCR Recognition Highlights (Triggered as progress advances) -->
          @if (scanProgress() >= 15 && scanProgress() <= 90) {
            <!-- Header Bounding Box -->
            <div
              class="absolute top-3 left-3 right-8 h-8 rounded border border-cyan-400 bg-cyan-400/20 shadow-[0_0_12px_rgba(6,182,212,0.6)] z-35 animate-ocr-lock flex items-start justify-end p-0.5 pointer-events-none"
            >
              <span class="text-[6px] font-mono font-bold bg-cyan-500 text-slate-950 px-1 rounded-sm">
                OCR: CABECERA [100%]
              </span>
            </div>
          }

          @if (scanProgress() >= 40 && scanProgress() <= 95) {
            <!-- Claim Amount Bounding Box -->
            <div
              class="absolute top-28 left-3 right-3 h-10 rounded border border-emerald-400 bg-emerald-400/25 shadow-[0_0_14px_rgba(16,163,127,0.7)] z-35 animate-ocr-lock flex items-end justify-end p-0.5 pointer-events-none"
            >
              <span class="text-[6px] font-mono font-bold bg-emerald-400 text-slate-950 px-1 rounded-sm">
                OCR: TOTAL VALIDADO
              </span>
            </div>
          }

          @if (scanProgress() >= 70) {
            <!-- Signature & Stamp Bounding Box -->
            <div
              class="absolute bottom-2 left-2 w-14 h-12 rounded border border-purple-400 bg-purple-400/20 shadow-[0_0_10px_rgba(168,85,247,0.5)] z-35 animate-ocr-lock flex items-end justify-start p-0.5 pointer-events-none"
            >
              <span class="text-[5px] font-mono font-bold bg-purple-400 text-slate-950 px-0.5 rounded-sm">
                FIRMA OK
              </span>
            </div>
          }

          <!-- Luminous Scanning Laser Bar Crossing Document Sheet -->
          <div
            class="absolute inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 shadow-[0_0_16px_#22d3ee,0_0_26px_#10A37F] z-40 animate-laser-scan pointer-events-none"
          ></div>

          <!-- Laser Trailing Light Cone -->
          <div
            class="absolute inset-x-0 h-16 bg-gradient-to-b from-cyan-400/30 via-emerald-400/20 to-transparent z-35 animate-laser-scan pointer-events-none"
          ></div>
        }

        <!-- ========================================================= -->
        <!-- VERIFIED STATE WATERMARK & EMBLEM -->
        <!-- ========================================================= -->
        @if (mode() === 'verified') {
          <!-- Translucent Diagonal Holographic Stamp -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div class="px-3 py-1.5 rounded-lg border-2 border-emerald-400 bg-slate-950/85 backdrop-blur-sm shadow-[0_0_20px_rgba(16,163,127,0.6)] rotate-[-18deg] flex items-center gap-1.5 text-emerald-400 animate-cascade-in">
              <ai-icon name="check" [size]="14" class="text-emerald-400 font-bold" />
              <div class="flex flex-col text-left">
                <span class="text-[8px] font-black font-mono tracking-wider text-white uppercase">VERIFICADO OCR</span>
                <span class="text-[6px] font-mono text-emerald-300">HASH SHA-256 OK</span>
              </div>
            </div>
          </div>
        }

        <!-- Magnify Hover Icon (when previewable) -->
        <div class="absolute bottom-1.5 right-1.5 z-25 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-slate-950/80 text-white backdrop-blur-sm border border-slate-700">
          <ai-icon name="search" [size]="12" />
        </div>
      </div>

      <!-- File Caption Underneath -->
      <div class="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
        <span class="truncate font-medium text-slate-300 max-w-[170px]" [title]="file()?.name">
          {{ file()?.name || 'Documento' }}
        </span>
        <span class="font-mono text-[9px] text-slate-500">{{ file()?.size || '1.8 MB' }}</span>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- EXPANDED HIGH-RES MODAL PREVIEW -->
    <!-- ========================================================= -->
    @if (isEnlarged()) {
      <div
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-cascade-in"
        (click)="isEnlarged.set(false)"
      >
        <div
          class="relative max-w-2xl w-full rounded-2xl bg-white border border-[#dbe6f0] p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0">
                <ai-icon name="document" [size]="18" />
              </div>
              <h4 class="text-xs font-bold text-[#002147] uppercase tracking-wider truncate">
                Vista Previa del Documento: {{ file()?.name }}
              </h4>
            </div>
            <button
              type="button"
              (click)="isEnlarged.set(false)"
              class="text-slate-400 hover:text-[#002147] cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0 transition-colors"
            >
              <ai-icon name="x" [size]="16" />
            </button>
          </div>

          <!-- Document details header -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[9px] text-slate-500 uppercase font-semibold block">Nombre de Archivo</span>
              <span class="font-mono text-[#002147] font-semibold truncate block">{{ file()?.name }}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[9px] text-slate-500 uppercase font-semibold block">Tamaño & Formato</span>
              <span class="font-mono text-[#003781] font-semibold">{{ file()?.size }} • {{ file()?.type }}</span>
            </div>
          </div>

          <!-- Full View of the Real Uploaded Document / Image -->
          <div class="w-full flex-1 overflow-auto flex items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            @if (isPhoto()) {
              @if (file()?.previewUrl) {
                <!-- REAL HIGH RES IMAGE -->
                <img
                  [src]="file()!.previewUrl"
                  [alt]="file()?.name || 'Imagen ampliada'"
                  class="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
                />
              } @else {
                <img
                  src="https://images.unsplash.com/photo-1543393470-b2c833b98dce?auto=format&fit=crop&w=1200&q=80"
                  alt="Evidencia fotográfica ampliada"
                  class="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
                />
              }
            } @else {
              <!-- Full Document View for PDF/Text -->
              <div class="w-full max-w-md p-6 rounded-xl bg-white border border-slate-200 flex flex-col gap-4 text-xs text-slate-700 shadow-sm">
                <div class="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h5 class="text-sm font-bold text-[#002147] uppercase">{{ file()?.name }}</h5>
                    <span class="text-[10px] text-[#003781] font-mono font-semibold">Expediente Oficial #REC-2026-8942-ALL</span>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-[#e6f9f3] text-[#059669] text-[10px] font-mono font-bold border border-[#a7f3d0]">
                    VERIFICADO
                  </span>
                </div>

                <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono flex flex-col gap-1.5">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Póliza:</span>
                    <span class="text-[#002147] font-semibold">#ALL-99421</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Monto Evaluado:</span>
                    <span class="text-[#002147] font-bold">$3,450.00 USD</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Autenticidad OCR:</span>
                    <span class="text-[#059669] font-bold">99.8% Confianza</span>
                  </div>
                  <div class="pt-1.5 border-t border-slate-200 text-[9px] text-slate-500 break-all">
                    SHA-256: {{ file()?.sha256 }}
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              (click)="isEnlarged.set(false)"
              class="px-4 py-1.5 rounded-xl bg-[#003781] hover:bg-[#002860] text-xs font-semibold text-white cursor-pointer transition-colors shadow-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class DocumentThumbnailComponent {
  readonly file = input<ScannedAttachment | null>(null);
  readonly mode = input<'thumbnail' | 'scanning' | 'verified'>('thumbnail');
  readonly scanProgress = input<number>(0);
  readonly showModalOnClick = input<boolean>(true);

  protected readonly isEnlarged = signal<boolean>(false);

  protected readonly isPhoto = computed(() => {
    const f = this.file();
    if (!f) return false;
    const name = f.name?.toLowerCase() || '';
    const type = f.type?.toLowerCase() || '';
    const url = f.previewUrl || '';
    return (
      url.startsWith('data:image/') ||
      type.startsWith('image/') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png') ||
      name.endsWith('.webp') ||
      name.endsWith('.gif') ||
      name.endsWith('.bmp') ||
      name.includes('captura') ||
      name.includes('screenshot') ||
      type.includes('foto')
    );
  });

  protected readonly isInvoice = computed(() => {
    const f = this.file();
    if (!f) return false;
    const name = f.name?.toLowerCase() || '';
    return name.includes('factura') || name.includes('invoice');
  });

  protected readonly containerClasses = computed(() => {
    if (this.mode() === 'scanning') {
      return 'border-[#003781] shadow-md ring-2 ring-blue-200';
    }
    if (this.mode() === 'verified') {
      return 'border-[#059669] shadow-sm';
    }
    return 'border-slate-300 hover:border-[#003781] shadow-xs';
  });

  protected toggleEnlarge(): void {
    if (this.showModalOnClick() && this.mode() !== 'scanning') {
      this.isEnlarged.set(!this.isEnlarged());
    }
  }
}
