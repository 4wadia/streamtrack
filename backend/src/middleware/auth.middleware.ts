import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../services/firebase.service';

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
}

/**
 * Middleware to verify Firebase ID token from Authorization header
 * Expects: Authorization: Bearer <id_token>
 */
export async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization header missing or invalid' });
        return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    try {
        const decodedToken = await verifyIdToken(idToken);

        if (!decodedToken) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
}
