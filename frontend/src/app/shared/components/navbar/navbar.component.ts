import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Search, LogOut, User, Bookmark, MonitorPlay } from 'lucide-angular';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    template: `
    <nav class="navbar-island glass-panel">
        <a routerLink="/" class="logo">
            <lucide-icon [name]="MonitorPlay" class="logo-icon"></lucide-icon>
            <span class="logo-text">StreamTrack</span>
        </a>

        <div class="nav-actions">
            <a routerLink="/search" class="icon-btn" title="Search (Ctrl+K)">
                <lucide-icon [name]="Search" [size]="20"></lucide-icon>
            </a>

            @if (authService.isAuthenticated()) {
                <a routerLink="/watchlist" class="icon-btn" title="Watchlist">
                    <lucide-icon [name]="Bookmark" [size]="20"></lucide-icon>
                </a>
                
                <a routerLink="/account" class="icon-btn" title="Account">
                    <lucide-icon [name]="User" [size]="20"></lucide-icon>
                </a>

                <button class="icon-btn logout-btn" (click)="logout()" title="Logout">
                    <lucide-icon [name]="LogOut" [size]="20"></lucide-icon>
                </button>
            } @else {
                <a routerLink="/login" class="sign-in-link">Sign In</a>
            }
        </div>
    </nav>
  `,
    styles: [`
    :host {
        display: flex;
        justify-content: center;
        width: 100%;
        position: fixed;
        top: var(--space-lg);
        z-index: 1000;
        pointer-events: none;
    }

    .navbar-island {
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 90%;
        max-width: 1200px;
        padding: 0.75rem 1.5rem;
        border-radius: 999px;
        background: rgba(10, 10, 10, 0.65);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 
            0 10px 40px -10px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(0, 0, 0, 0.4);
        transition: transform 0.3s var(--ease-cinema);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: white;
    }

    .logo-icon {
        color: var(--accent-neon-blue, #00f0ff);
        filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4));
    }

    .logo-text {
        font-family: var(--font-display);
        font-weight: 700;
        letter-spacing: 0.05em;
        font-size: 1.1rem;
        text-transform: uppercase;
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: transparent;
        border: none;
        border-radius: 50%;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s var(--ease-cinema);
    }

    .icon-btn:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
    }

    .logout-btn:hover {
        color: var(--color-accent, #E50914);
        background: rgba(229, 9, 20, 0.1);
    }

    .sign-in-link {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 999px;
        background: var(--color-accent, #E50914);
        transition: all 0.2s var(--ease-cinema);
    }

    .sign-in-link:hover {
        background: var(--color-accent-hover, #B20710);
        transform: scale(1.02);
    }

    @media (max-width: 768px) {
        .navbar-island {
            width: 95%;
            padding: 0.75rem 1rem;
        }

        .logo-text { display: none; }
        
        .nav-actions {
            gap: 0.25rem;
        }

        .icon-btn {
            width: 36px;
            height: 36px;
        }
    }
  `]
})
export class NavbarComponent {
    authService = inject(AuthService);
    private router = inject(Router);

    readonly Search = Search;
    readonly LogOut = LogOut;
    readonly User = User;
    readonly Bookmark = Bookmark;
    readonly MonitorPlay = MonitorPlay;

    logout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
