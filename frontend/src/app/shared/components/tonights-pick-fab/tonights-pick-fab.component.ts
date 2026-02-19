import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiscoverService, ContentItem } from '../../../core/services/discover.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { LucideAngularModule, Moon, X, Play, Plus, RefreshCw, Star } from 'lucide-angular';

@Component({
    selector: 'app-tonights-pick-fab',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <!-- Floating Action Button -->
        <button 
            class="fab" 
            [class.pulse]="!loading() && pick()"
            (click)="openModal()"
            title="Tonight's Pick"
        >
            <lucide-icon [name]="Moon" [size]="24"></lucide-icon>
        </button>

        <!-- Modal Overlay -->
        @if (isOpen()) {
            <div class="modal-overlay" (click)="closeModal()" (keydown.escape)="closeModal()" tabindex="0" role="button" aria-label="Close modal">
                <div class="modal-content" (click)="$event.stopPropagation()" (keydown)="0" tabindex="-1" role="dialog" aria-modal="true">
                    <!-- Close Button -->
                    <button class="close-btn" (click)="closeModal()">
                        <lucide-icon [name]="X" [size]="20"></lucide-icon>
                    </button>

                    @if (loading()) {
                        <div class="loading-state">
                            <div class="spinner"></div>
                            <p>Finding your perfect pick...</p>
                        </div>
                    } @else if (pick()) {
                        <!-- Backdrop -->
                        <div 
                            class="backdrop" 
                            [style.background-image]="'url(' + pick()!.backdropPath + ')'"
                        ></div>

                        <!-- Content -->
                        <div class="content">
                            <div class="badge"><lucide-icon [name]="Moon" [size]="14"></lucide-icon> Tonight's Pick</div>
                            <h2 class="title">{{ pick()!.title }}</h2>
                            <p class="reason">{{ reason() }}</p>
                            <p class="overview">{{ pick()!.overview | slice:0:200 }}{{ pick()!.overview.length > 200 ? '...' : '' }}</p>
                            
                            <div class="meta">
                                <span class="rating"><lucide-icon [name]="Star" [size]="14"></lucide-icon> {{ pick()!.rating.toFixed(1) }}</span>
                                <span class="type">{{ pick()!.type === 'movie' ? 'Movie' : 'TV Show' }}</span>
                            </div>

                            <div class="actions">
                                <button class="btn-primary" (click)="watchNow()">
                                    <lucide-icon [name]="Play" [size]="18"></lucide-icon>
                                    Watch Now
                                </button>
                                <button class="btn-secondary" (click)="addToWatchlist()">
                                    <lucide-icon [name]="Plus" [size]="18"></lucide-icon>
                                    Add to Watchlist
                                </button>
                                <button class="btn-ghost" (click)="tryAnother()">
                                    <lucide-icon [name]="RefreshCw" [size]="16"></lucide-icon>
                                    Try Another
                                </button>
                            </div>
                        </div>
                    } @else {
                        <div class="empty-state">
                            <p>No recommendation available right now.</p>
                            <button class="btn-secondary" (click)="loadPick()">
                                <lucide-icon [name]="RefreshCw" [size]="16"></lucide-icon>
                                Retry
                            </button>
                        </div>
                    }
                </div>
            </div>
        }
    `,
    styles: [`
        /* Floating Action Button */
        .fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: var(--color-accent, #E50914);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 4px 20px rgba(229, 9, 20, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1);
            transition: all 0.3s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1));
            z-index: 900;
        }

        .fab:hover {
            transform: scale(1.1);
            box-shadow: 
                0 6px 30px rgba(229, 9, 20, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .fab.pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(229, 9, 20, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1); }
            50% { box-shadow: 0 4px 30px rgba(229, 9, 20, 0.6), 0 0 0 4px rgba(229, 9, 20, 0.2); }
        }

        /* Modal Overlay */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
            padding: 24px;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Modal Content */
        .modal-content {
            position: relative;
            width: 100%;
            max-width: 600px;
            background: var(--bg-card, #181818);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.4s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1));
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            transition: background 0.2s;
        }

        .close-btn:hover {
            background: rgba(0, 0, 0, 0.7);
        }

        /* Backdrop */
        .backdrop {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center top;
            opacity: 0.3;
        }

        .backdrop::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to bottom,
                transparent 0%,
                var(--bg-card, #181818) 70%
            );
        }

        /* Content */
        .content {
            position: relative;
            z-index: 1;
            padding: 200px 32px 32px;
        }

        .badge {
            display: inline-block;
            background: var(--color-accent, #E50914);
            color: white;
            padding: 6px 16px;
            border-radius: 99px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 8px;
            color: white;
        }

        .reason {
            color: var(--text-secondary, #A3A3A3);
            font-size: 0.9rem;
            margin-bottom: 16px;
            font-style: italic;
        }

        .overview {
            color: var(--text-secondary, #A3A3A3);
            line-height: 1.6;
            margin-bottom: 16px;
        }

        .meta {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            color: var(--text-secondary, #A3A3A3);
            font-size: 0.9rem;
        }

        .rating {
            color: #fbbf24;
        }

        /* Actions */
        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }

        .btn-primary, .btn-secondary, .btn-ghost {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            font-size: 0.95rem;
        }

        .btn-primary {
            background: white;
            color: black;
        }

        .btn-primary:hover {
            background: #e5e5e5;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .btn-ghost {
            background: transparent;
            color: var(--text-secondary, #A3A3A3);
            padding: 12px 16px;
        }

        .btn-ghost:hover {
            color: white;
        }

        /* Loading & Empty States */
        .loading-state, .empty-state {
            padding: 100px 32px;
            text-align: center;
            color: var(--text-secondary, #A3A3A3);
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: var(--color-accent, #E50914);
            border-radius: 50%;
            animation: spin 1s infinite linear;
            margin: 0 auto 16px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 640px) {
            .modal-content {
                max-width: 100%;
                border-radius: 16px;
            }

            .content {
                padding: 160px 24px 24px;
            }

            .title {
                font-size: 1.5rem;
            }

            .actions {
                flex-direction: column;
            }
        }
    `]
})
export class TonightsPickFabComponent implements OnInit {
    private router = inject(Router);
    private discoverService = inject(DiscoverService);
    private watchlistService = inject(WatchlistService);

    readonly Moon = Moon;
    readonly X = X;
    readonly Play = Play;
    readonly Plus = Plus;
    readonly RefreshCw = RefreshCw;
    readonly Star = Star;

    isOpen = signal(false);
    loading = signal(true);
    pick = signal<ContentItem | null>(null);
    reason = signal('');

    ngOnInit() {
        this.loadPick();
    }

    async loadPick() {
        this.loading.set(true);
        try {
            const response = await this.discoverService.getTonightsPick();
            if (response) {
                this.pick.set(response.pick);
                this.reason.set(response.reason);
            }
        } catch (error) {
            console.error('Failed to load tonight\'s pick:', error);
        } finally {
            this.loading.set(false);
        }
    }

    openModal() {
        this.isOpen.set(true);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.isOpen.set(false);
        document.body.style.overflow = '';
    }

    watchNow() {
        if (this.pick()) {
            this.closeModal();
            this.router.navigate(['/content', this.pick()!.type, this.pick()!.tmdbId]);
        }
    }

    addToWatchlist() {
        const currentPick = this.pick();
        if (!currentPick) return;

        this.watchlistService.addToWatchlist({
            contentId: currentPick.id,
            title: currentPick.title,
            type: currentPick.type,
            posterPath: currentPick.posterPath || undefined,
            status: 'want'
        }).subscribe({
            next: () => {
                // Simple feedback, could use a toast
                alert('Added to watchlist!');
            },
            error: (err) => console.error('Failed to add to watchlist', err)
        });
    }

    async tryAnother() {
        await this.loadPick();
    }
}
