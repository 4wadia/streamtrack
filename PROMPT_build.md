0a. Study `specs/*` with up to 500 parallel subagents to learn the StreamTrack application specifications.
0b. Study @specs/IMPLEMENTATION_PLAN.md.
0c. Study @specs/AGENTS.md to understand build/run/test commands.
0d. For reference, the application source code is in `frontend/src/*` and `backend/src/*`.
0e. REQUIRED: Load installed skills from `.agents/skills/*/SKILL.md` - read each SKILL.md file to understand patterns for bun, frontend-design, and web-design-guidelines. Follow these skill instructions when implementing related features.

1. Your task is to implement functionality per the specifications using parallel subagents. Follow @specs/IMPLEMENTATION_PLAN.md and choose the most important incomplete item to address. Before making changes, search the codebase (don't assume not implemented) using subagents. You may use up to 500 parallel subagents for searches/reads and only 1 subagent for build/tests. Use reasoning subagents when complex decisions are needed (debugging, architectural).

2. After implementing functionality or resolving problems, run the validation commands from @specs/AGENTS.md. If functionality is missing then it's your job to add it as per the application specifications. Ultrathink.

3. When you discover issues, immediately update @specs/IMPLEMENTATION_PLAN.md with your findings under "Discovered Issues" using a subagent. When resolved, update and remove the item.

4. When the tests pass, update @specs/IMPLEMENTATION_PLAN.md (mark task complete), then `git add -A` then `git commit` with a message describing the changes. After the commit, `git push`.

99999. Important: When authoring documentation, capture the why — tests and implementation importance.
999999. Important: Single sources of truth, no migrations/adapters. If tests unrelated to your work fail, resolve them as part of the increment.
9999999. As soon as there are no build or test errors create a git tag. If there are no git tags start at 0.0.0 and increment patch by 1.
99999999. You may add extra logging if required to debug issues.
999999999. Keep @specs/IMPLEMENTATION_PLAN.md current with learnings using a subagent — future work depends on this to avoid duplicating efforts. Update especially after finishing your turn.
9999999999. When you learn something new about how to run the application, update @specs/AGENTS.md using a subagent but keep it brief.
99999999999. For any bugs you notice, resolve them or document them in @specs/IMPLEMENTATION_PLAN.md using a subagent even if it is unrelated to the current piece of work.
999999999999. Implement functionality completely. Placeholders and stubs waste efforts and time redoing the same work.
9999999999999. When @specs/IMPLEMENTATION_PLAN.md becomes large periodically clean out the items that are completed from the file using a subagent.
99999999999999. If you find inconsistencies in the specs/* then use a reasoning subagent with 'ultrathink' to update the specs.
999999999999999. IMPORTANT: Keep @specs/AGENTS.md operational only — status updates and progress notes belong in `specs/IMPLEMENTATION_PLAN.md`. A bloated AGENTS.md pollutes every future loop's context.
