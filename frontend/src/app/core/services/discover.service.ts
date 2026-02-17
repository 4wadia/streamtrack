import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface Vibe {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
}

export interface ContentItem {
    id: string;
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string;
    rating: number;
    voteCount: number;
    genreIds: number[];
    genres?: string[];
    runtime?: number;
    watchProviders?: string[];
}

export interface DiscoverResponse {
    results: ContentItem[];
    vibe: Vibe;
    type: string;
    page: number;
    userServices: string[];
    filtered: boolean;
}

export interface TonightsPickResponse {
    pick: ContentItem | null;
    reason: string;
}

@Injectable({
    providedIn: 'root'
})
export class DiscoverService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    async getGenres(): Promise<{ id: number; name: string }[]> {
        const response = await firstValueFrom(
            this.http.get<{ genres: { id: number; name: string }[] }>(
                `${environment.apiUrl}/discover/genres`
            )
        );
        return response?.genres || [];
    }

    async getRecommendations(): Promise<ContentItem[]> {
        const response = await firstValueFrom(
            this.http.get<{ recommendations: ContentItem[] }>(
                `${environment.apiUrl}/discover/recommendations`
            )
        );
        return response?.recommendations || [];
    }


    /**
     * Get all available vibes
     */
    async getVibes(): Promise<Vibe[]> {
        try {
            const response = await firstValueFrom(
                this.http.get<{ vibes: Vibe[] }>(
                    `${environment.apiUrl}/discover/vibes`
                )
            );
            return response?.vibes || [];
        } catch (error) {
            console.error('Error fetching vibes:', error);
            return [];
        }
    }

    /**
     * Discover content by vibe (requires auth)
     */
    async discoverByVibe(
        vibe: string,
        type: 'movie' | 'tv' = 'movie',
        page = 1
    ): Promise<DiscoverResponse | null> {
        try {
            const token = await this.authService.getIdToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await firstValueFrom(
                this.http.get<DiscoverResponse>(
                    `${environment.apiUrl}/discover`,
                    {
                        headers: this.getAuthHeaders(token),
                        params: { vibe, type, page: String(page) }
                    }
                )
            );
            return response || null;
        } catch (error) {
            console.error('Error discovering content:', error);
            return null;
        }
    }

    /**
     * Get tonight's pick recommendation
     */
    async getTonightsPick(): Promise<TonightsPickResponse | null> {
        try {
            const token = await this.authService.getIdToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await firstValueFrom(
                this.http.get<TonightsPickResponse>(
                    `${environment.apiUrl}/discover/tonight`,
                    { headers: this.getAuthHeaders(token) }
                )
            );
            return response || null;
        } catch (error) {
            console.error('Error getting tonight\'s pick:', error);
            return null;
        }
    }

    /**
     * Search content
     */
    async search(query: string, page = 1): Promise<ContentItem[]> {
        try {
            const response = await firstValueFrom(
                this.http.get<{ results: ContentItem[] }>(
                    `${environment.apiUrl}/content/search`,
                    { params: { q: query, page: String(page) } }
                )
            );
            return response?.results || [];
        } catch (error) {
            console.error('Error searching:', error);
            return [];
        }
    }

    /**
     * Get trending content
     */
    async getTrending(type: 'movie' | 'tv' | 'all' = 'all'): Promise<ContentItem[]> {
        try {
            const response = await firstValueFrom(
                this.http.get<{ results: ContentItem[] }>(
                    `${environment.apiUrl}/content/trending`,
                    { params: { type } }
                )
            );
            return response?.results || [];
        } catch (error) {
            console.error('Error getting trending:', error);
            return [];
        }
    }

    private getAuthHeaders(token: string): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }
}
