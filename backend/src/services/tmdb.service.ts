/**
 * TMDB Service - Handles all TMDB API interactions with caching
 */

// Simple LRU Cache implementation
class LRUCache<T> {
    private cache = new Map<string, { value: T; timestamp: number }>();
    private maxSize: number;
    private ttlMs: number;

    constructor(maxSize = 100, ttlMs = 10 * 60 * 1000) { // 10 min default TTL
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }

    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        // Check TTL
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return undefined;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.value;
    }

    set(key: string, value: T): void {
        // Remove if exists (to update position)
        this.cache.delete(key);

        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldest = this.cache.keys().next().value;
            if (oldest) this.cache.delete(oldest);
        }

        this.cache.set(key, { value, timestamp: Date.now() });
    }

    clear(): void {
        this.cache.clear();
    }
}

// Response types
export interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    media_type?: string;
}

export interface TMDBTVShow {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    media_type?: string;
}

export interface TMDBSearchResult {
    page: number;
    total_pages: number;
    total_results: number;
    results: (TMDBMovie | TMDBTVShow)[];
}

export interface TMDBWatchProvider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
}

export interface TMDBWatchProviders {
    link?: string;
    flatrate?: TMDBWatchProvider[];
    rent?: TMDBWatchProvider[];
    buy?: TMDBWatchProvider[];
}

export interface TMDBContentDetails {
    id: number;
    title?: string;         // Movie
    name?: string;          // TV
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;  // Movie
    first_air_date?: string; // TV
    vote_average: number;
    vote_count: number;
    genres: { id: number; name: string }[];
    runtime?: number;       // Movie
    episode_run_time?: number[]; // TV
    status: string;
    tagline?: string;
    watchProviders?: TMDBWatchProviders;
}

// Normalized content format for frontend
export interface ContentItem {
    id: string;
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    genres?: string[];
    runtime?: number;
    watchProviders?: string[];
}

class TMDBService {
    private apiKey: string;
    private readAccessToken: string;
    private isV4Token: boolean;
    private baseUrl = 'https://api.themoviedb.org/3';
    private imageBaseUrl = 'https://image.tmdb.org/t/p';
    private cache = new LRUCache<any>(200);
    private region = 'IN'; // Default region for watch providers

    constructor() {
        this.apiKey = process.env.TMDB_API_KEY || '';
        this.readAccessToken = process.env.TMDB_READ_ACCESS_TOKEN || '';
        // Prefer read access token (v4) over API key (v3)
        const effectiveToken = this.readAccessToken || this.apiKey;
        // JWT tokens (v4) are much longer than v3 hex keys (32 chars)
        this.isV4Token = effectiveToken.length > 40;
        if (!effectiveToken) {
            console.warn('⚠️ TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN not set - content features will not work');
        }
    }

