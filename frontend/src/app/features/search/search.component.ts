import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { DiscoverService, ContentItem } from '../../core/services/discover.service';
import { fadeAnimation, staggerAnimation } from '../../shared/animations/fade.animation';
import { LucideAngularModule, Frown, Star, Play, Plus, Check, Loader2 } from 'lucide-angular';
import { WatchlistService } from '../../core/services/watchlist.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, ContentCardComponent, NavbarComponent, LucideAngularModule, RouterLink],
    template: `
    <div class="search-page" @fade>
      <app-navbar />
      
      <main class="main-content">
        @if (loading() && results().length === 0) {
            <div class="content-grid" @stagger>
                @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
                    <app-content-card [isLoading]="true" />
                }
            </div>
        } @else if (results().length > 0) {
            <div class="search-layout" @fade>
                
                <!-- Featured Top Result -->
                <div class="featured-section">
                    <h2 class="section-title">Top Result</h2>
                    <div class="featured-card group" [routerLink]="['/content', results()[0].type, results()[0].tmdbId]">
                        <div class="featured-backdrop">
                            <img [src]="results()[0].backdropPath || results()[0].posterPath" [alt]="results()[0].title" loading="lazy">
                            <div class="featured-overlay"></div>
                        </div>
                        
                        <div class="featured-content">
                            <h3 class="featured-title">{{ results()[0].title }}</h3>
                            <div class="featured-meta">
                                <div class="rating-badge">
                                    <lucide-icon [name]="Star" size="14"></lucide-icon>
                                    <span>{{ results()[0].rating.toFixed(1) }}</span>
                                </div>
                                <span class="year">{{ getYear(results()[0].releaseDate) }}</span>
                                <span class="type">{{ results()[0].type === 'movie' ? 'Movie' : 'TV Show' }}</span>
                            </div>
                            <p class="featured-overview">{{ results()[0].overview }}</p>
                            
                            <div class="featured-actions">
                                <button class="btn-play">
                                    <lucide-icon [name]="Play" size="20"></lucide-icon>
                                    <span>Watch Now</span>
                                </button>
                                <button 
                                    class="btn-watchlist" 
                                    (click)="onAddToWatchlist($event, results()[0])"
                                    [class.added]="isFeaturedAdded()"
                                >
                                    <lucide-icon [name]="isFeaturedAdded() ? Check : Plus" size="20"></lucide-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Grid Results -->
                <div class="results-section">
                     <h2 class="section-title">More Results</h2>
                    <div class="content-grid" @stagger>
                        @for (item of results().slice(1); track item.id) {
                            <app-content-card [content]="item" />
                        }
                    </div>

                    @if (hasMore()) {
                        <div class="load-more-container">
                            <button class="btn-load-more" (click)="loadMore()" [disabled]="loadingMore()">
                                @if (loadingMore()) {
                                    <lucide-icon [name]="Loader2" class="spin" size="20"></lucide-icon>
                                } @else {
                                    <span>Load More Results</span>
                                }
                            </button>
                        </div>
                    }
                </div>
            </div>
        } @else {
            <div class="empty-state" @fade>
                <lucide-icon [name]="Frown" class="empty-icon" size="64"></lucide-icon>
                <h2>No results found</h2>
                <p>We couldn't find anything matching "{{ query() }}".</p>
            </div>
        }
      </main>
    </div>
  `,
    animations: [fadeAnimation, staggerAnimation],
    styles: [`
    .search-page {
        min-height: 100vh;
        background-color: var(--bg-cinema-black);
    }

    .main-content {
        padding: var(--space-3xl) var(--space-xl);
        max-width: 1800px;
        margin: 0 auto;
        padding-top: 120px;
    }

    .search-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-2xl);
    }

    @media (min-width: 1024px) {
        .search-layout {
            grid-template-columns: 450px 1fr; /* Featured fixed width on left */
            align-items: start;
        }
        
        .featured-section {
            position: sticky;
            top: 120px;
        }
    }

    .section-title {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-lg);
    }

    /* Featured Card Styles */
    .featured-card {
        position: relative;
        border-radius: var(--radius-xl);
        overflow: hidden;
        background: var(--bg-card);
        border: 1px solid rgba(255, 255, 255, 0.1);
        aspect-ratio: 2/3; /* Portrait on mobile */
        cursor: pointer;
        transition: transform 0.3s var(--ease-cinema);
    }
    
    @media (min-width: 1024px) {
        .featured-card {
             aspect-ratio: 2/3; /* Keep portrait for side layout to match poster-like feel or maybe 16:9? The plan said "Large card" */
             /* Actually, standard featured cards are often 16:9. Let's force 16:9 for Featured if standard, but here it's "Top Result". 
                If using backdrop, 16:9 is better. 
                But in a side-by-side layout, a vertical card often fits better visually as a "Poster".
                However, implementation plan said "Full backdrop image". 
                I will make it a tall card with backdrop cover.
             */
             height: 600px; 
             aspect-ratio: auto;
        }
    }

    .featured-card:hover {
        transform: scale(1.02);
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
    }

    .featured-backdrop {
        position: absolute;
        inset: 0;
    }

    .featured-backdrop img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .featured-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to top,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.6) 50%,
            transparent 100%
        );
    }

    .featured-content {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: var(--space-xl);
        z-index: 10;
    }

    .featured-title {
        font-family: var(--font-display);
        font-size: 2.5rem;
        line-height: 1.1;
        margin-bottom: var(--space-md);
        text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .featured-meta {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
        font-size: 0.95rem;
        color: var(--text-primary);
    }

    .featured-overview {
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: var(--space-xl);
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .featured-actions {
        display: flex;
        gap: var(--space-md);
    }

    .btn-play {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: white;
        color: black;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 99px;
        font-weight: 600;
        font-family: var(--font-display);
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-play:hover {
        transform: scale(1.05);
        background: #f0f0f0;
    }

    .btn-watchlist {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        backdrop-filter: blur(10px);
        transition: all 0.2s;
    }

    .btn-watchlist:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }
    
    .btn-watchlist.added {
        background: var(--accent-neon-blue);
        color: black;
        border-color: var(--accent-neon-blue);
    }

    .rating-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #fbbf24;
        font-weight: 700;
    }

    /* Grid Styles */
    .content-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--space-md);
        row-gap: var(--space-xl);
    }

    .load-more-container {
        display: flex;
        justify-content: center;
        margin-top: var(--space-3xl);
    }

    .btn-load-more {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 0.75rem 2rem;
        border-radius: 99px;
        font-family: var(--font-display);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-load-more:hover:not(:disabled) {
        border-color: white;
        background: rgba(255, 255, 255, 0.05);
    }

    .btn-load-more:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .empty-state {
        text-align: center;
        padding: var(--space-3xl);
        color: var(--text-secondary);
        margin-top: var(--space-xl);
    }

    .empty-icon {
        color: var(--text-secondary);
        margin-bottom: var(--space-lg);
        opacity: 0.5;
    }
  `]
})
export class SearchComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private discoverService = inject(DiscoverService);
    private watchlistService = inject(WatchlistService); // Inject WatchlistService

    readonly Frown = Frown;
    readonly Star = Star;
    readonly Play = Play;
    readonly Plus = Plus;
    readonly Check = Check;
    readonly Loader2 = Loader2;

    query = signal('');
    results = signal<ContentItem[]>([]);
    loading = signal(false);

    // Pagination state
    page = signal(1);
    hasMore = signal(true);
    loadingMore = signal(false);

    // Local state for featured item watchlist status
    isFeaturedAdded = signal(false);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const q = params['q'];
            if (q) {
                this.query.set(q);
                this.page.set(1);
                this.hasMore.set(true);
                this.performSearch(q, 1, true); // Reset search
            }
        });
    }

    async performSearch(query: string, pageNum: number, isReset: boolean) {
        if (isReset) {
            this.loading.set(true);
        } else {
            this.loadingMore.set(true);
        }

        try {
            const newResults = await this.discoverService.search(query, pageNum);

            if (isReset) {
                this.results.set(newResults);
            } else {
                this.results.update(current => [...current, ...newResults]);
            }

            // Simple check: if we got less than 20 results (default TMDB page size), no more results
            if (newResults.length < 20) {
                this.hasMore.set(false);
            }

            // Check if top result is in watchlist
            if (isReset && newResults.length > 0) {
                this.checkFeaturedWatchlistStatus();
            }

        } catch (err) {
            console.error('Search failed', err);
            if (isReset) this.results.set([]);
        } finally {
            this.loading.set(false);
            this.loadingMore.set(false);
        }
    }

    loadMore() {
        if (!this.hasMore() || this.loadingMore()) return;

        const nextPage = this.page() + 1;
        this.page.set(nextPage);
        this.performSearch(this.query(), nextPage, false);
    }

    getYear(date: string): string {
        if (!date) return '';
        return new Date(date).getFullYear().toString();
    }

    // Check if the featured item is in the watchlist
    // Since we don't have a direct "is in watchlist" API without fetching the whole list or user profile,
    // we might rely on the user object in AuthService or WatchlistService cache.
    // For now, let's assume we can check against the loaded watchlist if available, 
    // OR we just default to false and let the user add it. 
    // Ideally, WatchlistService should expose a signal `watchlistItems` we can check against.
    checkFeaturedWatchlistStatus() {
        // Implementation depends on WatchlistService capabilities. 
        // For now, simpler to not implement check on load without more context, default false.
        // Or if WatchlistService has a synced signal:
        // this.isFeaturedAdded.set(this.watchlistService.isInWatchlist(contentId));
        this.isFeaturedAdded.set(false);
    }

    onAddToWatchlist(event: Event, content: ContentItem) {
        event.stopPropagation();
        if (this.isFeaturedAdded()) return;

        this.isFeaturedAdded.set(true);
        this.watchlistService.addToWatchlist({
            contentId: content.id,
            title: content.title,
            type: content.type,
            posterPath: content.posterPath || undefined,
            status: 'want'
        }).subscribe({

            error: (err: unknown) => {
                console.error('Failed to add to watchlist', err);
                this.isFeaturedAdded.set(false);
            }
        });
    }
}
