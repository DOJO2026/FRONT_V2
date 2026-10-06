import { Component, inject } from '@angular/core';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiIconComponent } from '../../../../shared/ui/ai-icon';
import { ChatService } from '../../services/chat.service';
import { GreetingComponent } from '../greeting/greeting.component';

@Component({
  selector: 'app-chat-welcome',
  standalone: true,
  imports: [GreetingComponent, AiCardComponent, AiIconComponent],
  template: `
    <div class="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full gap-8 select-none">
      <!-- Top Greeting -->
      <app-chat-greeting />

      <!-- 2 Main Enterprise Options Requested -->
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        <!-- Option 1: Saber de nosotros (Como Empresa) -->
        <ai-card
          variant="elevated"
          padding="md"
          [interactive]="true"
          (click)="onSelectCompanyInfo()"
          class="group relative overflow-hidden bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/60 shadow-xl transition-all duration-300 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-[0_0_25px_rgba(16,163,127,0.2)]"
        >
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <ai-icon name="document" [size]="22" />
              </div>
              <span class="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Plataforma DOJO
              </span>
            </div>

            <div>
              <h3 class="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                <span>Conoce la plataforma DOJO 2.0</span>
                <span class="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
              </h3>
              <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Descubre la arquitectura de observabilidad, orquestación de clusters Kubernetes, métricas de SLA y gestión de infraestructura cloud.
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>Consultar capacidades DOJO</span>
            <ai-icon name="chevron-right" [size]="14" class="group-hover:translate-x-1 transition-transform" />
          </div>
        </ai-card>

        <!-- Option 2: Reportar una incidencia -->
        <ai-card
          variant="elevated"
          padding="md"
          [interactive]="true"
          (click)="onStartClaim()"
          class="group relative overflow-hidden bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/60 shadow-xl transition-all duration-300 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]"
        >
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <ai-icon name="chat" [size]="22" />
              </div>
              <span class="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                Incidentes & SLA
              </span>
            </div>

            <div>
              <h3 class="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                <span>Reportar incidencia de sistemas</span>
                <span class="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
              </h3>
              <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Registra un fallo crítico o degradación de servicio: describe el problema, adjunta logs o trazas y activa el diagnóstico forense por IA.
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-medium">
            <span>Iniciar diagnóstico asistido</span>
            <ai-icon name="chevron-right" [size]="14" class="group-hover:translate-x-1 transition-transform" />
          </div>
        </ai-card>
      </div>
    </div>
  `
})
export class WelcomeComponent {
  private readonly chatService = inject(ChatService);

  protected onSelectCompanyInfo(): void {
    this.chatService.sendMessage('Conoce la plataforma DOJO 2.0');
  }

  protected onStartClaim(): void {
    this.chatService.startClaimFlow();
  }
}

