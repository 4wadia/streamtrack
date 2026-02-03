import { Router, Response } from 'express';
import type { Router as RouterType } from 'express';
import { vibeService } from '../services/vibe.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';

const router: RouterType = Router();

/**
 * GET /api/discover/vibes
 * Get list of all available vibes
 */
router.get('/vibes', (_req, res: Response) => {
    const vibes = vibeService.getVibes();
    res.json({ vibes });
});

/**
 * GET /api/discover
 * Discover content by vibe
 * Query params: vibe (required), type (movie|tv), page
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { vibe, type, page } = req.query;

        if (!vibe || typeof vibe !== 'string') {
            res.status(400).json({ error: 'Query parameter "vibe" is required' });
            return;
        }

        // Get user's services
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        const userServices = user?.services || [];

        const contentType = (type as 'movie' | 'tv') || 'movie';
        const pageNum = parseInt(String(page)) || 1;

        const { results, vibe: vibeInfo } = await vibeService.discoverByVibe(
            vibe,
            userServices,
            contentType,
            pageNum
        );

        if (!vibeInfo) {
            res.status(400).json({
                error: 'Invalid vibe',
                available: vibeService.getVibes().map(v => v.id)
            });
            return;
        }

        res.json({
            results,
            vibe: vibeInfo,
            type: contentType,
            page: pageNum,
            userServices,
            filtered: userServices.length > 0
        });
    } catch (error) {
        console.error('Discover error:', error);
        res.status(500).json({ error: 'Discovery failed' });
    }
});

/**
 * GET /api/discover/tonight
 * Get tonight's pick recommendation (requires auth)
 */
router.get('/tonight', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Get watchlist TMDB IDs to exclude already saved content
        const watchlistTmdbIds = user.watchlist
            .map(item => parseInt(item.contentId))
            .filter(id => !isNaN(id));

        const { pick, reason } = await vibeService.getTonightsPick(
            user.services,
            watchlistTmdbIds
        );

        if (!pick) {
            res.json({
                pick: null,
                reason: 'No recommendations available',
                suggestion: 'Try adding more streaming services'
            });
            return;
        }

        res.json({ pick, reason });
    } catch (error) {
        console.error('Tonight\'s pick error:', error);
        res.status(500).json({ error: 'Failed to get tonight\'s pick' });
    }
});

export default router;
