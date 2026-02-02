# BUILD & SETUP GUIDE - StreamTrack

## Prerequisites
- **Bun**: v1.1+ (runtime & package manager).
- **MongoDB**: Local installation or Atlas connection string.
- **Firebase Project**: Create a project at console.firebase.google.com and get your config.
- **TMDB API Key**: Get one from themoviedb.org.

## Environment Variables
Create a `.env` file in the root (or separate `.env` in backend/frontend):
```bash
# Backend
PORT=3000
MONGO_URI=mongodb://localhost:27017/streamtrack
TMDB_API_KEY=your_tmdb_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Frontend
ng_APP_FIREBASE_API_KEY=...
ng_APP_TMDB_API_KEY=... # Only if accessing directly, but better to proxy
```

## Installation

### 1. Root Setup
If using a monorepo approach (recommended for simplicity):
```bash
bun install
```

### 2. Backend Setup
```bash
cd backend
bun install
bun add -d typescript @types/express @types/node
```

### 3. Frontend Setup
```bash
cd frontend
bun install
```

## Running the Project

### Development Mode (Concurrent)
We use `concurrently` to run both servers.
```bash
# From root
bun run dev
```
*This command runs `bun run dev:backend` and `bun run dev:frontend` simultaneously.*

- **Backend** runs on `http://localhost:3000`
- **Frontend** runs on `http://localhost:4200`

### Build for Production
```bash
# Backend
cd backend && bun run build

# Frontend
cd frontend && bun run build
```
Dist files will be in `backend/dist` and `frontend/dist`.
