import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface TonightsPickData {
    id: string;
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    rating: number;
}

@Component({
    selector: 'app-tonights-pick',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        @if (pick) {
            <div class="tonights-pick glass" [routerLink]="['/content', pick.type, pick.tmdbId]">
                <div class="backdrop" [style.background-image]="getBackdropUrl()"></div>
                <div class="content">
                    <div class="badge">🌙 Tonight's Pick</div>
                    <h2 class="title">{{ pick.title }}</h2>
                    <p class="reason">{{ reason }}</p>
                    <p class="overview">{{ pick.overview | slice:0:150 }}{{ pick.overview.length > 150 ? '...' : '' }}</p>
                    <div class="actions">
                        <button class="btn-watch">
                            ▶ Watch Now
                        </button>
                        <button class="btn-add" (click)="onAddToWatchlist($event)">
                            + Watchlist
                        </button>
                    </div>
                </div>
            </div>
        } @else if (loading) {
            <div class="tonights-pick glass loading">
                <div class="skeleton-content">
                    <div class="skeleton-badge"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                </div>
            </div>
        }
    `,
    styles: [`
        .tonights-pick {
            position: relative;
            border-radius: var(--radius-xl);
            overflow: hidden;
            padding: var(--space-2xl);
            min-height: 300px;
            display: flex;
            align-items: flex-end;
            cursor: pointer;
            transition: transform var(--transition-normal);
        }

        .tonights-pick:hover {
            transform: scale(1.01);
        }

        .backdrop {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            opacity: 0.4;
        }

        .backdrop::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to top,
                var(--bg-primary) 0%,
                transparent 50%,
                var(--bg-primary) 100%
            );
        }

        .content {
            position: relative;
            z-index: 1;
            max-width: 600px;
        }

        .badge {
            display: inline-block;
            background: var(--accent-primary);
            color: white;
            padding: var(--space-xs) var(--space-md);
            border-radius: var(--radius-full);
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: var(--space-md);
        }

        .title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 var(--space-sm);
        }

        .reason {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: var(--space-md);
        }

        .overview {
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: var(--space-lg);
        }

        .actions {
            display: flex;
            gap: var(--space-md);
        }

        .btn-watch, .btn-add {
            padding: var(--space-sm) var(--space-lg);
            border-radius: var(--radius-md);
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-fast);
            border: none;
        }

        .btn-watch {
            background: var(--accent-primary);
            color: white;
        }

        .btn-watch:hover {
            opacity: 0.9;
        }

        .btn-add {
            background: transparent;
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
        }

        .btn-add:hover {
            background: var(--bg-elevated);
        }

        /* Loading state */
        .loading {
            background: var(--bg-secondary);
        }

        .skeleton-content {
            width: 100%;
        }

        .skeleton-badge, .skeleton-title, .skeleton-text {
            background: var(--bg-elevated);
            border-radius: var(--radius-sm);
            animation: shimmer 1.5s infinite;
        }

        .skeleton-badge {
            width: 120px;
            height: 24px;
            margin-bottom: var(--space-md);
        }

        .skeleton-title {
            width: 300px;
            height: 32px;
            margin-bottom: var(--space-md);
        }

        .skeleton-text {
            width: 100%;
            height: 60px;
        }

        @keyframes shimmer {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `]
})
export class TonightsPickComponent {
    @Input() pick: TonightsPickData | null = null;
    @Input() reason: string = '';
    @Input() loading: boolean = false;

    getBackdropUrl(): string {
        return this.pick?.backdropPath ? `url(${this.pick.backdropPath})` : 'none';
    }

    onAddToWatchlist(event: Event) {
        event.stopPropagation();
        // TODO: Implement add to watchlist
        console.log('Add to watchlist:', this.pick?.tmdbId);
    }
}
