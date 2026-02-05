import { Component, Input, signal, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentItem } from '../../../core/services/discover.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { WatchlistButtonComponent } from '../watchlist-button/watchlist-button.component';
import { LucideAngularModule, Play, Plus } from 'lucide-angular';

@Component({
    selector: 'app-hero-carousel',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule, WatchlistButtonComponent],
    template: `
    <div class="carousel-container">
        @for (item of items; track item.id; let i = $index) {
            <div 
                class="carousel-item"
                [class.active]="currentIndex() === i"
                [style.opacity]="currentIndex() === i ? 1 : 0"
            >
                <div class="backdrop-wrapper">
                    @if (item.backdropPath) {
                        <img [src]="item.backdropPath" [alt]="item.title" class="backdrop-image">
                    } @else {
                        <div class="backdrop-placeholder"></div>
                    }
                    <div class="gradient-overlay"></div>
                </div>

                <div class="hero-content container-cinema">
                    <h1 class="hero-title text-display-huge">{{ item.title }}</h1>
                    <p class="hero-overview">{{ truncate(item.overview) }}</p>
                    
                    <div class="hero-actions">
                        <button class="btn-watch-now">
                            <lucide-icon [name]="Play" class="btn-icon" size="24" fill="black"></lucide-icon>
                            <span>Watch Now</span>
                        </button>
                        <button 
                            class="btn-watchlist"
                            [class.added]="isInWatchlist(item)"
                            (click)="toggleWatchlist(item, $event)"
                        >
                            <lucide-icon [name]="Plus" size="20" [class.rotate]="isInWatchlist(item)"></lucide-icon>
                            <span>{{ isInWatchlist(item) ? 'In Watchlist' : 'Add to Watchlist' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        }

        <div class="indicators">
            @for (item of items; track item.id; let i = $index) {
                <button 
                    class="indicator" 
                    [class.active]="currentIndex() === i"
                    (click)="setIndex(i)"
                ></button>
            }
        </div>
    </div>
  `,
    styles: [`
    .carousel-container {
        position: relative;
        width: 100%;
        height: 85vh;
        overflow: hidden;
        background: black;
    }

    .carousel-item {
        position: absolute;
        inset: 0;
        transition: opacity 1s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1));
        z-index: 1;
    }

    .carousel-item.active {
        z-index: 2;
    }

    .backdrop-wrapper {
        position: absolute;
        inset: 0;
    }

    .backdrop-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .backdrop-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a1a, #0a0a0a);
    }

    .gradient-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to top,
            var(--bg-cinema-black, #0C0C0C) 0%,
            transparent 60%,
            rgba(0,0,0,0.4) 100%
        );
    }
    
    .gradient-overlay::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to right,
            rgba(0,0,0,0.8) 0%,
            transparent 50%
        );
    }

    .hero-content {
        position: absolute;
        bottom: 25%;
        left: 0;
        width: 100%;
        z-index: 10;
        padding-left: 4%;
    }

    .hero-title {
        margin-bottom: var(--space-md, 12px);
        max-width: 800px;
    }

    .hero-overview {
        max-width: 600px;
        font-size: 1.2rem;
        text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
        margin-bottom: var(--space-xl, 24px);
        line-height: 1.5;
        color: #fff;
    }

    .hero-actions {
        display: flex;
        gap: var(--space-md, 12px);
        align-items: center;
    }

    .btn-watch-now, .btn-watchlist {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.8rem 2rem;
        border-radius: 4px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
    }

    .btn-watch-now {
        background: white;
        color: black;
    }

    .btn-watch-now:hover {
        background: rgba(255, 255, 255, 0.85);
        transform: scale(1.02);
    }

    .btn-watchlist {
        background: rgba(109, 109, 110, 0.7);
        backdrop-filter: blur(10px);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-watchlist:hover {
        background: rgba(109, 109, 110, 0.5);
        transform: scale(1.02);
    }

    .btn-watchlist.added {
        background: rgba(229, 9, 20, 0.8);
        border-color: rgba(229, 9, 20, 0.5);
    }

    .btn-watchlist .rotate {
        transform: rotate(45deg);
        transition: transform 0.3s ease;
    }

    .indicators {
        position: absolute;
        right: var(--space-xl, 24px);
        bottom: 30%;
        display: flex;
        flex-direction: column;
        gap: 0;
        z-index: 20;
    }

    .indicator {
        position: relative;
        width: 30px;
        height: 20px;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .indicator::after {
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,0.5);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }

    .indicator:hover::after {
        background: rgba(255,255,255,0.8);
        width: 6px;
        height: 6px;
    }

    .indicator.active::after {
        height: 24px;
        width: 4px;
        background: white;
        border-radius: 4px;
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
    @Input() items: ContentItem[] = [];

    private watchlistService = inject(WatchlistService);

    currentIndex = signal(0);
    private intervalId: any;
    private addedItems = signal<Set<string>>(new Set());

    readonly Play = Play;
    readonly Plus = Plus;

    ngOnInit() {
        this.startAutoPlay();
    }

    ngOnDestroy() {
        this.stopAutoPlay();
    }

    startAutoPlay() {
        this.intervalId = setInterval(() => {
            this.next();
        }, 8000);
    }

    stopAutoPlay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    setIndex(index: number) {
        this.stopAutoPlay();
        this.currentIndex.set(index);
        this.startAutoPlay();
    }

    next() {
        if (this.items.length === 0) return;
        this.currentIndex.update(i => (i + 1) % this.items.length);
    }

    truncate(text: string, length: number = 150): string {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    isInWatchlist(item: ContentItem): boolean {
        return this.addedItems().has(item.id) || this.watchlistService.isInWatchlist(item.id);
    }

    toggleWatchlist(item: ContentItem, event: Event) {
        event.stopPropagation();

        if (this.isInWatchlist(item)) return;

        this.addedItems.update(set => {
            const newSet = new Set(set);
            newSet.add(item.id);
            return newSet;
        });

        this.watchlistService.addToWatchlist({
            contentId: item.id,
            title: item.title,
            type: item.type,
            posterPath: item.posterPath || undefined,
            status: 'want'
        }).subscribe({
            error: (err) => {
                console.error('Failed to add to watchlist', err);
                this.addedItems.update(set => {
                    const newSet = new Set(set);
                    newSet.delete(item.id);
                    return newSet;
                });
            }
        });
    }
}
