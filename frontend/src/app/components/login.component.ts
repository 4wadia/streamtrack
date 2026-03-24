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

        <!-- Google Sign-In Button -->
        <button
          type="button"
          (click)="loginWithGoogle()"
          [disabled]="isSubmitting()"
          class="w-full flex items-center justify-center gap-3 bg-white border border-black/15 rounded-xl py-3 px-4 text-[13px] font-medium text-black/80 cursor-pointer hover:bg-black/[0.02] hover:border-black/25 transition-all disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-black/10"></div>
          <span class="text-[10px] font-mono text-black/35 uppercase tracking-widest">or</span>
          <div class="flex-1 h-px bg-black/10"></div>
        </div>

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
      void this.router.navigateByUrl('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login right now.';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.loginWithGoogle();
      void this.router.navigateByUrl('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in with Google.';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
