import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DiscoverVibeComponent } from './discover-vibe.component';

@Component({
  selector: 'app-vibes-page',
  standalone: true,
  imports: [RouterLink, DiscoverVibeComponent],
  template: `
    <section class="py-2">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-black">All Vibes</h1>
        <a
          routerLink="/"
          class="text-[11px] font-mono text-black/60 uppercase tracking-widest hover:text-black transition-colors no-underline"
          >Back to Home</a
        >
      </div>

      <app-discover-vibe [showViewAllButton]="false"></app-discover-vibe>
    </section>
  `,
})
export class VibesPageComponent {}
