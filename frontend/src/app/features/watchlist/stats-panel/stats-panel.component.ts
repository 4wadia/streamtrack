import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../../../core/services/watchlist.service';

@Component({
    selector: 'app-stats-panel',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <!-- Total -->
      <div class="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-white/5">
        <div class="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Items</div>
        <div class="text-2xl font-bold text-white">{{ stats().total }}</div>
      </div>

      <!-- Plan to Watch -->
      <div class="bg-indigo-900/20 backdrop-blur rounded-xl p-4 border border-indigo-500/10">
        <div class="text-indigo-300 text-xs uppercase tracking-wider mb-1">Plan to Watch</div>
        <div class="text-2xl font-bold text-indigo-100">{{ stats().byStatus.want }}</div>
      </div>

      <!-- Watching -->
      <div class="bg-blue-900/20 backdrop-blur rounded-xl p-4 border border-blue-500/10">
        <div class="text-blue-300 text-xs uppercase tracking-wider mb-1">Watching</div>
        <div class="text-2xl font-bold text-blue-100">{{ stats().byStatus.watching }}</div>
      </div>

      <!-- Watched -->
      <div class="bg-green-900/20 backdrop-blur rounded-xl p-4 border border-green-500/10">
        <div class="text-green-300 text-xs uppercase tracking-wider mb-1">Completed</div>
        <div class="text-2xl font-bold text-green-100">{{ stats().byStatus.watched }}</div>
      </div>
    </div>
  `
})
export class StatsPanelComponent {
    private watchlistService = inject(WatchlistService);

    stats = computed(() => {
        const list = this.watchlistService.watchlist();
        return {
            total: list.length,
            byStatus: {
                want: list.filter(i => i.status === 'want').length,
                watching: list.filter(i => i.status === 'watching').length,
                watched: list.filter(i => i.status === 'watched').length
            }
        };
    });
}
