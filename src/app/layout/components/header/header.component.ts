import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { CommandPaletteService } from '../../../core/services/command-palette.service';
import { ExportSessionService } from '../../../core/services/export-session.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ShortcutsService } from '../../../core/services/shortcuts.service';
import { AiAvatarComponent } from '../../../shared/ui/ai-avatar';
import { AiIconComponent } from '../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../shared/ui/ai-tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    AiAvatarComponent,
    AiIconComponent,
    AiTooltipDirective
  ],
  template: `
    <header class="h-16 px-4 md:px-8 bg-white border-b border-[#e2e8f0] flex items-center justify-between gap-4 select-none z-30 shadow-[0_1px_3px_rgba(0,33,71,0.04)]">
      <!-- Left: DOJO 2.0 Logo & Main Navigation Links -->
      <div class="flex items-center gap-6 md:gap-10 min-w-0">
        <!-- Drawer / History Toggle for Mobile & Desktop -->
        <button
          type="button"
          (click)="chatState.toggleSidebar()"
          class="p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-[#003781] hover:bg-slate-100 transition-colors cursor-pointer"
          aiTooltip="Historial & Menú lateral"
          tooltipPosition="bottom"
          aria-label="Abrir menú"
        >
          <ai-icon name="chat" [size]="18" />
        </button>

        <!-- Official DOJO 2.0 Logo & Wordmark -->
        <a routerLink="/" class="flex items-center gap-2 cursor-pointer group">
          <span class="text-xl md:text-2xl font-black tracking-tight text-[#003781]">
            DOJO 2.0
          </span>
          <div class="px-2 py-0.5 rounded-full bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee] text-[10px] font-bold tracking-wider uppercase">
            Sistemas
          </div>
        </a>

        <!-- Top Navigation Links (Systems & IT in Spanish) -->
        <nav class="hidden md:flex items-center gap-1 text-sm font-medium text-[#475569]">
          <a
            routerLink="/knowledge"
            routerLinkActive="text-[#003781] font-semibold"
            class="px-3 py-1.5 rounded-lg hover:text-[#003781] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Infraestructura
          </a>
          <a
            routerLink="/"
            [routerLinkActiveOptions]="{ exact: true }"
            routerLinkActive="text-[#003781] font-semibold bg-blue-50/70"
            class="px-3 py-1.5 rounded-lg hover:text-[#003781] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Incidencias
          </a>
          <a
            routerLink="/claims"
            routerLinkActive="text-[#003781] font-semibold bg-blue-50/70"
            class="px-3 py-1.5 rounded-lg hover:text-[#003781] hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Reclamos & Power Automate</span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          </a>
          <button
            type="button"
            (click)="shortcutsService.open()"
            class="px-3 py-1.5 rounded-lg hover:text-[#003781] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Ayuda & Atajos
          </button>
          <a
            routerLink="/knowledge"
            class="px-3 py-1.5 rounded-lg hover:text-[#003781] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Documentación
          </a>
        </nav>
      </div>

      <!-- Right: Action Pills & User Profile Badge -->
      <div class="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <!-- Command Palette Trigger Button -->
        <button
          type="button"
          (click)="openCommandPalette()"
          class="p-2 rounded-full text-slate-500 hover:text-[#003781] hover:bg-slate-100 transition-colors cursor-pointer"
          aiTooltip="Buscar en métricas, logs y documentación (⌘K)"
          tooltipShortcut="⌘K"
          tooltipPosition="bottom"
        >
          <ai-icon name="search" [size]="16" />
        </button>

        <!-- "Nueva Incidencia" Pill Button -->
        <a
          routerLink="/"
          class="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full border border-slate-300 hover:border-[#003781] bg-white text-xs font-semibold text-[#002147] hover:text-[#003781] shadow-sm transition-all cursor-pointer"
        >
          Nueva Incidencia
        </a>

        <!-- "Políticas SLA" Pill Button -->
        <a
          routerLink="/knowledge"
          class="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full border border-slate-300 hover:border-[#003781] bg-white text-xs font-semibold text-[#002147] hover:text-[#003781] shadow-sm transition-all cursor-pointer"
        >
          Políticas SLA
        </a>

        <!-- User Profile Pill: Diego Bueno (En línea) with Avatar -->
        <div
          class="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition-all cursor-pointer select-none"
          (click)="settingsService.open('profile')"
          aiTooltip="Perfil de Diego Bueno • Arquitecto Cloud DOJO 2.0"
          tooltipPosition="bottom"
        >
          <ai-avatar
            role="user"
            [name]="user().name"
            size="xs"
            [status]="user().status"
          />

          <div class="hidden sm:flex flex-col text-left leading-none pr-1">
            <span class="text-xs font-bold text-[#002147] truncate max-w-[120px]">
              {{ user().name }}
            </span>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span class="text-[10px] text-slate-500 font-medium">En línea</span>
            </div>
          </div>

          <ai-icon name="chevron-down" [size]="12" class="text-slate-400 ml-0.5" />
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  protected readonly chatState = inject(ChatStateService);
  protected readonly settingsService = inject(SettingsService);
  protected readonly exportService = inject(ExportSessionService);
  protected readonly shortcutsService = inject(ShortcutsService);
  private readonly commandPalette = inject(CommandPaletteService);
  protected readonly user = this.chatState.userProfile;

  protected openCommandPalette(): void {
    this.commandPalette.open();
  }
}
