import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { WatchlistCardComponent } from './watchlist-card.component';
import { WatchlistItem } from '../../../core/services/watchlist.service';

const mockItem: WatchlistItem = {
    contentId: 'test-1',
    title: 'Test Movie',
    type: 'movie',
    status: 'want',
    addedAt: new Date('2024-01-01')
};

describe('WatchlistCardComponent', () => {
    let component: WatchlistCardComponent;
    let fixture: ComponentFixture<WatchlistCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WatchlistCardComponent],
            providers: [provideAnimations()]
        }).compileComponents();

        fixture = TestBed.createComponent(WatchlistCardComponent);
        component = fixture.componentInstance;
        component.item = { ...mockItem };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('posterUrl', () => {
        it('should return TMDB image URL when posterPath is set', () => {
            component.item = { ...mockItem, posterPath: '/abc123.jpg' };
            expect(component.posterUrl).toBe('https://image.tmdb.org/t/p/w342/abc123.jpg');
        });

        it('should return placeholder SVG when posterPath is missing', () => {
            component.item = { ...mockItem, posterPath: undefined };
            expect(component.posterUrl).toContain('data:image/svg+xml');
        });
    });

    describe('statusLabel', () => {
        it('should return "Plan" for want status', () => {
            component.item = { ...mockItem, status: 'want' };
            expect(component.statusLabel).toBe('Plan');
        });

        it('should return "Watching" for watching status', () => {
            component.item = { ...mockItem, status: 'watching' };
            expect(component.statusLabel).toBe('Watching');
        });

        it('should return "Watched" for watched status', () => {
            component.item = { ...mockItem, status: 'watched' };
            expect(component.statusLabel).toBe('Watched');
        });
    });

    describe('setRating', () => {
        it('should emit the clicked rating when different from current', () => {
            const ratings: number[] = [];
            component.ratingChange.subscribe((r: number) => ratings.push(r));

            component.item = { ...mockItem, rating: 3 };
            component.setRating(4);

            expect(ratings).toEqual([4]);
        });

        it('should emit 0 when clicking same rating (toggle off)', () => {
            const ratings: number[] = [];
            component.ratingChange.subscribe((r: number) => ratings.push(r));

            component.item = { ...mockItem, rating: 3 };
            component.setRating(3);

            expect(ratings).toEqual([0]);
        });

        it('should emit rating when item has no current rating', () => {
            const ratings: number[] = [];
            component.ratingChange.subscribe((r: number) => ratings.push(r));

            component.item = { ...mockItem, rating: undefined };
            component.setRating(5);

            expect(ratings).toEqual([5]);
        });
    });

    describe('status change events', () => {
        it('should emit status change when action chip clicked', () => {
            const statuses: string[] = [];
            component.statusChange.subscribe((s: string) => statuses.push(s));

            component.statusChange.emit('watching');
            component.statusChange.emit('watched');

            expect(statuses).toEqual(['watching', 'watched']);
        });
    });

    describe('remove event', () => {
        it('should emit remove event', () => {
            let removed = false;
            component.remove.subscribe(() => { removed = true; });

            component.remove.emit();

            expect(removed).toBe(true);
        });
    });

    describe('highlighted input', () => {
        it('should default to not highlighted', () => {
            expect(component.highlighted).toBe(false);
        });

        it('should reflect highlighted input as true', () => {
            component.highlighted = true;
            fixture.changeDetectorRef.detectChanges();
            const el: HTMLElement = fixture.nativeElement.querySelector('.watchlist-card');
            expect(el.classList.contains('highlighted')).toBe(true);
        });
    });

    describe('stars array', () => {
        it('should have 5 stars', () => {
            expect(component.stars).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('template rendering', () => {
        it('should render card title', () => {
            const el: HTMLElement = fixture.nativeElement;
            expect(el.querySelector('.card-title')?.textContent?.trim()).toBe('Test Movie');
        });

        it('should render type tag as Movie for movie type', () => {
            const el: HTMLElement = fixture.nativeElement;
            expect(el.querySelector('.type-tag')?.textContent?.trim()).toBe('Movie');
        });

        it('should render type tag as TV for tv type', () => {
            component.item = { ...mockItem, type: 'tv' };
            fixture.changeDetectorRef.detectChanges();
            const el: HTMLElement = fixture.nativeElement;
            expect(el.querySelector('.type-tag')?.textContent?.trim()).toBe('TV');
        });
    });
});
