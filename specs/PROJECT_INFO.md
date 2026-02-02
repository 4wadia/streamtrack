oh shit you're cooking. streamtrack with vibe-based recs and "what's on my services" filtering is actually useful. imdb UI is dogshit you're right - opportunity to flex design.

## STREAMTRACK - REFINED CONCEPT:

### CORE FEATURES:

*1. service selection*
- user picks which services they subscribe to (netflix/prime/disney+/hbo/apple/etc)
- stores in profile (mongo user doc)
- filters all recs/search by "available on YOUR services only"

*2. vibe-based discovery*
"i want something [cozy/intense/mindless/thought-provoking/funny/dark]"
- map vibes to genre combos + rating thresholds
- return matches from user's selected services
- no ML needed - rule-based matching is fine for 603

*vibes mapping (backend logic):*
typescript
vibes = {
  cozy: ['romance', 'comedy', 'animation'] + rating > 7,
  intense: ['thriller', 'action', 'crime'] + rating > 7.5,
  mindless: ['reality', 'comedy', 'animation'] + rating > 6,
  thoughtful: ['documentary', 'drama', 'mystery'] + rating > 8,
  dark: ['horror', 'thriller', 'crime'] + keywords: ['dark', 'twisted'],
  funny: ['comedy', 'sitcom'] + rating > 7
}


*3. watchlist management (CRUD)*
- add to watchlist (CREATE)
- mark as watching/watched (UPDATE)
- rate + add notes (UPDATE)
- remove from list (DELETE)
- view all lists (READ)

*4. "where to watch" integration*
- scrape/api for streaming availability
- show "on netflix" badge vs "not on your services"
- option: "add hulu to see 47 more matches"

### DATA SOURCES:

*streaming availability:*
- *themoviedb API* (tmdb) - free, 50k requests/day, has watch provider data
- *justwatch API* (unofficial) - streaming availability by region
- *watchmode API* - 1k free calls/month, good for us market

*content metadata:*
- tmdb for posters/descriptions/ratings/genres
- omdb api (imdb wrapper) if you want imdb scores
- trakt.tv api for trending/popular

### UI/UX (not 2016 imdb trash):

*aesthetic direction:*
- dark mode default (streaming = night vibes)
- card-based layouts (pinterest/netflix style)
- smooth animations (angular animations api)
- gradient overlays on posters
- glassmorphism for panels (backdrop-blur)

*key screens:*
1. *onboarding* - "which services do you have?" checkbox grid
2. *home/discover* - vibe pills at top, trending carousel, "because you watched X"
3. *search* - instant results, filter by genre/year/rating, service badges
4. *detail page* - poster hero, ratings, where to watch, add to watchlist, similar titles
5. *watchlist* - tabs (want to watch/watching/watched), sort/filter
6. *profile* - edit services, stats (hours watched, favorite genres)

*design inspo:*
- letterboxd (clean, content-first)
- trakt.tv (good data viz)
- NOT imdb (bloated, confusing, ad hell)
- NOT netflix (too minimalist, hides info)

### TECHNICAL BREAKDOWN:

*firebase auth:*
- email/password + google sign-in
- store uid in mongo user doc
- jwt tokens for api calls

*mongo schema:*
typescript
User {
  firebaseUid, email, name,
  services: ['netflix', 'prime'],
  watchlist: [
    {contentId, title, status, rating, notes, addedAt}
  ]
}

Content { // cached from apis
  tmdbId, title, type, genres, rating,
  platforms: [{service, url}],
  poster, description, year
}


*express routes:*

POST /api/auth/register
POST /api/auth/login
GET /api/user/profile
PUT /api/user/services

GET /api/discover?vibe=cozy
GET /api/search?q=inception
GET /api/content/:id

POST /api/watchlist (CREATE)
GET /api/watchlist (READ)
PUT /api/watchlist/:id (UPDATE)
DELETE /api/watchlist/:id (DELETE)

GET /api/recommendations?based=contentId


*angular structure:*

features/
├── auth/ (login, register, guards)
├── discover/ (vibe selection, trending)
├── search/ (search bar, results, filters)
├── content/ (detail page, similar titles)
├── watchlist/ (list views, status management)
└── profile/ (edit services, stats)

shared/
├── components/ (content-card, rating-stars, service-badge)
├── services/ (api, auth, state)
└── pipes/ (runtime-format, genre-list)


### AI RECOMMENDATION (simple approach):

*without ML (rule-based):*
- "because you watched X" → match genres + similar rating range
- "users who watched X also watched Y" → collaborative filtering (count co-occurrences in watchlists)
- "trending in [genre]" → tmdb trending api filtered by user genres

*with basic ML (stretch goal):*
- content-based: cosine similarity on genre vectors
- collaborative: user-user similarity based on watchlist overlap
- hybrid: weighted combination

*recommendation types:*
1. *similar titles* - same genres, similar ratings
2. *vibe matches* - rule-based from user's vibe selection
3. *trending on your services* - popular + available filter
4. *based on watchlist* - analyze user's watched content, suggest similar

### STANDOUT FEATURES (impress the prof):

1. *"tonight's pick" algorithm* - suggests ONE title based on:
   - time of day (short vs long runtime)
   - vibe history (what they usually pick at this hour)
   - unwatched content on their services

2. *stats dashboard:*
   - total watch time
   - favorite genres (pie chart)
   - service utilization (% of watchlist on each platform)
   - "you've saved $X by not subscribing to Y"

3. *social features (optional):*
   - share watchlists
   - "watch parties" - group watchlist for movie nights
   - friends' recommendations

4. *smart notifications:*
   - "show X you're watching just added season 2"
   - "movie on your watchlist leaving netflix in 3 days"

### DIFFERENTIATION FROM 604:

if 604 is bigger/different:
- 604 could be full streaming platform (video hosting)
- 604 could be cinema booking system
- 604 could be content creator platform

streamtrack is DISCOVERY + TRACKING, not streaming itself.

### SCOPE CONTROL (basic implementation):

*MVP for 603:*
- user auth (firebase)
- service selection
- vibe-based discovery (5-6 vibes)
- search with service filter
- watchlist CRUD (3 statuses: want/watching/watched)
- basic recommendations (similar titles)
- responsive design

*skip for 603:*
- social features
- advanced ML recs
- real-time updates
- payment integration
- video playback (obviously)

### PROJECT FORM SUBMISSION:

*TITLE:* "StreamTrack - Smart Streaming Content Discovery"

*DESCRIPTION:* 
personalized streaming discovery platform with vibe-based recommendations and multi-platform filtering. users select their subscribed services (netflix, prime, disney+, etc.) and discover content through mood-based queries ("cozy", "intense", "mindless"). features full CRUD watchlist management with watch status tracking, firebase authentication, and intelligent recommendations based on user preferences. angular frontend with tmdb api integration, express backend, and mongodb for user data. solves streaming fragmentation by showing only content available on user's services, with modern UI design superior to existing platforms like imdb.

---
