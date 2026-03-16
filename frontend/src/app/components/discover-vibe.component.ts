import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-discover-vibe',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  template: `
    <section class="mb-[80px] reveal delay-2">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-black tracking-tight mb-2">Discover by Vibe</h2>
          <p class="text-black/60 text-sm">Find something that matches your current mood.</p>
        </div>
        @if (showViewAllButton) {
          <a
            routerLink="/vibes"
            class="text-xs font-mono text-black uppercase tracking-widest hover:underline cursor-pointer no-underline"
            >View All Vibes</a
          >
        }
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (vibe of vibes; track vibe.name) {
          <button
            (click)="selectVibe(vibe.name)"
            class="relative h-40 rounded-2xl overflow-hidden group cursor-pointer p-0 transition-all duration-500 hover:scale-[1.02]"
            [ngClass]="
              state.activeVibe() === vibe.name
                ? 'ring-2 ring-white ring-offset-4 ring-offset-[#050505]'
                : ''
            "
          >
            <img
              [src]="vibe.image"
              [alt]="vibe.name"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-[#fafafa]/20"></div>
            <div class="absolute inset-0 flex flex-col justify-end p-5 text-left">
              <lucide-icon
                [name]="vibe.icon"
                class="w-5 h-5 text-black mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></lucide-icon>
              <h3 class="text-black font-bold text-lg leading-tight">{{ vibe.name }}</h3>
              <p class="text-black/60 text-[10px] font-mono uppercase tracking-wider mt-1">
                {{ vibe.count }} titles
              </p>
            </div>
          </button>
        }
      </div>
    </section>
  `,
})
export class DiscoverVibeComponent {
  @Input() showViewAllButton = true;
  state = inject(StateService);

  vibes = [
    {
      name: 'Noir Night',
      count: 12,
      icon: 'moon',
      image: 'https://picsum.photos/seed/noir/400/400?grayscale',
    },
    {
      name: 'Adrenaline Rush',
      count: 24,
      icon: 'zap',
      image: 'https://picsum.photos/seed/action/400/400',
    },
    {
      name: 'Mind Benders',
      count: 18,
      icon: 'brain',
      image: 'https://picsum.photos/seed/mind/400/400?blur=2',
    },
    {
      name: 'Cozy Corner',
      count: 31,
      icon: 'coffee',
      image: 'https://picsum.photos/seed/cozy/400/400',
    },
    {
      name: 'Heart Strings',
      count: 15,
      icon: 'heart',
      image: 'https://picsum.photos/seed/heart/400/400',
    },
  ];

  selectVibe(vibe: string) {
    this.state.activeVibe.set(this.state.activeVibe() === vibe ? null : vibe);
  }
}
