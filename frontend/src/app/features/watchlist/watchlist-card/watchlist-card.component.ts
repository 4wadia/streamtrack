import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistItem } from '../../../core/services/watchlist.service';

@Component({
    selector: 'app-watchlist-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="group relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-900 transition-all hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-black/50">
      <!-- Poster Image -->
      <img 
        [src]="posterUrl" 
        [alt]="item.title"
        class="h-full w-full object-cover transition-opacity group-hover:opacity-40"
        loading="lazy"
      >
      
      <!-- Gradient Overlay (Default) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-0"></div>

      <!-- Title & Info (Always visible at bottom, moves up on hover) -->
      <div class="absolute bottom-0 left-0 right-0 p-4 transition-transform group-hover:-translate-y-2">
        <h3 class="text-lg font-bold text-white line-clamp-1 group-hover:line-clamp-none">{{ item.title }}</h3>
        <div class="flex items-center gap-2 text-xs text-gray-300">
          <span class="uppercase tracking-wider">{{ item.type }}</span>
          <span *ngIf="item.rating" class="flex items-center gap-1 text-yellow-400">
            ★ {{ item.rating }}
          </span>
        </div>
      </div>

      <!-- Hover Actions Overlay -->
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100 p-4">
        
        <!-- Status Actions -->
        <div class="flex flex-col gap-2 w-full">
            <button 
                *ngIf="item.status !== 'watching'"
                (click)="onStatusChange.emit('watching')"
                class="w-full rounded-lg bg-blue-600/20 px-3 py-2 text-sm font-medium text-blue-400 backdrop-blur-sm hover:bg-blue-600 hover:text-white transition-colors border border-blue-500/30"
            >
                Move to Watching
            </button>
            
            <button 
                *ngIf="item.status !== 'watched'"
                (click)="onStatusChange.emit('watched')"
                class="w-full rounded-lg bg-green-600/20 px-3 py-2 text-sm font-medium text-green-400 backdrop-blur-sm hover:bg-green-600 hover:text-white transition-colors border border-green-500/30"
            >
                Mark Watched
            </button>
            
            <button 
                *ngIf="item.status !== 'want'"
                (click)="onStatusChange.emit('want')"
                class="w-full rounded-lg bg-indigo-600/20 px-3 py-2 text-sm font-medium text-indigo-400 backdrop-blur-sm hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-500/30"
            >
                Move to Want
            </button>
        </div>

        <div class="mt-auto w-full flex justify-between items-center">
            <button 
            (click)="onRemove.emit()"
            class="rounded-full p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            title="Remove from Watchlist"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
            
            <div class="text-[10px] text-gray-500 font-mono">
                {{ item.addedAt | date:'shortDate' }}
            </div>
        </div>
      </div>
      
      <!-- Status Badge (Top Right) -->
      <div class="absolute top-2 right-2">
        <span 
            class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border"
            [ngClass]="statusClasses"
        >
            {{ item.status }}
        </span>
      </div>
    </div>
  `
})
export class WatchlistCardComponent {
    @Input({ required: true }) item!: WatchlistItem;
    @Output() onStatusChange = new EventEmitter<'want' | 'watching' | 'watched'>();
    @Output() onRemove = new EventEmitter<void>();

    get posterUrl(): string {
        return this.item.posterPath
            ? `https://image.tmdb.org/t/p/w500${this.item.posterPath}`
            : 'assets/no-poster.png'; // Fallback
    }

    get statusClasses(): string {
        switch (this.item.status) {
            case 'want': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            case 'watching': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'watched': return 'bg-green-500/20 text-green-300 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    }
}
