import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { ContentItem, ContentService } from '../services/content.service';
import { WatchlistService } from '../services/watchlist.service';

interface ProviderUi {
  id: string;
  label: string;
  short: string;
  colorClass: string;
}

const PROVIDER_UI: Record<string, ProviderUi> = {
  netflix: { id: 'netflix', label: 'Netflix', short: 'N', colorClass: 'bg-[#e50914] text-white' },
  prime: { id: 'prime', label: 'Prime Video', short: 'PV', colorClass: 'bg-[#00a8e1] text-white' },
  jiohotstar: {
    id: 'jiohotstar',
    label: 'JioHotstar',
    short: 'JH',
    colorClass: 'bg-[#0a1f44] text-white',
  },
  hbo: { id: 'hbo', label: 'Max', short: 'MAX', colorClass: 'bg-[#1f0f4f] text-white' },
  hulu: { id: 'hulu', label: 'Hulu', short: 'H', colorClass: 'bg-[#1ce783] text-black' },
  apple: { id: 'apple', label: 'Apple TV+', short: 'tv+', colorClass: 'bg-black text-white' },
  paramount: {
    id: 'paramount',
    label: 'Paramount+',
    short: 'P+',
    colorClass: 'bg-[#0055ff] text-white',
  },
  zee5: { id: 'zee5', label: 'ZEE5', short: 'Z5', colorClass: 'bg-black text-white' },
  sonyliv: { id: 'sonyliv', label: 'SonyLIV', short: 'SL', colorClass: 'bg-black text-white' },
};

