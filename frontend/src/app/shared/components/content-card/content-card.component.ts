import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
    imports: [CommonModule, RouterLink],
    template: `
        <div class="content-card" [routerLink]="['/content', content.type, content.tmdbId]">
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
                        <span>🎬</span>
                    </div>
                }
                <div class="poster-overlay">
                    <div class="rating-badge">
                        <span class="star">★</span>
                        {{ content.rating.toFixed(1) }}
                    </div>
                </div>
            </div>
            <div class="card-info">
                <h3 class="title">{{ content.title }}</h3>
                <div class="meta">
                    <span class="year">{{ getYear() }}</span>
                    <span class="type-badge">{{ content.type === 'movie' ? '🎬' : '📺' }}</span>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .content-card {
            cursor: pointer;
            transition: transform var(--transition-normal);
        }

        .content-card:hover {
            transform: translateY(-8px) scale(1.02);
        }

        .poster-container {
            position: relative;
            aspect-ratio: 2/3;
            border-radius: var(--radius-lg);
            overflow: hidden;
            background: var(--bg-elevated);
        }

        .poster {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .poster-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-elevated));
            font-size: 3rem;
        }

        .poster-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to top,
                rgba(0, 0, 0, 0.8) 0%,
                transparent 50%
            );
            opacity: 0;
            transition: opacity var(--transition-fast);
            display: flex;
            align-items: flex-end;
            padding: var(--space-md);
        }

        .content-card:hover .poster-overlay {
            opacity: 1;
        }

        .rating-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--space-xs);
            background: rgba(0, 0, 0, 0.7);
            padding: var(--space-xs) var(--space-sm);
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
        }

        .star {
            color: var(--accent-warning);
        }

        .card-info {
            padding: var(--space-sm) var(--space-xs);
        }

        .title {
            font-size: 0.875rem;
            font-weight: 600;
            margin: 0 0 var(--space-xs);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .meta {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            color: var(--text-secondary);
            font-size: 0.75rem;
        }

        .type-badge {
            font-size: 0.875rem;
        }
    `]
})
export class ContentCardComponent {
    @Input({ required: true }) content!: ContentItem;

    getYear(): string {
        if (!this.content.releaseDate) return '';
        return new Date(this.content.releaseDate).getFullYear().toString();
    }
}
