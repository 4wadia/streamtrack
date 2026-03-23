import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { initializeFirebase } from './services/firebase.service';
import { logTMDBStatus, getTMDBHeaders, buildTMDBUrl } from './config/tmdb';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import contentRoutes from './routes/content.routes';
import discoverRoutes from './routes/discover.routes';
import watchlistRoutes from './routes/watchlist.routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/streamtrack';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);

function buildQueryString(query: Request['query']): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (Array.isArray(value)) {
            value.forEach((entry) => params.append(key, String(entry)));
            continue;
        }

        if (value === undefined) continue;
        params.set(key, String(value));
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

// Validate TMDB configuration on startup
logTMDBStatus();

// Initialize Firebase Admin
initializeFirebase();

// Middleware
app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/watchlist', watchlistRoutes);

app.get('/api', (_req, res) => {
    res.json({ message: 'StreamTrack API v0.0.0' });
});

// Backward-compatible aliases for content endpoints
app.get('/movies', (req: Request, res: Response) => {
    res.redirect(307, `/api/content/movies${buildQueryString(req.query)}`);
});

app.get('/tv-shows', (req: Request, res: Response) => {
    res.redirect(307, `/api/content/tv-shows${buildQueryString(req.query)}`);
});

app.get('/search', (req: Request, res: Response) => {
    res.redirect(307, `/api/content/search${buildQueryString(req.query)}`);
});

app.get('/movie/:id', (req: Request, res: Response) => {
    res.redirect(307, `/api/content/movie/${req.params.id}${buildQueryString(req.query)}`);
});

app.get('/tv/:id', (req: Request, res: Response) => {
    res.redirect(307, `/api/content/tv/${req.params.id}${buildQueryString(req.query)}`);
});

app.get('/movie/:id/similar', (req: Request, res: Response) => {
    res.redirect(307, `/api/content/movie/${req.params.id}/similar${buildQueryString(req.query)}`);
});

app.get('/tv/:id/similar', (req: Request, res: Response) => {
    res.redirect(307, `/api/content/tv/${req.params.id}/similar${buildQueryString(req.query)}`);
});

// MongoDB connection
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        // Don't crash - allow health check to report disconnected state
    }
}

// TMDB health check (non-blocking)
async function checkTMDBHealth() {
    const { validateTMDBConfig } = await import('./config/tmdb');
    const config = validateTMDBConfig();
    
    if (!config.hasValidToken) {
        console.log('⚠️ TMDB token not configured, skipping health check');
        return;
    }
    
    try {
        const url = buildTMDBUrl('/configuration');
        const headers = getTMDBHeaders();
        
        console.log('🎬 TMDB API Request: GET /configuration');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(url, { 
            headers,
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            console.log('✅ TMDB connection OK');
        } else {
            console.error('❌ TMDB health check failed:', response.status);
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('❌ TMDB health check timed out');
        } else {
            console.error('❌ TMDB connection FAILED:', error instanceof Error ? error.message : String(error));
        }
    }
}

// Start server
async function start() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 StreamTrack API running on http://localhost:${PORT}`);
        // Run TMDB health check AFTER server starts (non-blocking)
        checkTMDBHealth();
    });
}

start();

export default app;

