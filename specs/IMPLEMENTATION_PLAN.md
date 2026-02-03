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
- [x] Set up Firebase project and credentials (Phase 1)
- [x] Firebase Auth on frontend (AuthService with signals)
- [x] Login/register components with dark theme styling
- [x] Firebase Admin SDK on backend
- [x] Auth middleware for token verification
- [x] Auth routes (/api/auth/register, /login, /me)
- [x] Angular auth guards (authGuard, guestGuard)
- [x] User Mongoose schema with watchlist support
- [x] Home component with hero section and vibe preview

---

## In Progress

---

## Backlog (Priority Order)

### Phase 3: User Services ✓
- [x] Create User Mongoose schema with services array
- [x] Implement /api/user/services GET endpoint
- [x] Implement /api/user/services PUT endpoint
- [x] Create ServiceSelectionGrid component
- [x] Build onboarding flow with service selection
- [x] Create ServiceBadge component

### Phase 4: TMDB Integration ✓
- [x] Create TMDB service with API key config
- [x] Implement response caching (in-memory LRU)
- [x] Create /api/search endpoint proxying TMDB
- [x] Create /api/content/:id endpoint for details
- [x] Add watch provider filtering to queries

### Phase 5: Vibe Discovery Engine ✓
- [x] Implement VIBE_MAP configuration
- [x] Create /api/discover?vibe= endpoint
- [x] Filter results by user's watch providers
- [x] Implement /api/discover/vibes list endpoint
- [x] Create VibePillBar component
- [x] Build Discover page with vibe selection
- [x] Implement "Tonight's Pick" algorithm
- [x] Create TonightsPick hero component

### Phase 6: Watchlist
- [ ] Add watchlist array to User schema
- [ ] Implement POST /api/watchlist
- [ ] Implement GET /api/watchlist with status filter
- [ ] Implement PUT /api/watchlist/:contentId
- [ ] Implement DELETE /api/watchlist/:contentId
- [/] Add watchlist array to User schema
- [x] Implement POST /api/watchlist
- [x] Implement GET /api/watchlist with status filter
- [x] Implement PUT /api/watchlist/:contentId
- [x] Implement DELETE /api/watchlist/:contentId
- [ ] Create WatchlistTabs component
- [ ] Build Watchlist page with all CRUD
- [ ] Implement GET /api/watchlist/stats
- [ ] Create StatsPanel component

### Phase 7: UI Polish
- [ ] Implement dark theme CSS variables
- [ ] Take inspiration from Netflix UI, Google Home, and Letterboxd
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
