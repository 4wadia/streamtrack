# StreamTrack Implementation Plan

## Goal
Build StreamTrack - a personalized streaming discovery platform with vibe-based recommendations and multi-platform filtering. Premium Apple TV / Netflix inspired UI.

---

## Completed Phases

### Phase 1-2: Foundation ✓
- [x] Initialize Bun monorepo structure (root package.json with workspaces)
- [x] Scaffold Angular 21 frontend with standalone components
- [x] Add TailwindCSS to Angular project with design tokens
- [x] Initialize Express backend with TypeScript on Bun
- [x] Configure MongoDB connection with Mongoose
- [x] Create environment variable templates (.env.example)
- [x] Firebase Auth (frontend + backend)
- [x] Auth routes, guards, middleware

### Phase 3: User Services ✓
- [x] Create User Mongoose schema with services array
- [x] Implement /api/user/services GET/PUT endpoints
- [x] Create ServiceSelectionGrid component
- [x] Build onboarding flow with service selection

### Phase 4: TMDB Integration ✓
- [x] Create TMDB service with API key config
- [x] Implement response caching (in-memory LRU)
- [x] Create /api/search, /api/content/:id endpoints
- [x] Add watch provider filtering to queries

### Phase 5: Vibe Discovery Engine ✓
- [x] Implement VIBE_MAP configuration
- [x] Create /api/discover?vibe= endpoint
- [x] Filter results by user's watch providers
- [x] Create VibePillBar component
- [x] Implement "Tonight's Pick" algorithm

### Phase 6: Watchlist ✓
- [x] Add watchlist array to User schema
- [x] Implement CRUD operations for watchlist
- [x] Create WatchlistTabs and StatsPanel components

