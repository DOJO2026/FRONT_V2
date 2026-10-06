import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiButtonComponent } from '../../../../shared/ui/ai-button';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { ChatMessage, ScannedAttachment } from '../../models/chat-message.model';
import { ChatService } from '../../services/chat.service';
import { DocumentThumbnailComponent } from './document-thumbnail.component';

@Component({
  selector: 'app-claim-workflow',
  standalone: true,
  imports: [
    RouterLink,
    AiIconComponent,
    AiButtonComponent,
    DocumentThumbnailComponent
  ],
  template: `
    @if (message().interactiveType) {
      <div class="mt-3.5 pt-3.5 border-t border-slate-200/70 flex flex-col gap-3 select-none">
        <!-- ========================================================= -->
        <!-- STEP 1: SUGGESTION CHIPS FOR CLAIM INPUT -->
        <!-- ========================================================= -->
        @if (message().interactiveType === 'claim_prompt_request') {
          <div class="flex flex-col gap-2">
            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ai-icon name="sparkles" [size]="12" class="text-[#003781]" />
              <span>O selecciona un reclamo tipo para probar:</span>
            </span>

            <div class="flex flex-wrap gap-2">
              @for (preset of claimPresets; track preset.title) {
                <button
                  type="button"
                  (click)="selectClaimPreset(preset.prompt)"
                  class="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-[#003781]/40 text-xs text-slate-700 hover:text-[#003781] transition-all text-left flex items-center gap-2 cursor-pointer group shadow-xs"
                >
                  <span class="text-sm">{{ preset.emoji }}</span>
                  <div class="flex flex-col">
                    <span class="font-semibold text-[#002147] group-hover:text-[#003781]">{{ preset.title }}</span>
                    <span class="text-[10px] text-slate-500 font-mono">{{ preset.policy }}</span>
                  </div>
                </button>
              }
            </div>
          </div>
        }

        <!-- ========================================================= -->
        <!-- STEP 2: ASK IF USER WANTS TO ATTACH DOCUMENTS -->
        <!-- ========================================================= -->
        @if (message().interactiveType === 'claim_ask_attachment') {
          <div class="p-4 rounded-2xl bg-white border border-[#dbe6f0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-cascade-in">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-[#003781] border border-blue-200/60 flex items-center justify-center flex-shrink-0">
                <ai-icon name="paperclip" [size]="16" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-[#002147]">¿Deseas adjuntar telemetría o logs de respaldo?</h4>
                <p class="text-[11px] text-slate-500">Archivos .log, stack traces o configuraciones YAML para escanear y diagnosticar.</p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <ai-button
                variant="primary"
                size="sm"
                (click)="onAcceptAttachment()"
              >
                <ai-icon name="paperclip" [size]="14" />
                <span>Sí, adjuntar logs</span>
              </ai-button>

              <ai-button
                variant="secondary"
                size="sm"
                (click)="onDeclineAttachment()"
              >
                <span>No, continuar</span>
              </ai-button>
            </div>
          </div>
        }

        <!-- ========================================================= -->
        <!-- STEP 3 & 4: DOCUMENT UPLOADER OR DOJO DIGITAL SCANNER -->
        <!-- ========================================================= -->
        @if (message().interactiveType === 'claim_uploader') {
          @if (isScanning()) {
            <!-- DOJO OPTICAL SCANNER HUD -->
            <div class="relative overflow-hidden rounded-2xl border border-[#dbe6f0] bg-white shadow-lg p-4 sm:p-5 animate-cascade-in">
              <!-- Scanner HUD Telemetry Header -->
              <div class="relative z-20 flex items-center justify-between pb-3 border-b border-slate-200 text-[10px] font-mono uppercase tracking-widest text-[#003781]">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
                  <span class="font-bold text-[#002147]">UNIDAD TELEMÉTRICA FORENSE • DOJO 2.0 AI</span>
                </div>
                <div class="flex items-center gap-2 text-slate-500 font-semibold">
                  <span>RESOLUCIÓN: 1200 DPI</span>
                  <span>•</span>
                  <span>SHA-256 EN TIEMPO REAL</span>
                </div>
              </div>

              <!-- Central Scanner Bed (Platen) with Document Miniature -->
              <div class="relative z-20 my-4 flex flex-col md:flex-row items-center gap-5">
                <!-- SCANNER GLASS PLATEN BED -->
                <div class="relative flex-shrink-0 w-[210px] sm:w-[230px] p-3 rounded-xl bg-slate-50 border-2 border-slate-200 shadow-inner overflow-hidden">
                  <!-- Top Millimeter Scale Markings -->
                  <div class="flex justify-between text-[7px] font-mono text-slate-400 border-b border-slate-200 pb-1 mb-2 px-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                    <span>150</span>
                    <span>210mm</span>
                  </div>

                  <!-- Corner Alignment Markers -->
                  <div class="absolute top-2 left-2 text-[#003781] text-xs font-mono select-none">┌</div>
                  <div class="absolute top-2 right-2 text-[#003781] text-xs font-mono select-none">┐</div>
                  <div class="absolute bottom-2 left-2 text-[#003781] text-xs font-mono select-none">└</div>
                  <div class="absolute bottom-2 right-2 text-[#003781] text-xs font-mono select-none">┘</div>

                  <!-- Physical Miniature Document Placed on Scanner Glass -->
                  <div class="relative z-10 w-full flex justify-center">
                    <app-document-thumbnail
                      [file]="activeAttachment()"
                      mode="scanning"
                      [scanProgress]="scanProgress()"
                      [showModalOnClick]="false"
                    />
                  </div>

                  <!-- Optical Scanning Carriage (Carro de Lectura Láser) -->
                  <div
                    class="absolute inset-x-0 h-2 bg-gradient-to-r from-transparent via-[#003781] to-transparent shadow-[0_0_15px_#003781] z-40 pointer-events-none animate-scanner-head flex items-center justify-center"
                  >
                    <!-- Sensor LEDs -->
                    <div class="flex items-center gap-3">
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-300 animate-ping"></span>
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-300 animate-ping"></span>
                    </div>
                  </div>

                  <!-- Optical Beam Illumination Trail -->
                  <div class="absolute inset-x-0 h-16 bg-gradient-to-b from-[#003781]/15 via-emerald-500/10 to-transparent z-30 pointer-events-none animate-scanner-head"></div>
                </div>

                <!-- Live Optical Feed & Telemetry Column -->
                <div class="flex-1 w-full flex flex-col justify-between gap-3">
                  <!-- Live Percentage and Target -->
                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span class="text-[9px] font-mono text-[#003781] uppercase tracking-wider block font-bold">Documento en Análisis</span>
                      <h5 class="text-xs font-bold text-[#002147] truncate max-w-[180px] sm:max-w-[240px]">
                        {{ activeAttachment().name }}
                      </h5>
                      <span class="text-[10px] text-slate-500 font-mono">{{ activeAttachment().size }} • {{ activeAttachment().type }}</span>
                    </div>
                    <div class="text-right">
                      <span class="text-3xl font-black font-mono tracking-tighter text-[#003781]">
                        {{ scanProgress() }}%
                      </span>
                      <div class="text-[9px] font-mono text-[#059669] uppercase font-bold">Extracción Óptica</div>
                    </div>
                  </div>

                  <!-- Live Sensor Gauges -->
                  <div class="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span class="text-slate-500 text-[8px] uppercase block">Posición Cabezal</span>
                      <span class="text-[#003781] font-bold">{{ (scanProgress() * 2.97).toFixed(1) }} mm / 297mm</span>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span class="text-slate-500 text-[8px] uppercase block">Campos Validados</span>
                      <span class="text-[#059669] font-bold">{{ extractedFieldsCount() }} / 6 detectados</span>
                    </div>
                  </div>

                  <!-- Live Neural OCR Character Feed -->
                  <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[9px] text-cyan-300 flex flex-col gap-1">
                    <div class="flex items-center justify-between text-[8px] text-slate-400">
                      <span>DECODIFICADOR OCR NEURAL</span>
                      <span class="text-emerald-400 flex items-center gap-1 font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>ACTIVO</span>
                      </span>
                    </div>
                    <div class="truncate text-slate-200 font-mono">
                      {{ activeOcrStream() }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Telemetry Progress Bar -->
              <div class="relative z-20 w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-3 border border-slate-200">
                <div
                  class="h-full bg-gradient-to-r from-[#003781] to-[#00a887] transition-all duration-150 ease-out"
                  [style.width.%]="scanProgress()"
                ></div>
              </div>

              <!-- Subsystem Status Feed -->
              <div class="relative z-20 flex items-center justify-between text-[11px] font-mono">
                <span class="text-slate-600 flex items-center gap-1.5 font-medium">
                  <span class="text-[#003781] font-bold animate-pulse">›</span>
                  {{ scanStep() }}
                </span>
                <span class="text-[10px] text-slate-400 hidden sm:inline font-semibold">MOTOR EMBEDDINGS 768-D</span>
              </div>
            </div>
          } @else {
            <!-- DOCUMENT DROPZONE & EVIDENCE SELECTOR -->
            <div class="p-4 sm:p-5 rounded-2xl bg-white border border-[#dbe6f0] shadow-sm flex flex-col gap-4 animate-cascade-in">
              <!-- Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <ai-icon name="paperclip" [size]="16" class="text-[#003781]" />
                  <h4 class="text-xs font-bold text-[#002147]">Adjuntar Evidencia Documental del Reclamo</h4>
                </div>
                <span class="text-[10px] font-mono text-slate-500">PDF, JPG, PNG o DOCX (Máx. 25MB)</span>
              </div>

              <!-- Drag & Drop Zone -->
              <div
                (click)="fileInput.click()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onFileDrop($event)"
                [class.border-[#003781]]="isDragging()"
                [class.bg-blue-50/50]="isDragging()"
                class="border-2 border-dashed border-slate-300 hover:border-[#003781] rounded-xl p-5 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
              >
                <input
                  #fileInput
                  type="file"
                  (change)="onFileSelected($event)"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.webp"
                  class="hidden"
                />
                <div class="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-[#003781] text-[#003781] group-hover:text-white flex items-center justify-center transition-colors">
                  <ai-icon name="upload" [size]="20" />
                </div>
                <div>
                  <span class="text-xs font-semibold text-[#002147] group-hover:text-[#003781]">
                    Haz clic para examinar o arrastra tu archivo aquí
                  </span>
                  <p class="text-[10px] text-slate-500 mt-0.5">Soporta imágenes, fotos, capturas y documentos oficiales</p>
                </div>
              </div>

              <!-- Quick Corporate Evidence Presets -->
              <div class="flex flex-col gap-2">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  O selecciona una evidencia preconfigurada:
                </span>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  @for (sample of sampleEvidences; track sample.name) {
                    <button
                      type="button"
                      (click)="selectSampleFile(sample)"
                      [class]="selectedFile()?.name === sample.name
                        ? 'border-[#003781] bg-blue-50/80 text-[#003781] ring-1 ring-[#003781]'
                        : 'border-slate-200 bg-slate-50/80 hover:bg-blue-50/40 text-slate-700'"
                      class="p-2.5 rounded-xl border transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                    >
                      <ai-icon name="document" [size]="16" class="text-[#003781] flex-shrink-0" />
                      <div class="min-w-0">
                        <span class="text-[11px] font-bold block truncate text-[#002147] group-hover:text-[#003781]">
                          {{ sample.name }}
                        </span>
                        <span class="text-[10px] text-slate-500 font-mono">{{ sample.size }}</span>
                      </div>
                    </button>
                  }
                </div>
              </div>

              <!-- Selected File Miniature Preview & Processing CTA -->
              @if (selectedFile()) {
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 animate-cascade-in">
                  <!-- Document Miniature Preview -->
                  <div class="w-24 sm:w-28 flex-shrink-0 shadow-sm">
                    <app-document-thumbnail
                      [file]="selectedFile()"
                      mode="thumbnail"
                      [showModalOnClick]="false"
                    />
                  </div>

                  <!-- File Details & Scan Trigger -->
                  <div class="flex-1 min-w-0 flex flex-col gap-1 text-left w-full">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#e6f9f3] text-[#059669] border border-[#a7f3d0] uppercase">
                        Documento Listo Para Escaneo
                      </span>
                      <span class="text-[10px] font-mono text-[#003781] font-semibold">1200 DPI</span>
                    </div>

                    <h5 class="text-xs font-bold text-[#002147] truncate">{{ selectedFile()?.name }}</h5>
                    <p class="text-[10px] text-slate-500 font-mono">{{ selectedFile()?.size }} • {{ selectedFile()?.type }}</p>

                    <div class="mt-2.5">
                      <ai-button
                        variant="primary"
                        size="md"
                        (click)="onStartProcessing()"
                      >
                        <ai-icon name="sparkles" [size]="16" />
                        <span>Escanear y Procesar con IA</span>
                      </ai-button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- ========================================================= -->
        <!-- STEP 5: SCANNED & VALIDATED DOCUMENT RESULT VIEW -->
        <!-- ========================================================= -->
        @if (message().interactiveType === 'claim_scanned_result') {
          <div class="p-4 sm:p-5 rounded-2xl bg-white border border-[#dbe6f0] shadow-sm flex flex-col gap-4 animate-cascade-in">
            <!-- Header Verification Banner -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-[#e6f9f3] text-[#059669] flex items-center justify-center">
                  <ai-icon name="check" [size]="16" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-[#002147] tracking-wide flex items-center gap-1.5">
                    <span>RECLAMO RADICADO & DISPARADO A POWER AUTOMATE</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                  </h4>
                  <p class="text-[10px] text-slate-500">Verificación RAG de telemetría, firma SHA-256 y notificación de aprobación enviada a Outlook.</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] flex items-center gap-1.5 shadow-2xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#003781] animate-pulse"></span>
                  <span>Ticket #{{ message().claimDetails?.claimNumber || 'REC-2026-0850' }}</span>
                </span>
                <span class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                  En Aprobación Outlook
                </span>
              </div>
            </div>

            <!-- Document Thumbnail + Verification Metadata Layout -->
            <div class="flex flex-col sm:flex-row items-start gap-4">
              <!-- Authenticated Document Miniature with Verified Stamp -->
              <div class="w-36 sm:w-44 flex-shrink-0 mx-auto sm:mx-0">
                <app-document-thumbnail
                  [file]="activeAttachment()"
                  mode="verified"
                  [showModalOnClick]="true"
                />
                <div class="text-[9px] text-center text-slate-400 mt-1 font-mono">
                  (Clic para ampliar)
                </div>
              </div>

              <!-- Right Column: Verification & OCR Data Grid -->
              <div class="flex-1 min-w-0 flex flex-col gap-3 w-full">
                <!-- SHA-256 Hash Preview with Copy -->
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                  <div class="flex items-center justify-between text-[10px] font-mono">
                    <span class="text-[#059669] font-bold flex items-center gap-1">
                      <ai-icon name="check" [size]="12" />
                      <span>Firma Criptográfica SHA-256</span>
                    </span>
                    <button
                      type="button"
                      (click)="copyHash()"
                      class="text-slate-600 hover:text-[#002147] cursor-pointer flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 shadow-xs"
                      title="Copiar Hash"
                    >
                      <ai-icon [name]="copiedHash() ? 'check' : 'copy'" [size]="10" />
                      <span>{{ copiedHash() ? 'Copiado' : 'Copiar' }}</span>
                    </button>
                  </div>
                  <div class="text-[9.5px] font-mono text-slate-700 break-all bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 select-all font-medium">
                    {{ activeAttachment().sha256 || '193e94778ba8a1fc7a2f38f2d6ce5dfcba025843a2c1f775d9a72b9442743634' }}
                  </div>
                </div>

                <!-- Structured OCR Metadata Grid -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span class="text-[9px] text-slate-500 font-semibold block uppercase">N° Incidencia</span>
                    <span class="font-mono text-[#003781] font-bold text-xs">INC-2026-8942-PROD</span>
                  </div>

                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span class="text-[9px] text-slate-500 font-semibold block uppercase">SLA Asociado</span>
                    <span class="font-mono text-[#002147] font-bold text-xs">#SLA-TI-99421</span>
                  </div>

                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span class="text-[9px] text-slate-500 font-semibold block uppercase">Tiempo RTO Estimado</span>
                    <span class="font-mono text-[#002147] font-bold text-xs">12 min (SLA 99.95%)</span>
                  </div>

                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span class="text-[9px] text-slate-500 font-semibold block uppercase">Autenticidad Diagnóstico</span>
                    <span class="font-mono text-[#059669] font-bold text-xs">99.8% Confianza</span>
                  </div>

                  <div class="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 col-span-2">
                    <span class="text-[9px] text-slate-500 font-semibold block uppercase">Estado Actual</span>
                    <span class="text-[#003781] font-semibold flex items-center gap-1.5 text-[11px]">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#003781] animate-ping"></span>
                      <span>En mitigación por equipo DevOps SRE (Plazo RTO: < 15 min)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div class="text-[11px] text-slate-500">
                Reporte técnico oficial de incidencia disponible para auditoría y descarga.
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <a
                  routerLink="/claims"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003781] hover:bg-[#002860] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  <ai-icon name="document" [size]="14" />
                  <span>Ver en Reclamos Power Automate</span>
                </a>

                <ai-button
                  variant="secondary"
                  size="sm"
                  (click)="downloadReceipt()"
                >
                  <ai-icon name="upload" [size]="14" />
                  <span>Descargar Reporte NOC</span>
                </ai-button>

                <ai-button
                  variant="ghost"
                  size="sm"
                  (click)="startNewChat()"
                >
                  <ai-icon name="plus" [size]="14" />
                  <span>Nueva Consulta</span>
                </ai-button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class ClaimWorkflowComponent {
  private readonly chatService = inject(ChatService);

  readonly message = input.required<ChatMessage>();

  protected readonly selectedFile = signal<ScannedAttachment | null>(null);
  protected readonly isScanning = signal<boolean>(false);
  protected readonly scanProgress = signal<number>(0);
  protected readonly scanStep = signal<string>('Iniciando lectura y parser telemétrico...');
  protected readonly copiedHash = signal<boolean>(false);

  // Ready sample evidences
  readonly sampleEvidences: ScannedAttachment[] = [
    {
      name: 'Diagnostico_Incidencia_NOC_PROD.pdf',
      size: '1.2 MB',
      type: 'Informe Forense de Sistemas',
      sha256: 'd5a8f293a1e944bc89e17042f9b841a067ec8e2b83419df9420cb489e21b712c',
      ocrExtractedData: {
        claimNumber: 'INC-2026-8942-PROD',
        incidentDate: 'Hoy, 11:20 AM',
        policyNumber: '#SLA-TI-99421',
        declaredAmount: 'RTO Estimado: 12 min',
        category: 'Infraestructura Cloud',
        confidenceScore: 99.8,
        issuer: 'Centro de Operaciones de Red (NOC) DOJO 2.0'
      }
    },
    {
      name: 'Log_Error_StackTrace_ApiGateway.log',
      size: '420 KB',
      type: 'Volcado de Logs & StackTrace',
      sha256: 'a14b9c84e82012fd901847120349817203948102394812039481230491823091',
      ocrExtractedData: {
        claimNumber: 'INC-2026-8942-PROD',
        incidentDate: 'Hoy, 11:22 AM',
        policyNumber: '#SLA-TI-99421',
        declaredAmount: '1,420 errores HTTP 504',
        category: 'Telemetría de Servidores',
        confidenceScore: 99.4,
        issuer: 'Agente OpenTelemetry / FluentBit'
      }
    },
    {
      name: 'Captura_Grafana_Pico_Latencia.png',
      size: '1.9 MB',
      type: 'image/png',
      sha256: '8872bca901239840192384019283401928340192834019283401923840192384',
      previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      ocrExtractedData: {
        claimNumber: 'INC-2026-8942-PROD',
        incidentDate: 'Hoy, 11:25 AM',
        policyNumber: '#SLA-TI-99421',
        declaredAmount: 'P99 Latency: 2,400ms',
        category: 'Métricas de Observabilidad',
        confidenceScore: 98.9,
        issuer: 'Monitor Grafana Cloud & Prometheus'
      }
    }
  ];

  // Presets for Systems Incident Input
  readonly claimPresets = [
    {
      emoji: '🔥',
      title: 'Caída en API Gateway y Spanner DB',
      policy: 'Cluster EKS-PROD-01 · P1',
      prompt: 'Incidencia técnica P1: Latencia superior a 1,200ms y errores 504 Gateway Timeout en API Gateway afectando microservicios de facturación. Requiero análisis RCA y plan de contingencia.'
    },
    {
      emoji: '💾',
      title: 'Bloqueo y Deadlock en Base de Datos Spanner',
      policy: 'Spanner us-central1 · P2',
      prompt: 'Alerta crítica en base de datos Cloud Spanner: Pico de locks en tablas de transacciones y degradación de throughput. Solicito revisión de réplicas y logs.'
    },
    {
      emoji: '⚡',
      title: 'Fuga de Memoria OOMKilled en Kubernetes',
      policy: 'Namespace Core-Services · P2',
      prompt: 'Fuga de memoria detectada en pods del servicio de pagos en cluster de Kubernetes. Reinicios continuos por OOMKilled (Exit Code 137). Requiero diagnóstico de telemetría.'
    },
    {
      emoji: '🛡️',
      title: 'Alerta de Seguridad DDoS en WAF & Cloudflare',
      policy: 'Edge Gateway · P1',
      prompt: 'Pico anómalo de 45,000 peticiones sospechosas por segundo bloqueando el tráfico legítimo. Se requiere activar mitigación de tráfico y validar reglas en WAF.'
    }
  ];

  protected readonly activeAttachment = computed(() => {
    return this.selectedFile() || this.message().attachmentState?.file || this.sampleEvidences[0];
  });

  protected readonly extractedFieldsCount = computed(() => {
    const p = this.scanProgress();
    if (p < 20) return 1;
    if (p < 40) return 2;
    if (p < 60) return 3;
    if (p < 80) return 4;
    if (p < 95) return 5;
    return 6;
  });

  protected readonly activeOcrStream = computed(() => {
    const p = this.scanProgress();
    if (p < 25) return '0x4F: "DOJO 2.0 SISTEMAS - INC-8942"';
    if (p < 50) return '0x8A: "SLA #SLA-TI-99421 - CLUSTER IDENTIFICADO"';
    if (p < 75) return '0xC1: "IMPACTO ESTIMADO: 2 MICROSERVICIOS"';
    if (p < 95) return '0xE4: "DIAGNÓSTICO AUTOMATIZADO: SPANNER LOCKS"';
    return '0xFF: "HASH SHA-256 GENERADO & FIRMADO"';
  });

  protected selectClaimPreset(prompt: string): void {
    this.chatService.sendMessage(prompt);
  }

  protected onAcceptAttachment(): void {
    this.chatService.acceptClaimAttachment(this.message().id);
    // Pre-select first sample evidence for immediate testability
    this.selectedFile.set(this.sampleEvidences[0]);
  }

  protected onDeclineAttachment(): void {
    this.chatService.declineClaimAttachment(this.message().id);
  }

  protected selectSampleFile(file: ScannedAttachment): void {
    this.selectedFile.set(file);
  }

  protected readonly isDragging = signal<boolean>(false);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  protected onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processUploadedFile(event.dataTransfer.files[0]);
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processUploadedFile(input.files[0]);
    }
  }

  protected processUploadedFile(f: File): void {
    const isImage = f.type.startsWith('image/') || f.name.match(/\.(png|jpe?g|webp|gif|bmp|svg)$/i);
    const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const customFile: ScannedAttachment = {
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
          type: f.type || 'image/jpeg',
          sha256: this.generateMockHash(),
          previewUrl: dataUrl,
          ocrExtractedData: {
            claimNumber: 'INC-2026-8942-PROD',
            incidentDate: '15 de Agosto de 2026, 10:42 UTC',
            policyNumber: '#SLA-TI-99421',
            declaredAmount: 'RTO: 12 min (P99 < 80ms)',
            category: 'Telemetría de Infraestructura Cloud',
            confidenceScore: 99.8,
            issuer: 'Archivo Cargado por Diego Bueno'
          }
        };
        this.selectedFile.set(customFile);
      };
      reader.readAsDataURL(f);
    } else {
      const blobUrl = URL.createObjectURL(f);
      const customFile: ScannedAttachment = {
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || (isPdf ? 'application/pdf' : 'Documento Digital'),
        sha256: this.generateMockHash(),
        previewUrl: blobUrl,
        ocrExtractedData: {
          claimNumber: 'INC-2026-8942-PROD',
          incidentDate: '15 de Agosto de 2026, 10:42 UTC',
          policyNumber: '#SLA-TI-99421',
          declaredAmount: 'RTO: 12 min (P99 < 80ms)',
          category: isPdf ? 'Reporte Técnico NOC & SLA' : 'Volcado de Trazas & Logs',
          confidenceScore: 99.7,
          issuer: 'Archivo Cargado por Diego Bueno'
        }
      };
      this.selectedFile.set(customFile);
    }
  }

  protected onStartProcessing(): void {
    const file = this.selectedFile() || this.sampleEvidences[0];
    this.isScanning.set(true);
    this.scanProgress.set(0);
    this.playScanHum();

    const steps = [
      'Iniciando lectura óptica de alta resolución...',
      'Extrayendo caracteres OCR y tablas estructuradas...',
      'Calculando hash criptográfico SHA-256 no repudiable...',
      'Vectorizando fragmentos con text-embedding-004 (768 dimensiones)...',
      'Validando cobertura contra póliza #ALL-99421...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      this.scanProgress.update((p) => {
        const next = p + 4;
        if (next >= 25 && currentStep === 0) {
          currentStep = 1;
          this.scanStep.set(steps[1]);
        } else if (next >= 50 && currentStep === 1) {
          currentStep = 2;
          this.scanStep.set(steps[2]);
        } else if (next >= 75 && currentStep === 2) {
          currentStep = 3;
          this.scanStep.set(steps[3]);
        } else if (next >= 90 && currentStep === 3) {
          currentStep = 4;
          this.scanStep.set(steps[4]);
        }

        if (next >= 100) {
          clearInterval(interval);
          this.playScanComplete();
          setTimeout(() => {
            this.isScanning.set(false);
            this.chatService.finalizeScannedDocument(this.message().id, file);
          }, 350);
          return 100;
        }
        return next;
      });
    }, 90);
  }

  protected copyHash(): void {
    const hash =
      this.activeAttachment().sha256 ||
      'd5a8f293a1e944bc89e17042f9b841a067ec8e2b83419df9420cb489e21b712c';
    navigator.clipboard?.writeText(hash);
    this.copiedHash.set(true);
    setTimeout(() => this.copiedHash.set(false), 2000);
  }

  protected downloadReceipt(): void {
    const content = `COMPROBANTE OFICIAL DE RADICACIÓN DE INCIDENCIA
DOJO 2.0 • SISTEMAS & INFRAESTRUCTURA CLOUD

N° Ticket: INC-2026-8942-PROD
SLA Asociado: #SLA-TI-99421
Documento Telemétrico: ${this.activeAttachment()?.name}
SHA-256: ${this.activeAttachment()?.sha256}
Estado: En mitigación técnica prioritaria por equipo DevOps
Fecha: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Incidencia_INC-2026-8942_DOJO.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected startNewChat(): void {
    this.chatService.startNewCleanChat();
  }

  private playScanHum(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio autoplay policy safe fallback
    }
  }

  private playScanComplete(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy safe fallback
    }
  }

  private generateMockHash(): string {
    const hex = '0123456789abcdef';
    let res = '';
    for (let i = 0; i < 64; i++) {
      res += hex[Math.floor(Math.random() * hex.length)];
    }
    return res;
  }
}
