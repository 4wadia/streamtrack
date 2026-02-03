# StreamTrack API Testing Specification

Base URL: `http://localhost:3000` (or your configured port)

## 1. Health Endpoints

### Check API Health
*   **Endpoint:** `GET /health`
*   **Description:** Checks if the API and database connection are working.
*   **Auth Required:** No
*   **Response:**
    ```json
    {
        "status": "ok",
        "timestamp": "2024-02-03T12:00:00.000Z",
        "mongodb": "connected"
    }
    ```

### Check API Version
*   **Endpoint:** `GET /api`
*   **Description:** Returns API version info.
*   **Auth Required:** No
*   **Response:**
    ```json
    {
        "message": "StreamTrack API v0.0.0"
    }
    ```

## 2. Authentication Endpoints

**Note:** Most endpoints require a Firebase ID token in the `Authorization` header:
`Authorization: Bearer <FIREBASE_ID_TOKEN>`

### Register User
*   **Endpoint:** `POST /api/auth/register`
*   **Description:** Registers a new user after Firebase signup.
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Body:**
    ```json
    {
        "name": "User Name"
    }
    ```
    *   `email` is extracted from the token.
*   **Response (201 Created):**
    ```json
    {
        "message": "User created",
        "user": { ... }
    }
    ```

### Login User
*   **Endpoint:** `POST /api/auth/login`
*   **Description:** Verifies token and returns user profile. Auto-creates user if not exists.
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Body:** Empty
*   **Response:**
    ```json
    {
        "message": "Login successful",
        "user": { ... }
    }
    ```

### Get Current User Profile
*   **Endpoint:** `GET /api/auth/me`
*   **Description:** Returns the currently authenticated user's profile.
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Response:**
    ```json
    {
        "user": { ... }
    }
    ```

## 3. User Profile & Preferences

### Get Available Streaming Services
*   **Endpoint:** `GET /api/user/services/available`
*   **Description:** Returns a list of all supported streaming services.
*   **Auth Required:** No
*   **Response:**
    ```json
    {
        "services": [
            { "id": "netflix", "name": "Netflix", "providerId": 8 },
            ...
        ]
    }
    ```

### Get User's Services
*   **Endpoint:** `GET /api/user/services`
*   **Description:** Returns the streaming services selected by the user.
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Response:**
    ```json
    {
        "services": ["netflix", "hulu"]
    }
    ```

### Update User's Services
*   **Endpoint:** `PUT /api/user/services`
*   **Description:** Updates the user's selected streaming services.
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Body:**
    ```json
    {
        "services": ["netflix", "prime", "disney"]
    }
    ```
*   **Response:**
    ```json
    {
        "message": "Services updated",
        "services": ["netflix", "prime", "disney"]
    }
    ```

## 4. Content Discovery

### Search Content
*   **Endpoint:** `GET /api/content/search`
*   **Query Params:**
    *   `q`: Search query (string, required)
    *   `page`: Page number (number, optional, default 1)
*   **Auth Required:** No
*   **Example:** `/api/content/search?q=inception`
*   **Response:**
    ```json
    {
        "results": [ ... ],
        "query": "inception",
        "page": 1
    }
    ```

### Get Trending Content
*   **Endpoint:** `GET /api/content/trending`
*   **Query Params:**
    *   `type`: `movie` | `tv` | `all` (default: `all`)
    *   `time`: `day` | `week` (default: `week`)
*   **Auth Required:** No
*   **Example:** `/api/content/trending?type=movie&time=week`
*   **Response:**
    ```json
    {
        "results": [ ... ]
    }
    ```

### Get Filtered Trending Content
*   **Endpoint:** `GET /api/content/trending/filtered`
*   **Description:** Returns trending content available on the user's selected services.
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Response:**
    ```json
    {
        "results": [ ... ],
        "filtered": true,
        "userServices": [...]
    }
    ```

### Get Content Details
*   **Endpoint:** `GET /api/content/:type/:id`
*   **Params:**
    *   `type`: `movie` or `tv`
    *   `id`: TMDB ID (integer)
*   **Auth Required:** No
*   **Example:** `/api/content/movie/550`
*   **Response:**
    ```json
    {
        "content": { ... }
    }
    ```

### Get Watch Providers
*   **Endpoint:** `GET /api/content/:type/:id/providers`
*   **Params:**
    *   `type`: `movie` or `tv`
    *   `id`: TMDB ID
*   **Auth Required:** No
*   **Response:**
    ```json
    {
        "providers": ["netflix", "flatrate"],
        "tmdbId": 550,
        "type": "movie"
    }
    ```

## 5. Vibe Discovery

### Get All Vibes
*   **Endpoint:** `GET /api/discover/vibes`
*   **Description:** Returns a list of available "vibes" (categories).
*   **Auth Required:** No
*   **Response:**
    ```json
    {
        "vibes": [
            { "id": "chill", "emoji": "😌", "label": "Chill & Relax" },
            ...
        ]
    }
    ```

### Discover by Vibe
*   **Endpoint:** `GET /api/discover`
*   **Query Params:**
    *   `vibe`: Vibe ID (required, from `/vibes`)
    *   `type`: `movie` | `tv` (optional, default `movie`)
    *   `page`: Page number (optional, default 1)
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Example:** `/api/discover?vibe=bgm&type=movie`
*   **Description:** Returns content matching the vibe, filtered by user's services.
*   **Response:**
    ```json
    {
        "results": [ ... ],
        "vibe": { ... },
        "filtered": true
    }
    ```

### Tonight's Pick
*   **Endpoint:** `GET /api/discover/tonight`
*   **Description:** Recommendations based on user services and vibes, excluding watchlist items.
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Response:**
    ```json
    {
        "pick": { ... }, // Single content item
        "reason": "Because you like..."
    }
    ```

## 6. Watchlist

### Get Watchlist
*   **Endpoint:** `GET /api/watchlist`
*   **Query Params:**
    *   `status`: `want` | `watching` | `watched` (optional)
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Response:**
    ```json
    {
        "watchlist": [ ... ]
    }
    ```

### Get Watchlist Stats
*   **Endpoint:** `GET /api/watchlist/stats`
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Response:**
    ```json
    {
        "stats": {
            "total": 10,
            "byStatus": { "want": 5, "watching": 2, "watched": 3 },
            "byType": { "movie": 7, "tv": 3 }
        }
    }
    ```

### Add to Watchlist
*   **Endpoint:** `POST /api/watchlist`
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Body:**
    ```json
    {
        "contentId": "550",    // String
        "title": "Fight Club",
        "type": "movie",
        "posterPath": "/path/to/poster.jpg",
        "status": "want",      // Optional: want, watching, watched
        "rating": 9,           // Optional: 0-10
        "notes": "Must watch"  // Optional
    }
    ```
*   **Response:**
    ```json
    {
        "message": "Added to watchlist",
        "item": { ... }
    }
    ```

### Update Watchlist Item
*   **Endpoint:** `PUT /api/watchlist/:contentId`
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Params:** `contentId` (the ID used when adding, usually TMDB string)
*   **Body:** (Any subset of fields)
    ```json
    {
        "status": "watched",
        "rating": 10,
        "notes": "Loved it!"
    }
    ```
*   **Response:**
    ```json
    {
        "message": "Watchlist item updated",
        "item": { ... }
    }
    ```

### Remove from Watchlist
*   **Endpoint:** `DELETE /api/watchlist/:contentId`
*   **Headers:** `Authorization: Bearer <TOKEN>`
*   **Params:** `contentId`
*   **Response:**
    ```json
    {
        "message": "Removed from watchlist"
    }
    ```