### Phase 7: Initial Design Overhaul ✓
- [x] Typography: Roboto font
- [x] Theme: Netflix Red (#E50914) accent
- [x] Home: Basic Backdrop Carousel
- [x] Icons: Partial lucide-angular integration
- [x] Navigation: Floating Island Navbar with glassmorphism

---

## Current Sprint: Phase 8 - Critical Fixes & API Improvements

> [!IMPORTANT]
> **MANDATORY SKILL USAGE**: All agents MUST read and follow `.agent/skills/senior-frontend/SKILL.md` before ANY frontend work. Use the skill's component generator, bundle analyzer, and frontend best practices references.

### Phase 8.1: API Critical Fixes ✓
- [x] **Fix Region to India**: Region already set to 'IN' in `tmdb.service.ts`
- [x] **Fix Provider Mapping**: Updated TMDB ID 337 → `jiohotstar` (was `disney`)
- [x] **Sync Provider Mappings**: `mapProviderId()` and `getProviderTmdbIds()` now consistent
- [x] **Update SUPPORTED_SERVICES**: JioHotstar added across all files (routes, types, frontend components)

### Phase 8.2: Custom Vibes Feature (API) ✓
- [x] Add `customVibes` array to User schema (max 5 custom vibes)
- [x] Create vibe interface: `{ id, name, genres: number[], minRating?: number }`
- [x] Implement `POST /api/discover/vibes/custom` - Create custom vibe
- [x] Implement `GET /api/discover/vibes/custom` - Get user's custom vibes
- [x] Implement `PUT /api/discover/vibes/custom/:id` - Update custom vibe
- [x] Implement `DELETE /api/discover/vibes/custom/:id` - Delete custom vibe
- [x] Update `GET /api/discover/vibes` to return both predefined and custom vibes
- [x] Update `GET /api/discover` to support custom vibe IDs (`custom-{id}` format)

---

### Phase 9: Onboarding Flow (First-Time User Experience) ✓

> [!IMPORTANT]
> **SKILL ENFORCEMENT**: Use `senior-frontend` and `frontend-design` skill's component generator for all new components. Run bundle analyzer after completing the phase.

### 9.1: Welcome/Landing Page ✓
- [x] Create `WelcomeComponent` for first-time visitors (check localStorage flag)
- [x] Hero section explaining StreamTrack value proposition:
  - "Discover what to watch across all your streaming services"
  - "Personalized recommendations based on your vibe"
  - "Never lose track of what you're watching"
- [x] Primary "Get Started" CTA button → Leads to sign-up
- [x] Subtle "Already have an account? Log in" link at bottom
- [x] Set `isFirstVisit` flag in localStorage after viewing

### 9.2: Provider Selection (Post Sign-up) ✓
- [x] Redirect (smooth redirect, no flashing) first-time sign-ups to `/onboarding/providers`
- [x] Animated grid of streaming provider cards (Netflix, Prime, JioHotstar, Apple TV+, etc.)
- [x] Multi-select with visual feedback (glow/border on selection)
- [x] "If none/all selected → same behavior" logic
- [x] Skip option subtle but available
- [x] Next button → Genre selection

### 9.3: Genre Preference Selection ✓
- [x] Create `GenreSelectionComponent` at `/onboarding/genres`
- [x] Display genre cards with icons (Action, Comedy, Drama, Horror, etc.)
- [x] Allow multiple selection with visual feedback
- [x] "Skip" option clearly available
- [x] Save selections to user profile

### 9.4: Personalized Preview ✓
- [x] If user selected genres → Show 4 preview cards (2 movies, 2 TV shows)
- [x] Use `GET /api/discover` with selected genres
- [x] Cards should be clickable with "Add to Watchlist" option
- [x] "Continue to Home" button
- [x] If user skipped genres → Go directly to Home

---

## Phase 10: Home Page Redesign (Apple TV Inspired)

> [!CAUTION]
> This phase has high visual impact. Ensure animations are smooth (60fps). Test on multiple screen sizes.

### 10.1: Hero Carousel Enhancement ✓
- [x] Limit to 5 carousel items from trending content
- [x] Left section: Title + Overview (max 2-3 lines truncated)
- [x] Two buttons:
  - Primary: "Watch Now" (white background, black text)
  - Secondary: "Add to Watchlist" (gray/faded, glassmorphism)
- [x] Smooth crossfade transitions (1s duration)
- [x] Auto-rotate every 8 seconds
- [x] Vertical dot indicators on right side

### 10.2: Content Sections ✓
- [x] Create `ContentRowComponent` - horizontal scrolling card row
- [x] Section headings with subtitle support:
  - "Best Picks for You"
  - "Based on Your Vibe"
  - "Best Movies" *(from your subscription - faded)*
  - "Best TV Shows" *(from your subscription - faded)*
- [x] Arrow navigation for horizontal scroll
- [x] Lazy loading for off-screen cards

### 10.3: Card Component Redesign ✓
- [x] Cards sized to movie poster ratio (2:3)
- [x] Hover state: 
  - Show animated watchlist button (port from `specs/wishlist.tsx` Check 10.4)
  - Subtle glow effect
- [x] Smooth 300ms transitions
- [x] Click → Navigate to content detail page

### 10.4: Animated Watchlist Button ✓
- [x] Port `specs/wishlist.tsx` React component to Angular
- [x] Use Angular Animations API (not motion/react)
- [x] Plus-to-checkmark animation
- [x] Integrate into ContentCard hover state

---

## Phase 11: Search Page Improvements

### 11.1: Search UX Fixes ✓
- [x] **Fix**: Text disappearing after Enter key pressed
- [x] Preserve search query in input field after search
- [x] Debounced search (300ms) for live results
- [x] Ctrl+K / Cmd+K global shortcut to open search

### 11.2: Search Results Layout ✓
- [x] Top result: Large card on left (featured)
  - Full backdrop image
  - Title, year, rating
  - Watchlist button
- [x] Other results: Compact grid on right
- [x] Infinite scroll or "Load More" pagination
- [x] Empty state: "No results found for [query]"

---

## Phase 12: Account Page

### 12.1: Account Overview ✓
- [x] User profile section (name, email)
- [x] Account creation date (placeholder - Firebase doesn't expose this easily)
- [x] Watchlist statistics preview

### 12.2: Provider Management ✓
- [x] Grid of all available providers
- [x] Toggle selection with visual feedback (brand colors for each provider)
- [x] Save changes button
- [x] Success feedback animation

---

## Phase 13: Navigation & Layout Polish

### 13.1: Navbar Simplification ✓
- [x] Left: StreamTrack logo only (home link)
- [x] Right: Search icon + Watchlist icon + Account avatar
- [x] Clean, minimal design

### 13.2: Tonight's Pick Floating Button ✓
- [x] Squircle floating button in bottom-right corner
- [x] Subtle pulse animation when new recommendation available
- [x] Click → Show modal with tonight's pick
- [x] "Watch Now" and "Try Another" actions

---

## Phase 14: Auth Pages Polish

### 14.1: Login Page ✓
- [x] Clean, centered card design (shadcn/better-auth inspired)
- [x] Email + Password fields with validation
- [x] "Sign in" primary button
- [x] "Forgot password?" link
- [x] Social login options (Google)
- [x] "Don't have an account? Sign up" link

### 14.2: Register Page ✓
- [x] Matching design to login
- [x] Name, Email, Password, Confirm Password
- [x] Strong password indicator
- [x] Terms & conditions checkbox
- [x] "Already have an account? Log in" link

---

## Phase 15: Icon System & Visual Consistency ✓

### 15.1: Remove All Emojis ✓
- [x] Audit all components for emoji usage - no emojis found in frontend
- [x] VIBE_MAP already uses Lucide icon names (coffee, zap, gamepad-2, lightbulb, moon, smile)

### 15.2: Provider Icons ✓
- [x] SVG icons stored in `/public/icons/providers/`
- [x] Icons: netflix.svg, prime.svg, jiohotstar.svg, apple.svg, sonyliv.svg, hbo.svg, hulu.svg, paramount.svg
- [x] `ProviderIconComponent` exists with error fallback

### 15.3: Design System Consolidation ✓
- [x] All CSS custom properties defined in `styles.css`
- [x] Animation duration tokens added (--duration-fast, --duration-normal, etc.)
- [x] Complete design token set: colors, backgrounds, spacing, radii, shadows, transitions

---

## Phase 16: SPA Route Consolidation ✓

### 16.1: Route Structure ✓
All routes correctly defined:
```
/                 → Home (hero carousel + content sections)
/search           → Search page
/watchlist        → Watchlist page (cards, filters, stats)
/account          → Account settings + provider management
/login            → Login (guest only)
/register         → Register (guest only)
/onboarding/*     → Onboarding flow (first-time users)
```

### 16.2: Route Changes ✓
- [x] `/discover` redirects to `/` (home)
- [x] Home page has vibe pills for browse-by-vibe
- [x] Watchlist kept as dedicated page

---

## Phase 17: Watchlist Page (Dedicated) ✓

### 17.1: Watchlist Layout ✓
- [x] Header with title, item count, action buttons
- [x] Collapsible filter bar
- [x] Responsive card grid (auto-fill columns)
- [x] Empty state with contextual message

### 17.2: Filter System ✓
- [x] Status tabs: All, Plan to Watch, Watching, Completed
- [x] Type filter: All, Movies, TV Shows (segmented control)
- [x] Title search with debounced input
- [x] Sort by: Date Added, Title A-Z, Title Z-A, Rating, Release Date
- [x] Clear filters button (appears when filters active)

### 17.3: Random Button ✓
- [x] "Random" button in header actions
- [x] Respects active filters when picking
- [x] Pulse/glow animation on selected card (3 seconds)
- [x] Scroll into view on selection

### 17.4: Stats Modal ✓
- [x] Stats toggle button in header
- [x] StatsModalComponent with overlay/backdrop
- [x] Breakdown: total, by status, movies vs TV, average rating
- [x] Animated bar charts for type breakdown

### 17.5: Card Interactions ✓
- [x] Status change chips on hover overlay
- [x] Star rating input (1-5 stars, toggle off)
- [x] Remove with confirm dialog
- [x] Highlighted state (glow animation for random pick)

---

## Phase 18: Testing & Verification

- [ ] Write E2E test: Full onboarding flow
- [ ] Write E2E test: Search and add to watchlist
- [ ] Verify responsive design (mobile, tablet, desktop)
- [ ] Performance audit with Lighthouse
- [ ] Bundle size analysis using senior-frontend skill

---

## Discovered Issues
<!-- Populated during implementation -->
- Backend test files have `bun:test` type declaration errors (runtime works, TypeScript needs config adjustment)
- Watchlist component tests required `provideRouter([])` and `provideAnimations()` providers to work (fixed in spec)

---

## Design References

### Color Palette
```css
--color-accent: #E50914;          /* Netflix Red */
--color-accent-hover: #B20710;
--bg-cinema-black: #0C0C0C;
--bg-card: #181818;
--bg-card-hover: #252525;
--text-primary: #FFFFFF;
--text-secondary: #A3A3A3;
--text-muted: #737373;
```

### Animation Timing
```css
--ease-cinema: cubic-bezier(0.16, 1, 0.3, 1);
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-carousel: 1000ms;
```

---

## Notes
- Provider icons: Use local SVGs (Store SVGs in `/public/icons/providers/`) with Simple Icons fallback
- All animations should target 60fps
- Use Angular Signals for reactive state
- Lazy load routes for better initial bundle size
- Smooth redirects (no flash) for onboarding flow

