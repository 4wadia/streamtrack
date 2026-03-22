import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { ContentGridComponent } from './content-grid.component';
import { ContentItem, ContentService } from '../services/content.service';
import { StateService } from '../services/state.service';

type BrowseCategory = 'trending' | 'movies' | 'tv' | 'anime';

interface BrowseConfig {
  title: string;
  type: 'all' | 'movie' | 'tv' | 'anime';
}

const BROWSE_CONFIG: Record<BrowseCategory, BrowseConfig> = {
  trending: { title: 'Trending Now', type: 'all' },
  movies: { title: 'All Movies', type: 'movie' },
  tv: { title: 'All TV Shows', type: 'tv' },
  anime: { title: 'Anime Picks', type: 'anime' },
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
              Search results ({{ filteredItems().length }})
            } @else {
              {{ items().length }} titles loaded from TMDB
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
      } @else if (filteredItems().length === 0) {
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
          [items]="filteredItems()"
          [maxItems]="null"
          [layout]="'grid'"
        ></app-content-grid>
      }
    </section>
  `,
})
export class BrowsePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  private state = inject(StateService);
  private routeSub?: Subscription;
  private requestId = 0;

  title = signal('Browse');
  items = signal<ContentItem[]>([]);
  isLoading = signal(true);
  loadingMessage = signal('Loading titles...');

  hasSearch = computed(() => this.state.searchQuery().trim().length > 0);
  filteredItems = computed(() => {
    const query = this.state.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.items();
    }

    return this.items().filter((item) => {
      const text = `${item.title || item.name || ''} ${item.overview || ''}`.toLowerCase();
      return text.includes(query);
    });
  });

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const category = this.resolveCategory(params.get('category'));
      const config = BROWSE_CONFIG[category];
      this.title.set(config.title);
      void this.loadCategory(category);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private async loadCategory(category: BrowseCategory): Promise<void> {
    const callId = ++this.requestId;
    this.isLoading.set(true);
    this.items.set([]);

    try {
      if (category === 'movies' || category === 'tv') {
        this.loadingMessage.set(`Loading ${category === 'movies' ? 'movies' : 'TV shows'}...`);
        const type = category === 'movies' ? 'movie' : 'tv' as const;

        // Load 3 pages in parallel for fast results (~60 items)
        const [p1, p2, p3] = await Promise.all([
          firstValueFrom(this.contentService.getCatalogPage(type, 1)),
          firstValueFrom(this.contentService.getCatalogPage(type, 2)),
          firstValueFrom(this.contentService.getCatalogPage(type, 3)),
        ]);

        if (callId !== this.requestId) return;
        const allResults = [...p1.results, ...p2.results, ...p3.results];
        this.items.set(this.uniqueById(allResults));
      } else if (category === 'anime') {
        this.loadingMessage.set('Loading anime picks...');
        const response = await firstValueFrom(this.contentService.getAnimePage(1));
        if (callId !== this.requestId) return;
        this.items.set(response.results);
      } else {
        this.loadingMessage.set('Loading trending titles...');
        const response = await firstValueFrom(
          this.contentService.getTrendingPage('all', 'week', 1),
        );
        if (callId !== this.requestId) return;
        this.items.set(response.results);
      }
    } catch (error) {
      if (callId !== this.requestId) return;
      console.error('Error loading browse page content:', error);
      this.items.set([]);
    } finally {
      if (callId === this.requestId) {
        this.isLoading.set(false);
      }
    }
  }


  private uniqueById(items: ContentItem[]): ContentItem[] {
    const seen = new Set<string>();
    const unique: ContentItem[] = [];

    for (const item of items) {
      const key = String(item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }

    return unique;
  }

  private resolveCategory(value: string | null): BrowseCategory {
    if (value === 'movies' || value === 'tv' || value === 'trending' || value === 'anime') {
      return value;
    }

    return 'trending';
  }
}
