# Vibe-Based Discovery Specification

## Topic of Concern
Mood-based content discovery engine that maps user "vibes" to genre combinations and TMDB filters.

## Overview
Users discover content through vibe selection ("cozy", "intense", "mindless", etc.) instead of traditional genre browsing. The backend maps vibes to TMDB genre IDs and filter parameters, returning content matching the mood AND available on user's streaming services.

## Requirements

### Supported Vibes (MVP)
| Vibe | Genres | Rating | Additional Filters |
|------|--------|--------|-------------------|
| Cozy | Romance, Comedy, Animation | ≥7.0 | Exclude Horror, Thriller |
| Intense | Thriller, Action, Crime | ≥7.5 | - |
| Mindless | Reality, Comedy, Animation | ≥6.0 | Runtime ≤90min |
| Thoughtful | Documentary, Drama, Mystery | ≥8.0 | - |
| Dark | Horror, Thriller, Crime | - | Keywords: dark, twisted |
| Funny | Comedy, Sitcom | ≥7.0 | - |

### Discovery Flow
1. User selects a vibe pill/button
2. Backend maps vibe → TMDB discover parameters
3. Filter by user's streaming services
4. Return paginated results
5. Support combining vibes (stretch goal)

### "Tonight's Pick" Algorithm (Standout Feature)
Generate ONE perfect recommendation based on:
- Time of day (evening → longer content, late → short)
- User's vibe history at this hour
- Unwatched items on their services
- Content in their watchlist marked "want to watch"

## Technical Implementation

### Vibe Mapping Engine
```typescript
const VIBE_MAP: Record<string, TMDBParams> = {
  cozy: {
    with_genres: '10749,35,16',      // Romance, Comedy, Animation
    'vote_average.gte': 7,
    without_genres: '27,53'          // No Horror, Thriller
  },
  intense: {
    with_genres: '53,28,80',         // Thriller, Action, Crime
    'vote_average.gte': 7.5
  },
  mindless: {
    with_genres: '10764,35,16',      // Reality, Comedy, Animation
    'vote_average.gte': 6,
    'with_runtime.lte': 90
  },
  thoughtful: {
    with_genres: '99,18,9648',       // Documentary, Drama, Mystery
    'vote_average.gte': 8
  },
  dark: {
    with_genres: '27,53,80',         // Horror, Thriller, Crime
    with_keywords: 'dark|twisted'
  },
  funny: {
    with_genres: '35',               // Comedy
    'vote_average.gte': 7
  }
}
```

### TMDB Genre IDs Reference
| Genre | ID |
|-------|-----|
| Action | 28 |
| Animation | 16 |
| Comedy | 35 |
| Crime | 80 |
| Documentary | 99 |
| Drama | 18 |
| Horror | 27 |
| Mystery | 9648 |
| Romance | 10749 |
| Thriller | 53 |

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discover?vibe=cozy` | Get content by vibe |
| GET | `/api/discover/vibes` | List available vibes |
| GET | `/api/discover/tonight` | Get tonight's pick |
| GET | `/api/trending` | Trending on user's services |

### Caching Strategy
- Cache TMDB responses (in-memory LRU or Redis)
- TTL: 1 hour for discover, 15 min for trending
- Cache key: `vibe:${vibe}:${services}:${page}`

## UI Components

### VibePillBar
- Horizontal scroll of vibe buttons
- Selected state with animation
- Icons for each vibe (optional)

### TonightsPick
- Hero card with featured recommendation
- "Why this?" explanation
- One-tap add to watchlist

## Acceptance Criteria
- [ ] User can select a vibe and see matching content
- [ ] Results filtered by user's streaming services
- [ ] Each vibe returns appropriate genre combinations
- [ ] Tonight's Pick generates relevant recommendation
- [ ] Results paginate correctly
