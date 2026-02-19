import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

function createMockAuthService(isAuthenticated: boolean) {
    const authSignal = signal(isAuthenticated);
    return {
        isAuthenticated: authSignal.asReadonly()
    };
}

const mockRoute = {} as ActivatedRouteSnapshot;
const mockState = { url: '/test' } as RouterStateSnapshot;

describe('authGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                {
                    provide: AuthService,
                    useValue: createMockAuthService(true)
                }
            ]
        });
    });

    it('should allow access when user is authenticated', () => {
        TestBed.overrideProvider(AuthService, { useValue: createMockAuthService(true) });

        const result = TestBed.runInInjectionContext(() =>
            authGuard(mockRoute, mockState)
        );

        expect(result).toBe(true);
    });

    it('should redirect to /login when user is not authenticated', () => {
        TestBed.overrideProvider(AuthService, { useValue: createMockAuthService(false) });

        const result = TestBed.runInInjectionContext(() =>
            authGuard(mockRoute, mockState)
        );

        const router = TestBed.inject(Router);
        expect(result).toEqual(router.createUrlTree(['/login']));
    });
});

describe('guestGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                {
                    provide: AuthService,
                    useValue: createMockAuthService(false)
                }
            ]
        });
    });

    it('should allow access when user is NOT authenticated', () => {
        TestBed.overrideProvider(AuthService, { useValue: createMockAuthService(false) });

        const result = TestBed.runInInjectionContext(() =>
            guestGuard(mockRoute, mockState)
        );

        expect(result).toBe(true);
    });

    it('should redirect to / when user is already authenticated', () => {
        TestBed.overrideProvider(AuthService, { useValue: createMockAuthService(true) });

        const result = TestBed.runInInjectionContext(() =>
            guestGuard(mockRoute, mockState)
        );

        const router = TestBed.inject(Router);
        expect(result).toEqual(router.createUrlTree(['/']));
    });
});
