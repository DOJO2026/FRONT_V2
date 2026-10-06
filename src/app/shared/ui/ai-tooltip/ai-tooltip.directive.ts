import {
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  EnvironmentInjector,
  OnDestroy,
  booleanAttribute,
  createComponent,
  inject,
  input
} from '@angular/core';
import { AiTooltipComponent, TooltipPosition } from './ai-tooltip.component';

@Directive({
  selector: '[aiTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(click)': 'hide()',
    '(window:scroll)': 'onWindowScroll()'
  }
})
export class AiTooltipDirective implements OnDestroy {
  readonly aiTooltip = input<string>('');
  readonly tooltipPosition = input<TooltipPosition>('top');
  readonly tooltipShortcut = input<string>('');
  readonly tooltipDisabled = input<boolean, boolean | ''>(false, { transform: booleanAttribute });
  readonly tooltipDelay = input<number>(120);

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  private componentRef: ComponentRef<AiTooltipComponent> | null = null;
  private showTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

  show(): void {
    if (this.tooltipDisabled() || !this.aiTooltip()?.trim()) {
      return;
    }

    this.clearHideTimeout();

    if (this.componentRef) {
      this.updatePosition();
      this.componentRef.setInput('visible', true);
      return;
    }

    this.showTimeoutId = setTimeout(() => {
      this.createTooltip();
    }, this.tooltipDelay());
  }

  hide(): void {
    this.clearShowTimeout();

    if (!this.componentRef) {
      return;
    }

    this.componentRef.setInput('visible', false);

    this.hideTimeoutId = setTimeout(() => {
      this.destroyTooltip();
    }, 150);
  }

  protected onWindowScroll(): void {
    if (this.componentRef) {
      this.hide();
    }
  }

  ngOnDestroy(): void {
    this.clearShowTimeout();
    this.clearHideTimeout();
    this.destroyTooltip();
  }

  private createTooltip(): void {
    if (this.componentRef) return;

    this.componentRef = createComponent(AiTooltipComponent, {
      environmentInjector: this.environmentInjector
    });

    this.componentRef.setInput('text', this.aiTooltip());
    this.componentRef.setInput('shortcut', this.tooltipShortcut());
    this.componentRef.setInput('position', this.tooltipPosition());

    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    this.updatePosition();

    // Trigger visibility animation
    requestAnimationFrame(() => {
      this.componentRef?.setInput('visible', true);
    });
  }

  private updatePosition(): void {
    if (!this.componentRef) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipElem = (this.componentRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    const tooltipRect = tooltipElem.firstElementChild?.getBoundingClientRect() || tooltipElem.getBoundingClientRect();

    const tooltipWidth = tooltipRect.width || 120;
    const tooltipHeight = tooltipRect.height || 28;
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition()) {
      case 'top':
        top = hostRect.top - tooltipHeight - gap;
        left = hostRect.left + hostRect.width / 2 - tooltipWidth / 2;
        break;

      case 'bottom':
        top = hostRect.bottom + gap;
        left = hostRect.left + hostRect.width / 2 - tooltipWidth / 2;
        break;

      case 'left':
        top = hostRect.top + hostRect.height / 2 - tooltipHeight / 2;
        left = hostRect.left - tooltipWidth - gap;
        break;

      case 'right':
        top = hostRect.top + hostRect.height / 2 - tooltipHeight / 2;
        left = hostRect.right + gap;
        break;
    }

    // Boundary guards
    const safeLeft = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
    const safeTop = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));

    this.componentRef.setInput('top', safeTop);
    this.componentRef.setInput('left', safeLeft);
  }

  private destroyTooltip(): void {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  private clearShowTimeout(): void {
    if (this.showTimeoutId) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = null;
    }
  }

  private clearHideTimeout(): void {
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }
  }
}
