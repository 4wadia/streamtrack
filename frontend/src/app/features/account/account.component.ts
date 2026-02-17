import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService, User } from '../../core/services/auth.service';
import { UserService, StreamingService } from '../../core/services/user.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { fadeAnimation, staggerAnimation } from '../../shared/animations/fade.animation';
import { LucideAngularModule, User as UserIcon, Mail, Calendar, Film, Tv, LogOut, Check, Loader2, ListVideo } from 'lucide-angular';
import { ProviderIconComponent, PROVIDER_DATA } from '../../shared/components/provider-icon/provider-icon.component';

interface ProviderDisplay extends StreamingService {
  color: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LucideAngularModule, RouterLink, ProviderIconComponent],
  template: `
    <div class="account-page" @fade>
      <app-navbar />
      
      <main class="main-content">
        <!-- Profile Section -->
        <section class="profile-section" @fade>
          <div class="profile-card glass">
            <div class="profile-avatar">
              <lucide-icon [name]="UserIcon" size="40"></lucide-icon>
            </div>
            
            <div class="profile-info">
              <h1 class="profile-name">{{ user()?.name || 'StreamTrack User' }}</h1>
              
              <div class="profile-meta">
                <div class="meta-item">
                  <lucide-icon [name]="Mail" size="16"></lucide-icon>
                  <span>{{ user()?.email || 'Not available' }}</span>
                </div>
                <div class="meta-item" *ngIf="memberSince">
                  <lucide-icon [name]="Calendar" size="16"></lucide-icon>
                  <span>Member since {{ memberSince }}</span>
                </div>
              </div>
            </div>
            
            <button class="btn-logout" (click)="logout()">
              <lucide-icon [name]="LogOut" size="18"></lucide-icon>
              <span>Sign Out</span>
            </button>
          </div>
          
          <!-- Watchlist Stats Preview -->
          <div class="stats-preview" @stagger>
            <div class="stat-card glass" [routerLink]="['/watchlist']">
              <lucide-icon [name]="ListVideo" size="24" class="stat-icon"></lucide-icon>
              <div class="stat-value">{{ watchlistCount() }}</div>
              <div class="stat-label">In Watchlist</div>
            </div>
            <div class="stat-card glass">
              <lucide-icon [name]="Film" size="24" class="stat-icon"></lucide-icon>
              <div class="stat-value">{{ movieCount() }}</div>
              <div class="stat-label">Movies</div>
            </div>
            <div class="stat-card glass">
              <lucide-icon [name]="Tv" size="24" class="stat-icon"></lucide-icon>
              <div class="stat-value">{{ tvCount() }}</div>
              <div class="stat-label">TV Shows</div>
            </div>
          </div>
        </section>

        <!-- Provider Management Section -->
        <section class="providers-section" @fade>
          <div class="section-header">
            <h2 class="section-title">Your Streaming Services</h2>
            <p class="section-subtitle">Select the platforms you have access to</p>
          </div>

          <div class="provider-grid" @stagger>
            @for (provider of providers(); track provider.id) {
              <button 
                class="provider-card"
                [class.selected]="selectedProviders().includes(provider.id)"
                [style.--provider-color]="provider.color"
                (click)="toggleProvider(provider.id)"
              >
                <div class="provider-icon">
                    <app-provider-icon [providerId]="provider.id" [size]="32" />
                </div>
                <span class="provider-name">{{ provider.name }}</span>
                @if (selectedProviders().includes(provider.id)) {
                  <div class="check-badge">
                    <lucide-icon [name]="Check" size="12"></lucide-icon>
                  </div>
                }
              </button>
            }
          </div>

          <div class="actions-bar">
            <button 
              class="btn-save" 
              (click)="saveProviders()"
              [disabled]="saving() || !hasChanges()"
              [class.success]="saveSuccess()"
            >
              @if (saving()) {
                <lucide-icon [name]="Loader2" class="spin" size="18"></lucide-icon>
                <span>Saving...</span>
              } @else if (saveSuccess()) {
                <lucide-icon [name]="Check" size="18"></lucide-icon>
                <span>Saved!</span>
              } @else {
                <span>Save Changes</span>
              }
            </button>
          </div>
        </section>
      </main>
    </div>
  `,
  animations: [fadeAnimation, staggerAnimation],
  styles: [`
    .account-page {
      min-height: 100vh;
      background-color: var(--bg-cinema-black);
    }

    .main-content {
      padding: var(--space-3xl) var(--space-xl);
      max-width: 900px;
      margin: 0 auto;
      padding-top: 120px;
    }

    /* Profile Section */
    .profile-section {
      margin-bottom: var(--space-3xl);
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
      padding: var(--space-2xl);
      border-radius: var(--radius-xl);
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: var(--space-xl);
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent) 0%, #ff6b6b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .profile-info {
      flex: 1;
    }

    .profile-name {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: var(--space-sm);
      background: linear-gradient(to right, #ffffff, #a0a0a0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .profile-meta {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 99px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-secondary);
      font-family: var(--font-display);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: rgba(255, 59, 48, 0.15);
      border-color: rgba(255, 59, 48, 0.3);
      color: #ff3b30;
    }

    /* Stats Preview */
    .stats-preview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-lg);
    }

    .stat-card {
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      cursor: pointer;
      transition: all 0.2s var(--ease-cinema);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .stat-icon {
      color: var(--text-muted);
      margin-bottom: var(--space-md);
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin-bottom: var(--space-xs);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Providers Section */
    .providers-section {
      margin-top: var(--space-3xl);
    }

    .section-header {
      margin-bottom: var(--space-xl);
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
      margin-bottom: var(--space-xs);
    }

    .section-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* Provider Grid */
    .provider-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }

    .provider-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.25s var(--ease-cinema);
    }

    .provider-card:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .provider-card.selected {
      border-color: var(--provider-color, var(--color-accent));
      background: linear-gradient(
        135deg,
        rgba(var(--provider-color-rgb, 229, 9, 20), 0.15) 0%,
        rgba(var(--provider-color-rgb, 229, 9, 20), 0.05) 100%
      );
      box-shadow: 0 0 30px rgba(var(--provider-color-rgb, 229, 9, 20), 0.2);
    }

    .provider-card.selected .provider-name {
      color: var(--provider-color, var(--color-accent));
    }

    .provider-icon {
      font-size: 2.25rem;
      margin-bottom: var(--space-md);
    }

    .provider-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-align: center;
      transition: color 0.2s;
    }

    .check-badge {
      position: absolute;
      top: var(--space-sm);
      right: var(--space-sm);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--provider-color, var(--color-accent));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    /* Actions */
    .actions-bar {
      display: flex;
      justify-content: center;
    }

    .btn-save {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.85rem 2rem;
      border-radius: 99px;
      background: var(--color-accent);
      border: none;
      color: white;
      font-family: var(--font-display);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 150px;
      justify-content: center;
    }

    .btn-save:hover:not(:disabled) {
      transform: scale(1.02);
      background: var(--color-accent-hover, #B20710);
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-save.success {
      background: #22c55e;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .profile-card {
        flex-direction: column;
        text-align: center;
      }

      .profile-meta {
        align-items: center;
      }

      .btn-logout {
        margin-top: var(--space-md);
      }

      .stats-preview {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccountComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private watchlistService = inject(WatchlistService);

  // Icons
  readonly UserIcon = UserIcon;
  readonly Mail = Mail;
  readonly Calendar = Calendar;
  readonly Film = Film;
  readonly Tv = Tv;
  readonly LogOut = LogOut;
  readonly Check = Check;
  readonly Loader2 = Loader2;
  readonly ListVideo = ListVideo;

  // State
  user = this.authService.user;
  memberSince = '';
  providers = signal<ProviderDisplay[]>([]);
  selectedProviders = signal<string[]>([]);
  originalProviders = signal<string[]>([]);
  saving = signal(false);
  saveSuccess = signal(false);

  // Provider brand colors
  private providerColors: Record<string, string> = {
    'netflix': '#E50914',
    'prime': '#00A8E1',
    'jiohotstar': '#1F80E0',
    'apple': '#A2AAAD',
    'hbo': '#5822B4',
    'hulu': '#1CE783',
    'paramount': '#0064FF',
    'sonyliv': '#0A8C6A'
  };

  // Computed signals for watchlist stats
  watchlistCount = computed(() => this.watchlistService.watchlist().length);
  movieCount = computed(() =>
    this.watchlistService.watchlist().filter(i => i.type === 'movie').length
  );
  tvCount = computed(() =>
    this.watchlistService.watchlist().filter(i => i.type === 'tv').length
  );
  hasChanges = computed(() => {
    const current = [...this.selectedProviders()].sort().join(',');
    const original = [...this.originalProviders()].sort().join(',');
    return current !== original;
  });

  async ngOnInit() {
    // Load watchlist for stats
    this.watchlistService.loadWatchlist().subscribe();

    // Load providers
    const availableServices = await this.userService.getAvailableServices();
    const providersWithColors: ProviderDisplay[] = availableServices.map(s => ({
      ...s,
      color: this.providerColors[s.id] || '#888888'
    }));
    this.providers.set(providersWithColors);

    // Load user's selected providers
    const userServices = await this.userService.getUserServices();
    this.selectedProviders.set(userServices);
    this.originalProviders.set(userServices);
  }

  toggleProvider(providerId: string) {
    const current = this.selectedProviders();
    const updated = current.includes(providerId)
      ? current.filter(id => id !== providerId)
      : [...current, providerId];
    this.selectedProviders.set(updated);

    // Reset success state on change
    if (this.saveSuccess()) {
      this.saveSuccess.set(false);
    }
  }

  async saveProviders() {
    if (!this.hasChanges() || this.saving()) return;

    this.saving.set(true);
    const success = await this.userService.updateUserServices(this.selectedProviders());
    this.saving.set(false);

    if (success) {
      this.originalProviders.set([...this.selectedProviders()]);
      this.saveSuccess.set(true);

      // Reset success indicator after 2 seconds
      setTimeout(() => this.saveSuccess.set(false), 2000);
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
