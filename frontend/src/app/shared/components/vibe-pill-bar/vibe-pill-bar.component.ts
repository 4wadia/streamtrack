import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Vibe {
    id: string;
    name: string;
    emoji: string;
    color: string;
    description: string;
}

@Component({
    selector: 'app-vibe-pill-bar',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="vibe-container">
            <div class="vibe-pills">
                @for (vibe of vibes; track vibe.id) {
                    <button 
                        class="vibe-pill"
                        [class.selected]="selectedVibe() === vibe.id"
                        [style.--vibe-color]="vibe.color"
                        (click)="selectVibe(vibe.id)"
                    >
                        <span class="vibe-emoji">{{ vibe.emoji }}</span>
                        <span class="vibe-name">{{ vibe.name }}</span>
                    </button>
                }
            </div>
        </div>
    `,
    styles: [`
        .vibe-container {
            width: 100%;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        .vibe-container::-webkit-scrollbar {
            display: none;
        }

        .vibe-pills {
            display: flex;
            gap: var(--space-md);
            padding: var(--space-sm) 0;
        }

        .vibe-pill {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm) var(--space-lg);
            border-radius: var(--radius-full);
            border: 2px solid var(--vibe-color);
            background: transparent;
            color: var(--text-primary);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all var(--transition-fast);
            white-space: nowrap;
        }

        .vibe-pill:hover {
            background: color-mix(in srgb, var(--vibe-color) 20%, transparent);
            transform: translateY(-2px);
        }

        .vibe-pill.selected {
            background: var(--vibe-color);
            color: white;
            box-shadow: 0 4px 15px color-mix(in srgb, var(--vibe-color) 40%, transparent);
        }

        .vibe-emoji {
            font-size: 1rem;
        }

        .vibe-name {
            font-weight: 600;
        }
    `]
})
export class VibePillBarComponent {
    @Input() vibes: Vibe[] = [];
    @Input() set initialVibe(value: string | null) {
        if (value) {
            this.selectedVibe.set(value);
        }
    }
    @Output() vibeChange = new EventEmitter<string>();

    selectedVibe = signal<string | null>(null);

    selectVibe(vibeId: string) {
        if (this.selectedVibe() === vibeId) {
            // Deselect if already selected
            this.selectedVibe.set(null);
            this.vibeChange.emit('');
        } else {
            this.selectedVibe.set(vibeId);
            this.vibeChange.emit(vibeId);
        }
    }
}
