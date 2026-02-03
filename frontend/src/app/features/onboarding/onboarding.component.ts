import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ServiceSelectionGridComponent } from '../../shared/components/service-selection-grid/service-selection-grid.component';

@Component({
    selector: 'app-onboarding',
    standalone: true,
    imports: [CommonModule, ServiceSelectionGridComponent],
    template: `
        <div class="onboarding-container">
            <div class="onboarding-content glass">
                <div class="onboarding-header">
                    <h1 class="text-display">Which services do you have?</h1>
                    <p class="text-secondary">Select your streaming subscriptions to get personalized recommendations.</p>
                </div>

                <app-service-selection-grid
                    [initialSelected]="initialServices()"
                    (selectionChange)="onSelectionChange($event)"
                />

                <div class="onboarding-footer">
                    <p class="selection-hint">
                        @if (selectedServices().length === 0) {
                            Select at least one service to continue
                        } @else {
                            {{ selectedServices().length }} service{{ selectedServices().length > 1 ? 's' : '' }} selected
                        }
                    </p>
                    
                    <button 
                        class="btn-primary btn-large"
                        [disabled]="saving() || selectedServices().length === 0"
                        (click)="saveAndContinue()"
                    >
                        @if (saving()) {
                            <span class="spinner"></span> Saving...
                        } @else {
                            Continue →
                        }
                    </button>

                    <button class="btn-skip" (click)="skipForNow()">
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .onboarding-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-xl);
        }

        .onboarding-content {
            max-width: 700px;
            width: 100%;
            padding: var(--space-2xl);
            text-align: center;
        }

        .onboarding-header {
            margin-bottom: var(--space-2xl);
        }

        .onboarding-header h1 {
            margin-bottom: var(--space-md);
        }

        .text-secondary {
            color: var(--text-secondary);
            font-size: 1.125rem;
        }

        .onboarding-footer {
            margin-top: var(--space-2xl);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-lg);
        }

        .selection-hint {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            padding: var(--space-md) var(--space-2xl);
            border-radius: var(--radius-md);
            font-size: 1rem;
            font-weight: 600;
            background: var(--accent-primary);
            color: white;
            border: none;
            cursor: pointer;
            transition: all var(--transition-fast);
            min-width: 200px;
        }

        .btn-primary:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-skip {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 0.875rem;
            cursor: pointer;
            text-decoration: underline;
        }

        .btn-skip:hover {
            color: var(--text-primary);
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `]
})
export class OnboardingComponent {
    private userService = inject(UserService);
    private router = inject(Router);

    initialServices = signal<string[]>([]);
    selectedServices = signal<string[]>([]);
    saving = signal(false);

    onSelectionChange(services: string[]) {
        this.selectedServices.set(services);
    }

    async saveAndContinue() {
        if (this.selectedServices().length === 0) return;

        this.saving.set(true);

        const success = await this.userService.updateUserServices(this.selectedServices());

        if (success) {
            this.router.navigate(['/']);
        } else {
            // TODO: Show error toast
            console.error('Failed to save services');
        }

        this.saving.set(false);
    }

    skipForNow() {
        this.router.navigate(['/']);
    }
}
