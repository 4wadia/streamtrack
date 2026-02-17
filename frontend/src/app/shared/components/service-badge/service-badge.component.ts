import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderIconComponent, PROVIDER_DATA } from '../provider-icon/provider-icon.component';

@Component({
    selector: 'app-service-badge',
    standalone: true,
    imports: [CommonModule, ProviderIconComponent],
    template: `
        <div class="service-badge" [title]="getServiceName(serviceId)">
            <app-provider-icon [providerId]="serviceId" [size]="16" />
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
    `]
})
export class ServiceBadgeComponent {
    @Input({ required: true }) serviceId!: string;

    getServiceName(id: string): string {
        return PROVIDER_DATA[id]?.name || id;
    }
}
