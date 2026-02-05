import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DiscoverService, ContentItem } from '../../core/services/discover.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { ContentRowComponent } from '../../shared/components/content-row/content-row.component';
import { fadeAnimation, staggerAnimation } from '../../shared/animations/fade.animation';
import { LucideAngularModule, Coffee, Zap, Gamepad2, Lightbulb, Moon, Smile, ChevronRight } from 'lucide-angular';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, NavbarComponent, HeroCarouselComponent, ContentRowComponent, LucideAngularModule],
    template: `
    <div class="home-container" @fade>
      <app-navbar />

      <main class="main-content">
        @if (authService.loading()) {
            <div class="loading-state">
                <div class="spinner-large"></div>
            </div>
        } @else if (authService.isAuthenticated()) {
            
            <!-- Hero Carousel -->
            <section class="hero-carousel-section" @fade>
                @if (trendingContent().length > 0) {
                    <app-hero-carousel [items]="trendingContent()"></app-hero-carousel>
                } @else {
                    <div class="loading-placeholder"></div>
                }
            </section>

            <!-- Content Rows -->
            <div class="content-sections">
                <!-- Best Picks For You -->
                @if (recommendationsContent().length > 0) {
                    <app-content-row
                        title="Best Picks for You"
                        [items]="recommendationsContent()"
                    ></app-content-row>
                }

                <!-- Browse by Vibe -->
                <section class="vibes-section" @stagger>
                    <h2 class="section-title">Browse by Vibe</h2>
                    <div class="vibe-pills">
                        @for (vibe of vibes; track vibe.name) {
                            <div 
                                class="vibe-pill glass-panel" 
                                [style.border-color]="vibe.color"
                                (click)="navigateToVibe(vibe.name.toLowerCase())"
                            >
                                <lucide-icon [name]="vibe.icon" [style.color]="vibe.color" size="18"></lucide-icon>
                                <span>{{ vibe.name }}</span>
                            </div>
                        }
                    </div>
                </section>

                <!-- Best Movies -->
                @if (moviesContent().length > 0) {
                    <app-content-row
                        title="Best Movies"
                        subtitle="from your subscriptions"
                        [items]="moviesContent()"
                    ></app-content-row>
                }

                <!-- Best TV Shows -->
                @if (tvShowsContent().length > 0) {
                    <app-content-row
                        title="Best TV Shows"
                        subtitle="from your subscriptions"
                        [items]="tvShowsContent()"
                    ></app-content-row>
                }
            </div>

        } @else {
            <div class="hero-section" @stagger>
                <h1 class="text-display-huge">Stream<br>Different</h1>
                <p class="hero-subtitle">Stop scrolling. Start watching. Discovery powered by how you actually feel.</p>
                
                <div class="cta-buttons">
                    <a routerLink="/register" class="btn-primary btn-large group">
                        <span>Get Started</span>
                        <lucide-icon [name]="ChevronRight" class="btn-icon group-hover:translate-x-1 transition-transform"></lucide-icon>
                    </a>
                    <a routerLink="/login" class="btn-secondary btn-large">Sign In</a>
                </div>
            </div>
        }
      </main>
    </div>
  `,
    animations: [fadeAnimation, staggerAnimation],
    styles: [`
    .home-container {
        min-height: 100vh;
        background-color: var(--bg-cinema-black);
    }

    .main-content {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .hero-carousel-section {
        width: 100%;
    }

    .content-sections {
        padding-top: var(--space-xl, 24px);
        padding-bottom: var(--space-3xl, 64px);
    }

    .vibes-section {
        padding: 0 var(--space-xl, 24px);
        max-width: 1400px;
        margin: 0 auto var(--space-2xl, 48px);
        width: 100%;
    }

    .section-title {
        font-size: 1.5rem;
        margin-bottom: var(--space-lg, 16px);
        color: var(--text-primary, white);
        font-weight: 600;
    }

    .loading-placeholder {
        height: 80vh;
        width: 100%;
        background: var(--bg-cinema-elevated, #181818);
        animation: pulse 2s infinite;
    }

    .hero-section {
        text-align: center;
        margin: auto;
        padding: var(--space-3xl, 64px) var(--space-xl, 24px);
        max-width: 1000px;
    }

    .hero-subtitle {
        color: var(--text-secondary, #A3A3A3);
        font-size: 1.5rem;
        line-height: 1.6;
        max-width: 600px;
        margin: var(--space-xl, 24px) auto var(--space-3xl, 64px);
        font-weight: 300;
        opacity: 0.8;
    }

    .vibe-pills {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md, 12px);
    }

    .vibe-pill {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 24px;
        border-radius: 99px;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.3s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1));
        cursor: pointer;
        border: 1px solid;
    }

    .vibe-pill:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.05);
        border-color: white !important;
    }

    .cta-buttons {
        display: flex;
        justify-content: center;
        gap: var(--space-lg, 16px);
        margin-top: var(--space-2xl, 48px);
    }

    .btn-primary, .btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 16px 40px;
        border-radius: 4px;
        font-size: 1.1rem;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1));
    }

    .btn-primary {
        background: var(--color-accent, #E50914);
        color: white;
        border: none;
    }

    .btn-primary:hover {
        background: #f40612;
        transform: scale(1.02);
    }

    .btn-secondary {
        background: transparent;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.4);
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: white;
    }

    .loading-state {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .spinner-large {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255,255,255,0.1);
        border-top-color: var(--color-accent, #E50914);
        border-radius: 50%;
        animation: spin 1s infinite linear;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
  `]
})
export class HomeComponent {
    authService = inject(AuthService);
    discoverService = inject(DiscoverService);

