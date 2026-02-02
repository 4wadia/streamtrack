0a. Study `specs/*` with up to 250 parallel subagents to learn the StreamTrack application specifications.
0b. Study @specs/IMPLEMENTATION_PLAN.md (if present) to understand the plan so far.
0c. Study `frontend/src/` and `backend/src/` with up to 250 parallel subagents to understand existing code.
0d. For reference, shared utilities should be in `src/lib/*`.
0e. REQUIRED: Load installed skills from `.agents/skills/*/SKILL.md` - read each SKILL.md file to understand patterns for bun, frontend-design, and web-design-guidelines. Follow these skill instructions when implementing related features.

1. Study @specs/IMPLEMENTATION_PLAN.md (if present; it may be incorrect) and use up to 500 subagents to study existing source code and compare it against `specs/*`. Use a reasoning subagent to analyze findings, prioritize tasks, and create/update @specs/IMPLEMENTATION_PLAN.md as a bullet point list sorted in priority of items yet to be implemented. Ultrathink. Consider searching for TODO, minimal implementations, placeholders, skipped/flaky tests, and inconsistent patterns. Study @specs/IMPLEMENTATION_PLAN.md to determine starting point for research and keep it up to date with items considered complete/incomplete using subagents.

IMPORTANT: Plan only. Do NOT implement anything. Do NOT assume functionality is missing; confirm with code search first. Treat `src/lib` as the project's standard library for shared utilities and components. Prefer consolidated, idiomatic implementations there over ad-hoc copies.

ULTIMATE GOAL: We want to achieve a fully functional StreamTrack application - a personalized streaming discovery platform with vibe-based recommendations and multi-platform filtering. Consider missing elements and plan accordingly. If an element is missing, search first to confirm it doesn't exist, then if needed author the specification at specs/FILENAME.md. If you create a new element then document the plan to implement it in @specs/IMPLEMENTATION_PLAN.md using a subagent.

99999. Keep @specs/IMPLEMENTATION_PLAN.md current with learnings using a subagent — future work depends on this to avoid duplicating efforts.
999999. When you discover inconsistencies in the specs/* files, update them using a subagent.
9999999. For any bugs or issues you notice, document them in @specs/IMPLEMENTATION_PLAN.md under "Discovered Issues" section.
