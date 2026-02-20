import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import type { SimpleIcon } from 'simple-icons';
import { siNetflix, siAppletv, siHbo, siParamountplus } from 'simple-icons';

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

const SIMPLE_ICON_MAP: Record<string, SimpleIcon> = {
    netflix: siNetflix,
    apple: siAppletv,
    hbo: siHbo,
    paramount: siParamountplus
};

@Component({
    selector: 'app-provider-icon',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        @if (!useFallback()) {
            <img 
                [src]="'/icons/providers/' + providerId + '.svg'"
                [alt]="getProviderName()"
                [width]="size"
                [height]="size"
                class="provider-icon-img"
                (error)="onImageError()"
            />
        } @else {
            <span
                class="provider-icon-fallback"
                [style.width.px]="size"
                [style.height.px]="size"
                [style.color]="getFallbackColor()"
                [attr.aria-label]="getProviderName()"
                role="img"
            >
                @if (hasFallbackSvg()) {
                    <span class="provider-icon-svg" [innerHTML]="getFallbackSvg()"></span>
                } @else {
                    <span class="provider-icon-letter">{{ getFallbackLetter() }}</span>
                }
            </span>
        }
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
        .provider-icon-fallback {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .provider-icon-fallback svg {
            width: 100%;
            height: 100%;
            fill: currentColor;
        }
        .provider-icon-letter {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            color: currentColor;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 6px;
        }
    `]
})
export class ProviderIconComponent {
    @Input({ required: true }) providerId!: string;
    @Input() size = 24;

    private fallbackEnabled = signal(false);
    private sanitizer = inject(DomSanitizer);

    getProviderName(): string {
        return PROVIDER_DATA[this.providerId]?.name || this.providerId;
    }

    useFallback(): boolean {
        return this.fallbackEnabled();
    }

    hasFallbackSvg(): boolean {
        return Boolean(SIMPLE_ICON_MAP[this.providerId]);
    }

    getFallbackSvg(): SafeHtml | null {
        const icon = SIMPLE_ICON_MAP[this.providerId];
        if (!icon) return null;
        return this.sanitizer.bypassSecurityTrustHtml(icon.svg);
    }

    getFallbackColor(): string {
        const icon = SIMPLE_ICON_MAP[this.providerId];
        if (icon?.hex) return `#${icon.hex}`;
        return PROVIDER_DATA[this.providerId]?.color || '#A3A3A3';
    }

    getFallbackLetter(): string {
        const name = this.getProviderName();
        return name.trim().charAt(0).toUpperCase() || '?';
    }

    onImageError() {
        if (SIMPLE_ICON_MAP[this.providerId]) {
            this.fallbackEnabled.set(true);
            return;
        }
        this.fallbackEnabled.set(true);
    }
}
