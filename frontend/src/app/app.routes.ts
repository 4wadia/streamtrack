import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
        canActivate: [authGuard]
    },
    {
        path: 'discover',
        loadComponent: () => import('./features/discover/discover.component').then(m => m.DiscoverComponent),
        canActivate: [authGuard]
    },
    {
        path: 'watchlist',
        loadComponent: () => import('./features/watchlist/watchlist.component').then(m => m.WatchlistComponent),
        canActivate: [authGuard]
    },
    {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];

