import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WatchlistService, WatchlistItem } from '../../core/services/watchlist.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { WatchlistCardComponent } from './watchlist-card/watchlist-card.component';
import { WatchlistTabsComponent, WatchlistTab } from './watchlist-tabs/watchlist-tabs.component';
import { StatsModalComponent } from './stats-modal/stats-modal.component';
import { fadeAnimation, staggerAnimation } from '../../shared/animations/fade.animation';
import { LucideAngularModule, Shuffle, BarChart2, SlidersHorizontal, X, Search, ChevronDown } from 'lucide-angular';

type SortOption = 'dateAdded' | 'titleAsc' | 'titleDesc' | 'rating' | 'releaseDate';
type TypeFilter = 'all' | 'movie' | 'tv';

@Component({
    selector: 'app-watchlist',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NavbarComponent,
        WatchlistCardComponent,
        WatchlistTabsComponent,
        StatsModalComponent,
        LucideAngularModule
    ],
    animations: [fadeAnimation, staggerAnimation],
    template: `
    <div class="watchlist-page" @fade>
      <app-navbar />

      <main class="main-content">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-left">
                <h1 class="page-title">My Library</h1>
                <span class="item-count">{{ filteredItems().length }} items</span>
            </div>
            <div class="header-actions">
                <button class="action-btn" (click)="pickRandom()" [disabled]="filteredItems().length === 0" title="Pick Random">
                    <lucide-icon [name]="Shuffle" [size]="18"></lucide-icon>
                    <span>Random</span>
                </button>
                <button class="action-btn" (click)="showStats.set(true)" title="View Stats">
                    <lucide-icon [name]="BarChart2" [size]="18"></lucide-icon>
                    <span>Stats</span>
                </button>
                <button 
                    class="action-btn" 
                    [class.active]="showFilters()"
                    (click)="toggleFilters()" 
                    title="Toggle Filters"
                >
                    <lucide-icon [name]="SlidersHorizontal" [size]="18"></lucide-icon>
                    <span>Filter</span>
                </button>
            </div>
        </div>

        <!-- Status Tabs -->
        <div class="tabs-row">
            <app-watchlist-tabs 
                [activeTab]="activeTab()" 
                [counts]="tabCounts()"
                (activeTabChange)="activeTab.set($event)"
            ></app-watchlist-tabs>
        </div>

        <!-- Filter Bar (collapsible) -->
        @if (showFilters()) {
            <div class="filter-bar glass-panel" @fade>
                <div class="filter-group">
                    <div class="search-input-wrap">
                        <lucide-icon [name]="Search" [size]="16" class="search-icon"></lucide-icon>
                        <input 
                            type="text" 
                            class="filter-search"
                            placeholder="Search titles..."
                            [(ngModel)]="searchQuery"
                        />
                    </div>
                </div>

                <div class="filter-group">
                    <label class="filter-label">Type</label>
                    <div class="segmented">
                        @for (opt of typeOptions; track opt.value) {
                            <button 
                                class="seg-btn"
                                [class.active]="typeFilter() === opt.value"
                                (click)="typeFilter.set(opt.value)"
                            >{{ opt.label }}</button>
                        }
                    </div>
                </div>

                <div class="filter-group">
                    <label class="filter-label">Sort By</label>
                    <div class="select-wrap">
                        <select class="filter-select" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
                            @for (opt of sortOptions; track opt.value) {
                                <option [value]="opt.value">{{ opt.label }}</option>
                            }
                        </select>
                        <lucide-icon [name]="ChevronDown" [size]="14" class="select-icon"></lucide-icon>
                    </div>
                </div>

                @if (hasActiveFilters()) {
                    <button class="clear-btn" (click)="clearFilters()">
                        <lucide-icon [name]="X" [size]="14"></lucide-icon>
                        Clear
                    </button>
                }
            </div>
        }

        <!-- Loading State -->
        @if (isLoading()) {
            <div class="loading-grid">
                @for (i of [1,2,3,4,5,6,7,8]; track i) {
                    <div class="skeleton-card"></div>
                }
            </div>
        } @else if (filteredItems().length === 0) {
            <!-- Empty State -->
            <div class="empty-state" @fade>
                <div class="empty-icon-wrap">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                        <path d="M7 3v18M3 7.5h4M3 12h18M3 16.5h4M17 3v18M7 7.5h10M7 16.5h10"/>
                    </svg>
                </div>
                <h3 class="empty-title">
                    {{ activeTab() === 'all' ? 'Your library is empty' : 'No items in this list' }}
                </h3>
                <p class="empty-subtitle">
                    {{ activeTab() === 'all' 
                        ? 'Start exploring content and add items to track what you want to watch.'
                        : 'Add items or change your filters to see content here.' 
                    }}
                </p>
            </div>
        } @else {
            <!-- Content Grid -->
            <div class="content-grid" @stagger>
                @for (item of filteredItems(); track item.contentId) {
                    <app-watchlist-card
                        [item]="item"
                        [highlighted]="highlightedId() === item.contentId"
                        (onStatusChange)="updateStatus(item.contentId, $event)"
                        (onRemove)="removeItem(item.contentId)"
                        (onRatingChange)="updateRating(item.contentId, $event)"
                    ></app-watchlist-card>
                }
            </div>
        }
      </main>

      <!-- Stats Modal -->
      @if (showStats()) {
          <app-stats-modal (close)="showStats.set(false)"></app-stats-modal>
      }
    </div>
    `,
    styles: [`
    .watchlist-page {
        min-height: 100vh;
        background-color: var(--bg-cinema-black);
    }

    .main-content {
        max-width: 1600px;
        margin: 0 auto;
        padding: 100px var(--space-xl) var(--space-3xl);
    }

    .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-xl);
        flex-wrap: wrap;
        gap: var(--space-md);
    }

    .header-left {
        display: flex;
        align-items: baseline;
        gap: var(--space-md);
    }

    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: white;
        margin: 0;
    }

    .item-count {
        font-size: 0.9rem;
        color: var(--text-muted);
        font-weight: 500;
    }

    .header-actions {
        display: flex;
        gap: var(--space-sm);
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0.6rem 1rem;
        border-radius: 99px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        color: var(--text-secondary);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s var(--ease-cinema);
    }

    .action-btn:hover:not(:disabled) {
        background: rgba(255,255,255,0.1);
        color: white;
        border-color: rgba(255,255,255,0.2);
    }

    .action-btn.active {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
    }

    .action-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .tabs-row {
        margin-bottom: var(--space-xl);
    }

    /* Filter Bar */
    .filter-bar {
        display: flex;
        align-items: center;
        gap: var(--space-xl);
        padding: var(--space-lg) var(--space-xl);
        border-radius: var(--radius-xl);
        margin-bottom: var(--space-xl);
        flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }

    .filter-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
    }

    .search-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
    }

    .search-icon {
        position: absolute;
        left: 12px;
        color: var(--text-muted);
        pointer-events: none;
    }

    .filter-search {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.75rem 0.5rem 36px;
        color: white;
        font-size: 0.9rem;
        width: 200px;
        outline: none;
        transition: border-color 0.2s;
    }

    .filter-search:focus {
        border-color: rgba(255,255,255,0.3);
    }

    .filter-search::placeholder {
        color: var(--text-muted);
    }

    .segmented {
        display: flex;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: var(--radius-md);
        padding: 2px;
    }

    .seg-btn {
        padding: 0.4rem 0.85rem;
        border-radius: calc(var(--radius-md) - 2px);
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
    }

    .seg-btn.active {
        background: rgba(255,255,255,0.12);
        color: white;
    }

    .select-wrap {
        position: relative;
        display: flex;
        align-items: center;
    }

    .filter-select {
        appearance: none;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: var(--radius-md);
        padding: 0.5rem 2rem 0.5rem 0.75rem;
        color: white;
        font-size: 0.85rem;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s;
    }

    .filter-select:focus {
        border-color: rgba(255,255,255,0.3);
    }

    .select-icon {
        position: absolute;
        right: 8px;
        color: var(--text-muted);
        pointer-events: none;
    }

    .clear-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0.4rem 0.75rem;
        border-radius: var(--radius-md);
        border: 1px solid rgba(229,9,20,0.3);
        background: rgba(229,9,20,0.1);
        color: #ff6b6b;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.15s;
        margin-left: auto;
    }

    .clear-btn:hover {
        background: rgba(229,9,20,0.2);
    }

    /* Content Grid */
    .content-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--space-xl) var(--space-lg);
    }

    @media (min-width: 640px) {
        .content-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
    }

    @media (min-width: 1024px) {
        .content-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
    }

    /* Loading Skeleton */
    .loading-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--space-xl) var(--space-lg);
    }

    .skeleton-card {
        aspect-ratio: 2/3;
        border-radius: var(--radius-lg);
        background: var(--bg-cinema-elevated);
        position: relative;
        overflow: hidden;
    }

    .skeleton-card::after {
        content: '';
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        100% { transform: translateX(100%); }
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: var(--space-3xl) var(--space-xl);
        color: var(--text-secondary);
        margin-top: var(--space-2xl);
    }

    .empty-icon-wrap {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--space-xl);
        color: var(--text-muted);
    }

    .empty-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin: 0 0 var(--space-sm);
    }

    .empty-subtitle {
        color: var(--text-muted);
        max-width: 400px;
        margin: 0 auto;
        font-size: 0.95rem;
        line-height: 1.6;
    }

    @media (max-width: 640px) {
        .main-content {
            padding: 90px var(--space-md) var(--space-3xl);
        }

        .page-title {
            font-size: 1.5rem;
        }

        .action-btn span {
            display: none;
        }

        .filter-bar {
            padding: var(--space-md);
            gap: var(--space-md);
        }

        .filter-search {
            width: 160px;
        }
    }
    `]
})
export class WatchlistComponent implements OnInit {
    watchlistService = inject(WatchlistService);

