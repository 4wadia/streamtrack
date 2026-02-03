import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DiscoverService, ContentItem, Vibe } from '../../core/services/discover.service';
import { AuthService } from '../../core/services/auth.service';
import { VibePillBarComponent } from '../../shared/components/vibe-pill-bar/vibe-pill-bar.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TonightsPickComponent } from '../../shared/components/tonights-pick/tonights-pick.component';

@Component({
    selector: 'app-discover',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        VibePillBarComponent,
        ContentCardComponent,
        TonightsPickComponent
    ],
    template: `
        <div class="discover-container">
            <nav class="navbar glass">
                <a routerLink="/" class="logo">
                    <h2>🎬 StreamTrack</h2>
                </a>
                <div class="nav-actions">
                    <a routerLink="/watchlist" class="nav-link">Watchlist</a>
                    <span class="user-email">{{ authService.user()?.email }}</span>
                </div>
            </nav>

            <main class="main-content">
                <!-- Tonight's Pick Section -->
                <section class="tonights-section">
                    <app-tonights-pick
                        [pick]="tonightsPick()"
                        [reason]="tonightsReason()"
                        [loading]="loadingTonights()"
                    />
                </section>

                <!-- Vibe Selection -->
                <section class="vibe-section">
                    <h2 class="section-title">How are you feeling?</h2>
                    <app-vibe-pill-bar
                        [vibes]="vibes()"
                        (vibeChange)="onVibeChange($event)"
                    />
                </section>

                <!-- Content Grid -->
                <section class="content-section">
                    @if (selectedVibe()) {
                        <div class="section-header">
                            <h2 class="section-title">
                                {{ getSelectedVibeEmoji() }} {{ getSelectedVibeName() }} picks
                            </h2>
                            <div class="type-toggle">
                                <button 
                                    [class.active]="contentType() === 'movie'"
                                    (click)="setContentType('movie')"
                                >Movies</button>
                                <button 
                                    [class.active]="contentType() === 'tv'"
                                    (click)="setContentType('tv')"
                                >TV Shows</button>
                            </div>
                        </div>
                    } @else {
                        <h2 class="section-title">Trending Now</h2>
                    }

                    @if (loading()) {
                        <div class="loading-grid">
                            @for (i of [1,2,3,4,5,6,7,8]; track i) {
                                <div class="skeleton-card">
                                    <div class="skeleton-poster"></div>
                                    <div class="skeleton-title"></div>
                                </div>
                            }
                        </div>
                    } @else if (content().length > 0) {
                        <div class="content-grid">
                            @for (item of content(); track item.id) {
                                <app-content-card [content]="item" />
                            }
                        </div>
                    } @else {
                        <div class="empty-state">
                            <p>No content found. Try selecting different services in your profile.</p>
                        </div>
                    }
                </section>
            </main>
        </div>
    `,
    styles: [`
        .discover-container {
            min-height: 100vh;
        }

        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--space-md) var(--space-xl);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            text-decoration: none;
            color: inherit;
        }

        .logo h2 {
            font-size: 1.25rem;
            font-weight: 700;
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: var(--space-lg);
        }

        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: color var(--transition-fast);
        }

        .nav-link:hover {
            color: var(--text-primary);
        }

        .user-email {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }

        .main-content {
            padding: var(--space-lg) var(--space-xl);
            max-width: 1400px;
            margin: 0 auto;
        }

        .tonights-section {
            margin-bottom: var(--space-2xl);
        }

        .vibe-section {
            margin-bottom: var(--space-2xl);
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: var(--space-lg);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-lg);
        }

        .type-toggle {
            display: flex;
            gap: var(--space-sm);
        }

        .type-toggle button {
            padding: var(--space-sm) var(--space-md);
            border: 1px solid var(--glass-border);
            background: transparent;
            color: var(--text-secondary);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .type-toggle button.active {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
            color: white;
        }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: var(--space-lg);
        }

        .loading-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: var(--space-lg);
        }

        .skeleton-card {
            animation: shimmer 1.5s infinite;
        }

        .skeleton-poster {
            aspect-ratio: 2/3;
            background: var(--bg-elevated);
            border-radius: var(--radius-lg);
            margin-bottom: var(--space-sm);
        }

        .skeleton-title {
            height: 20px;
            background: var(--bg-elevated);
            border-radius: var(--radius-sm);
            width: 80%;
        }

        @keyframes shimmer {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .empty-state {
            text-align: center;
            padding: var(--space-2xl);
            color: var(--text-secondary);
        }
    `]
})
export class DiscoverComponent implements OnInit {
    private discoverService = inject(DiscoverService);
    authService = inject(AuthService);

    vibes = signal<Vibe[]>([]);
    content = signal<ContentItem[]>([]);
    tonightsPick = signal<ContentItem | null>(null);
    tonightsReason = signal<string>('');
    selectedVibe = signal<string | null>(null);
    contentType = signal<'movie' | 'tv'>('movie');
    loading = signal(false);
    loadingTonights = signal(true);

    async ngOnInit() {
        // Load vibes
        const vibes = await this.discoverService.getVibes();
        this.vibes.set(vibes);

        // Load tonight's pick
        this.loadTonightsPick();

        // Load trending by default
        this.loadTrending();
    }

    async loadTonightsPick() {
        this.loadingTonights.set(true);
        const response = await this.discoverService.getTonightsPick();
        if (response?.pick) {
            this.tonightsPick.set(response.pick);
            this.tonightsReason.set(response.reason);
        }
        this.loadingTonights.set(false);
    }

    async loadTrending() {
        this.loading.set(true);
        const results = await this.discoverService.getTrending('all');
        this.content.set(results);
        this.loading.set(false);
    }

    async onVibeChange(vibeId: string) {
        this.selectedVibe.set(vibeId || null);

        if (!vibeId) {
            await this.loadTrending();
            return;
        }

        this.loading.set(true);
        const response = await this.discoverService.discoverByVibe(
            vibeId,
            this.contentType()
        );
        this.content.set(response?.results || []);
        this.loading.set(false);
    }

    async setContentType(type: 'movie' | 'tv') {
        this.contentType.set(type);
        if (this.selectedVibe()) {
            await this.onVibeChange(this.selectedVibe()!);
        }
    }

    getSelectedVibeEmoji(): string {
        const vibe = this.vibes().find(v => v.id === this.selectedVibe());
        return vibe?.emoji || '';
    }

    getSelectedVibeName(): string {
        const vibe = this.vibes().find(v => v.id === this.selectedVibe());
        return vibe?.name || '';
    }
}
