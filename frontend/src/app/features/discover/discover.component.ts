import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DiscoverService, ContentItem, Vibe } from '../../core/services/discover.service';
import { AuthService } from '../../core/services/auth.service';
import { VibePillBarComponent } from '../../shared/components/vibe-pill-bar/vibe-pill-bar.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TonightsPickComponent } from '../../shared/components/tonights-pick/tonights-pick.component';
import { fadeAnimation, staggerAnimation } from '../../shared/animations/fade.animation';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
    selector: 'app-discover',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        VibePillBarComponent,
        ContentCardComponent,
        TonightsPickComponent,
        NavbarComponent
    ],
    template: `
        <div class="discover-container" @fade>
            <app-navbar />

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
                        <div class="section-header" @fade>
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
                        <h2 class="section-title" @fade>Trending Now</h2>
                    }

                    @if (loading()) {
                        <div class="content-grid" @stagger>
                            @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
                                <app-content-card [isLoading]="true" />
                            }
                        </div>
                    } @else if (content().length > 0) {
                        <div class="content-grid" @stagger>
                            @for (item of content(); track item.id) {
                                <app-content-card [content]="item" />
                            }
                        </div>
                    } @else {
                        <div class="empty-state" @fade>
                            <p>No content found. Try selecting different services in your profile.</p>
                        </div>
                    }
                </section>
            </main>
        </div>
    `,
    animations: [fadeAnimation, staggerAnimation],
    styles: [`
        .discover-container {
            min-height: 100vh;
        }

        .main-content {
            padding: var(--space-lg) var(--space-xl);
            max-width: 1400px;
            margin: 0 auto;
            padding-bottom: var(--space-2xl);
        }

        .tonights-section {
            margin-bottom: var(--space-2xl);
        }

        .vibe-section {
            margin-bottom: var(--space-2xl);
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: var(--space-lg);
            color: var(--text-primary);
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
            background: var(--bg-secondary);
            padding: var(--space-xs);
            border-radius: var(--radius-lg);
        }

        .type-toggle button {
            padding: var(--space-sm) var(--space-md);
            border: none;
            background: transparent;
            color: var(--text-secondary);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
            font-weight: 500;
        }

        .type-toggle button:hover {
            color: var(--text-primary);
        }

        .type-toggle button.active {
            background: var(--bg-elevated);
            color: white;
            box-shadow: var(--shadow-sm);
        }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: var(--space-xl) var(--space-lg);
        }

        .empty-state {
            text-align: center;
            padding: var(--space-2xl);
            color: var(--text-secondary);
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            border: 1px dashed var(--bg-elevated);
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
