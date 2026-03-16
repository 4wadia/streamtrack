import { Component, inject, OnInit, signal } from '@angular/core';
import { HeroComponent } from './components/hero.component';
import { ContentGridComponent } from './components/content-grid.component';
import { ContentService, ContentItem } from './services/content.service';
import { CommonModule } from '@angular/common';

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
export class HomeComponent implements OnInit {
  private contentService = inject(ContentService);

  movies = signal<ContentItem[]>([]);
  shows = signal<ContentItem[]>([]);

  ngOnInit() {
    this.contentService.getTrending('movie', 'week').subscribe((data) => this.movies.set(data));
    this.contentService.getTrending('tv', 'week').subscribe((data) => this.shows.set(data));
  }
}
