# StreamTrack Implementation Plan

This file tracks active work only.
Historical completed phase detail was archived by consolidation to keep this plan actionable.

## Project Status

- Overall state: Functional baseline implemented across frontend + backend.
- Core areas implemented:
- Auth (Firebase client + backend token verification).
- Provider selection and persistence.
- TMDB search/trending/details integration.
- Vibe discovery (predefined + custom vibe API).
- Onboarding flow routes and pages.
- Watchlist CRUD + stats.
- Home/search/account/watchlist route structure.

## Current Priorities

1. Reliability and API consistency
- [ ] Align route docs and response contracts with current backend behavior.
- [ ] Add stronger request validation on write endpoints (`watchlist`, `custom vibes`, `user services/genres`).
- [ ] Normalize error payload shape across all route modules.

2. Region and provider robustness
- [ ] Make TMDB watch region configurable by environment/user preference (currently hardcoded `IN`).
- [ ] Confirm provider ID mapping and labels remain consistent in backend + frontend.

3. Discovery quality
- [ ] Improve vibe discover filtering quality (runtime/quality constraints where intended).
- [ ] Reduce API fanout cost in filtered trending/provider lookups.

4. Frontend polish and consistency
- [ ] Verify shared design tokens are used consistently across feature components.
- [ ] Audit onboarding-to-home transitions for edge cases (skip flows, refresh, unauth redirects).
- [ ] Ensure custom vibe management UX exists end-to-end (API exists; verify UI parity).

5. Testing and quality gates
- [ ] Expand backend route tests for unhappy paths and validation failures.
- [ ] Expand frontend component/service tests for onboarding/search/watchlist critical flows.
- [ ] Resolve any remaining type-test friction so `typecheck` and tests are stable by default.

## Discovered Issues

- Potential doc drift: older specs referenced removed/legacy files and stale assumptions.
- Backend auth dependency is strict: without Firebase admin credentials, all protected routes fail by design.
- TMDB region is currently fixed to `IN` in `backend/src/services/tmdb.service.ts`, limiting multi-region behavior.
- Some historical notes mention test/type mismatches; re-verify with current toolchain before release.

## Validation Commands

- `bun run typecheck`
- `bun run lint`
- `bun run test`

## Working Rules

- Keep this file focused on active/incomplete work.
- Move completed items out instead of accumulating long completed histories.
- When behavior changes, update this file and `AGENTS.md` in the same PR if context changed.
