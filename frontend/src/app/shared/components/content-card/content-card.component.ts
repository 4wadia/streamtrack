import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { LucideAngularModule, Star, Plus, Check, MonitorPlay, Film, Tv } from 'lucide-angular';

export interface ContentItem {
    id: string;
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string;
    rating: number;
    voteCount: number;
    genreIds: number[];
    genres?: string[];
    runtime?: number;
    watchProviders?: string[];
}

@Component({
    selector: 'app-content-card',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    template: `
        @if (isLoading) {
            <div class="content-card skeleton-card">
                <div class="poster-container skeleton"></div>
                <div class="card-info">
                    <div class="skeleton title-skeleton"></div>
                    <div class="skeleton meta-skeleton"></div>
                </div>
            </div>
        } @else if (content) {
            <div class="content-card group" [routerLink]="['/content', content.type, content.tmdbId]">
                <div class="poster-container">
                    @if (content.posterPath) {
                        <img 
                            [src]="content.posterPath" 
                            [alt]="content.title"
                            class="poster"
                            loading="lazy"
                        />
                    } @else {
                        <div class="poster-placeholder">
                            <lucide-icon [name]="MonitorPlay" class="placeholder-icon" size="48"></lucide-icon>
                        </div>
                    }
                    
                    <div class="poster-overlay">
                        <div class="rating-badge glass-panel">
                            <lucide-icon [name]="Star" class="star-icon" size="12"></lucide-icon>
                            <span>{{ content.rating.toFixed(1) }}</span>
                        </div>
                        
                        <button 
                            class="add-btn glass-panel" 
                            [class.added]="isAdded()"
                            (click)="onAddToWatchlist($event)"
                            [title]="isAdded() ? 'Added to Watchlist' : 'Add to Watchlist'"
                        >
                            <lucide-icon [name]="isAdded() ? Check : Plus" size="18"></lucide-icon>
                        </button>
                    </div>
                </div>

                <div class="card-info">
                    <h3 class="title" [title]="content.title">{{ content.title }}</h3>
                    <div class="meta">
                        <span class="year">{{ getYear() }}</span>
                        <div class="type-badge">
                            <lucide-icon [name]="content.type === 'movie' ? Film : Tv" size="12"></lucide-icon>
                            <span>{{ content.type === 'movie' ? 'Movie' : 'TV' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        }
    `,
    styles: [`
        .content-card {
            cursor: pointer;
            position: relative;
            transform-style: preserve-3d;
            perspective: 1000px;
        }

        .poster-container {
            position: relative;
            aspect-ratio: 2/3;
            border-radius: var(--radius-lg);
            overflow: hidden;
            background: var(--bg-elevated);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
            transition: all 0.4s var(--ease-cinema);
        }

        /* Cinematic Glow Effect */
        .group:hover .poster-container {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 
                0 20px 40px -10px rgba(0, 0, 0, 0.7),
                0 0 20px rgba(189, 0, 255, 0.15); /* Electric purple glow */
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .poster {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s var(--ease-cinema);
        }

        .group:hover .poster {
            transform: scale(1.08);
        }

        .poster-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-elevated));
            color: var(--text-secondary);
        }

        .poster-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to top,
                rgba(5, 5, 5, 0.95) 0%,
                rgba(5, 5, 5, 0.5) 40%,
                transparent 100%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            padding: var(--space-md);
        }

        .group:hover .poster-overlay {
            opacity: 1;
        }

        .rating-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #fbbf24; /* Amber-400 */
        }

        .star-icon {
            fill: currentColor;
        }

        .add-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            color: white;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .add-btn:hover {
            background: white;
            color: black;
            transform: scale(1.1);
        }

        .add-btn.added {
            background: var(--accent-neon-blue);
            color: black;
            border-color: var(--accent-neon-blue);
        }

        .card-info {
            padding-top: var(--space-md);
            transition: opacity 0.3s;
        }

        .group:hover .card-info {
            opacity: 0.8;
        }

        .title {
            font-family: var(--font-body);
            font-size: 1rem;
            font-weight: 700;
            margin: 0 0 4px;
            color: white;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .meta {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            color: var(--text-secondary);
            font-size: 0.8rem;
            font-weight: 500;
        }

        .type-badge {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* Skeleton Styles */
        .skeleton-card {
            pointer-events: none;
        }

        .skeleton {
            background: #1a1a1a;
            position: relative;
            overflow: hidden;
        }

        .skeleton::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0,
                rgba(255, 255, 255, 0.05) 20%,
                rgba(255, 255, 255, 0.1) 60%,
                rgba(255, 255, 255, 0)
            );
            animation: shimmer 2s infinite;
        }

        .title-skeleton {
            height: 1rem;
            width: 80%;
            margin-bottom: 0.5rem;
            border-radius: 4px;
        }

        .meta-skeleton {
            height: 0.8rem;
            width: 40%;
            border-radius: 4px;
        }

        @keyframes shimmer {
            100% {
                transform: translateX(100%);
            }
        }
    `]
})
export class ContentCardComponent {
    @Input() content: ContentItem | undefined;
    @Input() isLoading = false;

    private watchlistService = inject(WatchlistService);
    isAdded = signal(false);

    readonly Star = Star;
    readonly Plus = Plus;
    readonly Check = Check;
    readonly MonitorPlay = MonitorPlay;
    readonly Film = Film;
    readonly Tv = Tv;

    getYear(): string {
        const content = this.content;
        if (!content?.releaseDate) return '';
        return new Date(content.releaseDate).getFullYear().toString();
    }

    onAddToWatchlist(event: Event) {
        event.stopPropagation();
        if (this.isAdded() || !this.content) return;

        const content = this.content;
        this.isAdded.set(true);
        this.watchlistService.addToWatchlist({
            contentId: content.id,
            title: content.title,
            type: content.type,
            posterPath: content.posterPath || undefined,
            status: 'want'
        }).subscribe({
            next: () => { },
            error: (err) => {
                console.error('Failed to add to watchlist', err);
                this.isAdded.set(false);
            }
        });
    }
}
