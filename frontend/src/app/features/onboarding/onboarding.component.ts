import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-onboarding',
    standalone: true,
    imports: [RouterOutlet],
    template: `
        <div class="onboarding-layout">
            <router-outlet />
        </div>
    `,
    styles: [`
        .onboarding-layout {
            min-height: 100vh;
            background: var(--bg-cinema-black);
            padding-top: 80px; /* Space for navbar if present, or just spacing */
        }
    `]
})
export class Onboarding {
}
