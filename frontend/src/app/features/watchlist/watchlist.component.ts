import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistService, WatchlistItem } from '../../core/services/watchlist.service';
import { WatchlistCardComponent } from './watchlist-card/watchlist-card.component';
import { WatchlistTabsComponent, WatchlistTab } from './watchlist-tabs/watchlist-tabs.component';
import { StatsPanelComponent } from './stats-panel/stats-panel.component';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, WatchlistCardComponent, WatchlistTabsComponent, StatsPanelComponent],
  template: `
    <div class="min-h-screen bg-[#0a0a0a] pb-20">
      <!-- Header -->
      <div class="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div class="container mx-auto px-4 h-20 flex items-center justify-between">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Your Library
          </h1>
          
          <app-watchlist-tabs 
            [activeTab]="activeTab()" 
            [counts]="tabCounts()"
            (activeTabChange)="activeTab.set($event)"
          ></app-watchlist-tabs>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="container mx-auto px-4 py-8">
        
        <app-stats-panel *ngIf="!isLoading() && (watchlistService.watchlist().length > 0)"></app-stats-panel>
        
        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex justify-center p-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && filteredItems().length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M7 7.5h10"/><path d="M7 16.5h10"/></svg>
            </div>
            <h3 class="text-xl font-medium text-white mb-2">
                {{ activeTab() === 'all' ? 'Your watchlist is empty' : 'No items found in this list' }}
            </h3>
            <p class="text-gray-400 max-w-sm">
                {{ activeTab() === 'all' 
                    ? 'Start exploring content and add items to your library to track what you watch.'
                    : 'Change filters or add new items to populate this list.' 
                }}
            </p>
        </div>

        <!-- Grid -->
        <div *ngIf="!isLoading() && filteredItems().length > 0" class="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 desktop:grid-cols-5 gap-6">
          <app-watchlist-card
            *ngFor="let item of filteredItems()"
            [item]="item"
            (onStatusChange)="updateStatus(item.contentId, $event)"
            (onRemove)="removeItem(item.contentId)"
          ></app-watchlist-card>
        </div>

      </div>
    </div>
  `
})
export class WatchlistComponent implements OnInit {
  public watchlistService = inject(WatchlistService);

  activeTab = signal<WatchlistTab>('all');
  isLoading = signal(true);

  // Derived signals
  filteredItems = computed(() => {
    const all = this.watchlistService.watchlist();
    const tab = this.activeTab();

    if (tab === 'all') return all;
    return all.filter(item => item.status === tab);
  });

  tabCounts = computed(() => {
    const all = this.watchlistService.watchlist();
    return {
      all: all.length,
      want: all.filter(i => i.status === 'want').length,
      watching: all.filter(i => i.status === 'watching').length,
      watched: all.filter(i => i.status === 'watched').length
    };
  });

  ngOnInit() {
    this.watchlistService.loadWatchlist().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  updateStatus(id: string, newStatus: 'want' | 'watching' | 'watched') {
    // Optimistic update handled by service signal update flow, 
    // but the service method returns Observable, so we subscribe
    this.watchlistService.updateItem(id, { status: newStatus }).subscribe();
  }

  removeItem(id: string) {
    if (confirm('Are you sure you want to remove this from your library?')) {
      this.watchlistService.removeFromWatchlist(id).subscribe();
    }
  }
}
