import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable, tap, catchError, of } from 'rxjs';

export interface WatchlistItem {
    contentId: string;
    title: string;
    type: 'movie' | 'tv';
    posterPath?: string;
    status: 'want' | 'watching' | 'watched';
    rating?: number;
    notes?: string;
    addedAt: Date;
    updatedAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class WatchlistService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/watchlist`;

    // Signals for state management
    private watchlistSignal = signal<WatchlistItem[]>([]);
    readonly watchlist = this.watchlistSignal.asReadonly();

    readonly wantToWatch = computed(() =>
        this.watchlistSignal().filter(item => item.status === 'want')
    );

    readonly watching = computed(() =>
        this.watchlistSignal().filter(item => item.status === 'watching')
    );

    readonly watched = computed(() =>
        this.watchlistSignal().filter(item => item.status === 'watched')
    );



    /**
     * Fetch all watchlist items
     */
    loadWatchlist(): Observable<WatchlistItem[]> {
        return this.http.get<{ watchlist: WatchlistItem[] }>(this.apiUrl).pipe(
            map(response => response.watchlist),
            tap(items => this.watchlistSignal.set(items)),
            catchError(err => {
                console.error('Failed to load watchlist', err);
                return of([]);
            })
        );
    }

    /**
     * Add item to watchlist
     */
    addToWatchlist(item: {
        contentId: string;
        title: string;
        type: 'movie' | 'tv';
        posterPath?: string;
        status?: 'want' | 'watching' | 'watched';
    }): Observable<WatchlistItem> {
        return this.http.post<{ message: string; item: WatchlistItem }>(this.apiUrl, item).pipe(
            map(res => res.item),
            tap(newItem => {
                this.watchlistSignal.update(items => [newItem, ...items]);
            })
        );
    }

    /**
     * Update item status or details
     */
    updateItem(contentId: string, updates: Partial<WatchlistItem>): Observable<WatchlistItem> {
        return this.http.put<{ message: string; item: WatchlistItem }>(`${this.apiUrl}/${contentId}`, updates).pipe(
            map(res => res.item),
            tap(updatedItem => {
                this.watchlistSignal.update(items =>
                    items.map(item => item.contentId === contentId ? updatedItem : item)
                );
            })
        );
    }

    /**
     * Remove item from watchlist
     */
    removeFromWatchlist(contentId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${contentId}`).pipe(
            tap(() => {
                this.watchlistSignal.update(items =>
                    items.filter(item => item.contentId !== contentId)
                );
            })
        );
    }

    /**
     * Check if an item is in the watchlist
     */
    isInWatchlist(contentId: string): boolean {
        return this.watchlistSignal().some(item => item.contentId === contentId);
    }

    /**
     * Get item from watchlist
     */
    getItem(contentId: string): WatchlistItem | undefined {
        return this.watchlistSignal().find(item => item.contentId === contentId);
    }
}
