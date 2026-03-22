/**
 * Vibe Service - Maps vibes to genre combinations and TMDB discover parameters
 */

import { tmdbService, ContentItem } from './tmdb.service';

// TMDB Genre IDs
export const GENRE_IDS = {
    ACTION: 28,
    ANIMATION: 16,
    COMEDY: 35,
    CRIME: 80,
    DOCUMENTARY: 99,
    DRAMA: 18,
    HORROR: 27,
    MYSTERY: 9648,
    ROMANCE: 10749,
    THRILLER: 53,
    FAMILY: 10751,
    FANTASY: 14,
    SCIFI: 878,
    WAR: 10752
} as const;

// Vibe definition
export interface VibeDefinition {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    genres: number[];
    excludeGenres?: number[];
    minRating?: number;
    maxRuntime?: number;
}

// Vibe configurations
export const VIBE_MAP: Record<string, VibeDefinition> = {
    cozy: {
        id: 'cozy',
        name: 'Cozy',
        icon: 'coffee',
        color: '#f472b6',
        description: 'Warm and comforting content for relaxing',
        genres: [GENRE_IDS.ROMANCE, GENRE_IDS.COMEDY, GENRE_IDS.ANIMATION, GENRE_IDS.FAMILY],
        excludeGenres: [GENRE_IDS.HORROR, GENRE_IDS.THRILLER, GENRE_IDS.CRIME],
        minRating: 7.0
    },
    intense: {
        id: 'intense',
        name: 'Intense',
        icon: 'zap',
        color: '#ef4444',
        description: 'Edge-of-your-seat thrills and action',
        genres: [GENRE_IDS.THRILLER, GENRE_IDS.ACTION, GENRE_IDS.CRIME],
        minRating: 7.5
    },
    mindless: {
        id: 'mindless',
        name: 'Mindless',
        icon: 'gamepad-2',
        color: '#fbbf24',
        description: 'Easy watching, no brainpower required',
        genres: [GENRE_IDS.COMEDY, GENRE_IDS.ANIMATION],
        minRating: 6.0,
        maxRuntime: 100
    },
    thoughtful: {
        id: 'thoughtful',
        name: 'Thoughtful',
        icon: 'lightbulb',
        color: '#3b82f6',
        description: 'Stimulating content that makes you think',
        genres: [GENRE_IDS.DOCUMENTARY, GENRE_IDS.DRAMA, GENRE_IDS.MYSTERY],
        minRating: 7.5
    },
    dark: {
        id: 'dark',
        name: 'Dark',
        icon: 'moon',
        color: '#8b5cf6',
        description: 'Moody, mysterious, and atmospheric',
        genres: [GENRE_IDS.HORROR, GENRE_IDS.THRILLER, GENRE_IDS.MYSTERY],
        minRating: 6.5
    },
    funny: {
        id: 'funny',
        name: 'Funny',
        icon: 'smile',
        color: '#f97316',
        description: 'Guaranteed laughs and good times',
        genres: [GENRE_IDS.COMEDY],
        minRating: 7.0
    }
};

class VibeService {
    /**
     * Get all available vibes
     */
    getVibes(): VibeDefinition[] {
        return Object.values(VIBE_MAP);
    }

    /**
     * Get a specific vibe by ID
     */
    getVibe(vibeId: string): VibeDefinition | undefined {
        return VIBE_MAP[vibeId];
    }

    /**
     * Discover content by vibe, filtered by user's services
     */
    async discoverByVibe(
        vibeId: string,
        userServices: string[],
        type: 'movie' | 'tv' = 'movie',
        page = 1
    ): Promise<{ results: ContentItem[]; vibe: VibeDefinition | undefined }> {
        const vibe = VIBE_MAP[vibeId];

        if (!vibe) {
            return { results: [], vibe: undefined };
        }

        // Convert user services to TMDB provider IDs
        const providerIds = tmdbService.getProviderTmdbIds(userServices);

        // Discover content with vibe filters
        const results = await tmdbService.discover(type, {
            genres: vibe.genres,
            providers: providerIds.length > 0 ? providerIds : undefined,
            minRating: vibe.minRating,
            page,
            sortBy: 'popularity.desc'
        });

        // Filter out excluded genres if any
        let filteredResults = results;
        if (vibe.excludeGenres && vibe.excludeGenres.length > 0) {
            filteredResults = results.filter(item =>
                !item.genre_ids.some(g => vibe.excludeGenres!.includes(g))
            );
        }

        // Filter by runtime if specified
        if (vibe.maxRuntime && type === 'movie') {
            // Note: Runtime filtering would need content details - for now skip
            // This could be enhanced with parallel detail fetches
        }

        return { results: filteredResults, vibe };
    }

