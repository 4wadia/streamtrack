import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export const fadeAnimation = trigger('fade', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px) scale(0.98)' }),
    animate('0.6s cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
  ])
]);

export const staggerAnimation = trigger('stagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      stagger('80ms', [
        animate('0.7s cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);
