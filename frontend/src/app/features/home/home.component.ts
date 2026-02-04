import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DiscoverService, ContentItem } from '../../core/services/discover.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { HeroCarouselComponent } from '../../shared/components/hero-carousel/hero-carousel.component';
import { fadeAnimation, staggerAnimation } from '../../shared/animations/fade.animation';
import { LucideAngularModule, Coffee, Zap, Gamepad2, Lightbulb, Moon, Smile, ChevronRight } from 'lucide-angular';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, NavbarComponent, HeroCarouselComponent, LucideAngularModule],
    template: `
    <div class="home-container" @fade>
      <app-navbar />

      <main class="main-content">
        @if (authService.loading()) {
            <div class="loading-state">
                <div class="spinner-large"></div>
            </div>
        } @else if (authService.isAuthenticated()) {
            
            <section class="hero-carousel-section" @fade>
                @if (trendingContent().length > 0) {
                    <app-hero-carousel [items]="trendingContent()"></app-hero-carousel>
                } @else {
                    <div class="loading-placeholder"></div>
                }
            </section>

            <section class="vibes-section" @stagger>
                <h2 class="section-title">Browse by Vibe</h2>
                <div class="vibe-pills">
                    @for (vibe of vibes; track vibe.name) {
                        <div class="vibe-pill glass-panel" [style.border-color]="vibe.color">
                            <lucide-icon [name]="vibe.icon" [style.color]="vibe.color" size="18"></lucide-icon>
                            <span>{{ vibe.name }}</span>
                        </div>
                    }
                </div>
            </section>

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

    /* Remove padding for main content so carousel hits edges */
    .main-content {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .hero-carousel-section {
        width: 100%;
        margin-bottom: var(--space-2xl);
    }

    .vibes-section {
        padding: 0 var(--space-xl);
        max-width: 1400px;
        margin: 0 auto;
        width: 100%;
    }

    .section-title {
        font-size: 1.5rem;
        margin-bottom: var(--space-lg);
        color: var(--text-secondary);
        font-weight: 500;
    }

    .loading-placeholder {
        height: 80vh;
        width: 100%;
        background: var(--bg-cinema-elevated);
        animation: pulse 2s infinite;
    }

    /* Keep Guest Hero Specifics */
    .hero-section {
        text-align: center;
        margin: auto;
        padding: var(--space-3xl) var(--space-xl);
        max-width: 1000px;
    }

    .hero-subtitle {
        color: var(--text-secondary);
        font-size: 1.5rem;
        line-height: 1.6;
        max-width: 600px;
        margin: var(--space-xl) auto var(--space-3xl);
        font-weight: 300;
        opacity: 0.8;
    }

    .vibe-pills {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md);
    }

    .vibe-pill {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 24px;
        border-radius: 99px;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.3s var(--ease-cinema);
        cursor: pointer;
    }

    .vibe-pill:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.05);
        border-color: white !important;
    }

    .cta-buttons {
        display: flex;
        justify-content: center;
        gap: var(--space-lg);
        margin-top: var(--space-2xl);
    }

    .btn-primary, .btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 16px 40px;
        border-radius: 4px; /* Netflix style rect buttons */
        font-size: 1.1rem;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s var(--ease-cinema);
    }

    .btn-primary {
        background: var(--accent-netflix-red);
        color: white;
        border: none;
    }

    .btn-primary:hover {
        background: #f40612;
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
        border-top-color: var(--accent-netflix-red);
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
                this.loadTrending();
            }
        });
    }

    // async ngOnInit() removed as it is replaced by effect

    async loadTrending() {
        try {
            const trending = await this.discoverService.getTrending('all');
            // Take top 5 for carousel
            this.trendingContent.set(trending.slice(0, 5));
        } catch (error) {
            console.error('Failed to load trending content', error);
        }
    }

    logout() {
        this.authService.logout();
    }
}
