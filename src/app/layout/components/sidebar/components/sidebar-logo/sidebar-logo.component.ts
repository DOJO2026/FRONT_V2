import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { AiIconComponent } from '../../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../../shared/ui/ai-tooltip';

@Component({
  selector: 'app-sidebar-logo',
  standalone: true,
  imports: [RouterLink, AiIconComponent, AiTooltipDirective],
  template: `
    <div class="flex items-center justify-between gap-2 px-4 py-3.5 border-b border-[#dbe6f0] select-none bg-slate-50/50">
      <!-- DOJO 2.0 Logo & Title -->
      <a
        routerLink="/"
        (click)="chatState.toggleSidebar()"
        class="flex items-center gap-2.5 group overflow-hidden cursor-pointer"
      >
        <div class="w-8 h-8 rounded-full bg-[#002654] text-white flex items-center justify-center flex-shrink-0 font-bold shadow-sm">
          D
        </div>

        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold tracking-tight text-[#002147] group-hover:text-[#003781] transition-colors truncate">
              DOJO 2.0
            </span>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#e8f2fa] text-[#003781] border border-[#c2d9ee]">
              DOJO AI
            </span>
          </div>
          <span class="text-[11px] text-slate-500 truncate">
            Historial de incidentes & consultas
          </span>
        </div>
      </a>

      <!-- Close Drawer Button -->
      <button
        type="button"
        (click)="chatState.toggleSidebar()"
        class="p-1.5 rounded-lg text-slate-400 hover:text-[#002147] hover:bg-slate-200/60 transition-colors cursor-pointer"
        aiTooltip="Cerrar panel"
        tooltipPosition="bottom"
      >
        <ai-icon name="x" [size]="16" />
      </button>
    </div>
  `
})
export class SidebarLogoComponent {
  protected readonly chatState = inject(ChatStateService);
}
