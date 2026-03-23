import { Component, signal, HostListener, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { ContentService, ContentItem } from '../services/content.service';
import { WatchlistService } from '../services/watchlist.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <section
      class="relative mb-[84px] min-h-[520px] overflow-hidden border border-black/10 bg-[var(--surface-gradient-tonight)]"
      style="border-radius: var(--radius-card);"
    >
      <div class="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-[10%] py-16 md:grid-cols-2">
        <!-- Left Content -->
        <div class="reveal delay-1">
          <div class="mb-7 font-mono text-[10px] uppercase tracking-[5px] text-black/45">
            TONIGHT'S PICK
          </div>

          <h1
            class="mb-7 text-5xl font-extrabold leading-[1.02] tracking-[-1.2px] text-black transition-all duration-500 md:text-[4.8rem]"
            [ngClass]="{ 'opacity-0 translate-y-4': !pick() }"
            [innerHTML]="formatTitle(pick()?.title || pick()?.name || 'Loading...')"
          >
          </h1>

          <div
            class="mb-10 flex flex-wrap items-center gap-2.5 font-mono text-[11px] tracking-widest transition-all delay-100 duration-500"
            [ngClass]="{ 'opacity-0 translate-y-4': !pick() }"
          >
            <span class="st-pill-meta">{{ pick()?.type === 'movie' ? 'Movie' : 'TV Series' }}</span>
            <span class="st-pill-meta">{{ (pick()?.release_date || pick()?.first_air_date || '').split('-')[0] }}</span>
            <span class="st-pill-meta flex items-center gap-1.5">
              <lucide-icon name="star" class="h-3.5 w-3.5 fill-white"></lucide-icon>
              Rating {{ (pick()?.vote_average || 0).toFixed(1) }}
            </span>
          </div>

          <div class="flex flex-wrap gap-4">
            <button
              type="button"
              (click)="openPickDetails()"
              class="st-pill border border-black/15 bg-white font-mono text-[10px] font-bold uppercase tracking-[2px] text-black transition-all duration-300 hover:bg-black hover:text-white"
            >
              VIEW DETAILS
            </button>

            <button
              (click)="addPickToWatchlist()"
              [disabled]="isAddingToWatchlist() || isPickAdded()"
              class="st-pill relative overflow-hidden border-none font-mono text-[10px] font-bold uppercase tracking-[2px] transition-all duration-300 disabled:cursor-not-allowed"
              [ngClass]="
                isPickAdded()
                  ? 'bg-black text-white'
                  : 'bg-black text-white hover:bg-black/80'
              "
            >
              @if (showTickPulse()) {
                <span class="absolute inset-0 animate-ping bg-black/25"></span>
              }

              <span class="relative flex items-center gap-3">
                @if (isAddingToWatchlist()) {
                  <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ADDING...
                } @else if (isPickAdded()) {
                  <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                  ADDED
                } @else {
                  ADD TO WATCHLIST
                }
              </span>
            </button>
          </div>
        </div>

        <div
          (click)="openPickDetails()"
          (keydown.enter)="openPickDetails()"
          tabindex="0"
          class="group relative mr-0 cursor-pointer justify-self-center reveal delay-2 md:justify-self-end"
        >
          <div
            #visual
            class="st-poster-rounded st-poster-elevated relative h-[480px] w-[320px] overflow-hidden border border-black/10 transition-all duration-1000 ease-out"
          >
            <img
              [src]="watchlistService.getImageUrl(pick()?.poster_path)"
              [alt]="pick()?.title"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent implements OnInit {
  private contentService = inject(ContentService);
  private router = inject(Router);
  watchlistService = inject(WatchlistService);

  pick = signal<ContentItem | null>(null);
  isAddingToWatchlist = signal(false);
  isPickAdded = signal(false);
  showTickPulse = signal(false);
  @ViewChild('visual') visualRef!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.contentService.getTonightPick().subscribe({
      next: (data) => {
        if (!data.pick) {
          this.loadFallbackTrending();
          return;
        }
        this.pick.set(data.pick);
        this.isPickAdded.set(false);
        this.isAddingToWatchlist.set(false);
        this.showTickPulse.set(false);
      },
      error: () => {
        this.loadFallbackTrending();
      },
    });
  }

  private loadFallbackTrending() {
    this.contentService.getTrending('all', 'week').subscribe({
      next: (items) => {
        if (items.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(items.length, 5));
          this.pick.set(items[randomIndex]);
        }
      },
      error: (err) => console.error('Error fetching fallback trending:', err),
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

  private markAddedWithTick(): void {
    this.isPickAdded.set(true);
    this.showTickPulse.set(true);
    setTimeout(() => this.showTickPulse.set(false), 450);
  }

  addPickToWatchlist() {
    const item = this.pick();
    if (!item || this.isAddingToWatchlist() || this.isPickAdded()) return;

    const rawId = String(item.id);
    const contentId = rawId.includes('-') ? rawId : `${item.type}-${rawId}`;
    this.isAddingToWatchlist.set(true);

    this.watchlistService
      .addWatchlistItem({
        contentId,
        title: item.title || item.name || 'Unknown',
        type: item.type,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        status: 'want',
      })
      .subscribe({
        next: () => {
          this.isAddingToWatchlist.set(false);
          this.markAddedWithTick();
        },
        error: (err) => {
          this.isAddingToWatchlist.set(false);

          if (this.isAlreadyAddedError(err)) {
            this.markAddedWithTick();
            return;
          }

          console.error('Error adding tonight pick:', err);
        },
      });
  }

  openPickDetails(): void {
    const item = this.pick();
    if (!item) {
      return;
    }

    const tmdbId = this.resolveTmdbId(item);
    if (!tmdbId) return;

    const route = item.type === 'movie' ? '/movie' : '/tv';
    void this.router.navigate([route, tmdbId], {
      state: {
        preview: item,
      },
    });
  }

  formatTitle(title: string): string {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length > 2) {
      return words.slice(0, 2).join(' ') + '<br />' + words.slice(2).join(' ');
    }
    return title;
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
      if (Number.isInteger(candidate) && candidate > 0) return candidate;
    }

    return null;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.visualRef) return;
    const visual = this.visualRef.nativeElement;
    const { left, top, width, height } = visual.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    visual.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${y * -4}deg) scale(1.02)`;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (!this.visualRef) return;
    this.visualRef.nativeElement.style.transform = `perspective(1000px) rotateY(0) rotateX(0) scale(1)`;
  }
}
