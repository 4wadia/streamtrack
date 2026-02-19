import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Coffee, Zap, Gamepad2, Lightbulb, Moon, Smile, Sparkles } from 'lucide-angular';

export interface Vibe {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
}

@Component({
    selector: 'app-vibe-pill-bar',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
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
                        <lucide-icon [name]="getIcon(vibe.name)" class="vibe-icon" size="16"></lucide-icon>
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
            mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }

        .vibe-container::-webkit-scrollbar {
            display: none;
        }

        .vibe-pills {
            display: flex;
            gap: 12px;
            padding: 4px 5%; /* Padding for fade mask */
            justify-content: center; /* Center if few items */
        }
        
        /* Left-align if overflowing - trick requires wrapper but simple flex works for now */
        @media (max-width: 600px) {
            .vibe-pills {
                justify-content: flex-start;
            }
        }

        .vibe-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 99px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.03);
            color: rgba(255, 255, 255, 0.7);
            font-family: var(--font-body);
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s var(--ease-cinema);
            white-space: nowrap;
        }

        .vibe-pill:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
            color: white;
            border-color: var(--vibe-color);
        }

        .vibe-pill.selected {
            background: var(--vibe-color);
            color: black; /* Contrast against bright colors */
            border-color: var(--vibe-color);
            box-shadow: 0 0 20px color-mix(in srgb, var(--vibe-color) 40%, transparent);
        }

        /* Adjust icon color for selected state */
        .vibe-pill.selected .vibe-icon {
            color: black;
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

    // Make icons available to template
    readonly Coffee = Coffee;

    getIcon(name: string): unknown {
        const lower = name.toLowerCase();
        if (lower.includes('cozy')) return Coffee;
        if (lower.includes('intense')) return Zap;
        if (lower.includes('mindless')) return Gamepad2;
        if (lower.includes('thoughtful')) return Lightbulb;
        if (lower.includes('dark')) return Moon;
        if (lower.includes('funny')) return Smile;
        return Sparkles;
    }

    selectVibe(vibeId: string) {
        if (this.selectedVibe() === vibeId) {
            this.selectedVibe.set(null);
            this.vibeChange.emit('');
        } else {
            this.selectedVibe.set(vibeId);
            this.vibeChange.emit(vibeId);
        }
    }
}
