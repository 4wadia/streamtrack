import { Component, Input, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentItem } from '../../../core/services/discover.service';
import { LucideAngularModule, Play, Info } from 'lucide-angular';

@Component({
    selector: 'app-hero-carousel',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    template: `
    <div class="carousel-container">
        @for (item of items; track item.id; let i = $index) {
            <div 
                class="carousel-item"
                [class.active]="currentIndex() === i"
                [style.opacity]="currentIndex() === i ? 1 : 0"
            >
                <div class="backdrop-wrapper">
                    @if (item.backdropPath) {
                        <img [src]="item.backdropPath" [alt]="item.title" class="backdrop-image">
                    } @else {
                        <div class="backdrop-placeholder"></div>
                    }
                    <div class="gradient-overlay"></div>
                </div>

                <div class="hero-content container-cinema">
                    <h1 class="hero-title text-display-huge">{{ item.title }}</h1>
                    <p class="hero-overview">{{ truncate(item.overview) }}</p>
                    
                    <div class="hero-actions">
                        <button class="btn-play">
                            <lucide-icon [name]="Play" class="btn-icon" size="24" fill="black"></lucide-icon>
                            <span>Play</span>
                        </button>
                        <button class="btn-more" [routerLink]="['/content', item.type, item.tmdbId]">
                            <lucide-icon [name]="Info" class="btn-icon" size="24"></lucide-icon>
                            <span>More Info</span>
                        </button>
                    </div>
                </div>
            </div>
        }

        <div class="indicators">
            @for (item of items; track item.id; let i = $index) {
                <button 
                    class="indicator" 
                    [class.active]="currentIndex() === i"
                    (click)="setIndex(i)"
                ></button>
            }
        </div>
    </div>
  `,
    styles: [`
    .carousel-container {
        position: relative;
        width: 100%;
        height: 85vh; /* Netflix style tall hero */
        overflow: hidden;
        background: black;
    }

    .carousel-item {
        position: absolute;
        inset: 0;
        transition: opacity 1s var(--ease-cinema);
        z-index: 1;
    }

    .carousel-item.active {
        z-index: 2;
    }

    .backdrop-wrapper {
        position: absolute;
        inset: 0;
    }

    .backdrop-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .gradient-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to top,
            var(--bg-cinema-black) 0%,
            transparent 60%,
            rgba(0,0,0,0.4) 100%
        );
    }
    
    /* Left gradient for text readability */
    .gradient-overlay::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to right,
            rgba(0,0,0,0.8) 0%,
            transparent 50%
        );
    }

    .hero-content {
        position: absolute;
        bottom: 25%;
        left: 0;
        width: 100%;
        z-index: 10;
        padding-left: 4%; /* Align with container-cinema */
    }

    .hero-title {
        margin-bottom: var(--space-md);
        max-width: 800px;
    }

    .hero-overview {
        max-width: 600px;
        font-size: 1.2rem;
        text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
        margin-bottom: var(--space-xl);
        line-height: 1.5;
        color: #fff;
    }

    .hero-actions {
        display: flex;
        gap: var(--space-md);
    }

    .btn-play, .btn-more {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.8rem 2rem;
        border-radius: 4px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
    }

    .btn-play {
        background: white;
        color: black;
    }

    .btn-play:hover {
        background: rgba(255, 255, 255, 0.75);
    }

    .btn-more {
        background: rgba(109, 109, 110, 0.7);
        color: white;
    }

    .btn-more:hover {
        background: rgba(109, 109, 110, 0.4);
    }

    .indicators {
        position: absolute;
        right: var(--space-xl);
        bottom: 30%;
        display: flex;
        flex-direction: column;
        gap: 0; /* Minimized gap for tighter layout */
        z-index: 20;
    }

    .indicator {
        position: relative;
        width: 30px; /* Wide click target */
        height: 20px; /* Reduced vertical height */
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Visual dot/dash */
    .indicator::after {
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,0.5);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }

    .indicator:hover::after {
        background: rgba(255,255,255,0.8);
        width: 6px;
        height: 6px;
    }

    .indicator.active::after {
        height: 24px;
        width: 4px;
        background: white;
        border-radius: 4px;
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
    @Input() items: ContentItem[] = [];

    currentIndex = signal(0);
    private intervalId: any;

    readonly Play = Play;
    readonly Info = Info;

    ngOnInit() {
        this.startAutoPlay();
    }

    ngOnDestroy() {
        this.stopAutoPlay();
    }

    startAutoPlay() {
        this.intervalId = setInterval(() => {
            this.next();
        }, 8000); // 8s rotation
    }

    stopAutoPlay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    setIndex(index: number) {
        this.stopAutoPlay();
        this.currentIndex.set(index);
        this.startAutoPlay();
    }

    next() {
        if (this.items.length === 0) return;
        this.currentIndex.update(i => (i + 1) % this.items.length);
    }

    truncate(text: string, length: number = 150): string {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
}