    /**
     * Discover content by custom vibe (user-defined)
     */
    async discoverByCustomVibe(
        customVibe: { id: string; name: string; genres: number[]; minRating?: number; color?: string },
        userServices: string[],
        type: 'movie' | 'tv' = 'movie',
        page = 1
    ): Promise<{ results: ContentItem[]; vibe: VibeDefinition }> {
        // Convert custom vibe to VibeDefinition format
        const vibeDefinition: VibeDefinition = {
            id: `custom-${customVibe.id}`,
            name: customVibe.name,
            icon: 'sparkles',
            color: customVibe.color || '#6366f1', // Default indigo
            description: `Custom vibe: ${customVibe.name}`,
            genres: customVibe.genres,
            minRating: customVibe.minRating
        };

        // Convert user services to TMDB provider IDs
        const providerIds = tmdbService.getProviderTmdbIds(userServices);

        // Discover content with custom vibe filters
        const results = await tmdbService.discover(type, {
            genres: customVibe.genres,
            providers: providerIds.length > 0 ? providerIds : undefined,
            minRating: customVibe.minRating,
            page,
            sortBy: 'popularity.desc'
        });

        return { results, vibe: vibeDefinition };
    }

    /**
     * Get "Tonight's Pick" - personalized recommendation
     */
    async getTonightsPick(
        userServices: string[],
        watchlistTmdbIds: number[] = []
    ): Promise<{ pick: ContentItem | null; reason: string }> {
        const hour = new Date().getHours();

        // Determine vibe based on time of day
        let vibeId: string;
        let reason: string;

        if (hour >= 22 || hour < 2) {
            // Late night: mindless or dark
            vibeId = Math.random() > 0.5 ? 'mindless' : 'dark';
            reason = "Perfect for late night viewing";
        } else if (hour >= 18 && hour < 22) {
            // Prime time: intense or thoughtful
            vibeId = Math.random() > 0.5 ? 'intense' : 'thoughtful';
            reason = "Great choice for your evening";
        } else if (hour >= 6 && hour < 12) {
            // Morning: cozy or funny
            vibeId = Math.random() > 0.5 ? 'cozy' : 'funny';
            reason = "A great way to start your day";
        } else {
            // Afternoon: mindless or funny
            vibeId = Math.random() > 0.5 ? 'mindless' : 'funny';
            reason = "Perfect for an afternoon break";
        }

        const { results, vibe } = await this.discoverByVibe(vibeId, userServices, 'movie', 1);

        if (results.length === 0) {
            return { pick: null, reason: "No recommendations available" };
        }

        // Filter out items already in watchlist
        const unwatched = results.filter(item => !watchlistTmdbIds.includes(item.tmdbId));

        // Pick a random item from top 5
        const topPicks = unwatched.length > 0 ? unwatched.slice(0, 5) : results.slice(0, 5);
        const pick = topPicks[Math.floor(Math.random() * topPicks.length)];

        return {
            pick,
            reason: `${reason} — ${vibe?.name.toLowerCase()} vibes`
        };
    }
    /**
     * Get recommendations based on genres (for onboarding)
     */
    async getOnboardingRecommendations(
        genres: number[],
        userServices: string[],
        page = 1
    ): Promise<ContentItem[]> {
        // Convert user services to TMDB provider IDs
        const providerIds = tmdbService.getProviderTmdbIds(userServices);

        // Discover content
        const results = await tmdbService.discover('movie', {
            genres,
            providers: providerIds.length > 0 ? providerIds : undefined,
            minRating: 7.0, // Good quality baseline
            page,
            sortBy: 'popularity.desc'
        });

        return results;
    }
}

export const vibeService = new VibeService();
