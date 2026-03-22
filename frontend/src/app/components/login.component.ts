import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="min-h-[72vh] flex items-center justify-center py-10">
      <article
        class="w-full max-w-md border border-black/10 rounded-3xl bg-white shadow-sm p-8 reveal"
      >
        <p class="text-[10px] font-mono text-black/50 uppercase tracking-widest mb-2">
          Welcome Back
        </p>
        <h1 class="text-3xl font-bold tracking-tight text-black mb-6">Login</h1>

        <form class="flex flex-col gap-4" (submit)="login($event)">
          <div>
            <label class="text-[10px] font-mono text-black/45 uppercase tracking-widest mb-2 block"
              >Email</label
            >
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-black/30 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="text-[10px] font-mono text-black/45 uppercase tracking-widest mb-2 block"
              >Password</label
            >
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-black/30 transition-colors"
              placeholder="Enter password"
            />
          </div>

          @if (errorMessage()) {
            <p
              class="text-[12px] text-[#1d1d1f] border border-[#e2e2e7] bg-[#fcfcfd] rounded-lg px-3 py-2"
            >
              {{ errorMessage() }}
            </p>
          }

          <button
            type="submit"
            [disabled]="isSubmitting()"
            class="mt-2 w-full bg-black text-white rounded-xl py-3 text-[12px] font-mono uppercase tracking-widest border-none cursor-pointer disabled:opacity-60"
          >
            {{ isSubmitting() ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="text-[12px] text-black/60 mt-6">
          New here?
          <a routerLink="/signup" class="text-black font-semibold no-underline hover:underline"
            >Create account</a
          >
        </p>
      </article>
    </section>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  async login(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.login({ email: this.email, password: this.password });
      void this.router.navigateByUrl('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login right now.';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
