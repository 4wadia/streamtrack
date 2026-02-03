import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { initializeFirebase } from './services/firebase.service';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/streamtrack';

// Initialize Firebase Admin
initializeFirebase();

// Middleware
app.use(cors());
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

app.get('/api', (_req, res) => {
    res.json({ message: 'StreamTrack API v0.0.0' });
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

// Start server
async function start() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 StreamTrack API running on http://localhost:${PORT}`);
    });
}

start();

export default app;

