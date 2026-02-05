import { Component, Input, ViewChild, ElementRef, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentCardComponent, ContentItem } from '../content-card/content-card.component';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

/**
 * Content Row Component
 * Horizontal scrolling card row with section title and arrow navigation
 */
@Component({
    selector: 'app-content-row',
    standalone: true,
    imports: [CommonModule, ContentCardComponent, LucideAngularModule],
    template: `
        <section class="content-row" (mouseenter)="showArrows.set(true)" (mouseleave)="showArrows.set(false)">
            <div class="row-header">
                <div class="title-group">
                    <h2 class="section-title">{{ title }}</h2>
                    @if (subtitle) {
                        <span class="section-subtitle">{{ subtitle }}</span>
                    }
                </div>
            </div>

            <div class="scroll-container">
                <!-- Left Arrow -->
                @if (canScrollLeft() && showArrows()) {
                    <button 
                        class="scroll-arrow left" 
                        (click)="scrollLeft()"
                        aria-label="Scroll left"
                    >
                        <lucide-icon [name]="ChevronLeftIcon" size="24"></lucide-icon>
                    </button>
                }

                <!-- Cards Container -->
                <div 
                    #scrollContainer
                    class="cards-container"
                    (scroll)="onScroll()"
                >
                    @for (item of items; track item.id) {
                        <div class="card-wrapper">
                            <app-content-card [content]="item"></app-content-card>
                        </div>
                    }
                    
                    @if (isLoading) {
                        @for (i of [1,2,3,4,5]; track i) {
                            <div class="card-wrapper">
                                <app-content-card [isLoading]="true"></app-content-card>
                            </div>
                        }
                    }
                </div>

                <!-- Right Arrow -->
                @if (canScrollRight() && showArrows()) {
                    <button 
                        class="scroll-arrow right" 
                        (click)="scrollRight()"
                        aria-label="Scroll right"
                    >
                        <lucide-icon [name]="ChevronRightIcon" size="24"></lucide-icon>
                    </button>
                }
            </div>
        </section>
    `,
    styles: [`
        .content-row {
            position: relative;
            margin-bottom: var(--space-2xl, 48px);
        }

        .row-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            padding: 0 var(--space-xl, 24px);
            margin-bottom: var(--space-lg, 16px);
        }

        .title-group {
            display: flex;
            align-items: baseline;
            gap: var(--space-md, 12px);
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary, white);
            margin: 0;
        }

        .section-subtitle {
            font-size: 0.875rem;
            color: var(--text-muted, #737373);
            font-weight: 400;
        }

        .scroll-container {
            position: relative;
        }

        .cards-container {
            display: flex;
            gap: var(--space-md, 16px);
            overflow-x: auto;
            scroll-behavior: smooth;
            padding: var(--space-sm, 8px) var(--space-xl, 24px);
            padding-bottom: var(--space-lg, 16px);
            
            /* Hide scrollbar but keep functionality */
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        .cards-container::-webkit-scrollbar {
            display: none;
        }

        .card-wrapper {
            flex-shrink: 0;
            width: 180px;
        }

        @media (min-width: 768px) {
            .card-wrapper {
                width: 200px;
            }
        }

        /* Scroll Arrows */
        .scroll-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            width: 48px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            color: white;
            transition: opacity 0.2s, background 0.2s;
            opacity: 0;
            animation: fadeIn 0.2s forwards;
        }

        @keyframes fadeIn {
            to { opacity: 1; }
        }

        .scroll-arrow.left {
            left: 0;
            background: linear-gradient(to right, rgba(12, 12, 12, 0.95), transparent);
            padding-left: 8px;
        }

        .scroll-arrow.right {
            right: 0;
            background: linear-gradient(to left, rgba(12, 12, 12, 0.95), transparent);
            padding-right: 8px;
        }

        .scroll-arrow:hover {
            color: var(--color-accent, #E50914);
        }

        .scroll-arrow:active {
            transform: translateY(-50%) scale(0.95);
        }
    `]
})
export class ContentRowComponent implements AfterViewInit, OnDestroy {
    @Input() title = '';
    @Input() subtitle = '';
    @Input() items: ContentItem[] = [];
    @Input() isLoading = false;

    @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

    readonly ChevronLeftIcon = ChevronLeft;
    readonly ChevronRightIcon = ChevronRight;

    showArrows = signal(false);
    canScrollLeft = signal(false);
    canScrollRight = signal(true);

    private resizeObserver?: ResizeObserver;

    ngAfterViewInit() {
        this.updateScrollState();

        // Watch for resize
        this.resizeObserver = new ResizeObserver(() => {
            this.updateScrollState();
        });
        this.resizeObserver.observe(this.scrollContainer.nativeElement);
    }

    ngOnDestroy() {
        this.resizeObserver?.disconnect();
    }

    onScroll() {
        this.updateScrollState();
    }

    updateScrollState() {
        const el = this.scrollContainer?.nativeElement;
        if (!el) return;

        this.canScrollLeft.set(el.scrollLeft > 0);
        this.canScrollRight.set(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }

    scrollLeft() {
        const el = this.scrollContainer.nativeElement;
        el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' });
    }

    scrollRight() {
        const el = this.scrollContainer.nativeElement;
        el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
    }
}
