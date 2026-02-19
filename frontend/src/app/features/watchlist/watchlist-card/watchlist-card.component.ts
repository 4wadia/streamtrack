import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistItem } from '../../../core/services/watchlist.service';
import { LucideAngularModule, Star, Trash2, Play, Bookmark, CheckCircle2 } from 'lucide-angular';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-watchlist-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    animations: [
        trigger('highlight', [
            transition(':enter', [
                style({ boxShadow: '0 0 0 0 rgba(229,9,20,0)' }),
                animate('0.3s ease', style({ boxShadow: '0 0 0 3px rgba(229,9,20,0.8)' }))
            ])
        ])
    ],
    template: `
    <div 
        class="watchlist-card group"
        [class.highlighted]="highlighted"
        [attr.id]="'wl-card-' + item.contentId"
    >
        <!-- Poster -->
        <div class="poster-wrap">
            <img 
                [src]="posterUrl" 
                [alt]="item.title"
                class="poster"
                loading="lazy"
            />

            <!-- Status Badge -->
            <div class="status-badge" [class]="'status-' + item.status">
                {{ statusLabel }}
            </div>

            <!-- Hover overlay -->
            <div class="hover-overlay">
                <div class="overlay-actions">
                    @if (item.status !== 'watching') {
                        <button 
                            class="action-chip blue"
                            (click)="statusChange.emit('watching')"
                        >
                        <lucide-icon [name]="Play" [size]="12"></lucide-icon>
                        Watching
                    </button>
                    }
                    @if (item.status !== 'watched') {
                        <button 
                            class="action-chip green"
                            (click)="statusChange.emit('watched')"
                        >
                            <lucide-icon [name]="CheckCircle2" [size]="12"></lucide-icon>
                            Watched
                        </button>
                    }
                    @if (item.status !== 'want') {
                        <button 
                            class="action-chip indigo"
                            (click)="statusChange.emit('want')"
                        >
                            <lucide-icon [name]="Bookmark" [size]="12"></lucide-icon>
                            Plan
                        </button>
                    }
                </div>

                <button 
                    class="remove-btn"
                    (click)="remove.emit()"
                    title="Remove from library"
                >
                    <lucide-icon [name]="Trash2" [size]="16"></lucide-icon>
                </button>
            </div>
        </div>

        <!-- Card Info -->
        <div class="card-info">
            <h3 class="card-title" [title]="item.title">{{ item.title }}</h3>
            <div class="card-meta">
                <span class="type-tag">{{ item.type === 'movie' ? 'Movie' : 'TV' }}</span>
                @if (item.rating && item.rating > 0) {
                    <div class="user-rating">
                        <lucide-icon [name]="Star" [size]="11" class="star-filled"></lucide-icon>
                        <span>{{ item.rating }}</span>
                    </div>
                }
            </div>

            <!-- Star Rating Input -->
            <div class="star-input" (click)="$event.stopPropagation()" (keydown.enter)="$event.stopPropagation()" role="group" aria-label="Rate this item">
                @for (star of stars; track star) {
                    <button 
                        class="star-btn"
                        [class.filled]="(item.rating ?? 0) >= star"
                        (click)="setRating(star)"
                        [title]="star + '/5'"
                    >
                        <lucide-icon [name]="Star" [size]="14"></lucide-icon>
                    </button>
                }
            </div>
        </div>
    </div>
    `,
    styles: [`
    .watchlist-card {
        position: relative;
        cursor: default;
        transition: transform 0.3s var(--ease-cinema);
    }

    .watchlist-card.highlighted .poster-wrap {
        box-shadow: 0 0 0 3px var(--color-accent), 0 20px 40px rgba(229,9,20,0.3);
        animation: pulse-glow 1.5s ease-in-out 2;
    }

    @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 0 3px var(--color-accent), 0 20px 40px rgba(229,9,20,0.3); }
        50% { box-shadow: 0 0 0 6px rgba(229,9,20,0.5), 0 20px 40px rgba(229,9,20,0.5); }
    }

    .poster-wrap {
        position: relative;
        aspect-ratio: 2/3;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: var(--bg-cinema-elevated);
        transition: all 0.3s var(--ease-cinema);
    }

    .group:hover .poster-wrap {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0,0,0,0.5);
    }

    .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s var(--ease-cinema);
    }

    .group:hover .poster {
        transform: scale(1.05);
    }

    .status-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        backdrop-filter: blur(8px);
    }

    .status-want {
        background: rgba(99,102,241,0.25);
        color: #a5b4fc;
        border: 1px solid rgba(99,102,241,0.3);
    }

    .status-watching {
        background: rgba(59,130,246,0.25);
        color: #93c5fd;
        border: 1px solid rgba(59,130,246,0.3);
    }

    .status-watched {
        background: rgba(34,197,94,0.25);
        color: #86efac;
        border: 1px solid rgba(34,197,94,0.3);
    }

    .hover-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
        opacity: 0;
        transition: opacity 0.25s ease;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: var(--space-md);
    }

    .group:hover .hover-overlay {
        opacity: 1;
    }

    .overlay-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: var(--space-sm);
    }

    .action-chip {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid;
        cursor: pointer;
        transition: all 0.15s;
        backdrop-filter: blur(8px);
    }

    .action-chip.blue {
        background: rgba(59,130,246,0.2);
        border-color: rgba(59,130,246,0.35);
        color: #93c5fd;
    }
    .action-chip.blue:hover { background: rgba(59,130,246,0.5); color: white; }

    .action-chip.green {
        background: rgba(34,197,94,0.2);
        border-color: rgba(34,197,94,0.35);
        color: #86efac;
    }
    .action-chip.green:hover { background: rgba(34,197,94,0.5); color: white; }

    .action-chip.indigo {
        background: rgba(99,102,241,0.2);
        border-color: rgba(99,102,241,0.35);
        color: #a5b4fc;
    }
    .action-chip.indigo:hover { background: rgba(99,102,241,0.5); color: white; }

    .remove-btn {
        align-self: flex-end;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid rgba(229,9,20,0.3);
        background: rgba(229,9,20,0.15);
        color: #f87171;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;
    }

    .remove-btn:hover {
        background: rgba(229,9,20,0.4);
        color: white;
    }

    /* Card Info */
    .card-info {
        padding-top: var(--space-sm);
    }

    .card-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: white;
        margin: 0 0 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .card-meta {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: 6px;
    }

    .type-tag {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        font-weight: 600;
    }

    .user-rating {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 0.75rem;
        color: #fbbf24;
        font-weight: 600;
    }

    .star-filled {
        fill: #fbbf24;
        color: #fbbf24;
    }

    /* Star Input */
    .star-input {
        display: flex;
        gap: 2px;
    }

    .star-btn {
        background: none;
        border: none;
        padding: 2px;
        cursor: pointer;
        color: rgba(255,255,255,0.2);
        transition: color 0.15s, transform 0.1s;
        line-height: 0;
    }

    .star-btn.filled {
        color: #fbbf24;
    }

    .star-btn:hover {
        color: #fbbf24;
        transform: scale(1.2);
    }
    `]
})
export class WatchlistCardComponent {
    @Input({ required: true }) item!: WatchlistItem;
    @Input() highlighted = false;
    @Output() statusChange = new EventEmitter<'want' | 'watching' | 'watched'>();
    @Output() remove = new EventEmitter<void>();
    @Output() ratingChange = new EventEmitter<number>();

    readonly stars = [1, 2, 3, 4, 5];
    readonly Star = Star;
    readonly Trash2 = Trash2;
    readonly Play = Play;
    readonly Bookmark = Bookmark;
    readonly CheckCircle2 = CheckCircle2;

    get posterUrl(): string {
        return this.item.posterPath
            ? `https://image.tmdb.org/t/p/w342${this.item.posterPath}`
            : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="342" height="513" viewBox="0 0 342 513"><rect fill="%23181818" width="342" height="513"/><text x="50%25" y="50%25" fill="%23404040" text-anchor="middle" dy=".3em" font-size="48">?</text></svg>';
    }

    get statusLabel(): string {
        switch (this.item.status) {
            case 'want': return 'Plan';
            case 'watching': return 'Watching';
            case 'watched': return 'Watched';
            default: return '';
        }
    }

    setRating(rating: number) {
        const newRating = this.item.rating === rating ? 0 : rating;
        this.ratingChange.emit(newRating);
    }
}
