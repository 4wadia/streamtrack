import { Component, Input, Output, EventEmitter, signal, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';


/**
 * Animated Watchlist Button Component
 * Ported from specs/wishlist.tsx React component
 * Plus → Checkmark animation using Angular Animations API
 */
@Component({
    selector: 'app-watchlist-button',
    standalone: true,
    imports: [CommonModule],
    template: `
        <button
            class="watchlist-btn"
            [class.checked]="checked()"
            [class.animating]="isAnimating()"
            [attr.aria-label]="checked() ? 'Remove from Watchlist' : 'Add to Watchlist'"
            (click)="toggle($event)"
        >
            <svg 
                [attr.width]="svgSize" 
                [attr.height]="svgSize" 
                viewBox="0 0 60 60"
                class="icon-svg"
            >
                <!-- Horizontal line (collapses first) -->
                <line
                    class="h-line"
                    [class.collapsed]="checked()"
                    x1="10" y1="30" x2="50" y2="30"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                />
                
                <!-- Vertical line → becomes check stem -->
                <line
                    class="v-line"
                    [class.stem]="checked()"
                    x1="30" y1="10" x2="30" y2="50"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                />
                
                <!-- Check tail (hidden initially, draws in) -->
                <line
                    class="tail-line"
                    [class.visible]="checked()"
                    x1="28" y1="42" x2="18" y2="32"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                />
            </svg>
        </button>
    `,
    styles: [`
        :host {
            display: inline-block;
        }

        .watchlist-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
            background: var(--bg-glass, rgba(24, 24, 24, 0.8));
            backdrop-filter: blur(10px);
            color: white;
            cursor: pointer;
            transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
            padding: 0;
        }

        /* Size variants via CSS custom properties */
        :host(.size-sm) .watchlist-btn {
            width: 32px;
            height: 32px;
        }

        :host(.size-default) .watchlist-btn,
        :host(:not(.size-sm):not(.size-lg)) .watchlist-btn {
            width: 44px;
            height: 44px;
        }

        :host(.size-lg) .watchlist-btn {
            width: 56px;
            height: 56px;
        }

        .watchlist-btn:hover {
            transform: scale(1.08);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .watchlist-btn:active {
            transform: scale(0.95);
        }

        .watchlist-btn.checked {
            background: var(--color-accent, #E50914);
            border-color: var(--color-accent, #E50914);
        }

        .watchlist-btn.checked:hover {
            background: var(--color-accent-hover, #B20710);
        }

        .icon-svg {
            display: block;
        }

        /* Horizontal line animation */
        .h-line {
            transform-origin: center;
            transition: 
                opacity 0.28s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1)),
                transform 0.28s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1));
        }

        .h-line.collapsed {
            opacity: 0;
            transform: scaleX(0);
        }

        /* Vertical line → check stem animation */
        .v-line {
            transform-origin: center;
            transition: all 0.32s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1));
            transition-delay: 0s;
        }

        .v-line.stem {
            /* Transform to checkmark stem position */
            transform: translate(8px, 5px) rotate(45deg) scaleY(0.5);
            transition-delay: 0.28s;
        }

        /* Checkmark tail */
        .tail-line {
            opacity: 0;
            stroke-dasharray: 20;
            stroke-dashoffset: 20;
            transition: 
                opacity 0.1s,
                stroke-dashoffset 0.42s var(--ease-cinema, cubic-bezier(0.16, 1, 0.3, 1));
            transition-delay: 0s;
        }

        .tail-line.visible {
            opacity: 1;
            stroke-dashoffset: 0;
            transition-delay: 0.6s;
        }

        /* Reverse animation timing */
        .watchlist-btn:not(.checked) .v-line {
            transition-delay: 0.3s;
        }

        .watchlist-btn:not(.checked) .h-line {
            transition-delay: 0.6s;
        }

        .watchlist-btn:not(.checked) .tail-line {
            transition-delay: 0s;
        }
    `]
})
export class WatchlistButtonComponent {
    @Input() size: 'sm' | 'default' | 'lg' = 'default';
    @Input() set isChecked(value: boolean) {
        this.checked.set(value);
    }
    @Output() checkedChange = new EventEmitter<boolean>();

    checked = signal(false);
    isAnimating = signal(false);

    @HostBinding('class.size-sm') get isSm() { return this.size === 'sm'; }
    @HostBinding('class.size-default') get isDefault() { return this.size === 'default'; }
    @HostBinding('class.size-lg') get isLg() { return this.size === 'lg'; }

    get svgSize(): number {
        switch (this.size) {
            case 'sm': return 20;
            case 'lg': return 32;
            default: return 26;
        }
    }

    toggle(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        if (this.isAnimating()) return;

        this.isAnimating.set(true);
        const newValue = !this.checked();
        this.checked.set(newValue);
        this.checkedChange.emit(newValue);

        // Reset animating state after animation completes
        setTimeout(() => {
            this.isAnimating.set(false);
        }, 1000);
    }
}
