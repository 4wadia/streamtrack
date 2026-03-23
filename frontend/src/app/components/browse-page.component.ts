import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, combineLatest, firstValueFrom } from 'rxjs';
import { ContentGridComponent } from './content-grid.component';
import {
  ContentItem,
  ContentService,
  PagedContentResponse,
} from '../services/content.service';
import { StateService } from '../services/state.service';

type BrowseCategory = 'trending' | 'movies' | 'tv' | 'anime';

interface BrowseConfig {
  title: string;
}

const BROWSE_CONFIG: Record<BrowseCategory, BrowseConfig> = {
  trending: { title: 'Trending Now' },
  movies: { title: 'All Movies' },
  tv: { title: 'All TV Shows' },
  anime: { title: 'Anime Picks' },
};

@Component({
  selector: 'app-browse-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ContentGridComponent],
  template: `
    <section class="py-4 lg:py-6">
      <div class="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-black">{{ title() }}</h1>
          <p class="text-[11px] font-mono text-black/50 uppercase tracking-widest mt-2">
            @if (hasSearch()) {
              {{ totalResults() }} search matches
            } @else {
              {{ totalResults() }} titles found
            }
          </p>
        </div>
        <a
          routerLink="/"
          class="text-[11px] font-mono text-black/60 uppercase tracking-widest hover:text-black transition-colors no-underline"
          >Back to Home</a
        >
      </div>

      @if (isLoading()) {
        <div class="py-16 text-center text-black/60 font-mono text-sm uppercase tracking-widest">
          {{ loadingMessage() }}
        </div>
      } @else if (items().length === 0) {
        <div class="py-16 text-center text-black/60 font-mono text-sm uppercase tracking-widest">
          @if (hasSearch()) {
            No results found for your search.
          } @else {
            No titles found.
          }
        </div>
      } @else {
        <app-content-grid
          [title]="title()"
          [items]="items()"
          [maxItems]="null"
          [layout]="'grid'"
        ></app-content-grid>

        @if (hasPagination()) {
          <div
            class="mt-10 flex items-center justify-between rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3"
          >
            <button
              type="button"
              (click)="goToPage(page() - 1)"
              [disabled]="!canGoPrev()"
              class="rounded-full border border-black/10 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-black transition-colors enabled:hover:bg-black enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <p class="text-[11px] font-mono uppercase tracking-widest text-black/70 m-0">
              Page {{ page() }} / {{ totalPages() }}
            </p>

            <button
              type="button"
              (click)="goToPage(page() + 1)"
              [disabled]="!canGoNext()"
              class="rounded-full border border-black/10 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-black transition-colors enabled:hover:bg-black enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        }
      }
    </section>
  `,
})
export class BrowsePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contentService = inject(ContentService);
  private state = inject(StateService);
  private routeSub?: Subscription;
  private requestId = 0;
  private pageCache = new Map<string, PagedContentResponse>();

  title = signal('Browse');
  items = signal<ContentItem[]>([]);
  page = signal(1);
  totalPages = signal(1);
  totalResults = signal(0);
  query = signal('');
  isLoading = signal(true);
  loadingMessage = signal('Loading titles...');

  hasSearch = computed(() => this.query().length > 0);
  canGoPrev = computed(() => this.page() > 1);
  canGoNext = computed(() => this.page() < this.totalPages());
  hasPagination = computed(() => this.totalPages() > 1);

  ngOnInit(): void {
    this.routeSub = combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      ([params, queryParams]) => {
        const category = this.resolveCategory(params.get('category'));
        const config = BROWSE_CONFIG[category];
        const page = this.parsePage(queryParams.get('page'));
        const query = (queryParams.get('q') || '').trim();

        this.title.set(config.title);
        this.page.set(page);
        this.query.set(query);
        this.state.searchQuery.set(query);

        void this.loadPage(category, page, query);
      },
    );
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  async goToPage(targetPage: number): Promise<void> {
    const nextPage = Math.max(1, Math.min(this.totalPages(), targetPage));
    if (nextPage === this.page()) return;

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: nextPage,
        q: this.query() || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private async loadPage(category: BrowseCategory, page: number, query: string): Promise<void> {
    const callId = ++this.requestId;
    this.isLoading.set(true);

    try {
      this.loadingMessage.set(this.getLoadingMessage(category, query));
      const response = await this.fetchPage(category, page, query);
      if (callId !== this.requestId) return;

      this.items.set(response.results);
      this.totalPages.set(Math.max(1, response.totalPages || 1));
      this.totalResults.set(response.totalResults || response.results.length);
      this.page.set(response.page || page);

      const nextPage = (response.page || page) + 1;
      if (nextPage <= this.totalPages()) {
        void this.preloadPage(category, nextPage, query);
      }
    } catch (error) {
      if (callId !== this.requestId) return;
      console.error('Error loading browse page content:', error);
      this.items.set([]);
      this.totalPages.set(1);
      this.totalResults.set(0);
    } finally {
      if (callId === this.requestId) {
        this.isLoading.set(false);
      }
    }
  }

  private async fetchPage(
    category: BrowseCategory,
    page: number,
    query: string,
  ): Promise<PagedContentResponse> {
    const cacheKey = this.buildCacheKey(category, page, query);
    const cached = this.pageCache.get(cacheKey);
    if (cached) return cached;

    const response = await firstValueFrom(this.getPageRequest(category, page, query));
    const normalized: PagedContentResponse = {
      results: response.results,
      page: response.page || page,
      totalPages: response.totalPages || 1,
      totalResults: response.totalResults || response.results.length,
    };

    this.pageCache.set(cacheKey, normalized);
    return normalized;
  }

  private async preloadPage(category: BrowseCategory, page: number, query: string): Promise<void> {
    const cacheKey = this.buildCacheKey(category, page, query);
    if (this.pageCache.has(cacheKey)) return;

    try {
      await this.fetchPage(category, page, query);
    } catch {
      // Ignore preload errors to keep UX stable.
    }
  }

  private getPageRequest(category: BrowseCategory, page: number, query: string) {
    if (query) {
      const type: 'movie' | 'tv' | 'all' =
        category === 'movies' ? 'movie' : category === 'tv' ? 'tv' : 'all';
      return this.contentService.search(query, page, type);
    }

    if (category === 'movies') {
      return this.contentService.getMoviesPage(page);
    }

    if (category === 'tv') {
      return this.contentService.getTvShowsPage(page);
    }

    if (category === 'anime') {
      return this.contentService.getAnimePage(page);
    }

    return this.contentService.getTrendingPage('all', 'week', page);
  }

  private getLoadingMessage(category: BrowseCategory, query: string): string {
    if (query) {
      return `Searching for "${query}"...`;
    }

    if (category === 'movies') return 'Loading movies...';
    if (category === 'tv') return 'Loading TV shows...';
    if (category === 'anime') return 'Loading anime picks...';
    return 'Loading trending titles...';
  }

  private buildCacheKey(category: BrowseCategory, page: number, query: string): string {
    return `${category}|${query.toLowerCase()}|${page}`;
  }

  private parsePage(value: string | null): number {
    const parsed = Number.parseInt(value || '1', 10);
    if (Number.isNaN(parsed)) return 1;
    return Math.max(1, parsed);
  }

  private resolveCategory(value: string | null): BrowseCategory {
    if (value === 'movies' || value === 'tv' || value === 'trending' || value === 'anime') {
      return value;
    }

    return 'trending';
  }
}
