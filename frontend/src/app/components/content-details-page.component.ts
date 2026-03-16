import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { ContentItem, ContentService } from '../services/content.service';
import { WatchlistService } from '../services/watchlist.service';

interface ProviderUi {
  id: string;
  label: string;
  short: string;
  colorClass: string;
  urlBase: string;
}

const PROVIDER_UI: Record<string, ProviderUi> = {
  netflix: {
    id: 'netflix',
    label: 'Netflix',
    short: 'N',
    colorClass: 'bg-[#e50914] text-white',
    urlBase: 'https://www.netflix.com/search?q=',
  },
  prime: {
    id: 'prime',
    label: 'Prime Video',
    short: 'PV',
    colorClass: 'bg-[#00a8e1] text-white',
    urlBase: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=',
  },
  jiohotstar: {
    id: 'jiohotstar',
    label: 'JioHotstar',
    short: 'JH',
    colorClass: 'bg-[#0a1f44] text-white',
    urlBase: 'https://www.hotstar.com/in/search?q=',
  },
  hbo: {
    id: 'hbo',
    label: 'Max',
    short: 'MAX',
    colorClass: 'bg-[#1f0f4f] text-white',
    urlBase: 'https://play.max.com/search?q=',
  },
  hulu: {
    id: 'hulu',
    label: 'Hulu',
    short: 'H',
    colorClass: 'bg-[#1ce783] text-black',
    urlBase: 'https://www.hulu.com/search?q=',
  },
  apple: {
    id: 'apple',
    label: 'Apple TV+',
    short: 'tv+',
    colorClass: 'bg-black text-white',
    urlBase: 'https://tv.apple.com/search?term=',
  },
  paramount: {
    id: 'paramount',
    label: 'Paramount+',
    short: 'P+',
    colorClass: 'bg-[#0055ff] text-white',
    urlBase: 'https://www.paramountplus.com/search/?query=',
  },
};

