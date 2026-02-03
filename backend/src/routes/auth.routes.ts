import { Router, Response } from 'express';
import type { Router as RouterType } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router: RouterType = Router();

/**
 * POST /api/auth/register
 * Creates or returns user document after Firebase signup
 * Requires Firebase ID token in Authorization header
 */
router.post('/register', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { uid, email } = req.user!;
        const { name } = req.body;

        // Check if user already exists
        let user = await User.findOne({ firebaseUid: uid });

        if (user) {
            res.json({ message: 'User already exists', user });
            return;
        }

        // Create new user
        user = new User({
            firebaseUid: uid,
            email: email || req.body.email,
            name: name || '',
            services: [],
            watchlist: []
        });

        await user.save();
        console.log('✅ New user created:', user.email);

        res.status(201).json({ message: 'User created', user });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

/**
 * POST /api/auth/login
 * Verifies token and returns user document (creates if doesn't exist)
 */
router.post('/login', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { uid, email } = req.user!;

        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // Auto-create user on first login
            user = new User({
                firebaseUid: uid,
                email: email || '',
                services: [],
                watchlist: []
            });
            await user.save();
            console.log('✅ User auto-created on login:', user.email);
        }

        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/auth/me
 * Returns current user profile
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
