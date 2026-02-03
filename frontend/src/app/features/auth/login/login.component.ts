import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
        <div class="auth-container">
            <div class="auth-card glass">
                <div class="auth-header">
                    <h1 class="text-h1">Welcome Back</h1>
                    <p class="text-secondary">Sign in to continue to StreamTrack</p>
                </div>

                @if (authService.error()) {
                    <div class="error-message">
                        {{ authService.error() }}
                    </div>
                }

                <form (ngSubmit)="onSubmit()" class="auth-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            [(ngModel)]="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            [disabled]="loading()"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            [(ngModel)]="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            [disabled]="loading()"
                        />
                    </div>

                    <button
                        type="submit"
                        class="btn-primary"
                        [disabled]="loading() || !email || !password"
                    >
                        @if (loading()) {
                            <span class="spinner"></span>
                            Signing in...
                        } @else {
                            Sign In
                        }
                    </button>
                </form>

                <div class="auth-footer">
                    <p>Don't have an account? <a routerLink="/register">Sign up</a></p>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-lg);
        }

        .auth-card {
            width: 100%;
            max-width: 400px;
            padding: var(--space-2xl);
        }

        .auth-header {
            text-align: center;
            margin-bottom: var(--space-xl);
        }

        .auth-header h1 {
            margin-bottom: var(--space-sm);
        }

        .auth-header p {
            color: var(--text-secondary);
        }

        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--accent-error);
            color: var(--accent-error);
            padding: var(--space-md);
            border-radius: var(--radius-md);
            margin-bottom: var(--space-lg);
            text-align: center;
        }

        .auth-form {
            display: flex;
            flex-direction: column;
            gap: var(--space-lg);
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: var(--space-xs);
        }

        .form-group label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .form-group input {
            padding: var(--space-md);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 1rem;
            transition: border-color var(--transition-fast);
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--accent-primary);
        }

        .form-group input::placeholder {
            color: var(--text-muted);
        }

        .form-group input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            padding: var(--space-md) var(--space-lg);
            background: var(--accent-primary);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .btn-primary:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .auth-footer {
            text-align: center;
            margin-top: var(--space-xl);
            color: var(--text-secondary);
        }

        .auth-footer a {
            color: var(--accent-primary);
            text-decoration: none;
            font-weight: 500;
        }

        .auth-footer a:hover {
            text-decoration: underline;
        }
    `]
})
export class LoginComponent {
    authService = inject(AuthService);
    private router = inject(Router);

    email = '';
    password = '';
    loading = signal(false);

    async onSubmit() {
        if (!this.email || !this.password) return;

        this.loading.set(true);

        try {
            await this.authService.login(this.email, this.password);
            this.router.navigate(['/']);
        } catch (error) {
            // Error is handled by AuthService
        } finally {
            this.loading.set(false);
        }
    }
}
