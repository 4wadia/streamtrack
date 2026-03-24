import { Component, effect, inject, signal } from '@angular/core';
import { HeroComponent } from './components/hero.component';
import { ContentGridComponent } from './components/content-grid.component';
import { ContentService, ContentItem } from './services/content.service';
import { CommonModule } from '@angular/common';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, ContentGridComponent, CommonModule],
  template: `
    <div class="w-full pb-16">
      <app-hero></app-hero>

      <div>
        <app-content-grid
          title="Movies"
          [items]="movies()"
          viewAllLink="/browse/movies"
          [layout]="'rail'"
        ></app-content-grid>

        <app-content-grid
          title="Series"
          [items]="shows()"
          viewAllLink="/browse/tv"
          [layout]="'rail'"
        ></app-content-grid>
      </div>
    </div>
  `,
})
export class HomeComponent {
  private contentService = inject(ContentService);
  private state = inject(StateService);
  private requestId = 0;

  movies = signal<ContentItem[]>([]);
  shows = signal<ContentItem[]>([]);

  constructor() {
    effect(() => {
      const providerId = this.state.selectedProviderId();
      const watchRegion = this.state.selectedWatchRegion();
      this.loadHomeRows(providerId, watchRegion);
    });
  }

  private loadHomeRows(providerId: number | null, watchRegion: string): void {
    const currentRequest = ++this.requestId;

    // Reset current lists when provider changes before fetching page 1.
    this.movies.set([]);
    this.shows.set([]);

    this.contentService.getMoviesPage(1, providerId, watchRegion).subscribe({
      next: (response) => {
        if (currentRequest !== this.requestId) return;
        this.movies.set(response.results);
      },
      error: (error) => {
        if (currentRequest !== this.requestId) return;
        console.error('Error loading movie row:', error);
      },
    });

    this.contentService.getTvShowsPage(1, providerId, watchRegion).subscribe({
      next: (response) => {
        if (currentRequest !== this.requestId) return;
        this.shows.set(response.results);
      },
      error: (error) => {
        if (currentRequest !== this.requestId) return;
        console.error('Error loading tv row:', error);
      },
    });
  }
}
