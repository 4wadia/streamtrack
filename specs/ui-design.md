# UI/UX Design Specification

## Topic of Concern
Visual design system, component patterns, animations, and user experience guidelines.

## Overview
StreamTrack features a modern, dark-first design inspired by premium streaming platforms. Clean aesthetics with smooth animations create an engaging discovery experience that's superior to cluttered alternatives like IMDB.

## Design Principles

### Aesthetic Direction
- **Dark mode default** - Streaming is a nighttime activity
- **Card-based layouts** - Pinterest/Netflix style grid
- **Glassmorphism** - Subtle backdrop-blur on panels
- **Gradient overlays** - On poster images
- **Generous whitespace** - Content breathing room
- **Smooth micro-interactions** - Delightful animations

### Design Inspiration
✅ **Letterboxd** - Clean, content-first
✅ **Trakt.tv** - Good data visualization
❌ **IMDB** - Too cluttered, ad-heavy
❌ **Netflix** - Too minimal, hides info

## Color System

### Dark Theme (Default)
```css
:root {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  --bg-elevated: #242424;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent-primary: #6366f1;    /* Indigo */
  --accent-success: #22c55e;    /* Green */
  --accent-warning: #f59e0b;    /* Amber */
  --accent-error: #ef4444;      /* Red */
}
```

### Vibe Colors
| Vibe | Color | Hex |
|------|-------|-----|
| Cozy | Warm Pink | #f472b6 |
| Intense | Electric Red | #ef4444 |
| Mindless | Soft Yellow | #fbbf24 |
| Thoughtful | Deep Blue | #3b82f6 |
| Dark | Purple | #8b5cf6 |
| Funny | Orange | #f97316 |

## Typography

### Font Stack
```css
--font-primary: 'Inter', -apple-system, sans-serif;
--font-display: 'Plus Jakarta Sans', sans-serif;
```

### Scale
| Name | Size | Weight | Use |
|------|------|--------|-----|
| Display | 2.5rem | 700 | Page titles |
| H1 | 1.875rem | 600 | Section headers |
| H2 | 1.5rem | 600 | Card titles |
| Body | 1rem | 400 | General text |
| Small | 0.875rem | 400 | Metadata |
| Tiny | 0.75rem | 500 | Badges |

## Component Library

### ContentCard
- Poster image with gradient overlay
- Title, year, rating
- Service badges
- Hover: Scale up, show actions
- Aspect ratio: 2:3 (poster standard)

### VibePill
- Rounded pill button
- Icon + text
- Vibe-specific color
- Selected: Filled background
- Unselected: Outline only

### ServiceBadge
- Small circular logo
- 24x24px size
- Tooltip on hover

### RatingStars
- 5-star system (half-star support)
- Interactive for user rating
- Read-only for TMDB rating

### SearchBar
- Full-width input
- Magnifying glass icon
- Clear button
- Instant results dropdown

### Skeleton
- Loading placeholder
- Animated shimmer effect
- Matches component shape

## Key Screens

### 1. Onboarding
```
┌──────────────────────────────────┐
│  Which services do you have?     │
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ 🔴  │ │ 🔵  │ │ 🟣  │        │
│  │NFLX │ │PRIME│ │DSNY+│        │
│  └─────┘ └─────┘ └─────┘        │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ 🟡  │ │ 🟢  │ │ ⚫  │        │
│  │HULU │ │HBO  │ │APL+ │        │
│  └─────┘ └─────┘ └─────┘        │
│                                  │
│  [       Continue →        ]     │
└──────────────────────────────────┘
```

### 2. Home/Discover
```
┌──────────────────────────────────┐
│  StreamTrack           👤        │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │   🌙 Tonight's Pick        │  │
│  │   [Fight Club poster]      │  │
│  │   Perfect for late night   │  │
│  └────────────────────────────┘  │
│                                  │
│  How are you feeling?            │
│  [Cozy][Intense][Mindless]...    │
│                                  │
│  Trending on Your Services       │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│  │   │ │   │ │   │ │   │ →      │
│  └───┘ └───┘ └───┘ └───┘        │
└──────────────────────────────────┘
```

### 3. Search
- Full-width search bar
- Filter chips (genre, year, rating)
- Grid of results
- Service badges on each card

### 4. Content Detail
- Hero poster with backdrop
- Title, year, runtime, rating
- "Where to Watch" section
- Add to Watchlist button
- Similar Titles carousel

### 5. Watchlist
- Tab bar (Want/Watching/Watched)
- List or grid view toggle
- Sort dropdown
- Cards with quick actions

### 6. Profile
- User avatar and name
- Service selection editor
- Stats dashboard
- Settings (theme, notifications)

## Animations

### Using Angular Animations
```typescript
import { trigger, transition, style, animate } from '@angular/animations';

// Fade in
trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 }))
  ])
])

// Stagger list
trigger('staggerList', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(50, animate('300ms ease-out'))
    ], { optional: true })
  ])
])
```

### Animation Guidelines
- **Duration**: 150-300ms for micro-interactions
- **Easing**: ease-out for entrances, ease-in for exits
- **Stagger delay**: 50ms between list items
- **Scale hover**: 1.02-1.05 on cards

## Responsive Breakpoints
```css
--mobile: 640px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

### Grid Columns
| Breakpoint | Cards per row |
|------------|---------------|
| Mobile | 2 |
| Tablet | 3 |
| Desktop | 4-5 |
| Wide | 6 |

## Acceptance Criteria
- [ ] Dark theme implemented by default
- [ ] All components follow design system
- [ ] Smooth animations on interactions
- [ ] Responsive across all breakpoints
- [ ] Glassmorphism effects on elevated surfaces
- [ ] Consistent typography hierarchy
- [ ] Service logos display correctly
