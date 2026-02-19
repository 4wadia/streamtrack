import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
    template: `
        <div class="auth-container">
            <div class="auth-card glass-panel">
                <div class="auth-header">
                    <div class="logo-container">
                        <img src="/assets/logo.svg" alt="StreamTrack Logo" class="auth-logo" onerror="this.style.display='none'">
                    </div>
                    <h1 class="text-h2">Create Account</h1>
                    <p class="text-secondary">Join StreamTrack to discover your next favorite show</p>
                </div>

                @if (authService.error()) {
                    <div class="error-message fade-in">
                        <lucide-icon name="alert-circle" [size]="18"></lucide-icon>
                        <span>{{ authService.error() }}</span>
                    </div>
                }

                <form (ngSubmit)="onSubmit()" class="auth-form fade-in">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <div class="input-wrapper">
                            <lucide-icon name="user" [size]="18" class="input-icon"></lucide-icon>
                            <input
                                type="text"
                                id="name"
                                [(ngModel)]="name"
                                name="name"
                                placeholder="Your name"
                                [disabled]="loading()"
                                autocomplete="name"
                            />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <div class="input-wrapper">
                            <lucide-icon name="mail" [size]="18" class="input-icon"></lucide-icon>
                            <input
                                type="email"
                                id="email"
                                [(ngModel)]="email"
                                name="email"
                                placeholder="name@example.com"
                                required
                                [disabled]="loading()"
                                autocomplete="email"
                            />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="input-wrapper">
                            <lucide-icon name="lock" [size]="18" class="input-icon"></lucide-icon>
                            <input
                                [type]="showPassword() ? 'text' : 'password'"
                                id="password"
                                [(ngModel)]="password"
                                name="password"
                                (ngModelChange)="checkPasswordStrength()"
                                placeholder="••••••••"
                                required
                                minlength="6"
                                [disabled]="loading()"
                                autocomplete="new-password"
                            />
                            <button 
                                type="button" 
                                class="password-toggle"
                                (click)="togglePasswordVisibility()"
                                tabindex="-1"
                            >
                                <lucide-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="18"></lucide-icon>
                            </button>
                        </div>
                        
                        <!-- Password Strength Indicator -->
                        @if (password) {
                            <div class="password-strength">
                                <div class="strength-bar">
                                    <div class="strength-fill" [style.width]="passwordStrength() + '%'" [style.background-color]="strengthColor()"></div>
                                </div>
                                <span class="strength-text" [style.color]="strengthColor()">{{ strengthLabel() }}</span>
                            </div>
                        }
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm-password">Confirm Password</label>
                        <div class="input-wrapper">
                            <lucide-icon name="lock" [size]="18" class="input-icon"></lucide-icon>
                            <input
                                [type]="showConfirmPassword() ? 'text' : 'password'"
                                id="confirm-password"
                                [(ngModel)]="confirmPassword"
                                name="confirmPassword"
                                placeholder="••••••••"
                                required
                                [disabled]="loading()"
                                autocomplete="new-password"
                            />
                            <button 
                                type="button" 
                                class="password-toggle"
                                (click)="toggleConfirmPasswordVisibility()"
                                tabindex="-1"
                            >
                                <lucide-icon [name]="showConfirmPassword() ? 'eye-off' : 'eye'" [size]="18"></lucide-icon>
                            </button>
                        </div>
                        @if (confirmPassword && password !== confirmPassword) {
                            <p class="field-error">Passwords do not match</p>
                        }
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-container">
                            <input type="checkbox" [(ngModel)]="termsAccepted" name="terms" required>
                            <span class="checkmark"></span>
                            <span class="checkbox-label">I agree to the <a href="#" (click)="$event.preventDefault()">Terms of Service</a> and <a href="#" (click)="$event.preventDefault()">Privacy Policy</a></span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        class="btn-primary w-full"
                        [disabled]="loading() || !isValid()"
                    >
                        @if (loading()) {
                            <span class="spinner"></span>
                            Creating account...
                        } @else {
                            Create Account
                        }
                    </button>

                    <div class="divider">
                        <span>or continue with</span>
                    </div>

                    <button
                        type="button"
                        class="btn-secondary w-full google-btn"
                        (click)="onGoogleSignUp()"
                        [disabled]="loading()"
                    >
                        <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign up with Google
                    </button>
                </form>

                <div class="auth-footer">
                    <p>Already have an account? <a routerLink="/login">Sign in</a></p>
                </div>
            </div>
        </div>
    `,
    styles: [`
        /* Reusing Login Styles for Consistency */
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-lg);
            background-image: 
                radial-gradient(circle at top left, rgba(229, 9, 20, 0.05), transparent 40%),
                radial-gradient(circle at bottom right, rgba(229, 9, 20, 0.05), transparent 40%);
        }

        .auth-card {
            width: 100%;
            max-width: 420px;
            padding: var(--space-2xl);
            background: rgba(24, 24, 24, 0.95);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(12px);
            margin: var(--space-xl) 0;
        }
        
        /* ... (Same styles as Login) ... */
        .auth-header {
            text-align: center;
            margin-bottom: var(--space-xl);
        }

        .logo-container {
            display: flex;
            justify-content: center;
            margin-bottom: var(--space-md);
        }
        
        .auth-logo {
            height: 48px;
            width: auto;
        }

        .auth-header h1 {
            color: var(--text-primary);
            margin-bottom: var(--space-xs);
            font-weight: 700;
        }

        .auth-header p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .error-message {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
            padding: var(--space-md);
            border-radius: var(--radius-md);
            margin-bottom: var(--space-lg);
            font-size: 0.9rem;
        }

        .auth-form {
            display: flex;
            flex-direction: column;
            gap: var(--space-md); /* Slightly tighter for register form */
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

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-icon {
            position: absolute;
            left: 12px;
            color: var(--text-muted);
            pointer-events: none;
            z-index: 10;
        }

        .form-group input {
            width: 100%;
            padding: var(--space-md) var(--space-md) var(--space-md) 40px;
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-md);
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
            font-size: 0.95rem;
            transition: all var(--transition-fast);
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--accent-primary);
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 0 1px rgba(229, 9, 20, 0.1);
        }

        .form-group input::placeholder {
            color: var(--text-muted);
        }

        .form-group input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .field-error {
            color: var(--accent-error);
            font-size: 0.75rem;
            margin-top: 4px;
        }

        .password-toggle {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: color 0.2s;
        }

        .password-toggle:hover {
            color: var(--text-secondary);
        }
        
        /* Password strength */
        .password-strength {
            margin-top: 6px;
        }
        
        .strength-bar {
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 4px;
        }
        
        .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
        }
        
        .strength-text {
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        /* Checkbox */
        .checkbox-group {
            margin-top: 8px;
        }
        
        .checkbox-container {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            cursor: pointer;
            font-size: 0.85rem;
            line-height: 1.4;
            color: var(--text-secondary);
        }
        
        .checkbox-container input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }
        
        .checkmark {
            height: 18px;
            width: 18px;
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            border-radius: 4px;
            flex-shrink: 0;
            position: relative;
            transition: all 0.2s;
        }
        
        .checkbox-container:hover input ~ .checkmark {
            border-color: var(--text-muted);
        }
        
        .checkbox-container input:checked ~ .checkmark {
            background-color: var(--accent-primary);
            border-color: var(--accent-primary);
        }
        
        .checkmark:after {
            content: "";
            position: absolute;
            display: none;
            left: 5px;
            top: 1px;
            width: 6px;
            height: 11px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
        
        .checkbox-container input:checked ~ .checkmark:after {
            display: block;
        }
        
        .checkbox-label a {
            color: var(--accent-primary);
            text-decoration: none;
        }
        
        .checkbox-label a:hover {
            text-decoration: underline;
        }

        .btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            padding: 14px;
            background: var(--accent-primary);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-fast);
            box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
            margin-top: var(--space-sm);
        }

        .btn-primary:hover:not(:disabled) {
            background: var(--accent-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(229, 9, 20, 0.4);
        }

        .btn-primary:active:not(:disabled) {
            transform: translateY(0);
        }

        .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            box-shadow: none;
        }

        .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: var(--space-xs) 0;
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .divider::before,
        .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid var(--glass-border);
        }

        .divider span {
            padding: 0 var(--space-md);
        }

        .btn-secondary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-md);
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
            border-radius: var(--radius-md);
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .btn-secondary:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .google-icon {
            display: block;
        }

        .spinner {
            width: 18px;
            height: 18px;
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
            font-size: 0.9rem;
        }

        .auth-footer a {
            color: var(--accent-primary);
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s;
        }

        .auth-footer a:hover {
            color: var(--accent-hover);
            text-decoration: underline;
        }
        
        .fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .w-full { width: 100%; }
        .mb-4 { margin-bottom: 1rem; }
    `]
})
export class RegisterComponent {
    authService = inject(AuthService);
    private router = inject(Router);

