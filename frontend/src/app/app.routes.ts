import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ProfileComponent } from './components/profile.component';
import { WatchlistComponent } from './components/watchlist.component';
import { BrowsePageComponent } from './components/browse-page.component';
import { VibesPageComponent } from './components/vibes-page.component';
import { ContentDetailsPageComponent } from './components/content-details-page.component';
import { LoginComponent } from './components/login.component';
import { SignupComponent } from './components/signup.component';
import { authGuard } from './core/guards/auth.guard';

import { LandingComponent } from './components/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'home', component: HomeComponent, data: { animation: 'home' } },
  { path: 'browse/:category', component: BrowsePageComponent },
  { path: 'details/:type/:id', component: ContentDetailsPageComponent },
  { path: 'vibes', component: VibesPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [authGuard], data: { animation: 'watchlist' } },
  { path: '**', redirectTo: '' },
];
