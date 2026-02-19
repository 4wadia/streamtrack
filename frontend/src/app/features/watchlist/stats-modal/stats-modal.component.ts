import { Component, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { LucideAngularModule, X, Film, Tv, Star, BookMarked, Play, CheckCircle } from 'lucide-angular';

@Component({
    selector: 'app-stats-modal',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="modal-backdrop" (click)="close.emit()">
        <div class="modal-panel glass-panel" (click)="$event.stopPropagation()">
            <div class="modal-header">
                <h2 class="modal-title">Library Stats</h2>
                <button class="close-btn" (click)="close.emit()">
                    <lucide-icon [name]="X" [size]="20"></lucide-icon>
                </button>
            </div>

            <div class="stats-grid">
                <!-- Total -->
                <div class="stat-card total">
                    <div class="stat-icon-wrap">
                        <lucide-icon [name]="BookMarked" [size]="22"></lucide-icon>
                    </div>
                    <div class="stat-body">
                        <div class="stat-value">{{ stats().total }}</div>
                        <div class="stat-label">Total Items</div>
                    </div>
                </div>

                <!-- Want to Watch -->
                <div class="stat-card want">
                    <div class="stat-icon-wrap">
                        <lucide-icon [name]="BookMarked" [size]="22"></lucide-icon>
                    </div>
                    <div class="stat-body">
                        <div class="stat-value">{{ stats().want }}</div>
                        <div class="stat-label">Plan to Watch</div>
                    </div>
                </div>

                <!-- Watching -->
                <div class="stat-card watching">
                    <div class="stat-icon-wrap">
                        <lucide-icon [name]="Play" [size]="22"></lucide-icon>
                    </div>
                    <div class="stat-body">
                        <div class="stat-value">{{ stats().watching }}</div>
                        <div class="stat-label">Watching</div>
                    </div>
                </div>

                <!-- Completed -->
                <div class="stat-card watched">
                    <div class="stat-icon-wrap">
                        <lucide-icon [name]="CheckCircle" [size]="22"></lucide-icon>
                    </div>
                    <div class="stat-body">
                        <div class="stat-value">{{ stats().watched }}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
            </div>

            <!-- Type Breakdown -->
            <div class="breakdown-section">
                <h3 class="breakdown-title">Content Type</h3>
                <div class="breakdown-bars">
                    <div class="breakdown-row">
                        <div class="breakdown-label">
                            <lucide-icon [name]="Film" [size]="14"></lucide-icon>
                            <span>Movies</span>
                        </div>
                        <div class="bar-track">
                            <div 
                                class="bar-fill movies"
                                [style.width]="stats().total > 0 ? ((stats().movies / stats().total) * 100) + '%' : '0%'"
                            ></div>
                        </div>
                        <span class="bar-count">{{ stats().movies }}</span>
                    </div>
                    <div class="breakdown-row">
                        <div class="breakdown-label">
                            <lucide-icon [name]="Tv" [size]="14"></lucide-icon>
                            <span>TV Shows</span>
                        </div>
                        <div class="bar-track">
                            <div 
                                class="bar-fill tv"
                                [style.width]="stats().total > 0 ? ((stats().tvShows / stats().total) * 100) + '%' : '0%'"
                            ></div>
                        </div>
                        <span class="bar-count">{{ stats().tvShows }}</span>
                    </div>
                </div>
            </div>

            <!-- Average Rating -->
            @if (stats().avgRating > 0) {
                <div class="rating-section">
                    <div class="rating-display">
                        <lucide-icon [name]="Star" [size]="20" class="star-icon"></lucide-icon>
                        <span class="rating-value">{{ stats().avgRating.toFixed(1) }}</span>
                        <span class="rating-label">Average Rating Given</span>
                    </div>
                </div>
            }
        </div>
    </div>
    `,
    styles: [`
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(8px);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-xl);
        animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .modal-panel {
        width: 100%;
        max-width: 480px;
        border-radius: var(--radius-xl);
        padding: var(--space-2xl);
        animation: slideUp 0.3s var(--ease-cinema);
    }

    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-2xl);
    }

    .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        margin: 0;
    }

    .close-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.1);
        background: transparent;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: rgba(255,255,255,0.1);
        color: white;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-md);
        margin-bottom: var(--space-2xl);
    }

    .stat-card {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
    }

    .stat-card.total .stat-icon-wrap { color: white; }
    .stat-card.want .stat-icon-wrap { color: #818cf8; }
    .stat-card.watching .stat-icon-wrap { color: #60a5fa; }
    .stat-card.watched .stat-icon-wrap { color: #4ade80; }

    .stat-icon-wrap {
        flex-shrink: 0;
    }

    .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: white;
        line-height: 1;
    }

    .stat-label {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 4px;
    }

    /* Breakdown */
    .breakdown-section {
        margin-bottom: var(--space-xl);
    }

    .breakdown-title {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        margin: 0 0 var(--space-lg);
    }

    .breakdown-bars {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .breakdown-row {
        display: flex;
        align-items: center;
        gap: var(--space-md);
    }

    .breakdown-label {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-secondary);
        font-size: 0.9rem;
        width: 90px;
        flex-shrink: 0;
    }

    .bar-track {
        flex: 1;
        height: 6px;
        background: rgba(255,255,255,0.06);
        border-radius: 99px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        border-radius: 99px;
        transition: width 0.5s var(--ease-cinema);
    }

    .bar-fill.movies {
        background: linear-gradient(to right, var(--color-accent), #ff6b6b);
    }

    .bar-fill.tv {
        background: linear-gradient(to right, #3b82f6, #60a5fa);
    }

    .bar-count {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);
        width: 24px;
        text-align: right;
    }

    /* Rating */
    .rating-section {
        padding-top: var(--space-xl);
        border-top: 1px solid rgba(255,255,255,0.06);
    }

    .rating-display {
        display: flex;
        align-items: center;
        gap: var(--space-md);
    }

    .star-icon {
        color: #fbbf24;
        fill: #fbbf24;
    }

    .rating-value {
        font-size: 2rem;
        font-weight: 700;
        color: white;
    }

    .rating-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    `]
})
export class StatsModalComponent {
    @Output() close = new EventEmitter<void>();

    private watchlistService = inject(WatchlistService);

    readonly X = X;
    readonly Film = Film;
    readonly Tv = Tv;
    readonly Star = Star;
    readonly BookMarked = BookMarked;
    readonly Play = Play;
    readonly CheckCircle = CheckCircle;

    stats = computed(() => {
        const list = this.watchlistService.watchlist();
        const rated = list.filter(i => i.rating && i.rating > 0);
        const avgRating = rated.length > 0
            ? rated.reduce((sum, i) => sum + (i.rating ?? 0), 0) / rated.length
            : 0;

        return {
            total: list.length,
            want: list.filter(i => i.status === 'want').length,
            watching: list.filter(i => i.status === 'watching').length,
            watched: list.filter(i => i.status === 'watched').length,
            movies: list.filter(i => i.type === 'movie').length,
            tvShows: list.filter(i => i.type === 'tv').length,
            avgRating
        };
    });
}
