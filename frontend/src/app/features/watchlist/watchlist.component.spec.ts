import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { WatchlistComponent } from './watchlist.component';
import { WatchlistService, WatchlistItem } from '../../core/services/watchlist.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('WatchlistComponent', () => {
    let component: WatchlistComponent;
    let fixture: ComponentFixture<WatchlistComponent>;
    let mockWatchlistService: any;
    let watchlistSignal: any;

    const mockItems: WatchlistItem[] = [
        {
            contentId: '1',
            title: 'Movie 1',
            type: 'movie',
            status: 'want',
            addedAt: new Date()
        },
        {
            contentId: '2',
            title: 'Series 1',
            type: 'tv',
            status: 'watching',
            addedAt: new Date()
        }
    ];

    beforeEach(async () => {
        watchlistSignal = signal(mockItems);

        mockWatchlistService = {
            watchlist: watchlistSignal.asReadonly(),
            loadWatchlist: vi.fn().mockReturnValue(of(mockItems)),
            updateItem: vi.fn().mockReturnValue(of({})),
            removeFromWatchlist: vi.fn().mockReturnValue(of({}))
        };

        await TestBed.configureTestingModule({
            imports: [WatchlistComponent],
            providers: [
                { provide: WatchlistService, useValue: mockWatchlistService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(WatchlistComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load watchlist on init', () => {
        expect(mockWatchlistService.loadWatchlist).toHaveBeenCalled();
        expect(component.isLoading()).toBe(false);
    });

    it('should filter items based on active tab', () => {
        // Default is 'all'
        expect(component.filteredItems().length).toBe(2);

        // Switch to 'want'
        component.activeTab.set('want');
        fixture.detectChanges();
        expect(component.filteredItems().length).toBe(1);
        expect(component.filteredItems()[0].status).toBe('want');

        // Switch to 'watching'
        component.activeTab.set('watching');
        fixture.detectChanges();
        expect(component.filteredItems().length).toBe(1);
        expect(component.filteredItems()[0].status).toBe('watching');

        // Switch to 'watched'
        component.activeTab.set('watched');
        fixture.detectChanges();
        expect(component.filteredItems().length).toBe(0);
    });

    it('should calculate tab counts correctly', () => {
        const counts = component.tabCounts();
        expect(counts.all).toBe(2);
        expect(counts.want).toBe(1);
        expect(counts.watching).toBe(1);
        expect(counts.watched).toBe(0);
    });

    it('should call updateStatus', () => {
        component.updateStatus('1', 'watched');
        expect(mockWatchlistService.updateItem).toHaveBeenCalledWith('1', { status: 'watched' });
    });

    it('should call removeFromWatchlist when confirmed', () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        component.removeItem('1');
        expect(mockWatchlistService.removeFromWatchlist).toHaveBeenCalledWith('1');
        confirmSpy.mockRestore();
    });

    it('should NOT call removeFromWatchlist when not confirmed', () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        component.removeItem('1');
        expect(mockWatchlistService.removeFromWatchlist).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
    });
});
