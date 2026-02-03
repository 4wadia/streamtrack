import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { tmdbService } from '../services/tmdb.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';

const router: RouterType = Router();

/**
 * GET /api/content/search
 * Search for movies and TV shows
 * Query params: q (required), page (optional)
 */
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { q, page } = req.query;

        if (!q || typeof q !== 'string') {
            res.status(400).json({ error: 'Query parameter "q" is required' });
            return;
        }

        const pageNum = parseInt(String(page)) || 1;
        const results = await tmdbService.search(q, pageNum);

        res.json({ results, query: q, page: pageNum });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * GET /api/content/trending
 * Get trending movies and TV shows
 * Query params: type (movie|tv|all), time (day|week)
 */
router.get('/trending', async (req: Request, res: Response) => {
    try {
        const type = (req.query.type as 'movie' | 'tv' | 'all') || 'all';
        const timeWindow = (req.query.time as 'day' | 'week') || 'week';

        const results = await tmdbService.getTrending(type, timeWindow);
        res.json({ results });
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ error: 'Failed to get trending content' });
    }
});

/**
 * GET /api/content/trending/filtered
 * Get trending content filtered by user's services (requires auth)
 */
router.get('/trending/filtered', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });

        if (!user || user.services.length === 0) {
            // No services selected, return unfiltered trending
            const results = await tmdbService.getTrending('all', 'week');
            res.json({ results, filtered: false });
            return;
        }

        // Get trending and filter by user's services
        const trending = await tmdbService.getTrending('all', 'week');

        // Fetch watch providers for each item and filter
        const filteredResults = await Promise.all(
            trending.slice(0, 20).map(async (item) => {
                const providers = await tmdbService.getWatchProviders(item.tmdbId, item.type);
                const hasUserService = providers.some(p => user.services.includes(p));
                return hasUserService ? { ...item, watchProviders: providers } : null;
            })
        );

        res.json({
            results: filteredResults.filter(Boolean),
            filtered: true,
            userServices: user.services
        });
    } catch (error) {
        console.error('Filtered trending error:', error);
        res.status(500).json({ error: 'Failed to get filtered trending' });
    }
});

/**
 * GET /api/content/:type/:id
 * Get details for a specific movie or TV show
 * Params: type (movie|tv), id (TMDB ID)
 */
router.get('/:type/:id', async (req: Request, res: Response) => {
    try {
        const type = req.params.type as string;
        const id = req.params.id as string;

        if (type !== 'movie' && type !== 'tv') {
            res.status(400).json({ error: 'Type must be "movie" or "tv"' });
            return;
        }

        const tmdbId = parseInt(id, 10);
        if (isNaN(tmdbId)) {
            res.status(400).json({ error: 'Invalid ID' });
            return;
        }

        const content = await tmdbService.getDetails(tmdbId, type);

        if (!content) {
            res.status(404).json({ error: 'Content not found' });
            return;
        }

        res.json({ content });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ error: 'Failed to get content details' });
    }
});

/**
 * GET /api/content/:type/:id/providers
 * Get watch providers for specific content
 */
router.get('/:type/:id/providers', async (req: Request, res: Response) => {
    try {
        const type = req.params.type as string;
        const id = req.params.id as string;

        if (type !== 'movie' && type !== 'tv') {
            res.status(400).json({ error: 'Type must be "movie" or "tv"' });
            return;
        }

        const tmdbId = parseInt(id, 10);
        if (isNaN(tmdbId)) {
            res.status(400).json({ error: 'Invalid ID' });
            return;
        }

        const providers = await tmdbService.getWatchProviders(tmdbId, type as 'movie' | 'tv');
        res.json({ providers, tmdbId, type });
    } catch (error) {
        console.error('Get providers error:', error);
        res.status(500).json({ error: 'Failed to get watch providers' });
    }
});

export default router;
