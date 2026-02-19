import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Skip auth for external APIs if needed, but for now we assume all calls are to our backend or handled otherwise
    // Actually, we should only attach token for calls to our API
    if (req.url.includes('api.themoviedb.org')) {
        return next(req);
    }

    return from(authService.getIdToken()).pipe(
        switchMap(token => {
            if (token) {
                const cloned = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return next(cloned);
            }
            return next(req);
        })
    );
};
