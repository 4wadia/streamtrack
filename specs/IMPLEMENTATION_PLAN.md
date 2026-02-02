# StreamTrack Implementation Plan

## Goal
Build StreamTrack - a personalized streaming discovery platform with vibe-based recommendations and multi-platform filtering.

---

## Completed
- [x] Initial project planning
- [x] Specs documentation created
- [x] Initialize Bun monorepo structure (root package.json with workspaces)
- [x] Scaffold Angular 21 frontend with standalone components
- [x] Add TailwindCSS to Angular project with design tokens
- [x] Initialize Express backend with TypeScript on Bun
- [x] Configure MongoDB connection with Mongoose
- [x] Create environment variable templates (.env.example)

---

## In Progress

---

## Backlog (Priority Order)

### Phase 1: Foundation & Setup
- [ ] Set up Firebase project and download credentials

### Phase 2: Authentication
- [ ] Implement Firebase Auth on frontend (AuthService)
- [ ] Create login/register components
- [ ] Add Firebase Admin SDK to backend
- [ ] Create verifyFirebaseToken middleware
- [ ] Implement /api/auth/register endpoint
- [ ] Implement /api/auth/login endpoint
- [ ] Create Angular auth guards for protected routes
- [ ] Store user document in MongoDB on first login

### Phase 3: User Services
- [ ] Create User Mongoose schema with services array
- [ ] Implement /api/user/services GET endpoint
- [ ] Implement /api/user/services PUT endpoint
- [ ] Create ServiceSelectionGrid component
- [ ] Build onboarding flow with service selection
- [ ] Create ServiceBadge component

### Phase 4: TMDB Integration
- [ ] Create TMDB service with API key config
- [ ] Implement response caching (in-memory LRU)
- [ ] Create /api/search endpoint proxying TMDB
- [ ] Create /api/content/:id endpoint for details
- [ ] Add watch provider filtering to queries

### Phase 5: Vibe Discovery Engine
- [ ] Implement VIBE_MAP configuration
- [ ] Create /api/discover?vibe= endpoint
- [ ] Filter results by user's watch providers
- [ ] Implement /api/discover/vibes list endpoint
- [ ] Create VibePillBar component
- [ ] Build Discover page with vibe selection
- [ ] Implement "Tonight's Pick" algorithm
- [ ] Create TonightsPick hero component

### Phase 6: Watchlist
- [ ] Add watchlist array to User schema
- [ ] Implement POST /api/watchlist
- [ ] Implement GET /api/watchlist with status filter
- [ ] Implement PUT /api/watchlist/:contentId
- [ ] Implement DELETE /api/watchlist/:contentId
- [ ] Create WatchlistCard component
- [ ] Create WatchlistTabs component
- [ ] Build Watchlist page with all CRUD
- [ ] Implement GET /api/watchlist/stats
- [ ] Create StatsPanel component

### Phase 7: UI Polish
- [ ] Implement dark theme CSS variables
- [ ] Add glassmorphism effects
- [ ] Create ContentCard with poster gradient
- [ ] Implement Angular animations (fade, stagger)
- [ ] Build responsive grid layouts
- [ ] Create Skeleton loading components
- [ ] Add hover micro-interactions
- [ ] Implement search with instant results

### Phase 8: Testing & Verification
- [ ] Write backend unit tests for VibeService
- [ ] Write backend unit tests for AuthMiddleware
- [ ] Add E2E test: login → select service → vibe → results
- [ ] Verify responsive design on mobile
- [ ] Performance test with many poster images

---

## Discovered Issues
<!-- Populated during implementation -->

---

## Notes
<!-- Learnings from build process -->