@Component({
  selector: 'app-content-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <section class="py-2">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-[10px] font-mono text-black/40 uppercase tracking-[0.3em] mb-2">Details</p>
          <h1 class="text-3xl font-bold tracking-tight text-black">{{ pageTitle() }}</h1>
        </div>
        <a
          routerLink="/"
          class="text-[11px] font-mono text-black/60 uppercase tracking-widest hover:text-black transition-colors no-underline"
          >Back to Home</a
        >
      </div>

      @if (isLoading()) {
        <div class="py-16 text-center text-black/60 font-mono text-sm uppercase tracking-widest">
          Loading details...
        </div>
      } @else if (errorMessage()) {
        <div
          class="py-16 text-center text-black/60 font-mono text-sm uppercase tracking-widest border border-black/10 rounded-2xl"
        >
          {{ errorMessage() }}
        </div>
      } @else if (content(); as item) {
        <article
          class="rounded-3xl overflow-hidden border border-black/10 bg-white shadow-sm reveal"
        >
          <div class="relative h-[260px] md:h-[380px] border-b border-black/10">
            <img
              [src]="
                watchlistService.getImageUrl(item.backdrop_path || item.poster_path, 'original')
              "
              [alt]="item.title || item.name"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
            ></div>

            <div class="absolute bottom-0 left-0 w-full p-6 md:p-8 flex items-end gap-5">
              <img
                [src]="watchlistService.getImageUrl(item.poster_path)"
                [alt]="item.title || item.name"
                class="hidden md:block w-28 aspect-[2/3] object-cover rounded-xl border border-white/20 shadow-xl"
              />

              <div class="text-white flex-1">
                <p class="font-mono text-[10px] uppercase tracking-widest text-white/70 mb-3">
                  {{ item.type === 'movie' ? 'Movie' : 'TV Show' }}
                  @if (releaseYear()) {
                    <span class="mx-2">-</span>{{ releaseYear() }}
                  }
                  @if (item.vote_average) {
                    <span class="mx-2">-</span>{{ item.vote_average.toFixed(1) }}/10
                  }
                  @if (item.runtime) {
                    <span class="mx-2">-</span>{{ formatRuntime(item.runtime) }}
                  }
                </p>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
                  {{ item.title || item.name }}
                </h2>

                @if (item.genres?.length) {
                  <div class="flex flex-wrap gap-2">
                    @for (genre of item.genres; track genre) {
                      <span
                        class="px-3 py-1 rounded-full border border-white/25 bg-white/10 text-[10px] font-mono uppercase tracking-wider"
                      >
                        {{ genre }}
                      </span>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-2">
              <h3 class="text-[10px] font-mono text-black/50 mb-3 uppercase tracking-widest">
                Overview
              </h3>
              <p class="text-black/80 text-[15px] leading-relaxed">
                {{ item.overview || 'No overview available yet.' }}
              </p>
            </div>

            <div>
              <h3 class="text-[10px] font-mono text-black/50 mb-3 uppercase tracking-widest">
                Where to Watch
              </h3>

              @if (providers().length > 0) {
                <div class="flex flex-col gap-2">
                  @for (provider of providers(); track provider.id) {
                    <button
                      type="button"
                      (click)="openProvider(provider)"
                      class="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-black/10 bg-black/[0.03] hover:bg-black/[0.06] transition-colors cursor-pointer"
                    >
                      <span class="flex items-center gap-3 min-w-0">
                        <span
                          class="w-8 h-8 rounded-md text-[10px] font-mono font-bold uppercase tracking-wide flex items-center justify-center"
                          [ngClass]="provider.colorClass"
                        >
                          {{ provider.short }}
                        </span>
                        <span class="text-[13px] text-black font-medium truncate">{{
                          provider.label
                        }}</span>
                      </span>
                      <lucide-icon
                        name="external-link"
                        class="w-3.5 h-3.5 text-black/50"
                      ></lucide-icon>
                    </button>
                  }
                </div>
              } @else {
                <p class="text-black/60 text-[13px] leading-relaxed">
                  No streaming providers found for this title in your region.
                </p>
              }
            </div>
          </div>
        </article>
      }
    </section>
  `,
})
export class ContentDetailsPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  watchlistService = inject(WatchlistService);
  private routeSub?: Subscription;

  content = signal<ContentItem | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  pageTitle = computed(() => {
    const item = this.content();
    return item ? `${item.title || item.name} Details` : 'Show Details';
  });

  releaseYear = computed(() => {
    const item = this.content();
    const date = item?.release_date || item?.first_air_date || '';
    return date.split('-')[0] || '';
  });

  providers = computed(() => {
    const providers = this.content()?.watchProviders ?? [];
    const unique = Array.from(new Set(providers));
    return unique.map((providerId) => {
      const mapped = PROVIDER_UI[providerId];
      if (mapped) {
        return mapped;
      }

      return {
        id: providerId,
        label: providerId,
        short: providerId.slice(0, 2).toUpperCase(),
        colorClass: 'bg-black text-white',
        urlBase: 'https://www.google.com/search?q=',
      };
    });
  });

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const type = params.get('type');
      const idValue = params.get('id');
      const tmdbId = Number(idValue);

      if ((type !== 'movie' && type !== 'tv') || !Number.isInteger(tmdbId) || tmdbId <= 0) {
        this.content.set(null);
        this.isLoading.set(false);
        this.errorMessage.set('This title cannot be opened.');
        return;
      }

      void this.loadContent(type, tmdbId);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  formatRuntime(runtimeMinutes: number): string {
    if (!Number.isFinite(runtimeMinutes) || runtimeMinutes <= 0) {
      return 'Runtime N/A';
    }

    const hours = Math.floor(runtimeMinutes / 60);
    const minutes = runtimeMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  openProvider(provider: ProviderUi): void {
    const title = this.content()?.title || this.content()?.name;
    if (!title || typeof window === 'undefined') {
      return;
    }

    const destination = `${provider.urlBase}${encodeURIComponent(title)}`;
    window.open(destination, '_blank', 'noopener,noreferrer');
  }

  private async loadContent(type: 'movie' | 'tv', tmdbId: number): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const item = await firstValueFrom(this.contentService.getDetails(type, tmdbId));
      this.content.set(item);
    } catch (error) {
      console.error('Error loading content details:', error);
      this.content.set(null);
      this.errorMessage.set('Failed to load this title right now.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
