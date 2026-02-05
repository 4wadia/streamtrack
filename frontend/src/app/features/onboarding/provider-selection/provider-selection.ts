import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ServiceSelectionGridComponent } from '../../../shared/components/service-selection-grid/service-selection-grid.component';

@Component({
  selector: 'app-provider-selection',
  standalone: true,
  imports: [CommonModule, ServiceSelectionGridComponent],
  templateUrl: './provider-selection.html',
  styleUrl: './provider-selection.css',
})
export class ProviderSelection {
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
      // Next step: Genre selection
      this.router.navigate(['/onboarding/genres']);
    } else {
      console.error('Failed to save services');
    }

    this.saving.set(false);
  }

  skipForNow() {
    // Skip provider selection, go to genres or home? 
    // Spec 9.2: "Skip option subtle but available"
    // Spec 9.2: "Next button -> Genre selection"
    this.router.navigate(['/onboarding/genres']);
  }
}