    name = '';
    email = '';
    password = '';
    confirmPassword = '';
    termsAccepted = false;

    showPassword = signal(false);
    showConfirmPassword = signal(false);
    loading = signal(false);

    // Derived state for password strength
    passwordStrength = signal(0);
    strengthLabel = signal('');
    strengthColor = signal('');

    async onSubmit() {
        if (!this.isValid()) return;

        this.loading.set(true);

        try {
            await this.authService.register(this.email, this.password, this.name);
            // Navigate to onboarding to select streaming services
            this.router.navigate(['/onboarding']);
        } catch {
            // Error is handled by AuthService
        } finally {
            this.loading.set(false);
        }
    }

    isValid(): boolean {
        return !!(
            this.email &&
            this.password &&
            this.password.length >= 6 &&
            this.password === this.confirmPassword &&
            this.termsAccepted
        );
    }

    togglePasswordVisibility() {
        this.showPassword.update(v => !v);
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword.update(v => !v);
    }

    checkPasswordStrength() {
        const password = this.password;
        if (!password) {
            this.passwordStrength.set(0);
            return;
        }

        let score = 0;
        if (password.length > 6) score += 20;
        if (password.length > 10) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;

        this.passwordStrength.set(score);

        if (score < 40) {
            this.strengthLabel.set('Weak');
            this.strengthColor.set('#ef4444'); // Red
        } else if (score < 80) {
            this.strengthLabel.set('Medium');
            this.strengthColor.set('#eab308'); // Yellow
        } else {
            this.strengthLabel.set('Strong');
            this.strengthColor.set('#22c55e'); // Green
        }
    }

    async onGoogleSignUp() {
        this.loading.set(true);
        try {
            await this.authService.loginWithGoogle();
            this.router.navigate(['/onboarding']); // Should verify if new user, but onboarding handles redirects anyway
        } catch {
            // Error handled by service
        } finally {
            this.loading.set(false);
        }
    }
}
