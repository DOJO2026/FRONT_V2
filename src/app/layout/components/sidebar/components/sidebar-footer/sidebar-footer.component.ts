import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { SettingsService } from '../../../../../core/services/settings.service';
import { AiAvatarComponent } from '../../../../../shared/ui/ai-avatar';
import { AiIconComponent } from '../../../../../shared/ui/ai-icon';
import { AiTooltipDirective } from '../../../../../shared/ui/ai-tooltip';

@Component({
  selector: 'app-sidebar-footer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AiAvatarComponent, AiIconComponent, AiTooltipDirective],
  template: `
    <div class="p-3 border-t border-[var(--color-border)] flex flex-col gap-2.5 select-none">
      <!-- Quick Navigation Links (Design System & Analytics) -->
      @if (!chatState.sidebarCollapsed()) {
        <div class="flex items-center justify-between gap-1 pb-1">
          <a
            routerLink="/claims"
            routerLinkActive="text-[var(--color-primary)] bg-white/5"
            class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aiTooltip="Reclamos & Power Automate"
            tooltipPosition="top"
          >
            <ai-icon name="document" [size]="14" />
            <span>Reclamos</span>
          </a>

          <a
            routerLink="/analytics"
            routerLinkActive="text-[var(--color-primary)] bg-white/5"
            class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aiTooltip="Métricas de tokens y uso"
            tooltipPosition="top"
          >
            <ai-icon name="history" [size]="14" />
            <span>Métricas</span>
          </a>

          <a
            routerLink="/design-system"
            routerLinkActive="text-[var(--color-primary)] bg-white/5"
            class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aiTooltip="Componentes & Design Tokens"
            tooltipPosition="top"
          >
            <ai-icon name="sparkles" [size]="14" />
            <span>UI Lab</span>
          </a>
        </div>

        <!-- Token Usage Progress Bar -->
        <div class="px-2.5 py-2 rounded-xl bg-slate-50 border border-[#dbe6f0] flex flex-col gap-1.5">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-500 font-medium">Cuota Tokens</span>
            <span class="font-mono text-[#003781] font-semibold">{{ formattedTokens() }}</span>
          </div>
          <div class="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              class="h-full rounded-full bg-[#003781] transition-all duration-500"
              [style.width.%]="tokenPercent()"
            ></div>
          </div>
        </div>

        <!-- User Profile Card -->
        <div class="flex items-center justify-between pt-1">
          <div
            (click)="settingsService.open('profile')"
            class="flex items-center gap-2.5 min-w-0 cursor-pointer p-1 -m-1 rounded-lg hover:bg-white/5 transition-colors"
            aiTooltip="Ver perfil y consumo de tokens"
            tooltipPosition="top"
          >
            <ai-avatar
              role="user"
              [name]="user().name"
              size="sm"
              [status]="user().status"
            />
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-semibold text-white truncate">{{ user().name }}</span>
              <span class="text-[10px] text-[var(--color-text-muted)] truncate">{{ user().role }}</span>
            </div>
          </div>

          <button
            type="button"
            (click)="settingsService.open('model')"
            class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aiTooltip="Configuración del sistema"
            tooltipPosition="top"
          >
            <ai-icon name="settings" [size]="16" />
          </button>
        </div>
      } @else {
        <!-- Collapsed Footer View -->
        <div class="flex flex-col items-center gap-3 py-1">
          <a
            routerLink="/analytics"
            class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aiTooltip="Analítica y Métricas"
            tooltipPosition="right"
          >
            <ai-icon name="history" [size]="16" />
          </a>

          <a
            routerLink="/design-system"
            class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aiTooltip="Design System Playground"
            tooltipPosition="right"
          >
            <ai-icon name="sparkles" [size]="16" />
          </a>

          <div
            class="cursor-pointer"
            (click)="settingsService.open('profile')"
            [aiTooltip]="user().name + ' (' + user().role + ')'"
            tooltipPosition="right"
          >
            <ai-avatar
              role="user"
              [name]="user().name"
              size="sm"
              [status]="user().status"
            />
          </div>
        </div>
      }
    </div>
  `
})
export class SidebarFooterComponent {
  protected readonly chatState = inject(ChatStateService);
  protected readonly settingsService = inject(SettingsService);
  protected readonly user = this.chatState.userProfile;

  protected readonly tokenPercent = computed(() => {
    const u = this.user();
    return Math.round((u.tokensUsed / u.tokenLimit) * 100);
  });

  protected readonly formattedTokens = computed(() => {
    const u = this.user();
    return `${(u.tokensUsed / 1000).toFixed(1)}k / ${(u.tokenLimit / 1000).toFixed(0)}k`;
  });
}
