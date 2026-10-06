import { Injectable, signal } from '@angular/core';

export type HelpCenterTab = 'shortcuts' | 'rag-guide' | 'best-practices';

@Injectable({
  providedIn: 'root'
})
export class ShortcutsService {
  readonly isOpen = signal<boolean>(false);
  readonly activeTab = signal<HelpCenterTab>('shortcuts');

  open(tab: HelpCenterTab = 'shortcuts'): void {
    this.activeTab.set(tab);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  setTab(tab: HelpCenterTab): void {
    this.activeTab.set(tab);
  }
}
