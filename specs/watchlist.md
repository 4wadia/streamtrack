# Watchlist Specification

## Topic of Concern
Full CRUD operations for user's personal watchlist with status tracking and notes.

## Overview
Users maintain a personal watchlist of movies and TV shows with three status levels: "Want to Watch", "Watching", and "Watched". Each item can have a personal rating and notes.

## Requirements

### Watchlist Statuses
| Status | Description |
|--------|-------------|
| `want` | User intends to watch |
| `watching` | Currently watching (especially series) |
| `watched` | Completed watching |

### CRUD Operations
| Operation | Description |
|-----------|-------------|
| CREATE | Add content to watchlist |
| READ | View all watchlist items |
| UPDATE | Change status, add rating/notes |
| DELETE | Remove from watchlist |

### Watchlist Item Data
```typescript
interface WatchlistItem {
  contentId: string      // TMDB ID
  title: string
  type: 'movie' | 'tv'
  posterPath: string
  status: 'want' | 'watching' | 'watched'
  rating?: number        // 1-10 user rating
  notes?: string         // Personal notes
  addedAt: Date
  updatedAt: Date
}
```

### Features
- Filter by status (tabs)
- Sort by: date added, title, rating
- Quick status change (swipe or click)
- Batch operations (optional)
- Export watchlist (stretch goal)

### Stats Dashboard
Track and display:
- Total items per status
- Total watch time (calculated)
- Favorite genres (from watched items)
- Monthly watching trends

## Technical Implementation

### MongoDB Schema
```typescript
// Embedded in User document
interface User {
  // ...other fields
  watchlist: WatchlistItem[]
}

// OR separate collection for scale
interface Watchlist {
  userId: ObjectId
  items: WatchlistItem[]
}
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist` | Get user's watchlist |
| GET | `/api/watchlist?status=want` | Filter by status |
| POST | `/api/watchlist` | Add item to watchlist |
| PUT | `/api/watchlist/:contentId` | Update item |
| DELETE | `/api/watchlist/:contentId` | Remove item |
| GET | `/api/watchlist/stats` | Get watchlist stats |

### Request/Response Examples

**Add to Watchlist:**
```typescript
POST /api/watchlist
{
  contentId: "550",
  title: "Fight Club",
  type: "movie",
  posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
}
// Response: 201 Created
```

**Update Status:**
```typescript
PUT /api/watchlist/550
{
  status: "watched",
  rating: 9,
  notes: "Incredible twist ending"
}
// Response: 200 OK
```

## UI Components

### WatchlistTabs
- Three tabs: Want / Watching / Watched
- Badge with count per tab
- Animated tab indicator

### WatchlistCard
- Poster thumbnail
- Title and year
- Status indicator
- Quick action buttons (change status, delete)
- Expand for rating/notes

### AddToWatchlistButton
- Reusable across app (search, discover, detail)
- Dropdown for status selection
- Visual feedback on add

### StatsPanel
- Pie chart: content by genre
- Bar chart: monthly activity
- Key metrics cards

## Acceptance Criteria
- [ ] User can add content to watchlist
- [ ] User can view watchlist filtered by status
- [ ] User can update status of watchlist items
- [ ] User can add rating (1-10) to watched items
- [ ] User can add personal notes
- [ ] User can remove items from watchlist
- [ ] Stats dashboard shows viewing activity
