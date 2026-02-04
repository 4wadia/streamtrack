# AGENTS.md - StreamTrack Operational Guide

This file is the operational heart of the Ralph loop. Keep it concise (~60 lines max).
Status updates and progress notes belong in `IMPLEMENTATION_PLAN.md`, not here.

## Required Skills

**IMPORTANT**: Before starting any work, agents MUST load and follow the installed skills:

| Skill | Purpose | Location |
|-------|---------|----------|
| `bun` | Bun runtime patterns, package management | `.agents/skills/bun/SKILL.md` |
| `frontend-design` | Frontend component patterns | `.agents/skills/frontend-design/SKILL.md` |
| `web-design-guidelines` | UI/UX design standards | `.agents/skills/web-design-guidelines/SKILL.md` |
| `angular-component` | Angular component patterns | `.agents/skills/angular-component/SKILL.md` |
| `angular-routing` | Angular routing patterns | `.agents/skills/angular-routing/SKILL.md` |

**Load skills by reading their SKILL.md files before implementing related features.**

## Build & Run

### Prerequisites
- **Bun**: v1.1+ (runtime & package manager)
- **MongoDB**: Local or Atlas connection
- **Firebase**: Project with auth enabled
- **TMDB API Key**: From themoviedb.org

### Environment Setup
Create `.env` files as documented in project root.

### Development Mode
```bash
# From project root - run both frontend and backend
bun run dev

# Or separately:
cd frontend && bun run dev    # Port 4200
cd backend && bun run dev     # Port 3000
```

### Production Build
```bash
cd frontend && bun run build
cd backend && bun run build
```

## Validation (Backpressure)

Run these after implementing to verify correctness:

```bash
# Type checking
bun run typecheck

# Linting
bun run lint

# Unit tests
cd backend && bun test       # Backend: 24 tests
cd frontend && bun run test  # Frontend: 9 tests (Vitest)

# E2E tests (when available)
bun run test:e2e
```

## Operational Notes

- MongoDB must be running before backend starts
- TMDB_API_KEY is required for any content endpoints
- Firebase credentials required for auth middleware
- Frontend proxies API calls to backend in dev mode

## Codebase Patterns

### Frontend (Angular 19)
- Standalone components in `frontend/src/app/features/`
- Shared components in `frontend/src/app/shared/`
- Services in `frontend/src/app/core/services/`
- State via Angular Signals

### Backend (Express + Bun)
- Routes in `backend/src/routes/`
- Middleware in `backend/src/middleware/`
- Services in `backend/src/services/`
- Types in `backend/src/types/`

### Shared Patterns
- Use `src/lib/` for shared utilities
- Prefer async/await over callbacks
- Use TypeScript strict mode
- Follow existing code patterns before creating new ones
