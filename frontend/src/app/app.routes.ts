import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'welcome',
        loadComponent: () => import('./features/welcome/welcome').then(m => m.Welcome)
    },
    {
        path: 'onboarding',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.Onboarding),
        canActivate: [authGuard],
        children: [
            {
                path: 'providers',
                loadComponent: () => import('./features/onboarding/provider-selection/provider-selection').then(m => m.ProviderSelection)
            },
            {
                path: 'genres',
                loadComponent: () => import('./features/onboarding/genre-selection/genre-selection').then(m => m.GenreSelection)
            },
            {
                path: 'preview',
                loadComponent: () => import('./features/onboarding/personalized-preview/personalized-preview').then(m => m.PersonalizedPreview)
            },
            {
                path: '',
                redirectTo: 'providers',
                pathMatch: 'full'
            }
        ]
    },

    {
        path: 'discover',
        redirectTo: '/',
        pathMatch: 'full'
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
        path: 'account',
        loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent),
        canActivate: [authGuard]
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

