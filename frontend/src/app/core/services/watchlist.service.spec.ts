import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WatchlistService, WatchlistItem } from './watchlist.service';

const baseUrl = 'http://localhost:3000/api/watchlist';

const mockItem: WatchlistItem = {
    contentId: 'abc123',
    title: 'Inception',
    type: 'movie',
    status: 'want',
    addedAt: new Date('2024-01-01')
};

const mockItem2: WatchlistItem = {
    contentId: 'def456',
    title: 'Breaking Bad',
    type: 'tv',
    status: 'watching',
    addedAt: new Date('2024-01-02')
};

describe('WatchlistService', () => {
    let service: WatchlistService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                WatchlistService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });

        service = TestBed.inject(WatchlistService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with empty watchlist signal', () => {
        expect(service.watchlist()).toEqual([]);
    });

    describe('computed signals', () => {
        it('wantToWatch should return only want status items', async () => {
            const loadPromise = firstValueFrom(service.loadWatchlist());
            const req = httpMock.expectOne(baseUrl);
            req.flush({ watchlist: [mockItem, mockItem2] });
            await loadPromise;

            expect(service.wantToWatch()).toEqual([mockItem]);
        });

        it('watching should return only watching status items', async () => {
            const loadPromise = firstValueFrom(service.loadWatchlist());
            const req = httpMock.expectOne(baseUrl);
            req.flush({ watchlist: [mockItem, mockItem2] });
            await loadPromise;

            expect(service.watching()).toEqual([mockItem2]);
        });

        it('watched should return only watched status items', async () => {
            const watchedItem: WatchlistItem = { ...mockItem, contentId: 'xyz', status: 'watched' };

            const loadPromise = firstValueFrom(service.loadWatchlist());
            const req = httpMock.expectOne(baseUrl);
            req.flush({ watchlist: [mockItem, watchedItem] });
            await loadPromise;

            expect(service.watched()).toEqual([watchedItem]);
        });
    });

    describe('loadWatchlist', () => {
        it('should load items and update the signal', async () => {
            const loadPromise = firstValueFrom(service.loadWatchlist());
            const req = httpMock.expectOne(baseUrl);
            expect(req.request.method).toBe('GET');
            req.flush({ watchlist: [mockItem, mockItem2] });
            const items = await loadPromise;

            expect(items).toEqual([mockItem, mockItem2]);
            expect(service.watchlist()).toEqual([mockItem, mockItem2]);
        });

        it('should return empty array and not throw on HTTP error', async () => {
            const loadPromise = firstValueFrom(service.loadWatchlist());
            const req = httpMock.expectOne(baseUrl);
            req.flush('Error', { status: 500, statusText: 'Server Error' });
            const items = await loadPromise;

            expect(items).toEqual([]);
        });
    });

    describe('addToWatchlist', () => {
        it('should add item to watchlist signal', async () => {
            const addPromise = firstValueFrom(service.addToWatchlist({
                contentId: mockItem.contentId,
                title: mockItem.title,
                type: mockItem.type,
                status: 'want'
            }));

            const req = httpMock.expectOne(baseUrl);
            expect(req.request.method).toBe('POST');
            req.flush({ message: 'Added', item: mockItem });
            const item = await addPromise;

            expect(item).toEqual(mockItem);
            expect(service.watchlist()).toContainEqual(mockItem);
        });

        it('should prepend new item to beginning of list', async () => {
            service['watchlistSignal'].set([mockItem2]);

            const addPromise = firstValueFrom(service.addToWatchlist({
                contentId: mockItem.contentId,
                title: mockItem.title,
                type: mockItem.type
            }));

            const req = httpMock.expectOne(baseUrl);
            req.flush({ message: 'Added', item: mockItem });
            await addPromise;

            expect(service.watchlist()[0].contentId).toBe(mockItem.contentId);
        });
    });

    describe('updateItem', () => {
        it('should update item in signal', async () => {
            service['watchlistSignal'].set([mockItem]);
            const updatedItem = { ...mockItem, status: 'watched' as const };

            const updatePromise = firstValueFrom(
                service.updateItem(mockItem.contentId, { status: 'watched' })
            );

            const req = httpMock.expectOne(`${baseUrl}/${mockItem.contentId}`);
            expect(req.request.method).toBe('PUT');
            req.flush({ message: 'Updated', item: updatedItem });
            const item = await updatePromise;

            expect(item.status).toBe('watched');
            expect(service.watchlist()[0].status).toBe('watched');
        });
    });

    describe('removeFromWatchlist', () => {
        it('should remove item from signal', async () => {
            service['watchlistSignal'].set([mockItem, mockItem2]);

            const removePromise = firstValueFrom(
                service.removeFromWatchlist(mockItem.contentId)
            );

            const req = httpMock.expectOne(`${baseUrl}/${mockItem.contentId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
            await removePromise;

            expect(service.watchlist().length).toBe(1);
            expect(service.watchlist()[0].contentId).toBe(mockItem2.contentId);
        });
    });

    describe('isInWatchlist', () => {
        it('should return true when item exists', () => {
            service['watchlistSignal'].set([mockItem]);
            expect(service.isInWatchlist(mockItem.contentId)).toBe(true);
        });

        it('should return false when item does not exist', () => {
            service['watchlistSignal'].set([mockItem]);
            expect(service.isInWatchlist('nonexistent')).toBe(false);
        });

        it('should return false for empty watchlist', () => {
            expect(service.isInWatchlist(mockItem.contentId)).toBe(false);
        });
    });

    describe('getItem', () => {
        it('should return item when it exists', () => {
            service['watchlistSignal'].set([mockItem, mockItem2]);
            expect(service.getItem(mockItem.contentId)).toEqual(mockItem);
        });

        it('should return undefined when item does not exist', () => {
            service['watchlistSignal'].set([mockItem]);
            expect(service.getItem('nonexistent')).toBeUndefined();
        });
    });
});
