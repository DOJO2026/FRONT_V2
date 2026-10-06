import { Component, inject } from '@angular/core';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { AiAvatarComponent } from '../../../../shared/ui/ai-avatar';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';

@Component({
  selector: 'app-chat-greeting',
  standalone: true,
  imports: [AiAvatarComponent, AiIconComponent],
  template: `
    <div class="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto pt-6 pb-2 select-none animate-cascade-in">
      <!-- Glow Copilot Avatar -->
      <div class="relative">
        <ai-avatar role="ai" size="xl" status="online" [bordered]="true" />
        <div class="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-emerald-500/30">
          <ai-icon name="sparkles" [size]="14" class="text-emerald-400 animate-pulse" />
        </div>
      </div>

      <!-- Heading -->
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          DOJO 2.0 • Copilot RAG Conectado
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          ¿En qué puedo ayudarte hoy, {{ firstName() }}?
        </h2>
        <p class="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-lg">
          Estoy listo para analizar contratos, auditar políticas SOC2, resumir finanzas y responder consultas con respaldo en tus fuentes documentales.
        </p>
      </div>
    </div>
  `
})
export class GreetingComponent {
  private readonly chatState = inject(ChatStateService);

  protected readonly firstName = () => {
    return this.chatState.userProfile().name.split(' ')[0] || 'Colega';
  };
}
