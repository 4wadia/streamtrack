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

## Phase 9: Onboarding Flow (First-Time User Experience)

> [!IMPORTANT]
> **SKILL ENFORCEMENT**: Use `senior-frontend` skill's component generator for all new components. Run bundle analyzer after completing the phase.

### 9.1: Welcome/Landing Page
- [ ] Create `WelcomeComponent` for first-time visitors (check localStorage flag)
- [ ] Hero section explaining StreamTrack value proposition:
  - "Discover what to watch across all your streaming services"
  - "Personalized recommendations based on your vibe"
  - "Never lose track of what you're watching"
- [ ] Primary "Get Started" CTA button → Leads to sign-up
- [ ] Subtle "Already have an account? Log in" link at bottom
- [ ] Set `isFirstVisit` flag in localStorage after viewing

### 9.2: Provider Selection (Post Sign-up)
- [ ] Redirect (smooth redirect, no flashing) first-time sign-ups to `/onboarding/providers`
- [ ] Animated grid of streaming provider cards (Netflix, Prime, JioHotstar, Apple TV+, etc.)
- [ ] Multi-select with visual feedback (glow/border on selection)
- [ ] "If none/all selected → same behavior" logic
- [ ] Skip option subtle but available
- [ ] Next button → Genre selection

### 9.3: Genre Preference Selection
- [ ] Create `GenreSelectionComponent` at `/onboarding/genres`
- [ ] Display genre cards with icons (Action, Comedy, Drama, Horror, etc.)
- [ ] Allow multiple selection with visual feedback
- [ ] "Skip" option clearly available
- [ ] Save selections to user profile

### 9.4: Personalized Preview
- [ ] If user selected genres → Show 4 preview cards (2 movies, 2 TV shows)
- [ ] Use `GET /api/discover` with selected genres
- [ ] Cards should be clickable with "Add to Watchlist" option
- [ ] "Continue to Home" button
- [ ] If user skipped genres → Go directly to Home

---

## Phase 10: Home Page Redesign (Apple TV Inspired)

> [!CAUTION]
> This phase has high visual impact. Ensure animations are smooth (60fps). Test on multiple screen sizes.

### 10.1: Hero Carousel Enhancement
- [ ] Limit to 5 carousel items from trending content
- [ ] Left section: Title + Overview (max 2-3 lines truncated)
- [ ] Two buttons:
  - Primary: "Watch Now" (white background, black text)
  - Secondary: "Add to Watchlist" (gray/faded, glassmorphism)
- [ ] Smooth crossfade transitions (1s duration)
- [ ] Auto-rotate every 8 seconds
- [ ] Vertical dot indicators on right side

### 10.2: Content Sections
- [ ] Create `ContentRowComponent` - horizontal scrolling card row
- [ ] Section headings with subtitle support:
  - "Best Picks for You"
  - "Based on Your Vibe"
  - "Best Movies" *(from your subscription - faded)*
  - "Best TV Shows" *(from your subscription - faded)*
- [ ] Arrow navigation for horizontal scroll
- [ ] Lazy loading for off-screen cards

### 10.3: Card Component Redesign
- [ ] Cards sized to movie poster ratio (2:3)
- [ ] Hover state: 
  - Show animated watchlist button (port from `specs/wishlist.tsx` Check 10.4)
  - Subtle glow effect
- [ ] Smooth 300ms transitions
- [ ] Click → Navigate to content detail page

### 10.4: Animated Watchlist Button
- [ ] Port `specs/wishlist.tsx` React component to Angular
- [ ] Use Angular Animations API (not motion/react)
- [ ] Plus-to-checkmark animation
- [ ] Integrate into ContentCard hover state

---

## Phase 11: Search Page Improvements

### 11.1: Search UX Fixes  
- [ ] **Fix**: Text disappearing after Enter key pressed
- [ ] Preserve search query in input field after search
- [ ] Debounced search (300ms) for live results
- [ ] Ctrl+K / Cmd+K global shortcut to open search

### 11.2: Search Results Layout
- [ ] Top result: Large card on left (featured)
  - Full backdrop image
  - Title, year, rating
  - Watchlist button
- [ ] Other results: Compact grid on right
- [ ] Infinite scroll or "Load More" pagination
- [ ] Empty state: "No results found for [query]"

---

## Phase 12: Account Page

### 12.1: Account Overview
- [ ] User profile section (name, email)
- [ ] Account creation date
- [ ] Watchlist statistics preview

### 12.2: Provider Management
- [ ] Grid of all available providers
- [ ] Toggle selection with visual feedback (gray unselected and Colored of the Provider Color like Netfix red, Amazon blue when selected)
- [ ] Save changes button
- [ ] Success feedback animation

