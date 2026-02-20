0. Read `AGENTS.md` first for run/build/test workflow and repo conventions.

1. Read `specs/IMPLEMENTATION_PLAN.md` and pick the highest-priority incomplete item.

2. Before coding, confirm whether functionality already exists:
- Search backend in `backend/src/**`
- Search frontend in `frontend/src/**`

3. Implement the selected item end-to-end.

4. After implementation:
- Run `bun run typecheck`
- Run `bun run lint`
- Run `bun run test`

5. Update docs:
- Mark completed items in `specs/IMPLEMENTATION_PLAN.md`
- Add/remove entries under "Discovered Issues" as needed
- Update `AGENTS.md` only if architectural/runtime context changed

6. Keep changes practical:
- No placeholder implementations
- No speculative rewrites
- Preserve existing contracts unless intentionally versioned
