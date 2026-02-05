import { Router, Response } from 'express';
import type { Router as RouterType } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router: RouterType = Router();

// Supported streaming services with TMDB provider IDs
// Note: TMDB ID 337 is "JioHotstar" in India market (formerly Disney+ Hotstar)
export const SUPPORTED_SERVICES = [
    { id: 'netflix', name: 'Netflix', providerId: 8 },
    { id: 'prime', name: 'Amazon Prime Video', providerId: 9 },
    { id: 'jiohotstar', name: 'JioHotstar', providerId: 337 },
    { id: 'hbo', name: 'HBO Max', providerId: 384 },
    { id: 'hulu', name: 'Hulu', providerId: 15 },
    { id: 'apple', name: 'Apple TV+', providerId: 350 },
    { id: 'paramount', name: 'Paramount+', providerId: 531 }
];

/**
 * GET /api/user/services
 * Returns the user's selected streaming services
 */
router.get('/services', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ services: user.services });
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({ error: 'Failed to get services' });
    }
});

/**
 * PUT /api/user/services
 * Updates the user's selected streaming services
 * Body: { services: string[] }
 */
router.put('/services', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { services } = req.body;

        // Validate services array
        if (!Array.isArray(services)) {
            res.status(400).json({ error: 'Services must be an array' });
            return;
        }

        // Validate each service ID
        const validServiceIds = SUPPORTED_SERVICES.map(s => s.id);
        const invalidServices = services.filter(s => !validServiceIds.includes(s));
        if (invalidServices.length > 0) {
            res.status(400).json({
                error: 'Invalid services',
                invalid: invalidServices,
                valid: validServiceIds
            });
            return;
        }

        const user = await User.findOneAndUpdate(
            { firebaseUid: uid },
            { services },
            { new: true }
        );

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        console.log('✅ Services updated for user:', user.email, services);
        res.json({ message: 'Services updated', services: user.services });
    } catch (error) {
        console.error('Error updating services:', error);
        res.status(500).json({ error: 'Failed to update services' });
    }
});

/**
 * GET /api/user/services/available
 * Returns list of all supported streaming services
 */
router.get('/services/available', (_req, res: Response) => {
    res.json({ services: SUPPORTED_SERVICES });
});

export default router;
