# AGENTS.md - StreamTrack Operational Guide

This file is the **MANDATORY** operational guide for all agents. Status updates belong in `IMPLEMENTATION_PLAN.md`.

---

## ⚠️ MANDATORY SKILL ENFORCEMENT

> [!CAUTION]
> **BEFORE ANY FRONTEND WORK**, agents MUST:
> 1. Read `.agent/skills/senior-frontend/SKILL.md`
> 2. Read `.agent/skills/senior-frontend/references/frontend_best_practices.md`
> 3. Follow the patterns and run the analysis scripts

**Failure to use skills = rejected work.**

| Skill | Purpose | Location | REQUIRED FOR |
|-------|---------|----------|--------------|
| `senior-frontend` | Frontend patterns, component scaffolding, bundle analysis | `.agent/skills/senior-frontend/SKILL.md` | **ALL frontend work** |

### Skill Usage Commands
```bash
# Before starting frontend work - analyze current state
python .agent/skills/senior-frontend/scripts/bundle_analyzer.py frontend

# Generate new components following best practices
python .agent/skills/senior-frontend/scripts/component_generator.py <project-path> [options]

# After completing frontend work - verify quality
python .agent/skills/senior-frontend/scripts/frontend_scaffolder.py --analyze
```

---

## Build & Run

### Prerequisites
- **Bun**: v1.1+ (runtime & package manager)
- **MongoDB**: Local or Atlas connection
- **Firebase**: Project with auth enabled
- **TMDB API Key**: From themoviedb.org

### Development Mode
```bash
# From project root
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

---

## Validation (Run After Every Change)

```bash
# Type checking
bun run typecheck

# Linting
bun run lint

# Tests
cd backend && bun test
cd frontend && bun run test
```

---

## Code Patterns (ENFORCED)

### Frontend (Angular 19+)
- **Components**: `frontend/src/app/features/` and `frontend/src/app/shared/`
- **Services**: `frontend/src/app/core/services/`
- **State**: Angular Signals (NO RxJS BehaviorSubjects for state)
- **Styling**: Component-scoped CSS with design tokens
- **Icons**: Lucide Angular ONLY (NO emojis)
- **Animations**: Angular Animations API

### Backend (Express + Bun)
- **Routes**: `backend/src/routes/`
- **Middleware**: `backend/src/middleware/`
- **Services**: `backend/src/services/`
- **Types**: `backend/src/types/`

### Design System (ENFORCED)
```css
/* Colors - USE THESE ONLY */
--color-accent: #E50914;
--bg-cinema-black: #0C0C0C;
--bg-card: #181818;
--text-primary: #FFFFFF;
--text-secondary: #A3A3A3;

/* Animations */
--ease-cinema: cubic-bezier(0.16, 1, 0.3, 1);
```

---

## Current Focus: Phase 8-10

See `IMPLEMENTATION_PLAN.md` for detailed task breakdown.

**Priority Order:**
1. API fixes (region, provider mapping)
2. Onboarding flow
3. Home page redesign
4. Search improvements
