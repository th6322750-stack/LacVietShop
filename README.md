# LacVietShop

Lạc Việt Media Agency customer web app rebuild.

## Project authority
- **Production target:** `th6322750-stack/LacVietShop`.
- **Reference only:** `th6322750-stack/clone-thatim-vn` — use its screenshots/static HTML only to understand feature scope, information architecture and interaction flow. Do not copy Thatim branding, captured credentials, session state or user data.
- **Design process:** `th6322750-stack/webbyLucifer` v3.3.
- **User:** final acceptance authority.
- **ChatGPT:** design/UI/asset/state/motion-feel authority.
- **Claude:** implementation/technical-mechanism authority.

## Current execution state
`BUILD_APPROVED_WITH_PLACEHOLDERS`

This project uses **ONE continuous ALL-IN-ONE execution**. Do not split it into Task 001 / Task 002 / separate staged prompts.

## Build-first workflow
1. Build the complete app and all 20 target screens in one continuous execution.
2. Before each route, inspect the matching approved image in `references/ui-approved/` using `references/REFERENCE_MAP.md`.
3. If an exact visual asset is missing, use a neutral layout-preserving `TODO_ASSET:<key>` placeholder.
4. Do not search/generate/redraw/substitute missing brand visuals.
5. Log every visual gap in `.webby/MISSING_ASSET_REPORT.md` and keep building.
6. Log unresolved live business/payment/backend config in `.webby/FINAL_GAPS_REPORT.md` and keep building with isolated typed DEMO data.
7. Only after all 20 screens and checks are complete, return the consolidated reports once.
8. ChatGPT renders/prepares missing production assets; Claude patches them into the exact mapped slots without redesigning surrounding UI.

## Locked stack
Next.js App Router + TypeScript + Tailwind CSS + pnpm. Generic UI icons use `@tabler/icons-react`.

## Start here
Claude reads in this order:
1. `CLAUDE.md`
2. `.webby/ALL_IN_ONE.md`
3. `PROJECT_HANDOFF.md`
4. `references/REFERENCE_MAP.md`
5. matching files in `references/ui-approved/`
6. `.webby/HANDOFF.json`
7. `.webby/PROJECT_ENV.json`
8. `.webby/asset-manifest.json`

The only execution command is: **complete `.webby/ALL_IN_ONE.md` from beginning to end.**