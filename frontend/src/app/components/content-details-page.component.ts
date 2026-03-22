import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { ContentItem, ContentService } from '../services/content.service';
import { WatchlistService } from '../services/watchlist.service';

interface ProviderUi {
  id: string;
  label: string;
  colorClass: string;
}

const PROVIDER_UI: Record<string, ProviderUi> = {
  netflix: { id: 'netflix', label: 'Netflix', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
  prime: { id: 'prime', label: 'Prime Video', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
  jiohotstar: { id: 'jiohotstar', label: 'JioHotstar', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
  hbo: { id: 'hbo', label: 'Max', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
  hulu: { id: 'hulu', label: 'Hulu', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
  apple: { id: 'apple', label: 'Apple TV+', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
  paramount: { id: 'paramount', label: 'Paramount+', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
  zee5: { id: 'zee5', label: 'ZEE5', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
  sonyliv: { id: 'sonyliv', label: 'SonyLIV', colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]' },
};

@Component({
  selector: 'app-content-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a
          [routerLink]="['/home']"
          class="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black mb-6 transition-colors"
        >
          <lucide-icon name="arrow-left" class="h-4 w-4"></lucide-icon>
          Back to Home
        </a>

        @if (isLoading()) {
          <div class="flex items-center justify-center py-20">
            <div class="flex flex-col items-center gap-4">
              <div class="animate-spin rounded-full h-8 w-8 border-4 border-[#1d1d1f] border-t-transparent"></div>
              <span class="text-xs font-mono uppercase tracking-widest text-black/50">Loading...</span>
            </div>
          </div>
        } @else if (errorMessage()) {
          <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
            <lucide-icon name="alert-circle" class="h-10 w-10 text-black/30 mb-4"></lucide-icon>
            <p class="text-sm text-black/60 mb-2">{{ errorMessage() }}</p>
            <a
              [routerLink]="['/home']"
              class="mt-4 text-xs font-mono uppercase tracking-widest text-black/50 hover:text-black transition-colors"
            >
              Go Home
            </a>
          </div>
        } @else if (content(); as detail) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div class="lg:col-span-1">
              <img
                [src]="watchlistService.getImageUrl(detail.poster_path)"
                [alt]="detail.title || detail.name"
                class="w-full max-w-sm mx-auto lg:mx-0 aspect-[2/3] object-cover rounded-xl shadow-lg"
              />
            </div>

            <div class="lg:col-span-2">
              <div class="flex items-center gap-2 mb-4">
                <span class="inline-flex items-center gap-1 rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[11px] font-semibold text-white font-mono">
                  <lucide-icon name="star" class="h-3 w-3 fill-white"></lucide-icon>
                  {{ (detail.vote_average || 0).toFixed(1) }}
                </span>
                <span class="text-[10px] font-mono uppercase tracking-widest text-black/50">
                  {{ detail.type === 'movie' ? 'Movie' : 'Series' }}
                </span>
                @if (releaseYear()) {
                  <span class="text-[10px] font-mono uppercase tracking-widest text-black/50">
                    · {{ releaseYear() }}
                  </span>
                }
              </div>

              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-6">
                {{ detail.title || detail.name }}
              </h1>

              <p class="text-base leading-relaxed text-black/70 mb-8">
                {{ detail.overview || 'No overview available.' }}
              </p>

              <div class="mb-8">
                <h4 class="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-3">
                  Available On
                </h4>
                <div class="flex flex-wrap gap-2">
                  @for (provider of providers(); track provider.id) {
                    <span
                      class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                      [ngClass]="provider.colorClass"
                    >
                      {{ provider.label }}
                    </span>
                  }
                  @if (providers().length === 0) {
                    <span class="text-xs text-black/40 italic">
                      No streaming info available
                    </span>
                  }
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button
                  (click)="addToWatchlist()"
                  [disabled]="isAddingToWatchlist() || isInWatchlist()"
                  class="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-mono uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed"
                  [ngClass]="isInWatchlist()
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-black text-white hover:bg-black/80'"
                >
                  @if (isAddingToWatchlist()) {
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding...
                  } @else if (isInWatchlist()) {
                    <lucide-icon name="check" class="h-4 w-4"></lucide-icon>
                    Added
                  } @else {
                    <lucide-icon name="plus" class="h-4 w-4"></lucide-icon>
                    Add to Watchlist
                  }
                </button>

                <a
                  [routerLink]="['/watchlist']"
                  class="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-mono uppercase tracking-widest border border-black/20 text-black/70 hover:bg-black/5 transition-all duration-200"
                >
                  <lucide-icon name="bookmark" class="h-4 w-4"></lucide-icon>
                  View Watchlist
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ContentDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contentService = inject(ContentService);
  watchlistService = inject(WatchlistService);

  content = signal<ContentItem | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isAddingToWatchlist = signal(false);
  isInWatchlist = signal(false);

  releaseYear = signal<string>('');
  providers = signal<ProviderUi[]>([]);

  ngOnInit(): void {
    const type = this.route.snapshot.paramMap.get('type');
    const id = this.route.snapshot.paramMap.get('id');

    if (!type || !id) {
      this.errorMessage.set('Invalid content parameters');
      return;
    }

    const tmdbId = this.extractTmdbId(id);
    if (!tmdbId) {
      this.errorMessage.set('Invalid content ID');
      return;
    }

    void this.loadContent(type as 'movie' | 'tv', tmdbId);
  }

  private extractTmdbId(id: string): number | null {
    if (id.includes('-')) {
      const parts = id.split('-');
      const lastPart = parts[parts.length - 1];
      const num = parseInt(lastPart, 10);
      return isNaN(num) ? null : num;
    }
    const num = parseInt(id, 10);
    return isNaN(num) ? null : num;
  }

  private async loadContent(type: 'movie' | 'tv', id: number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const detail = await firstValueFrom(this.contentService.getDetails(type, id));
      this.content.set(detail);

      const date = detail.release_date || detail.first_air_date || '';
      this.releaseYear.set(date.split('-')[0] || '');

      const providerIds = detail.watchProviders ?? [];
      const unique = Array.from(new Set(providerIds));
      this.providers.set(
        unique.map((providerId) => {
          const mapped = PROVIDER_UI[providerId];
          if (mapped) return mapped;
          return {
            id: providerId,
            label: providerId,
            colorClass: 'bg-[#e2e2e7] text-[#1d1d1f]',
          };
        })
      );
    } catch (error) {
      console.error('Error loading content details:', error);
      this.errorMessage.set('Could not load content details. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  addToWatchlist(): void {
    const detail = this.content();
    if (!detail || this.isAddingToWatchlist() || this.isInWatchlist()) return;

    this.isAddingToWatchlist.set(true);
    const contentId = `${detail.type}-${detail.id}`;

    this.watchlistService
      .addWatchlistItem({
        contentId,
        title: detail.title || detail.name || 'Unknown',
        type: detail.type,
        posterPath: detail.poster_path,
        backdropPath: detail.backdrop_path,
        status: 'want',
      })
      .subscribe({
        next: () => {
          this.isAddingToWatchlist.set(false);
          this.isInWatchlist.set(true);
        },
        error: (error) => {
          this.isAddingToWatchlist.set(false);
          if (this.isAlreadyAddedError(error)) {
            this.isInWatchlist.set(true);
            return;
          }
          console.error('Error adding to watchlist:', error);
        },
      });
  }

  private isAlreadyAddedError(error: unknown): boolean {
    const status =
      typeof (error as { status?: unknown })?.status === 'number'
        ? (error as { status: number }).status
        : undefined;
    const message = [
      error instanceof Error ? error.message : '',
      (error as { error?: { error?: string } })?.error?.error || '',
    ]
      .join(' ')
      .toLowerCase();
    return status === 409 || message.includes('already in watchlist') || message.includes('already added');
  }
}
