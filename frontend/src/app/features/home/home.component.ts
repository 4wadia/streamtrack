import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="home-container">
            <nav class="navbar glass">
                <div class="logo">
                    <h2>🎬 StreamTrack</h2>
                </div>
                <div class="nav-actions">
                    @if (authService.isAuthenticated()) {
                        <span class="user-email">{{ authService.user()?.email }}</span>
                        <button class="btn-secondary" (click)="logout()">Logout</button>
                    } @else {
                        <a routerLink="/login" class="btn-secondary">Sign In</a>
                        <a routerLink="/register" class="btn-primary">Get Started</a>
                    }
                </div>
            </nav>

            <main class="main-content">
                @if (authService.loading()) {
                    <div class="loading-state">
                        <div class="spinner-large"></div>
                        <p>Loading...</p>
                    </div>
                } @else if (authService.isAuthenticated()) {
                    <div class="welcome-section">
                        <h1 class="text-display">Welcome, {{ authService.user()?.name || 'there' }}!</h1>
                        <p class="text-secondary">Your personalized streaming discovery experience is coming soon.</p>
                        
                        <div class="features-preview">
                            <div class="feature-card glass">
                                <span class="feature-icon">🎯</span>
                                <h3>Vibe Discovery</h3>
                                <p>Find content based on your mood</p>
                            </div>
                            <div class="feature-card glass">
                                <span class="feature-icon">📺</span>
                                <h3>Service Filter</h3>
                                <p>Only see what's on your subscriptions</p>
                            </div>
                            <div class="feature-card glass">
                                <span class="feature-icon">📋</span>
                                <h3>Watchlist</h3>
                                <p>Track what you want to watch</p>
                            </div>
                        </div>
                    </div>
                } @else {
                    <div class="hero-section">
                        <h1 class="text-display">Discover Your Next Favorite</h1>
                        <p class="hero-subtitle">Personalized streaming recommendations based on your vibe. Only shows what's on your services.</p>
                        
                        <div class="vibe-pills">
                            @for (vibe of vibes; track vibe.name) {
                                <span class="vibe-pill" [style.background]="vibe.color">
                                    {{ vibe.emoji }} {{ vibe.name }}
                                </span>
                            }
                        </div>

                        <div class="cta-buttons">
                            <a routerLink="/register" class="btn-primary btn-large">Get Started Free</a>
                            <a routerLink="/login" class="btn-secondary btn-large">Sign In</a>
                        </div>
                    </div>
                }
            </main>
        </div>
    `,
    styles: [`
        .home-container {
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

        .logo h2 {
            font-size: 1.25rem;
            font-weight: 700;
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: var(--space-md);
        }

        .user-email {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }

        .btn-primary, .btn-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-sm) var(--space-lg);
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all var(--transition-fast);
            border: none;
        }

        .btn-primary {
            background: var(--accent-primary);
            color: white;
        }

        .btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: transparent;
            color: var(--text-primary);
            border: 1px solid var(--glass-border);
        }

        .btn-secondary:hover {
            background: var(--bg-elevated);
        }

        .btn-large {
            padding: var(--space-md) var(--space-2xl);
            font-size: 1rem;
        }

        .main-content {
            padding: var(--space-2xl);
            max-width: 1200px;
            margin: 0 auto;
        }

        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: var(--space-lg);
        }

        .spinner-large {
            width: 48px;
            height: 48px;
            border: 3px solid var(--bg-elevated);
            border-top-color: var(--accent-primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .hero-section, .welcome-section {
            text-align: center;
            padding-top: var(--space-2xl);
        }

        .hero-section h1, .welcome-section h1 {
            margin-bottom: var(--space-lg);
        }

        .hero-subtitle {
            color: var(--text-secondary);
            font-size: 1.25rem;
            max-width: 600px;
            margin: 0 auto var(--space-2xl);
        }

        .vibe-pills {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: var(--space-md);
            margin-bottom: var(--space-2xl);
        }

        .vibe-pill {
            padding: var(--space-sm) var(--space-lg);
            border-radius: var(--radius-full);
            font-size: 0.875rem;
            font-weight: 500;
            color: white;
            opacity: 0.9;
        }

        .cta-buttons {
            display: flex;
            justify-content: center;
            gap: var(--space-lg);
        }

        .features-preview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-lg);
            margin-top: var(--space-2xl);
        }

        .feature-card {
            padding: var(--space-xl);
            text-align: center;
            transition: transform var(--transition-normal);
        }

        .feature-card:hover {
            transform: translateY(-4px);
        }

        .feature-icon {
            font-size: 2rem;
            display: block;
            margin-bottom: var(--space-md);
        }

        .feature-card h3 {
            margin-bottom: var(--space-sm);
        }

        .feature-card p {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }

        .text-secondary {
            color: var(--text-secondary);
        }
    `]
})
export class HomeComponent {
    authService = inject(AuthService);

    vibes = [
        { name: 'Cozy', emoji: '🛋️', color: 'var(--vibe-cozy)' },
        { name: 'Intense', emoji: '⚡', color: 'var(--vibe-intense)' },
        { name: 'Mindless', emoji: '🍿', color: 'var(--vibe-mindless)' },
        { name: 'Thoughtful', emoji: '🧠', color: 'var(--vibe-thoughtful)' },
        { name: 'Dark', emoji: '🌙', color: 'var(--vibe-dark)' },
        { name: 'Funny', emoji: '😂', color: 'var(--vibe-funny)' }
    ];

    logout() {
        this.authService.logout();
    }
}
