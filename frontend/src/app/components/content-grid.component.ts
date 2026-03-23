import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentItem } from '../services/content.service';
import { ShowCardComponent } from './show-card.component';

@Component({
  selector: 'app-content-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, ShowCardComponent],
  template: `
    <section class="mt-10 lg:mt-16">
      <div class="mb-4 flex items-end justify-between gap-4 lg:mb-6">
        <h2 class="text-2xl font-bold tracking-tight text-black">{{ title }}</h2>
        @if (showViewAllButton()) {
          <a
            [routerLink]="viewAllLink"
            class="text-[11px] font-mono uppercase tracking-widest text-black/55 transition-colors hover:text-black no-underline"
          >
            View All
          </a>
        }
      </div>

      @if (layout === 'rail') {
        <div class="no-scrollbar flex gap-4 overflow-x-auto pb-2 pr-2 lg:gap-6">
          @for (item of visibleItems(); track item.id) {
            <app-show-card [item]="item" [mode]="'rail'"></app-show-card>
          }
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          @for (item of visibleItems(); track item.id) {
            <app-show-card [item]="item" [mode]="'grid'"></app-show-card>
          }
        </div>
      }
    </section>
  `,
})
export class ContentGridComponent {
  @Input() title: string = '';
  @Input() items: ContentItem[] = [];
  @Input() viewAllLink: string | null = null;
  @Input() maxItems: number | null = 12;
  @Input() layout: 'rail' | 'grid' = 'rail';

  showViewAllButton(): boolean {
    return (
      this.maxItems !== null &&
      this.maxItems > 0 &&
      !!this.viewAllLink &&
      this.items.length > this.maxItems
    );
  }

  visibleItems(): ContentItem[] {
    if (this.maxItems === null || this.maxItems <= 0) {
      return this.items;
    }

    return this.items.slice(0, this.maxItems);
  }
}
