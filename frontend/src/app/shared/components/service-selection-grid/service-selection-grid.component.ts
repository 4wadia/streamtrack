import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, StreamingService } from '../../../core/services/user.service';
import { ProviderIconComponent } from '../provider-icon/provider-icon.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-service-selection-grid',
    standalone: true,
    imports: [CommonModule, ProviderIconComponent, LucideAngularModule],
    template: `
        <div class="service-grid">
            @for (service of services(); track service.id) {
                <button 
                    class="service-card glass"
                    [class.selected]="selectedServices().includes(service.id)"
                    (click)="toggleService(service.id)"
                >
                    <div class="service-icon">
                        <app-provider-icon [providerId]="service.id" [size]="36" />
                    </div>
                    <span class="service-name">{{ service.name }}</span>
                    @if (selectedServices().includes(service.id)) {
                        <div class="check-indicator">
                            <lucide-icon name="check" [size]="14"></lucide-icon>
                        </div>
                    }
                </button>
            }
        </div>
    `,
    styles: [`
        .service-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: var(--space-lg);
            max-width: 600px;
            margin: 0 auto;
        }

        .service-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--space-xl);
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: all var(--transition-normal);
            border: 2px solid transparent;
            background: var(--bg-elevated);
            position: relative;
        }

        .service-card:hover {
            transform: translateY(-2px);
            border-color: var(--accent-primary);
        }

        .service-card.selected {
            border-color: var(--accent-success);
            background: rgba(34, 197, 94, 0.1);
        }

        .service-icon {
            margin-bottom: var(--space-md);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .service-name {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-primary);
            text-align: center;
        }

        .check-indicator {
            position: absolute;
            top: var(--space-sm);
            right: var(--space-sm);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--accent-success);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `]
})
export class ServiceSelectionGridComponent implements OnInit {
    private userService = inject(UserService);

    @Input() initialSelected: string[] = [];
    @Output() selectionChange = new EventEmitter<string[]>();

    services = signal<StreamingService[]>([]);
    selectedServices = signal<string[]>([]);

    async ngOnInit() {
        const services = await this.userService.getAvailableServices();
        this.services.set(services);

        if (this.initialSelected.length > 0) {
            this.selectedServices.set([...this.initialSelected]);
        }
    }

    toggleService(serviceId: string) {
        const current = this.selectedServices();
        const updated = current.includes(serviceId)
            ? current.filter(id => id !== serviceId)
            : [...current, serviceId];

        this.selectedServices.set(updated);
        this.selectionChange.emit(updated);
    }
}