---

## Phase 13: Navigation & Layout Polish

### 13.1: Navbar Simplification
- [ ] Left: StreamTrack logo only (home link)
- [ ] Right: Search icon + Watchlist icon + Account avatar
- [ ] Clean, minimal design

### 13.2: Tonight's Pick Floating Button
- [ ] Squircle floating button in bottom-right corner
- [ ] Subtle pulse animation when new recommendation available
- [ ] Click → Show modal with tonight's pick
- [ ] "Watch Now" and "Try Another" actions

---

## Phase 14: Auth Pages Polish

### 14.1: Login Page
- [ ] Clean, centered card design (shadcn/better-auth inspired)
- [ ] Email + Password fields with validation
- [ ] "Sign in" primary button
- [ ] "Forgot password?" link
- [ ] Social login options (Google)
- [ ] "Don't have an account? Sign up" link

### 14.2: Register Page
- [ ] Matching design to login
- [ ] Name, Email, Password, Confirm Password
- [ ] Strong password indicator
- [ ] Terms & conditions checkbox
- [ ] "Already have an account? Log in" link

---

## Phase 15: Icon System & Visual Consistency

### 15.1: Remove All Emojis
- [ ] Audit all components for emoji usage
- [ ] Replace vibes emojis with Lucide icons:
  - cozy → `Sofa` or `Coffee`
  - intense → `Zap`
  - mindless → `Popcorn` or `Brain`
  - thoughtful → `Lightbulb`
  - dark → `Moon`
  - funny → `Smile`
- [ ] Update VIBE_MAP to use icon names instead of emojis

### 15.2: Provider Icons
- [ ] **Decision**: Store provider icons in `/public/icons/providers/`
- [ ] Icons: netflix.svg, prime.svg, jiohotstar.svg, apple.svg, sonyliv.svg
- [ ] Fallback to Simple Icons CDN if local not available
- [ ] Create `ProviderIconComponent` for consistent rendering

### 15.3: Design System Consolidation
- [ ] Color scheme: Red (`#E50914`) + Gray tones
- [ ] Primary accent: Netflix Red
- [ ] Backgrounds: Cinema black (`#0C0C0C`), Dark gray (`#181818`)
- [ ] Text: White primary, Gray-400 secondary
- [ ] Create CSS custom properties for all colors
- [ ] Document in `styles/design-tokens.css`

---

## Phase 16: SPA Route Consolidation

### 16.1: Route Structure
```
/                 → Home (hero carousel + content sections)
/search           → Search page
/watchlist        → Watchlist page (cards, filters, stats)
/account          → Account settings + provider management
/login            → Login (guest only)
/register         → Register (guest only)
/onboarding/*     → Onboarding flow (first-time users)
```

### 16.2: Route Changes
- [ ] Merge `/discover` functionality into Home page vibe sections
- [ ] Keep `/watchlist` as dedicated page
- [ ] Update navigation accordingly

---

## Phase 17: Watchlist Page (Dedicated)

> [!IMPORTANT]
> Watchlist is a core feature - keep as dedicated page accessible from navbar.

### 17.1: Watchlist Layout
- [ ] Header with title and stats button
- [ ] Filter bar (always visible)
- [ ] Card grid (responsive columns)
- [ ] Empty state when no items

### 17.2: Filter System
- [ ] Filter by status: All, Plan to Watch, Watching, Completed
- [ ] Filter by type: All, Movies, TV Shows
- [ ] Filter by genre: Dropdown with multi-select
- [ ] Filter by rating: Range slider (0-10)
- [ ] Sort by: Date Added, Title (A-Z), Rating, Release Date
- [ ] Clear filters button

### 17.3: Random Button
- [ ] "Pick Random" floating button or in filter bar
- [ ] Respects current filters when picking random
- [ ] Highlight animation on selected card
- [ ] Option: "Watch this" to mark as watching

### 17.4: Stats Modal/Panel
- [ ] Toggle stats view button
- [ ] Stats include:
  - Total items (by status breakdown)
  - Movies vs TV shows ratio
  - Genre distribution (pie chart or bar)
  - Average rating given
  - Recently added/completed
- [ ] Animated charts on reveal

### 17.5: Card Interactions  
- [ ] Quick status change (dropdown on hover or click)
- [ ] Quick rating (star input)
- [ ] Remove from watchlist (confirm dialog)
- [ ] Navigate to content detail page

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
- Emojis still present in VIBE_MAP (need icon replacements) - Phase 15.1
- Watchlist tests have timeout issues (pre-existing, unrelated to provider fixes)

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

