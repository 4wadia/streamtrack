import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  effect,
  AfterViewInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StateService } from '../services/state.service';
import { WatchlistService } from '../services/watchlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <header class="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
      <div
        class="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-4 lg:px-16"
      >
        <div class="flex items-center gap-4 lg:gap-8">
          <a
            routerLink="/home"
            class="flex items-center gap-2 text-lg font-bold tracking-tight text-black no-underline"
          >
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-black">
              <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
            </span>
            StreamTrack
          </a>

          @if (!isAuthPage()) {
            <nav
              class="relative hidden min-w-[220px] grid-cols-2 rounded-full border border-black/10 bg-black/[0.03] p-1 md:grid"
            >
            <span
              class="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-black transition-transform duration-300 ease-out"
              [ngClass]="activeNavPath() === '/watchlist' ? 'translate-x-full' : 'translate-x-0'"
            ></span>

            <a
              routerLink="/home"
              (click)="setActiveNav('/home')"
              class="relative z-10 rounded-full px-4 py-2 text-center text-[12px] leading-none transition-colors no-underline"
              [ngClass]="
                activeNavPath() === '/home'
                  ? 'font-semibold text-white'
                  : 'font-medium text-black/70 hover:text-black'
              "
            >
              Home
            </a>

            <a
              routerLink="/watchlist"
              (click)="setActiveNav('/watchlist')"
              class="relative z-10 rounded-full px-4 py-2 text-center text-[12px] leading-none transition-colors no-underline"
              [ngClass]="
                activeNavPath() === '/watchlist'
                  ? 'font-semibold text-white'
                  : 'font-medium text-black/70 hover:text-black'
              "
            >
              Watchlist
            </a>
          </nav>
          }
        </div>

        <div class="flex items-center gap-2 lg:gap-3">
          @if (!isAuthPage()) {
            <div
              #searchShell
            class="relative h-9 overflow-hidden rounded-full border border-black/10 bg-black/[0.03] transition-[width,padding] duration-300 ease-out"
            [ngClass]="isSearchExpanded() ? 'w-56 pl-3 pr-2 lg:w-64' : 'w-9 px-0'"
          >
            <button
              type="button"
              (click)="toggleSearch($event)"
              class="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border-none bg-transparent text-black/70 transition-colors hover:text-black"
            >
              <lucide-icon name="search" class="h-4 w-4"></lucide-icon>
            </button>

            <input
              #searchInput
              type="text"
              [ngModel]="state.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search titles"
              class="h-full w-full border-none bg-transparent pl-8 pr-2 text-[12px] text-black outline-none transition-opacity duration-200"
              [ngClass]="
                isSearchExpanded()
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              "
            />
          </div>

          <div
            class="hidden items-center gap-1 rounded-full border border-black/10 bg-black/[0.03] p-1 xl:flex relative"
          >
            <!-- Sliding Background -->
            <div
              class="absolute top-1 bottom-1 rounded-full bg-black transition-all duration-300 ease-out z-0"
              [style.left.px]="pillIndicatorLeft()"
              [style.width.px]="pillIndicatorWidth()"
            ></div>

            @for (pill of pills; track pill) {
              <button
                #pillButton
                type="button"
                (click)="setActivePill(pill)"
                class="relative z-10 rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors"
                [ngClass]="
                  state.activePill() === pill
                    ? 'text-white'
                    : 'text-black/65 hover:text-black'
                "
              >
                {{ pill }}
              </button>
            }
          </div>

          <button
            type="button"
            (click)="isAddModalOpen.set(true)"
            class="hidden h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-black transition-colors hover:bg-black hover:text-white md:flex"
          >
            <lucide-icon name="plus" class="h-4 w-4"></lucide-icon>
          </button>
          }

          @if (auth.isAuthenticated() && !isAuthPage()) {
            <a
              routerLink="/profile"
              class="hidden h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-black transition-colors hover:bg-black hover:text-white no-underline md:flex"
            >
              <lucide-icon name="user" class="h-4 w-4"></lucide-icon>
            </a>
            <button
              type="button"
              (click)="logout()"
              class="hidden rounded-full border border-black/10 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-black/70 transition-colors hover:bg-black hover:text-white md:block"
            >
              Logout
            </button>
          } @else if (!auth.isAuthenticated()) {
            @if (!isLoginPage()) {
              <a
                routerLink="/login"
                class="hidden rounded-full border border-black/10 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-black/70 transition-colors hover:bg-black hover:text-white no-underline md:block"
              >
                Login
              </a>
            }
            @if (!isSignupPage()) {
              <a
                routerLink="/signup"
                class="hidden rounded-full border border-black bg-black px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-white transition-opacity hover:opacity-90 no-underline md:block"
              >
                Sign Up
              </a>
            }
          }

          @if (!isAuthPage()) {
            <button
              type="button"
              (click)="toggleMobileMenu()"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-black md:hidden"
          >
            <lucide-icon [name]="mobileMenuOpen() ? 'x' : 'list'" class="h-4 w-4"></lucide-icon>
          </button>
          }
        </div>
      </div>

      @if (mobileMenuOpen() && !isAuthPage()) {
        <div class="border-t border-black/10 bg-white md:hidden">
          <div class="space-y-4 px-6 py-4">
            <nav class="flex flex-col gap-1">
              <a
                routerLink="/home"
                (click)="closeMobileMenu()"
                class="rounded-xl px-3 py-2 text-sm text-black/75 no-underline"
              >
                Home
              </a>
              <a
                routerLink="/watchlist"
                (click)="closeMobileMenu()"
                class="rounded-xl px-3 py-2 text-sm text-black/75 no-underline"
              >
                Watchlist
              </a>
            </nav>

            <label
              class="flex items-center gap-2 rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2"
            >
              <lucide-icon name="search" class="h-4 w-4 text-black/50"></lucide-icon>
              <input
                type="text"
                [ngModel]="state.searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Search titles"
                class="w-full border-none bg-transparent text-sm text-black outline-none"
              />
            </label>

            <div class="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              @for (pill of pills; track pill) {
                <button
                  type="button"
                  (click)="setActivePill(pill)"
                  class="whitespace-nowrap rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider"
                  [ngClass]="
                    state.activePill() === pill
                      ? 'border-black bg-black text-white'
                      : 'text-black/70'
                  "
                >
                  {{ pill }}
                </button>
              }
            </div>

            @if (auth.isAuthenticated()) {
              <div class="flex items-center gap-2">
                <a
                  routerLink="/profile"
                  (click)="closeMobileMenu()"
                  class="rounded-full border border-black/10 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-black/75 no-underline"
                >
                  Profile
                </a>
                <button
                  type="button"
                  (click)="logout()"
                  class="rounded-full border border-black bg-black px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-white"
                >
                  Logout
                </button>
              </div>
            } @else {
              <div class="flex items-center gap-2">
                <a
                  routerLink="/login"
                  (click)="closeMobileMenu()"
                  class="rounded-full border border-black/10 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-black/75 no-underline"
                >
                  Login
                </a>
                <a
                  routerLink="/signup"
                  (click)="closeMobileMenu()"
                  class="rounded-full border border-black bg-black px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-white no-underline"
                >
                  Sign Up
                </a>
              </div>
            }
          </div>
        </div>
      }
    </header>

    @if (isAddModalOpen()) {
      <div
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
        (click)="closeAddModal()"
      >
        <div
          class="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-black">Add New Title</h2>
              <p class="mt-1 text-[11px] font-mono uppercase tracking-widest text-black/55">
                Add to your watchlist
              </p>
            </div>
            <button
              type="button"
              (click)="closeAddModal()"
              class="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-black transition-colors hover:bg-black hover:text-white"
            >
              <lucide-icon name="x" class="h-4 w-4"></lucide-icon>
            </button>
          </div>

          <form class="space-y-4" (submit)="addTitle($event)">
            <div>
              <label
                class="mb-2 block text-[10px] font-mono uppercase tracking-widest text-black/45"
                >Title</label
              >
              <input
                type="text"
                [(ngModel)]="newItem.title"
                name="title"
                required
                class="w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 focus:bg-white"
                placeholder="e.g. Inception"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="mb-2 block text-[10px] font-mono uppercase tracking-widest text-black/45"
                  >Type</label
                >
                <select
                  [(ngModel)]="newItem.type"
                  name="type"
                  class="w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 focus:bg-white"
                >
                  <option value="movie">Movie</option>
                  <option value="tv">TV Show</option>
                </select>
              </div>

              <div>
                <label
                  class="mb-2 block text-[10px] font-mono uppercase tracking-widest text-black/45"
                  >Year</label
                >
                <input
                  type="text"
                  [(ngModel)]="newItem.year"
                  name="year"
                  class="w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 focus:bg-white"
                  placeholder="2026"
                />
              </div>
            </div>

            <div>
              <label
                class="mb-2 block text-[10px] font-mono uppercase tracking-widest text-black/45"
                >Genre</label
              >
              <input
                type="text"
                [(ngModel)]="newItem.genre"
                name="genre"
                class="w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 focus:bg-white"
                placeholder="Sci-Fi"
              />
            </div>

            <div>
              <label
                class="mb-2 block text-[10px] font-mono uppercase tracking-widest text-black/45"
                >Poster URL</label
              >
              <input
                type="text"
                [(ngModel)]="newItem.posterPath"
                name="posterPath"
                class="w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 focus:bg-white"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              [disabled]="isSubmittingAdd()"
              class="w-full rounded-xl bg-black py-3 text-[11px] font-mono uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {{ isSubmittingAdd() ? 'Adding...' : 'Add to Watchlist' }}
            </button>
          </form>
        </div>
      </div>
    }
  `,
})
export class HeaderComponent implements OnDestroy, AfterViewInit {
  state = inject(StateService);
  auth = inject(AuthService);
  private router = inject(Router);
  private watchlistService = inject(WatchlistService);

  @ViewChild('searchShell') searchShell?: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  @ViewChildren('pillButton') pillButtons!: QueryList<ElementRef>;

  currentUrl = signal<string>('/');
  isAuthPage = computed(() => this.currentUrl() === '/login' || this.currentUrl() === '/signup');
  isLoginPage = computed(() => this.currentUrl() === '/login');
  isSignupPage = computed(() => this.currentUrl() === '/signup');

  activeNavPath = signal<'/home' | '/watchlist'>('/home');
  isSearchExpanded = signal(false);
  mobileMenuOpen = signal(false);
  isAddModalOpen = signal(false);
  isSubmittingAdd = signal(false);
  pills = ['All', 'Netflix', 'Prime Video', 'JioHotstar', 'ZEE5', 'SonyLIV'];

  pillIndicatorLeft = signal(0);
  pillIndicatorWidth = signal(0);

  newItem = {
    title: '',
    type: 'movie' as const,
    year: '',
    genre: '',
    posterPath: '',
    status: 'want' as const,
    contentId: '',
  };

  private routerSub: Subscription;

  constructor() {
    this.setActiveNavByUrl(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.setActiveNavByUrl(event.urlAfterRedirects));

    effect(() => {
      const active = this.state.activePill();
      setTimeout(() => this.updatePillIndicator());
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updatePillIndicator(), 100);
  }

  updatePillIndicator(): void {
    if (!this.pillButtons) return;
    const index = this.pills.indexOf(this.state.activePill());
    if (index === -1) return;
    const button = this.pillButtons.toArray()[index];
    if (button) {
      const el = button.nativeElement;
      this.pillIndicatorLeft.set(el.offsetLeft);
      this.pillIndicatorWidth.set(el.offsetWidth);
    }
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (!this.isSearchExpanded()) {
      return;
    }

    const shell = this.searchShell?.nativeElement;
    const target = event.target;

    if (shell && target instanceof Node && !shell.contains(target)) {
      this.closeSearch();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeSearch();
    if (this.mobileMenuOpen()) {
      this.mobileMenuOpen.set(false);
    }
    if (this.isAddModalOpen()) {
      this.closeAddModal();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updatePillIndicator();
  }

  setActiveNav(path: '/home' | '/watchlist'): void {
    this.activeNavPath.set(path);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  setActivePill(pill: string): void {
    this.state.activePill.set(pill);
  }

  toggleSearch(event?: Event): void {
    event?.stopPropagation();

    if (this.isSearchExpanded()) {
      this.closeSearch();
      return;
    }

    this.isSearchExpanded.set(true);
    setTimeout(() => this.searchInput?.nativeElement.focus(), 220);
  }

  closeSearch(): void {
    this.isSearchExpanded.set(false);
  }

  onSearchChange(value: string): void {
    this.state.searchQuery.set(value);

    if (this.currentUrl().startsWith('/browse/')) {
      const query = value.trim();
      void this.router.navigate([this.currentUrl()], {
        queryParams: {
          q: query || null,
          page: 1,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
    this.isSubmittingAdd.set(false);
  }

  addTitle(event: Event): void {
    event.preventDefault();
    if (!this.newItem.title.trim() || this.isSubmittingAdd()) {
      return;
    }

    this.isSubmittingAdd.set(true);
    this.newItem.contentId = `custom-${Date.now()}`;

    this.watchlistService.addWatchlistItem(this.newItem).subscribe({
      next: () => {
        this.closeAddModal();
        this.resetAddForm();
      },
      error: (error) => {
        this.isSubmittingAdd.set(false);
        console.error('Error adding item:', error);
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.mobileMenuOpen.set(false);
    this.closeSearch();
    void this.router.navigateByUrl('/login');
  }

  private resetAddForm(): void {
    this.newItem = {
      title: '',
      type: 'movie',
      year: '',
      genre: '',
      posterPath: '',
      status: 'want',
      contentId: '',
    };
  }

  private setActiveNavByUrl(url: string): void {
    const urlWithoutQuery = url.split('?')[0];
    this.currentUrl.set(urlWithoutQuery);

    if (url.startsWith('/watchlist')) {
      this.activeNavPath.set('/watchlist');
      return;
    }

    this.activeNavPath.set('/home');
  }
}
