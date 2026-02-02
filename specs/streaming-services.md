# Streaming Services Specification

## Topic of Concern
User streaming service selection and content filtering by available platforms.

## Overview
Users select which streaming services they subscribe to (Netflix, Prime, Disney+, etc.). All recommendations and search results are filtered to show only content available on the user's selected services.

## Requirements

### Service Selection
- Display grid of major streaming services
- User can select/deselect multiple services
- Persist selections to user profile
- Update selections at any time from profile

### Supported Services (MVP)
| Service | Provider ID (TMDB) |
|---------|-------------------|
| Netflix | 8 |
| Amazon Prime Video | 9 |
| Disney+ | 337 |
| HBO Max | 384 |
| Hulu | 15 |
| Apple TV+ | 350 |
| Paramount+ | 531 |

### Content Filtering
- Filter all discovery/search results by user's services
- Show "available on" badges on content cards
- Option: "Add [service] to see X more matches"
- Support regional availability (default: US)

### Service Badges UI
- Display service logo on content cards
- Show which of user's services have the content
- Visual indicator for "not on your services"

## Technical Implementation

### MongoDB Schema
```typescript
interface User {
  firebaseUid: string
  email: string
  name: string
  services: string[]  // ['netflix', 'prime', 'disney']
  region: string      // 'US' default
}
```

### TMDB Integration
```typescript
// Use watch/providers endpoint
GET /movie/{id}/watch/providers
// Filter discover results
GET /discover/movie?with_watch_providers=8|9&watch_region=US
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/services` | Get user's services |
| PUT | `/api/user/services` | Update user's services |
| GET | `/api/services/available` | List all supported services |

## UI Components

### ServiceSelectionGrid
- Checkbox grid with service logos
- Used in onboarding and profile edit
- Responsive 3-4 column layout

### ServiceBadge
- Small service logo component
- Displays on content cards
- Tooltip with service name

## Acceptance Criteria
- [ ] User can select streaming services during onboarding
- [ ] Services are persisted to user profile
- [ ] Search/discover results filtered by user's services
- [ ] Service badges display on content cards
- [ ] User can update services from profile
