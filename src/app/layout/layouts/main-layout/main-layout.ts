import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AiAttachmentUploaderComponent } from '../../../shared/ui/ai-attachment-uploader';
import { AiCommandPaletteComponent } from '../../../shared/ui/ai-command-palette';
import { AiExportModalComponent } from '../../../shared/ui/ai-export-modal';
import { AiFeedbackDialogComponent } from '../../../shared/ui/ai-feedback-dialog';
import { AiPromptTemplatesModalComponent } from '../../../shared/ui/ai-prompt-templates-modal';
import { AiRagCitationViewerComponent } from '../../../shared/ui/ai-rag-citation-viewer';
import { AiReasoningCanvasComponent } from '../../../shared/ui/ai-reasoning-canvas';
import { AiSettingsModalComponent } from '../../../shared/ui/ai-settings-modal';
import { AiShortcutsModalComponent } from '../../../shared/ui/ai-shortcuts-modal';
import { HeaderComponent } from '../../components/header';
import { SidebarComponent } from '../../components/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    AiRagCitationViewerComponent,
    AiCommandPaletteComponent,
    AiReasoningCanvasComponent,
    AiAttachmentUploaderComponent,
    AiPromptTemplatesModalComponent,
    AiSettingsModalComponent,
    AiExportModalComponent,
    AiFeedbackDialogComponent,
    AiShortcutsModalComponent
  ],
  template: `
    <div class="h-screen w-screen overflow-hidden flex bg-[var(--color-background)] text-[var(--color-text)]">
      <!-- Left Sidebar (Collapsible / Mobile Drawer) -->
      <app-sidebar />

      <!-- Right Main Content Area (Header + Router Outlet) -->
      <div class="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <app-header />

        <!-- Router Outlet Content Container with Custom Scrollbar -->
        <main class="flex-1 min-h-0 overflow-y-auto relative bg-[var(--color-background)]">
          <router-outlet />
        </main>
      </div>

      <!-- Global RAG Citation & Document Inspection Modal -->
      <ai-rag-citation-viewer />

      <!-- Global Command Palette (Cmd+K / Ctrl+K) -->
      <ai-command-palette />

      <!-- Global Reasoning Canvas / Deep CoT Workspace -->
      <ai-reasoning-canvas />

      <!-- Global Document & Attachment Uploader Modal -->
      <ai-attachment-uploader />

      <!-- Global Corporate Prompt Templates Modal -->
      <ai-prompt-templates-modal />

      <!-- Global Settings & Preferences Modal -->
      <ai-settings-modal />

      <!-- Global Export & Share Modal -->
      <ai-export-modal />

      <!-- Global Feedback & Hallucination Reporting Dialog -->
      <ai-feedback-dialog />

      <!-- Global Keyboard Shortcuts & Help Center Overlay -->
      <ai-shortcuts-modal />
    </div>
  `
})
export class MainLayoutComponent {}
