import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { HeaderComponent } from './components/header.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

const SLIDE_TIMING = '450ms cubic-bezier(0.22, 1, 0.36, 1)';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent],
  animations: [
    trigger('routeAnimations', [
      transition('home => watchlist', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ], { optional: true }),
        query(':enter', [style({ transform: 'translate3d(100%, 0, 0)' })], { optional: true }),
        group([
          query(':leave', [animate(SLIDE_TIMING, style({ transform: 'translate3d(-100%, 0, 0)' }))], { optional: true }),
          query(':enter', [animate(SLIDE_TIMING, style({ transform: 'translate3d(0, 0, 0)' }))], { optional: true }),
        ]),
      ]),
      transition('watchlist => home', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ], { optional: true }),
        query(':enter', [style({ transform: 'translate3d(-100%, 0, 0)' })], { optional: true }),
        group([
          query(':leave', [animate(SLIDE_TIMING, style({ transform: 'translate3d(100%, 0, 0)' }))], { optional: true }),
          query(':enter', [animate(SLIDE_TIMING, style({ transform: 'translate3d(0, 0, 0)' }))], { optional: true }),
        ]),
      ]),
      transition('* => details', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.96) translateY(20px)' }),
        ], { optional: true }),
        group([
          query(':leave', [
            animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(1.04)' })),
          ], { optional: true }),
          query(':enter', [
            animate('400ms 50ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
          ], { optional: true }),
        ]),
      ]),
      transition('details => *', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ], { optional: true }),
        query(':enter', [style({ opacity: 0, transform: 'scale(1.04)' })], { optional: true }),
        group([
          query(':leave', [
            animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.96) translateY(20px)' })),
          ], { optional: true }),
          query(':enter', [
            animate('400ms 50ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1)' })),
          ], { optional: true }),
        ]),
      ]),
    ]),
  ],
  template: `
    <div
      [class]="isLandingPage()
        ? 'h-screen overflow-hidden bg-[var(--surface-app)] text-[var(--text-on-dark)] font-[Inter,sans-serif] selection:bg-black/10 selection:text-black antialiased'
        : 'min-h-screen bg-[var(--surface-app)] text-[var(--text-on-dark)] font-[Inter,sans-serif] selection:bg-black/10 selection:text-black pb-20 antialiased'"
    >
      @if (!isLandingPage()) {
        <app-header></app-header>
      }

      <main [class]="isLandingPage() ? 'relative z-10 mx-auto w-full max-w-[1440px]' : 'relative z-10 mx-auto w-full max-w-[1440px] px-[6%] pt-28 md:px-[8%] lg:px-[10%] lg:pt-32'">
        <div
          class="route-slide-shell relative min-h-[60vh] overflow-x-hidden"
          [class.disable-reveal]="isSlideOnlyRoute(outlet)"
          [@routeAnimations]="prepareRoute(outlet)"
        >
          <router-outlet #outlet="outlet"></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class AppComponent {
  private router = inject(Router);
  
  isLandingPage = toSignal(
    this.router.events.pipe(
      map(() => this.router.url === '/')
    ),
    { initialValue: this.router.url === '/' }
  );

  prepareRoute(outlet: RouterOutlet): string {
    return (outlet.activatedRouteData?.['animation'] as string) || 'other';
  }

  isSlideOnlyRoute(outlet: RouterOutlet): boolean {
    const route = this.prepareRoute(outlet);
    return route === 'home' || route === 'watchlist';
  }
}