@Component({
  selector: 'app-content-details-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (item) {
      <div
        class="details-backdrop fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4"
        (click)="close()"
      >
        <article
          class="details-expand w-full max-w-3xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          @if (isLoading()) {
            <div
              class="py-16 text-center text-sm font-mono uppercase tracking-widest text-black/55"
            >
              Loading details...
            </div>
          } @else if (errorMessage()) {
            <div
              class="py-16 text-center text-sm font-mono uppercase tracking-widest text-black/55"
            >
              {{ errorMessage() }}
            </div>
          } @else if (content(); as detail) {
            <div
              class="grid grid-cols-1 gap-4 border-b border-black/10 p-5 sm:grid-cols-[140px_1fr] sm:p-6"
            >
              <img
                [src]="watchlistService.getImageUrl(detail.poster_path)"
                [alt]="detail.title || detail.name"
                class="mx-auto aspect-[2/3] w-[140px] rounded-xl border border-black/10 object-cover sm:mx-0"
              />

              <div>
                <div class="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2 py-1 text-[11px] font-semibold text-black"
                  >
                    <lucide-icon name="star" class="h-3.5 w-3.5 fill-black"></lucide-icon>
                    {{ (detail.vote_average || 0).toFixed(1) }}
                  </span>
                  <span class="text-[10px] font-mono uppercase tracking-widest text-black/45">
                    {{ detail.type === 'movie' ? 'Movie' : 'Series' }}
                    @if (releaseYear()) {
                      <span class="mx-1">-</span>{{ releaseYear() }}
                    }
                  </span>
                </div>

                <h3 class="text-2xl font-bold tracking-tight text-black">
                  {{ detail.title || detail.name }}
                </h3>

                <div class="mt-3 flex flex-wrap gap-2">
                  @for (provider of providers(); track provider.id) {
                    <span
                      class="inline-flex items-center gap-1 rounded-md border border-black/10 bg-black/[0.03] px-2 py-1 text-[11px] text-black/75"
                    >
                      <span
                        class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[4px] px-1 text-[9px] font-mono font-bold uppercase"
                        [ngClass]="provider.colorClass"
                      >
                        {{ provider.short }}
                      </span>
                      {{ provider.label }}
                    </span>
                  }
                  @if (providers().length === 0) {
                    <span
                      class="rounded-md border border-black/10 bg-black/[0.03] px-2 py-1 text-[11px] text-black/60"
                    >
                      OTT info unavailable
                    </span>
                  }
                </div>
              </div>
            </div>

            <div class="border-b border-black/10 px-5 py-4 sm:px-6">
              <h4 class="mb-2 text-[10px] font-mono uppercase tracking-widest text-black/50">
                Description
              </h4>
              <p class="text-sm leading-relaxed text-black/80">
                {{ shortOverview(detail.overview) }}
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
              <button
                type="button"
                (click)="addToWatchlist()"
                [disabled]="isAddingToWatchlist() || isInWatchlist()"
                class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors disabled:cursor-not-allowed"
                [ngClass]="
                  isInWatchlist()
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-black bg-black text-white hover:bg-black/85'
                "
              >
                @if (isAddingToWatchlist()) {
                  <lucide-icon name="activity" class="h-4 w-4 animate-spin"></lucide-icon>
                  Adding...
                } @else if (isInWatchlist()) {
                  <lucide-icon name="check" class="h-4 w-4"></lucide-icon>
                  In Watchlist
                } @else {
                  <lucide-icon name="plus" class="h-4 w-4"></lucide-icon>
                  Add to Watchlist
                }
              </button>

              <button
                type="button"
                (click)="close()"
                class="rounded-full border border-black/10 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-black/70 transition-colors hover:bg-black hover:text-white"
              >
                Close
              </button>
            </div>
          }
        </article>
      </div>
    }
  `,
})
export class ContentDetailsModalComponent implements OnChanges, OnDestroy {
  @Input() item: ContentItem | null = null;
  @Output() closed = new EventEmitter<void>();

  private contentService = inject(ContentService);
  watchlistService = inject(WatchlistService);

  content = signal<ContentItem | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isAddingToWatchlist = signal(false);
  isInWatchlist = signal(false);

  private previousBodyOverflow = '';
  private bodyLocked = false;

  releaseYear = computed(() => {
    const detail = this.content();
    const date = detail?.release_date || detail?.first_air_date || '';
    return date.split('-')[0] || '';
  });

  providers = computed(() => {
    const providerIds = this.content()?.watchProviders ?? [];
    const unique = Array.from(new Set(providerIds));

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
      };
    });
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!('item' in changes)) {
      return;
    }

    const current = this.item;
    if (!current) {
      this.content.set(null);
      this.errorMessage.set(null);
      this.isLoading.set(false);
      this.isAddingToWatchlist.set(false);
      this.isInWatchlist.set(false);
      this.lockBodyScroll(false);
      return;
    }

    this.lockBodyScroll(true);
    this.isAddingToWatchlist.set(false);
    this.isInWatchlist.set(false);
    void this.loadDetails(current);
  }

  ngOnDestroy(): void {
    this.lockBodyScroll(false);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.item) {
      this.close();
    }
  }

  close(): void {
    this.lockBodyScroll(false);
    this.closed.emit();
  }

  shortOverview(text?: string): string {
    const value = (text || '').trim();
    if (!value) {
      return 'No overview available yet.';
    }

    if (value.length <= 260) {
      return value;
    }

    return `${value.slice(0, 257)}...`;
  }

  addToWatchlist(): void {
    const detail = this.content();
    if (!detail || this.isAddingToWatchlist() || this.isInWatchlist()) {
      return;
    }

    this.isAddingToWatchlist.set(true);
    const rawId = String(detail.id);
    const contentId = rawId.includes('-') ? rawId : `${detail.type}-${rawId}`;

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

    return (
      status === 409 ||
      message.includes('already in watchlist') ||
      message.includes('already added')
    );
  }

  private resolveTmdbId(item: ContentItem): number | null {
    if (typeof item.tmdbId === 'number' && Number.isInteger(item.tmdbId) && item.tmdbId > 0) {
      return item.tmdbId;
    }

    if (typeof item.id === 'number' && Number.isInteger(item.id) && item.id > 0) {
      return item.id;
    }

    if (typeof item.id === 'string') {
      const parts = item.id.split('-');
      const candidate = Number(parts[parts.length - 1]);
      if (Number.isInteger(candidate) && candidate > 0) {
        return candidate;
      }
    }

    return null;
  }

  private async loadDetails(item: ContentItem): Promise<void> {
    const tmdbId = this.resolveTmdbId(item);
    if (!tmdbId) {
      this.content.set(item);
      this.errorMessage.set('Detailed data is unavailable for this title.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const detail = await firstValueFrom(this.contentService.getDetails(item.type, tmdbId));
      this.content.set(detail);
    } catch (error) {
      console.error('Error loading modal details:', error);
      this.content.set(item);
      this.errorMessage.set('Could not load full details right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private lockBodyScroll(shouldLock: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (shouldLock && !this.bodyLocked) {
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.bodyLocked = true;
      return;
    }

    if (!shouldLock && this.bodyLocked) {
      document.body.style.overflow = this.previousBodyOverflow;
      this.bodyLocked = false;
    }
  }
}
