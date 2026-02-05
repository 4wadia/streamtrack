import { Component, inject, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Search, LogOut, User, Clapperboard, MonitorPlay } from 'lucide-angular';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, LucideAngularModule],
    template: `
    <nav class="navbar-island glass-panel">
        <a routerLink="/" class="logo">
            <lucide-icon [name]="MonitorPlay" class="logo-icon"></lucide-icon>
            <span class="logo-text">StreamTrack</span>
        </a>

        <div class="search-container">
            <lucide-icon [name]="Search" class="search-icon"></lucide-icon>
            <input 
                #searchInput
                [formControl]="searchControl"
                (keydown.enter)="onSearchSubmit()"
                type="text" 
                placeholder="Find movies, TV & vibes..." 
                class="search-input"
            />
        </div>

        <div class="nav-actions">
            @if (authService.isAuthenticated()) {
                <a routerLink="/watchlist" class="nav-link" title="Watchlist">
                    <lucide-icon [name]="Clapperboard" size="20"></lucide-icon>
                    <span>Watchlist</span>
                </a>
                
                <div class="user-profile">
                    <lucide-icon [name]="User" size="20"></lucide-icon>
                    <span class="user-email">{{ getShortEmail(authService.user()?.email) }}</span>
                </div>

                <button class="btn-icon" (click)="logout()" title="Logout">
                    <lucide-icon [name]="LogOut" size="20"></lucide-icon>
                </button>
            } @else {
                <a routerLink="/login" class="nav-link">Sign In</a>
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
        pointer-events: none; /* Allow clicking through outside the navbar */
    }

    .navbar-island {
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 90%;
        max-width: 1200px;
        padding: 0.75rem 1.5rem;
        border-radius: 999px; /* Pill shape */
        background: rgba(10, 10, 10, 0.65); /* Darker glass */
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
        color: var(--accent-neon-blue);
        filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4));
    }

    .logo-text {
        font-family: var(--font-display);
        font-weight: 700;
        letter-spacing: 0.05em;
        font-size: 1.1rem;
        text-transform: uppercase;
    }

    .search-container {
        position: relative;
        flex: 1;
        max-width: 350px;
        margin: 0 2rem;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.4);
        width: 18px;
        height: 18px;
        pointer-events: none;
    }

    .search-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 99px;
        padding: 0.6rem 1rem 0.6rem 2.8rem;
        color: white;
        font-family: var(--font-body);
        font-size: 0.9rem;
        transition: all 0.2s ease-out;
    }

    .search-input:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 0 4px rgba(0, 240, 255, 0.05);
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: color 0.2s;
    }

    .nav-link:hover {
        color: white;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.4);
        font-size: 0.85rem;
        padding-left: 1rem;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-icon {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-icon:hover {
        color: var(--accent-hot-pink);
        background: rgba(255, 0, 85, 0.1);
    }

    @media (max-width: 768px) {
        .navbar-island {
            width: 95%;
            padding: 0.75rem 1rem;
        }

        .logo-text { display: none; }
        .user-profile { display: none; }
        .search-container { margin: 0 1rem; }
    }
  `]
})
export class NavbarComponent {
    authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    readonly Search = Search;
    readonly LogOut = LogOut;
    readonly User = User;
    readonly Clapperboard = Clapperboard;
    readonly MonitorPlay = MonitorPlay;

    searchControl = new FormControl('');

    constructor() {
        // Sync URL query param to search input
        this.route.queryParams.pipe(
            takeUntilDestroyed()
        ).subscribe(params => {
            const q = params['q'];
            // Only update if different to avoid cursor jumping
            // AND check if input is NOT focused to avoid overwriting user while typing
            // This prevents the "disappearing text" issue when debounce/navigation lags behind typing
            const isFocused = this.searchInput?.nativeElement === document.activeElement;

            if (q && q !== this.searchControl.value && !isFocused) {
                this.searchControl.setValue(q, { emitEvent: false });
            }
        });

        // Debounced search for typing
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntilDestroyed()
        ).subscribe(query => {
            if (query && query.length > 2) {
                this.router.navigate(['/search'], { queryParams: { q: query } });
            }
        });
    }

    // Handle Enter key to force search even with short queries
    onSearchSubmit() {
        const query = this.searchControl.value;
        if (query) {
            this.router.navigate(['/search'], { queryParams: { q: query } });
            this.searchInput.nativeElement.blur(); // Remove focus to allow query params to sync back if needed
        }
    }

    @HostListener('window:keydown.control.k', ['$event'])
    @HostListener('window:keydown.meta.k', ['$event'])
    focusSearch(event: Event) {
        event.preventDefault();
        this.searchInput.nativeElement.focus();
    }

    getShortEmail(email: string | undefined): string {
        if (!email) return '';
        return email.split('@')[0];
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
