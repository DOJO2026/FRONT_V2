import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { AttachmentUploaderService, RepositoryDocItem } from '../../../core/services/attachment-uploader.service';
import { AiButtonComponent } from '../ai-button';
import { AiIconComponent } from '../ai-icon';
import { AiSpinnerComponent } from '../ai-spinner';
import { AiTooltipDirective } from '../ai-tooltip';

@Component({
  selector: 'ai-attachment-uploader',
  standalone: true,
  imports: [
    AiButtonComponent,
    AiIconComponent,
    AiSpinnerComponent,
    AiTooltipDirective
  ],
  template: `
    @if (uploaderService.isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[85] flex items-center justify-center p-4 sm:p-6 select-none animate-cascade-in"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Dialog Container -->
        <div
          class="w-full max-w-2xl max-h-[88vh] bg-white border border-[#dbe6f0] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Header Bar -->
          <div class="px-6 py-4 border-b border-[#dbe6f0] bg-white flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
                <ai-icon name="upload" [size]="20" />
              </div>

              <div>
                <h3 class="text-base font-bold text-[#002147] tracking-tight">
                  Gestor de Documentos & Base RAG
                </h3>
                <p class="text-xs text-slate-500">
                  Sube nuevos archivos para vectorización o vincula documentos del repositorio empresarial.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="uploaderService.close()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-100 transition-colors cursor-pointer"
              aiTooltip="Cerrar modal (Esc)"
              tooltipPosition="left"
            >
              <ai-icon name="x" [size]="18" />
            </button>
          </div>

          <!-- Navigation Tabs -->
          <div class="px-6 pt-3 border-b border-[#dbe6f0] bg-slate-50/70 flex items-center gap-2">
            <button
              type="button"
              (click)="uploaderService.setActiveTab('upload')"
              [class]="uploaderService.activeTab() === 'upload' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ai-icon name="upload" [size]="14" />
              <span>Subir Archivos</span>
              @if (uploaderService.uploadQueue().length > 0) {
                <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#003781] font-bold font-mono">
                  {{ uploaderService.uploadQueue().length }}
                </span>
              }
            </button>

            <button
              type="button"
              (click)="uploaderService.setActiveTab('repository')"
              [class]="uploaderService.activeTab() === 'repository' ? 'border-[#003781] text-[#003781] font-bold' : 'border-transparent text-slate-500 hover:text-[#002147]'"
              class="pb-2.5 px-3 border-b-2 text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ai-icon name="document" [size]="14" />
              <span>Catálogo RAG Empresarial</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {{ uploaderService.repositoryDocs().length }}
              </span>
            </button>
          </div>

          <!-- Body Content Area (Scrollable) -->
          <div class="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-6 no-scrollbar bg-white">
            <!-- TAB 1: UPLOAD FILES -->
            @if (uploaderService.activeTab() === 'upload') {
              <!-- Drag and Drop Dropzone -->
              <div
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()"
                [class]="isDragging() ? 'border-[#003781] bg-blue-50/60 scale-[0.99]' : 'border-slate-300 bg-slate-50 hover:border-[#003781]/60 hover:bg-blue-50/30'"
                class="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all duration-200 group relative"
              >
                <input
                  #fileInput
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.csv,.xlsx"
                  (change)="onFileInputChange($event)"
                  class="hidden"
                />

                <div class="w-14 h-14 rounded-2xl bg-blue-50 text-[#003781] border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <ai-icon name="upload" [size]="28" />
                </div>

                <div>
                  <h4 class="text-sm font-semibold text-[#002147]">
                    Arrastra y suelta tus archivos aquí, o <span class="text-[#003781] underline underline-offset-2">explora tu equipo</span>
                  </h4>
                  <p class="text-xs text-slate-500 mt-1">
                    Soporta PDF, DOCX, TXT, CSV, XLSX (máximo 25 MB por archivo)
                  </p>
                </div>

                <div class="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span class="px-2 py-0.5 rounded bg-white border border-slate-200">Auto-chunking</span>
                  <span>•</span>
                  <span class="px-2 py-0.5 rounded bg-white border border-slate-200">Embedding text-embedding-004</span>
                  <span>•</span>
                  <span class="px-2 py-0.5 rounded bg-white border border-slate-200">Cifrado AES-256</span>
                </div>
              </div>

              <!-- Quick Demo Simulation Button -->
              <div class="flex items-center justify-between px-1">
                <span class="text-xs text-slate-500">¿No tienes archivos a mano para probar?</span>
                <button
                  type="button"
                  (click)="demoSampleUpload()"
                  class="text-xs text-[#003781] hover:text-[#002147] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <ai-icon name="sparkles" [size]="14" />
                  <span>Simular carga de PDF empresarial</span>
                </button>
              </div>

              <!-- Upload Queue List -->
              @if (uploaderService.uploadQueue().length > 0) {
                <div class="flex flex-col gap-3 pt-2">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Cola de Procesamiento & Vectorización ({{ uploaderService.uploadQueue().length }})
                    </h4>

                    <button
                      type="button"
                      (click)="uploaderService.clearCompleted()"
                      class="text-[11px] text-slate-500 hover:text-[#002147] transition-colors cursor-pointer"
                    >
                      Limpiar completados
                    </button>
                  </div>

                  <div class="flex flex-col gap-2.5">
                    @for (item of uploaderService.uploadQueue(); track item.id) {
                      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                        <!-- File Top Info -->
                        <div class="flex items-center justify-between gap-3">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-[#003781]">
                              <ai-icon name="document" [size]="16" />
                            </div>

                            <div class="min-w-0">
                              <p class="text-xs font-semibold text-[#002147] truncate" [title]="item.name">
                                {{ item.name }}
                              </p>
                              <p class="text-[11px] text-slate-500">
                                {{ item.sizeFormatted }} • {{ item.chunksCount }} fragmentos proyectados
                              </p>
                            </div>
                          </div>

                          <!-- Status / Action -->
                          <div class="flex items-center gap-2 flex-shrink-0">
                            @switch (item.status) {
                              @case ('uploading') {
                                <span class="text-[11px] text-[#003781] flex items-center gap-1 font-mono font-semibold">
                                  <ai-spinner size="sm" />
                                  <span>{{ item.progress }}%</span>
                                </span>
                              }
                              @case ('vectorizing') {
                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                  <ai-spinner size="sm" />
                                  <span>Vectorizando RAG...</span>
                                </span>
                              }
                              @case ('ready') {
                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <ai-icon name="check" [size]="12" />
                                  <span>Listo & Adjunto</span>
                                </span>
                              }
                              @case ('error') {
                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                  Error
                                </span>
                              }
                            }

                            <button
                              type="button"
                              (click)="uploaderService.removeUpload(item.id)"
                              class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Eliminar de la cola"
                            >
                              <ai-icon name="x" [size]="14" />
                            </button>
                          </div>
                        </div>

                        <!-- Progress Bar (Only while uploading) -->
                        @if (item.status === 'uploading') {
                          <div class="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              class="h-full bg-[#003781] transition-all duration-200"
                              [style.width.%]="item.progress"
                            ></div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            }

            <!-- TAB 2: REPOSITORY CATALOG -->
            @if (uploaderService.activeTab() === 'repository') {
              <div class="flex flex-col gap-4">
                <!-- Search Filter Input -->
                <div class="relative">
                  <ai-icon
                    name="search"
                    [size]="16"
                    class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    [value]="searchFilter()"
                    (input)="onSearchFilter($event)"
                    placeholder="Filtrar por título, categoría o palabra clave..."
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-[#002147] placeholder:text-slate-400 focus:outline-none focus:border-[#003781] focus:bg-white transition-colors"
                  />
                </div>

                <!-- Documents List -->
                <div class="flex flex-col gap-2.5">
                  @for (doc of filteredDocs(); track doc.id) {
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#003781]/40 hover:bg-blue-50/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="flex items-start gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-lg bg-blue-50 text-[#003781] flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                          <ai-icon name="document" [size]="18" />
                        </div>

                        <div class="min-w-0">
                          <div class="flex items-center gap-2 flex-wrap">
                            <h5 class="text-xs font-semibold text-[#002147] truncate">
                              {{ doc.title }}
                            </h5>
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white text-slate-600 border border-slate-200">
                              {{ doc.category }}
                            </span>
                          </div>

                          <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {{ doc.description }}
                          </p>

                          <div class="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                            <span>{{ doc.size }}</span>
                            <span>•</span>
                            <span>{{ doc.chunks }} chunks</span>
                            <span>•</span>
                            <span>{{ doc.embeddingModel }}</span>
                            <span>•</span>
                            <span>{{ doc.updatedAt }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Attach / Detach Button -->
                      <div class="flex-shrink-0 sm:self-center self-end">
                        @if (uploaderService.isAttached(doc.title)) {
                          <ai-button
                            variant="secondary"
                            size="sm"
                            (click)="uploaderService.toggleAttach(doc.title)"
                          >
                            <ai-icon name="check" [size]="12" class="text-emerald-600" />
                            <span class="text-[#003781] font-semibold">Adjunto</span>
                          </ai-button>
                        } @else {
                          <ai-button
                            variant="ghost"
                            size="sm"
                            (click)="uploaderService.toggleAttach(doc.title)"
                          >
                            <ai-icon name="plus" [size]="12" />
                            <span>Adjuntar</span>
                          </ai-button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3.5 border-t border-[#dbe6f0] bg-slate-50 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 text-slate-500">
              <ai-icon name="sparkles" [size]="14" class="text-[#003781]" />
              <span>Los documentos adjuntos actuarán como contexto prioritario en el siguiente prompt.</span>
            </div>

            <ai-button variant="primary" size="sm" (click)="uploaderService.close()">
              <span>Listo</span>
            </ai-button>
          </div>
        </div>
      </div>
    }
  `
})
export class AiAttachmentUploaderComponent {
  protected readonly uploaderService = inject(AttachmentUploaderService);
  protected readonly isDragging = signal<boolean>(false);
  protected readonly searchFilter = signal<string>('');

  protected readonly filteredDocs = computed<RepositoryDocItem[]>(() => {
    const q = this.searchFilter().trim().toLowerCase();
    const docs = this.uploaderService.repositoryDocs();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  });

  @HostListener('window:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.uploaderService.isOpen()) {
      this.uploaderService.close();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    this.uploaderService.close();
  }

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

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files) {
      this.uploaderService.handleFiles(event.dataTransfer.files);
    }
  }

  protected onFileInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.uploaderService.handleFiles(target.files);
      target.value = '';
    }
  }

  protected onSearchFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchFilter.set(target.value);
  }

  protected demoSampleUpload(): void {
    const mockNames = [
      'Manual_Procedimientos_Operativos_2026.pdf',
      'Auditoria_Infraestructura_SOC2_v3.pdf',
      'Informe_Sostenibilidad_ESG_2026.pdf',
      'Estrategia_Transformacion_Digital.docx'
    ];
    const picked = mockNames[Math.floor(Math.random() * mockNames.length)];
    this.uploaderService.uploadSampleMockFile(picked);
  }
}
