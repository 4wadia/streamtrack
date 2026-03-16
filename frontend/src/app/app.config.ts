import { ApplicationConfig } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  LucideAngularModule,
  Search,
  Plus,
  X,
  Play,
  Star,
  Clock,
  Calendar,
  LayoutGrid,
  List,
  Check,
  ChevronDown,
  User,
  TrendingUp,
  Film,
  Moon,
  Zap,
  Brain,
  Coffee,
  Heart,
  CheckCircle,
  Activity,
} from 'lucide-angular';

import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { HomeWatchlistReuseStrategy } from './home-watchlist-reuse.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: HomeWatchlistReuseStrategy },
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Search,
        Plus,
        X,
        Play,
        Star,
        Clock,
        Calendar,
        LayoutGrid,
        List,
        Check,
        ChevronDown,
        User,
        TrendingUp,
        Film,
        Moon,
        Zap,
        Brain,
        Coffee,
        Heart,
        CheckCircle,
        Activity,
      }),
    ),
  ],
};
