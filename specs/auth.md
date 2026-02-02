# Authentication Specification

## Topic of Concern
User authentication and authorization for StreamTrack platform.

## Overview
Firebase Authentication handles user identity with email/password and Google Sign-in options. Backend validates tokens via Firebase Admin SDK and manages user sessions.

## Requirements

### User Registration
- Email/password registration with validation
- Google OAuth sign-in option
- Store Firebase UID in MongoDB user document
- Generate JWT tokens for API calls

### User Login
- Email/password login
- Google OAuth login
- Return JWT token on successful authentication
- Handle invalid credentials gracefully

### Token Management
- JWT tokens for authenticated API requests
- Token verification middleware on Express
- Token refresh mechanism
- Secure token storage on frontend

### Password Security
- Password reset via Firebase
- Email verification (optional for MVP)

## Technical Implementation

### Frontend (Angular)
```typescript
// AuthService wrapping AngularFireAuth
interface AuthService {
  login(email: string, password: string): Promise<UserCredential>
  loginWithGoogle(): Promise<UserCredential>
  register(email: string, password: string): Promise<UserCredential>
  logout(): Promise<void>
  getIdToken(): Promise<string>
  currentUser$: Observable<User | null>
}
```

### Backend (Express)
```typescript
// Middleware: verifyFirebaseToken
// Extracts UID from Firebase token and attaches to request
async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  const decoded = await admin.auth().verifyIdToken(token)
  req.user = { uid: decoded.uid, email: decoded.email }
  next()
}
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Get current user |

## Dependencies
- `firebase` (Client SDK)
- `firebase-admin` (Server SDK)
- `@angular/fire` (Angular bindings)

## Acceptance Criteria
- [ ] User can register with email/password
- [ ] User can sign in with Google
- [ ] Protected routes require valid token
- [ ] Invalid tokens return 401
- [ ] User profile stored in MongoDB on first login
