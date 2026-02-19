import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { StatsModalComponent } from './stats-modal.component';
import { WatchlistService, WatchlistItem } from '../../../core/services/watchlist.service';

const makeItems = (overrides: Partial<WatchlistItem>[] = []): WatchlistItem[] =>
    overrides.map((o, i) => ({
        contentId: `item-${i}`,
        title: `Item ${i}`,
        type: 'movie',
        status: 'want',
        addedAt: new Date(),
        ...o
    }));

describe('StatsModalComponent', () => {
    let component: StatsModalComponent;
    let fixture: ComponentFixture<StatsModalComponent>;
    let watchlistSignal: ReturnType<typeof signal<WatchlistItem[]>>;

    function createWithItems(items: WatchlistItem[]) {
        watchlistSignal.set(items);
        fixture.detectChanges();
    }

    beforeEach(async () => {
        watchlistSignal = signal<WatchlistItem[]>([]);

        await TestBed.configureTestingModule({
            imports: [StatsModalComponent],
            providers: [
                {
                    provide: WatchlistService,
                    useValue: { watchlist: watchlistSignal.asReadonly() }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(StatsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('stats computation', () => {
        it('should return zero stats for empty watchlist', () => {
            createWithItems([]);
            const s = component.stats();
            expect(s.total).toBe(0);
            expect(s.want).toBe(0);
            expect(s.watching).toBe(0);
            expect(s.watched).toBe(0);
            expect(s.movies).toBe(0);
            expect(s.tvShows).toBe(0);
            expect(s.avgRating).toBe(0);
        });

        it('should count total items correctly', () => {
            createWithItems(makeItems([{}, {}, {}]));
            expect(component.stats().total).toBe(3);
        });

        it('should count want items', () => {
            createWithItems(makeItems([
                { status: 'want' },
                { status: 'want' },
                { status: 'watching' }
            ]));
            expect(component.stats().want).toBe(2);
        });

        it('should count watching items', () => {
            createWithItems(makeItems([
                { status: 'watching' },
                { status: 'want' }
            ]));
            expect(component.stats().watching).toBe(1);
        });

        it('should count watched items', () => {
            createWithItems(makeItems([
                { status: 'watched' },
                { status: 'watched' },
                { status: 'watching' }
            ]));
            expect(component.stats().watched).toBe(2);
        });

        it('should count movies', () => {
            createWithItems(makeItems([
                { type: 'movie' },
                { type: 'movie' },
                { type: 'tv' }
            ]));
            expect(component.stats().movies).toBe(2);
        });

        it('should count tv shows', () => {
            createWithItems(makeItems([
                { type: 'tv' },
                { type: 'movie' }
            ]));
            expect(component.stats().tvShows).toBe(1);
        });

        it('should calculate average rating from rated items only', () => {
            createWithItems(makeItems([
                { rating: 4 },
                { rating: 2 },
                { rating: undefined }
            ]));
            expect(component.stats().avgRating).toBe(3);
        });

        it('should return 0 average rating when no items are rated', () => {
            createWithItems(makeItems([{ rating: undefined }, {}]));
            expect(component.stats().avgRating).toBe(0);
        });

        it('should not count items with rating 0 in average', () => {
            createWithItems(makeItems([
                { rating: 0 },
                { rating: 5 }
            ]));
            expect(component.stats().avgRating).toBe(5);
        });
    });

    describe('close event', () => {
        it('should emit close event', () => {
            let closed = false;
            component.close.subscribe(() => { closed = true; });
            component.close.emit();
            expect(closed).toBe(true);
        });
    });
});
