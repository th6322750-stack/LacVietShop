# Claude Task 000 — Pre-implementation readiness only

`TASK_MODE: NEW_REDESIGN`

Do not begin broad feature coding yet.

## Goal
Prepare this new repository for implementation without redesigning anything and without inventing missing assets/specs.

## Read first
1. `/CLAUDE.md`
2. `/PROJECT_HANDOFF.md`
3. `/.webby/HANDOFF.json`
4. `/.webby/ASSET_COUNT_PLAN.json`
5. `/.webby/asset-manifest.json`
6. `/.webby/PROJECT_ENV.json`

## Required actions
1. DRIFT CHECK.
2. Confirm repository is a new rebuild target; do not modify `clone-thatim-vn`.
3. Propose the framework/runtime/package-manager/development setup suitable for this app and report it as a short `BLOCKED_SPEC` decision request before broad implementation.
4. Do a targeted security check only for accidentally copied reference credentials if any files appear later; do not broad-audit unrelated systems.
5. Review the asset manifest only enough to identify dependencies for P0/P1.
6. For every missing visual, use `NEED_ASSET` format from `CLAUDE.md`. Do not search/generate/redraw/substitute.
7. Do not auto-merge.

## Do not
- create fake assets;
- scrape or search the internet for visuals;
- redesign the approved UI;
- copy reference user/session/access-token data;
- implement eight duplicated product-detail pages;
- add a global scroll engine;
- start payment/auth/business logic using invented assumptions.

## Expected response
Return a concise readiness report containing:
- proposed stack and why it fits;
- exact files/configs you would create for P0;
- `NEED_ASSET` items needed by P0/P1 only;
- `BLOCKED_SPEC` items that prevent correct implementation;
- no implementation until those material decisions are approved.
