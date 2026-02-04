import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { DiscoverService, ContentItem } from '../../core/services/discover.service';
import { fadeAnimation, staggerAnimation } from '../../shared/animations/fade.animation';
import { LucideAngularModule, Frown } from 'lucide-angular';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, ContentCardComponent, NavbarComponent, LucideAngularModule],
    template: `
    <div class="search-page" @fade>
      <app-navbar />
      
      <main class="main-content">
        <!-- Removed Header as requested -->
        
        @if (loading()) {
            <div class="content-grid" @stagger>
                @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
                    <app-content-card [isLoading]="true" />
                }
            </div>
        } @else if (results().length > 0) {
            <div class="content-grid" @stagger>
                @for (item of results(); track item.id) {
                    <app-content-card [content]="item" />
                }
            </div>
        } @else {
            <div class="empty-state" @fade>
                <lucide-icon [name]="Frown" class="empty-icon" size="64"></lucide-icon>
                <h2>No results found</h2>
                <p>We couldn't find anything matching "{{ query() }}".</p>
            </div>
        }
      </main>
    </div>
  `,
    animations: [fadeAnimation, staggerAnimation],
    styles: [`
    .search-page {
        min-height: 100vh;
        background-color: var(--bg-cinema-black);
    }

    .main-content {
        padding: var(--space-3xl) var(--space-xl);
        max-width: 1600px;
        margin: 0 auto;
        padding-top: 120px; /* Space for fixed navbar */
    }

    .content-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--space-md); /* Tighter grid like Netflix */
        row-gap: var(--space-xl);
    }

    .empty-state {
        text-align: center;
        padding: var(--space-3xl);
        color: var(--text-secondary);
        margin-top: var(--space-xl);
    }

    .empty-icon {
        color: var(--text-secondary);
        margin-bottom: var(--space-lg);
        opacity: 0.5;
    }
  `]
})
export class SearchComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private discoverService = inject(DiscoverService);

    readonly Frown = Frown;

    query = signal('');
    results = signal<ContentItem[]>([]);
    loading = signal(false);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const q = params['q'];
            if (q) {
                this.query.set(q);
                this.performSearch(q);
            }
        });
    }

    async performSearch(query: string) {
        this.loading.set(true);
        try {
            const results = await this.discoverService.search(query);
            this.results.set(results);
        } catch (err) {
            console.error('Search failed', err);
            this.results.set([]);
        } finally {
            this.loading.set(false);
        }
    }
}