    private async fetchWithRetry<T>(url: string, options: RequestInit, maxRetries = 3): Promise<T> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🎬 TMDB API Request [${attempt}/${maxRetries}]: ${options.method || 'GET'} ${url}`);
                
                const response = await fetch(url, {
                    ...options,
                    signal: AbortSignal.timeout(10000) // 10-second timeout
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    const error = new Error(`TMDB API error: ${response.status} ${response.statusText} - ${errorText}`);
                    console.error(`❌ TMDB API Error [${attempt}/${maxRetries}]:`, {
                        status: response.status,
                        statusText: response.statusText,
                        url,
                        errorText
                    });
                    throw error;
                }

                console.log(`✅ TMDB API Success [${attempt}/${maxRetries}]: ${response.status} ${url}`);
                return await response.json() as T;
            } catch (error) {
                console.error(`❌ TMDB Fetch Error [${attempt}/${maxRetries}]:`, {
                    url,
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined
                });

                if (attempt === maxRetries) {
                    throw new Error(`TMDB API failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`);
                }

                // Exponential backoff: 500ms, 1000ms, 2000ms
                const delay = 500 * Math.pow(2, attempt - 1);
                console.log(`⏳ Retrying TMDB request in ${delay}ms... [${attempt}/${maxRetries}]`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new Error('TMDB fetchWithRetry failed unexpectedly');
    }

    private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
        const queryParams = new URLSearchParams(params);
        const effectiveToken = this.readAccessToken || this.apiKey;

        // For v3 keys, pass as query param; for v4 tokens, use Authorization header
        if (!this.isV4Token) {
            queryParams.set('api_key', effectiveToken);
        }

        const url = `${this.baseUrl}${endpoint}?${queryParams}`;
        const cacheKey = url;

        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached) {
            console.log(`🎯 TMDB Cache Hit: ${endpoint}`);
            return cached as T;
        }

        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (this.isV4Token) {
            headers['Authorization'] = `Bearer ${effectiveToken}`;
        }

        const data = await this.fetchWithRetry<T>(url, { headers });
        this.cache.set(cacheKey, data);
        return data;
    }

    /**
     * Search for movies and TV shows
     */
    async search(query: string, page = 1): Promise<ContentItem[]> {
        const data = await this.fetch<TMDBSearchResult>('/search/multi', {
            query,
            page: String(page),
            include_adult: 'false'
        });

        return data.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => this.normalizeResult(item));
    }

    /**
     * Get content details by ID
     */
    async getDetails(id: number, type: 'movie' | 'tv'): Promise<ContentItem | null> {
        try {
            const [details, providers] = await Promise.all([
                this.fetch<TMDBContentDetails>(`/${type}/${id}`),
                this.getWatchProviders(id, type)
            ]);

            return this.normalizeDetails(details, type, providers);
        } catch (error) {
            console.error(`Error fetching ${type} ${id}:`, error);
            return null;
        }
    }

    /**
     * Get watch providers for content
     */
    async getWatchProviders(id: number, type: 'movie' | 'tv'): Promise<string[]> {
        try {
            const data = await this.fetch<{ results: Record<string, TMDBWatchProviders> }>(
                `/${type}/${id}/watch/providers`
            );

            const regionData = data.results[this.region];
            if (!regionData?.flatrate) return [];

            // Map provider IDs to our internal service IDs
            return regionData.flatrate
                .map(p => this.mapProviderId(p.provider_id))
                .filter((id): id is string => id !== null);
        } catch {
            return [];
        }
    }

    /**
     * Discover content with filters
     */
    async discover(
        type: 'movie' | 'tv',
        options: {
            genres?: number[];
            providers?: number[];
            minRating?: number;
            page?: number;
            sortBy?: string;
        } = {}
    ): Promise<ContentItem[]> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            sort_by: options.sortBy || 'popularity.desc',
            'vote_count.gte': '50', // Minimum votes for quality
            watch_region: this.region
        };

        if (options.genres?.length) {
            params.with_genres = options.genres.join(',');
        }
        if (options.providers?.length) {
            params.with_watch_providers = options.providers.join('|');
        }
        if (options.minRating) {
            params['vote_average.gte'] = String(options.minRating);
        }

        const data = await this.fetch<TMDBSearchResult>(`/discover/${type}`, params);
        return data.results.map(item => this.normalizeResult(item, type));
    }

    /**
     * Get trending content
     */
    async getTrending(type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<ContentItem[]> {
        const data = await this.fetch<TMDBSearchResult>(`/trending/${type}/${timeWindow}`);
        return data.results.map(item => this.normalizeResult(item));
    }

    /**
     * Get genres list (movies + tv combined)
     */
    async getGenres(): Promise<{ id: number; name: string }[]> {
        const cacheKey = 'tmdb_genres';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached as { id: number; name: string }[];

        try {
            const [movieGenres, tvGenres] = await Promise.all([
                this.fetch<{ genres: { id: number; name: string }[] }>('/genre/movie/list'),
                this.fetch<{ genres: { id: number; name: string }[] }>('/genre/tv/list')
            ]);

            // Merge and deduplicate
            const genreMap = new Map<number, string>();
            movieGenres.genres.forEach(g => genreMap.set(g.id, g.name));
            tvGenres.genres.forEach(g => genreMap.set(g.id, g.name));

            const genres = Array.from(genreMap.entries()).map(([id, name]) => ({ id, name }));

            // Sort alphabetically
            genres.sort((a, b) => a.name.localeCompare(b.name));

            this.cache.set(cacheKey, genres);
            return genres;
        } catch (error) {
            console.error('Error fetching genres:', error);
            return [];
        }
    }

    /**
     * Normalize TMDB search result to our format
     */
    private normalizeResult(item: TMDBMovie | TMDBTVShow, forceType?: 'movie' | 'tv'): ContentItem {
        const isMovie = forceType === 'movie' || ('title' in item);
        const type = forceType || (isMovie ? 'movie' : 'tv');

        return {
            id: `${type}-${item.id}`,
            tmdbId: item.id,
            type,
            title: isMovie ? (item as TMDBMovie).title : (item as TMDBTVShow).name,
            name: !isMovie ? (item as TMDBTVShow).name : undefined,
            overview: item.overview,
            poster_path: item.poster_path ? `${this.imageBaseUrl}/w500${item.poster_path}` : null,
            backdrop_path: item.backdrop_path ? `${this.imageBaseUrl}/w1280${item.backdrop_path}` : null,
            release_date: isMovie ? (item as TMDBMovie).release_date : undefined,
            first_air_date: !isMovie ? (item as TMDBTVShow).first_air_date : undefined,
            vote_average: Math.round(item.vote_average * 10) / 10,
            vote_count: item.vote_count,
            genre_ids: item.genre_ids
        };
    }

    /**
     * Normalize TMDB details to our format
     */
    private normalizeDetails(
        item: TMDBContentDetails,
        type: 'movie' | 'tv',
        watchProviders: string[]
    ): ContentItem {
        const isMovie = type === 'movie';

        return {
            id: `${type}-${item.id}`,
            tmdbId: item.id,
            type,
            title: isMovie ? item.title! : item.name!,
            name: !isMovie ? item.name : undefined,
            overview: item.overview,
            poster_path: item.poster_path ? `${this.imageBaseUrl}/w500${item.poster_path}` : null,
            backdrop_path: item.backdrop_path ? `${this.imageBaseUrl}/w1280${item.backdrop_path}` : null,
            release_date: isMovie ? item.release_date : undefined,
            first_air_date: !isMovie ? item.first_air_date : undefined,
            vote_average: Math.round(item.vote_average * 10) / 10,
            vote_count: item.vote_count,
            genre_ids: item.genres.map(g => g.id),
            genres: item.genres.map(g => g.name),
            runtime: isMovie ? item.runtime : item.episode_run_time?.[0],
            watchProviders
        };
    }

    /**
     * Map TMDB provider ID to our internal service ID
     */
    private mapProviderId(tmdbId: number): string | null {
        const mapping: Record<number, string> = {
            8: 'netflix',
            9: 'prime',
            337: 'jiohotstar',
            384: 'hbo',
            15: 'hulu',
            350: 'apple',
            531: 'paramount'
        };
        return mapping[tmdbId] || null;
    }

    /**
     * Get our internal provider IDs as TMDB provider IDs
     * Note: TMDB ID 337 is "JioHotstar" in India market (formerly Disney+ Hotstar)
     */
    getProviderTmdbIds(serviceIds: string[]): number[] {
        const mapping: Record<string, number> = {
            'netflix': 8,
            'prime': 9,
            'jiohotstar': 337,  // India: JioHotstar (formerly Disney+ Hotstar)
            'hbo': 384,
            'hulu': 15,
            'apple': 350,
            'paramount': 531
        };
        return serviceIds.map(id => mapping[id]).filter((id): id is number => id !== undefined);
    }
}

// Export singleton instance
export const tmdbService = new TMDBService();
