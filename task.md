# StreamTrack Implementation Tasks

## 1. TMDB API - ECONNRESET Fixes
- [x] Ensure every fetch to TMDB includes `Authorization: Bearer <TMDB_READ_ACCESS_TOKEN>` or API Key in headers.
- [x] Implement retry logic: retry up to 3 times with 500ms exponential backoff.
- [x] Add a 10-second timeout to all TMDB fetch calls.
- [x] Support `TMDB_READ_ACCESS_TOKEN` in [.env](file:///e:/Project/streamtrack/.env).
- [x] Log verbose fetch errors.

## 2. Firebase Service Account Handling
- [x] Ensure missing `serviceAccountKey.json` logs a warning but doesn't crash the server.
- [x] Add `FIREBASE_SERVICE_ACCOUNT_PATH` documentation to [.env.example](file:///e:/Project/streamtrack/.env.example).
- [x] Make Firebase auth routes return 503 if Firebase Admin is not configured.

<details>
<summary>Completed Tasks</summary>

## App Name - Rename to "StreamTrack"
- [x] Update [index.html](file:///e:/Project/streamtrack/frontend/src/index.html) <title> tag.
- [x] Update Angular component titles.

## Permissions / Auth Guard
- [x] Fix eager permission requests by implementing proper Angular routing authGuard.

## API Connection (Frontend ↔ Backend)
- [x] Configure centralized ApiService and environment urls.

## Landing Page
- [x] Move app to `/home`.
- [x] Create Apple-inspired minimal landing page at `/`.

</details>
