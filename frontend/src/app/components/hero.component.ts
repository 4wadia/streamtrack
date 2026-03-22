import { Component, signal, HostListener, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ContentService, ContentItem } from '../services/content.service';
import { WatchlistService } from '../services/watchlist.service';
import { OnInit } from '@angular/core';
import { ContentDetailsModalComponent } from './content-details-modal.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ContentDetailsModalComponent],
  template: `
    <section class="relative mb-[100px] flex items-center min-h-[500px] overflow-hidden">
      <!-- Background with backdrop image and white overlay -->
      <div class="absolute inset-0 z-0">
        <img
          [src]="watchlistService.getBackdropUrl(pick()?.backdrop_path)"
          [alt]="pick()?.title || ''"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-white/60"></div>
      </div>

      <div
        class="relative z-10 max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6"
      >
        <!-- Left Content -->
        <div class="reveal delay-1">
          <div class="text-black/40 font-mono text-[10px] uppercase tracking-[5px] mb-8">
            TONIGHT'S PICK
          </div>

          <h1
            class="text-6xl md:text-[5.5rem] font-light leading-[1.05] tracking-[-3px] mb-8 text-black transition-all duration-500"
            [ngClass]="{ 'opacity-0 translate-y-4': !pick() }"
            [innerHTML]="formatTitle(pick()?.title || pick()?.name || 'Loading...')"
          >
          </h1>

          <div
            class="flex flex-wrap gap-5 font-mono text-[11px] text-black/50 mb-12 items-center tracking-widest transition-all duration-500 delay-100"
            [ngClass]="{ 'opacity-0 translate-y-4': !pick() }"
          >
            <span>{{ pick()?.type === 'movie' ? 'Movie' : 'TV Series' }}</span>
            <span class="w-1 h-1 bg-black/20 rounded-full"></span>
            <span>{{ (pick()?.release_date || pick()?.first_air_date || '').split('-')[0] }}</span>
            <span class="w-1 h-1 bg-black/20 rounded-full"></span>
            <span class="flex items-center gap-1.5">
              <lucide-icon name="star" class="w-3.5 h-3.5 fill-black"></lucide-icon>
              {{ (pick()?.vote_average || 0).toFixed(1) }}
            </span>
          </div>

          <div class="flex flex-wrap gap-4">
            <button
              type="button"
              (click)="openPickDetails()"
              class="border border-black/20 px-10 py-5 font-mono text-[10px] font-bold cursor-pointer transition-all duration-300 rounded-none flex items-center justify-center gap-3 uppercase tracking-[2px] bg-white text-black hover:bg-black hover:text-white no-underline"
            >
              VIEW DETAILS
            </button>

            <button
              (click)="addPickToWatchlist()"
              [disabled]="isAddingToWatchlist() || isPickAdded()"
              class="relative border-none px-10 py-5 font-mono text-[10px] font-bold cursor-pointer transition-all duration-300 rounded-none flex items-center justify-center gap-3 uppercase tracking-[2px] overflow-hidden disabled:cursor-not-allowed"
              [ngClass]="
                isPickAdded()
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-black text-white hover:bg-black/80'
              "
            >
              @if (showTickPulse()) {
                <span class="absolute inset-0 bg-[#8e8e93]/40 animate-ping"></span>
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
          class="relative group justify-self-center md:justify-self-end mr-12 reveal delay-2 cursor-pointer"
        >
          <div
            #visual
            class="relative w-[320px] h-[480px] overflow-hidden rounded-2xl shadow-2xl transition-all duration-1000 ease-out border border-black/10"
          >
            <img
              [src]="watchlistService.getImageUrl(pick()?.poster_path)"
              [alt]="pick()?.title"
              class="w-full h-full object-cover grayscale-[0.1] transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      <app-content-details-modal
        [item]="isDetailsOpen() ? pick() : null"
        (closed)="closePickDetails()"
      ></app-content-details-modal>
    </section>
  `,
})
export class HeroComponent implements OnInit {
  private contentService = inject(ContentService);
  watchlistService = inject(WatchlistService);

  pick = signal<ContentItem | null>(null);
  isDetailsOpen = signal(false);
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
    if (!this.pick()) {
      return;
    }

    this.isDetailsOpen.set(true);
  }

  closePickDetails(): void {
    this.isDetailsOpen.set(false);
  }

  formatTitle(title: string): string {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length > 2) {
      return words.slice(0, 2).join(' ') + '<br />' + words.slice(2).join(' ');
    }
    return title;
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