    readonly Shuffle = Shuffle;
    readonly BarChart2 = BarChart2;
    readonly SlidersHorizontal = SlidersHorizontal;
    readonly X = X;
    readonly Search = Search;
    readonly ChevronDown = ChevronDown;

    activeTab = signal<WatchlistTab>('all');
    isLoading = signal(true);
    showStats = signal(false);
    showFilters = signal(false);
    highlightedId = signal<string | null>(null);
    searchQuery = '';
    typeFilter = signal<TypeFilter>('all');
    sortBy = signal<SortOption>('dateAdded');

    readonly typeOptions: { value: TypeFilter; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'movie', label: 'Movies' },
        { value: 'tv', label: 'TV' }
    ];

    readonly sortOptions: { value: SortOption; label: string }[] = [
        { value: 'dateAdded', label: 'Date Added' },
        { value: 'titleAsc', label: 'Title A–Z' },
        { value: 'titleDesc', label: 'Title Z–A' },
        { value: 'rating', label: 'Rating' },
        { value: 'releaseDate', label: 'Release Date' }
    ];

    filteredItems = computed(() => {
        const all = this.watchlistService.watchlist();
        const tab = this.activeTab();
        const type = this.typeFilter();
        const sort = this.sortBy();
        const query = this.searchQuery.toLowerCase().trim();

        let items = tab === 'all' ? all : all.filter(i => i.status === tab);

        if (type !== 'all') {
            items = items.filter(i => i.type === type);
        }

        if (query) {
            items = items.filter(i => i.title.toLowerCase().includes(query));
        }

        const sorted = [...items];
        switch (sort) {
            case 'titleAsc':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'titleDesc':
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
                break;
            case 'releaseDate':
                sorted.sort((a, b) => {
                    const da = new Date(a.addedAt).getTime();
                    const db = new Date(b.addedAt).getTime();
                    return db - da;
                });
                break;
            default:
                sorted.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        }

        return sorted;
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

    hasActiveFilters = computed(() =>
        this.typeFilter() !== 'all' || this.sortBy() !== 'dateAdded' || this.searchQuery.trim() !== ''
    );

    ngOnInit() {
        this.watchlistService.loadWatchlist().subscribe({
            next: () => this.isLoading.set(false),
            error: () => this.isLoading.set(false)
        });
    }

    updateStatus(id: string, newStatus: 'want' | 'watching' | 'watched') {
        this.watchlistService.updateItem(id, { status: newStatus }).subscribe();
    }

    updateRating(id: string, rating: number) {
        this.watchlistService.updateItem(id, { rating }).subscribe();
    }

    removeItem(id: string) {
        if (confirm('Remove this from your library?')) {
            this.watchlistService.removeFromWatchlist(id).subscribe();
        }
    }

    toggleFilters() {
        this.showFilters.set(!this.showFilters());
    }

    pickRandom() {
        const items = this.filteredItems();
        if (items.length === 0) return;
        const random = items[Math.floor(Math.random() * items.length)];
        this.highlightedId.set(random.contentId);
        setTimeout(() => this.highlightedId.set(null), 3000);

        const el = document.getElementById(`wl-card-${random.contentId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    clearFilters() {
        this.searchQuery = '';
        this.typeFilter.set('all');
        this.sortBy.set('dateAdded');
    }
}
