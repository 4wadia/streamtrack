import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type WatchlistTab = 'all' | 'want' | 'watching' | 'watched';

@Component({
  selector: 'app-watchlist-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 p-1 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 w-fit">
      @for (tab of tabs; track tab.id) {
          <button
            (click)="activeTabChange.emit(tab.id)"
            class="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            [ngClass]="activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'"
          >
            @if (activeTab === tab.id) {
                <div 
                    class="absolute inset-0 bg-white/10 rounded-lg shadow-sm border border-white/5"
                ></div>
            }
            <span class="relative z-10 flex items-center gap-2">
                {{ tab.label }}
                @if (counts && counts[tab.id]) {
                    <span class="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px]">
                        {{ counts[tab.id] }}
                    </span>
                }
            </span>
          </button>
      }
    </div>
  `
})
export class WatchlistTabsComponent {
  @Input() activeTab: WatchlistTab = 'all';
  @Input() counts: Record<string, number> = {};
  @Output() activeTabChange = new EventEmitter<WatchlistTab>();

  tabs: { id: WatchlistTab; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'want', label: 'Plan to Watch' },
    { id: 'watching', label: 'Watching' },
    { id: 'watched', label: 'Completed' }
  ];
}
