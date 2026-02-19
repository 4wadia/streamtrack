import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface ProviderInfo {
    name: string;
    color: string;
}

export const PROVIDER_DATA: Record<string, ProviderInfo> = {
    'netflix': { name: 'Netflix', color: '#E50914' },
    'prime': { name: 'Prime Video', color: '#00A8E1' },
    'jiohotstar': { name: 'JioHotstar', color: '#1F80E0' },
    'apple': { name: 'Apple TV+', color: '#A2AAAD' },
    'hbo': { name: 'HBO Max', color: '#5822B4' },
    'hulu': { name: 'Hulu', color: '#1CE783' },
    'paramount': { name: 'Paramount+', color: '#0064FF' },
    'sonyliv': { name: 'SonyLIV', color: '#0A8C6A' }
};

@Component({
    selector: 'app-provider-icon',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <img 
            [src]="'/icons/providers/' + providerId + '.svg'"
            [alt]="getProviderName()"
            [width]="size"
            [height]="size"
            class="provider-icon-img"
            (error)="onImageError($event)"
        />
    `,
    styles: [`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .provider-icon-img {
            display: block;
            object-fit: contain;
        }
    `]
})
export class ProviderIconComponent {
    @Input({ required: true }) providerId!: string;
    @Input() size = 24;

    getProviderName(): string {
        return PROVIDER_DATA[this.providerId]?.name || this.providerId;
    }

    onImageError(event: Event) {
        const img = event.target as HTMLImageElement;
        // Fallback: hide the broken image and we'll show nothing (Lucide Tv could be added)
        img.style.display = 'none';
    }
}
