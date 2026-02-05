import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-service-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="service-badge" [title]="getServiceName(serviceId)">
            <span class="badge-icon">{{ getServiceEmoji(serviceId) }}</span>
        </div>
    `,
    styles: [`
        .service-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--bg-elevated);
            cursor: default;
            transition: transform var(--transition-fast);
        }

        .service-badge:hover {
            transform: scale(1.1);
        }

        .badge-icon {
            font-size: 0.75rem;
        }
    `]
})
export class ServiceBadgeComponent {
    @Input({ required: true }) serviceId!: string;

    private serviceData: Record<string, { name: string; emoji: string }> = {
        'netflix': { name: 'Netflix', emoji: '🔴' },
        'prime': { name: 'Prime Video', emoji: '📦' },
        'jiohotstar': { name: 'JioHotstar', emoji: '🌟' },
        'hbo': { name: 'HBO Max', emoji: '🟣' },
        'hulu': { name: 'Hulu', emoji: '💚' },
        'apple': { name: 'Apple TV+', emoji: '🍎' },
        'paramount': { name: 'Paramount+', emoji: '⭐' }
    };

    getServiceName(id: string): string {
        return this.serviceData[id]?.name || id;
    }

    getServiceEmoji(id: string): string {
        return this.serviceData[id]?.emoji || '📺';
    }
}
