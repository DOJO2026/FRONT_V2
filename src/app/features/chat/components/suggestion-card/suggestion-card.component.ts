import { Component, input, output } from '@angular/core';
import { ChatSuggestion } from '../../models/chat-message.model';
import { AiCardComponent } from '../../../../shared/ui/ai-card';
import { AiIconComponent, IconName } from '../../../../shared/ui/ai-icon';

@Component({
  selector: 'app-suggestion-card',
  standalone: true,
  imports: [AiCardComponent, AiIconComponent],
  template: `
    <ai-card
      variant="default"
      padding="md"
      [interactive]="true"
      (click)="selected.emit(suggestion().prompt)"
      class="cursor-pointer group flex flex-col justify-between h-full"
    >
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <ai-icon [name]="iconName()" [size]="18" />
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {{ suggestion().category }}
          </span>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors">
            {{ suggestion().title }}
          </h4>
          <p class="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed">
            {{ suggestion().description }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-primary)] mt-3 pt-2 border-t border-white/5 group-hover:translate-x-1 transition-transform">
        <span>Consultar al Copilot</span>
        <ai-icon name="chevron-right" [size]="12" />
      </div>
    </ai-card>
  `
})
export class SuggestionCardComponent {
  readonly suggestion = input.required<ChatSuggestion>();
  readonly selected = output<string>();

  protected get iconName(): () => IconName {
    return () => this.suggestion().icon as IconName;
  }
}