    trendingContent = signal<ContentItem[]>([]);
    recommendationsContent = signal<ContentItem[]>([]);
    moviesContent = signal<ContentItem[]>([]);
    tvShowsContent = signal<ContentItem[]>([]);

    readonly ChevronRight = ChevronRight;

    vibes = [
        { name: 'Cozy', icon: Coffee, color: '#eebc1d' },
        { name: 'Intense', icon: Zap, color: '#E50914' },
        { name: 'Mindless', icon: Gamepad2, color: '#46d369' },
        { name: 'Thoughtful', icon: Lightbulb, color: '#10b981' },
        { name: 'Dark', icon: Moon, color: '#8b5cf6' },
        { name: 'Funny', icon: Smile, color: '#f59e0b' }
    ];

    constructor() {
        effect(() => {
            if (this.authService.isAuthenticated()) {
                this.loadAllContent();
            }
        });
    }

    async loadAllContent() {
        // Load all content in parallel
        await Promise.all([
            this.loadTrending(),
            this.loadRecommendations(),
            this.loadMovies(),
            this.loadTvShows()
        ]);
    }

    async loadTrending() {
        try {
            const trending = await this.discoverService.getTrending('all');
            this.trendingContent.set(trending.slice(0, 5));
        } catch (error) {
            console.error('Failed to load trending content', error);
        }
    }

    async loadRecommendations() {
        try {
            const recommendations = await this.discoverService.getRecommendations();
            this.recommendationsContent.set(recommendations.slice(0, 20));
        } catch (error) {
            console.error('Failed to load recommendations', error);
        }
    }

    async loadMovies() {
        try {
            const movies = await this.discoverService.getTrending('movie');
            this.moviesContent.set(movies.slice(0, 20));
        } catch (error) {
            console.error('Failed to load movies', error);
        }
    }

    async loadTvShows() {
        try {
            const tvShows = await this.discoverService.getTrending('tv');
            this.tvShowsContent.set(tvShows.slice(0, 20));
        } catch (error) {
            console.error('Failed to load TV shows', error);
        }
    }

    navigateToVibe(vibe: string) {
        // Navigate to discover page with vibe filter
        window.location.href = `/discover?vibe=${vibe}`;
    }

    logout() {
        this.authService.logout();
    }
}
