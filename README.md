# LacVietShop

Lạc Việt Media Agency customer web app rebuild.

## Project authority
- **Production target:** `th6322750-stack/LacVietShop`.
- **Reference only:** `th6322750-stack/clone-thatim-vn` — use its 20 full-page screenshots/static HTML only to understand feature scope, information architecture and interaction flow. Do not copy Thatim branding, captured credentials, session state or user data.
- **Design process:** `th6322750-stack/webbyLucifer` v3.3.
- **User:** final acceptance authority.
- **ChatGPT:** design/UI/asset/state/motion-feel authority.
- **Claude:** implementation/technical-mechanism authority.

## Current execution state
`BUILD_APPROVED_WITH_PLACEHOLDERS`

The whole 20-screen app may be built now. Missing visual assets do **not** block implementation.

## Build-first workflow
1. Build all 20 screens/routes and shared components.
2. If an exact visual asset is missing, use a neutral layout-preserving `TODO_ASSET:<key>` placeholder.
3. Do not search/generate/redraw/substitute missing brand visuals.
4. Log every gap in `.webby/MISSING_ASSET_REPORT.md`.
5. Finish the entire app first.
6. ChatGPT reviews the original clone UI/screenshots and renders/prepares the missing production assets.
7. Claude patches the exact asset slots without redesigning the surrounding UI.

Missing real production config is handled similarly: use isolated typed DEMO data for the visual build, never execute real financial/account side effects with invented values, and log live-integration gaps in `.webby/FINAL_GAPS_REPORT.md`.

## Locked stack
Next.js App Router + TypeScript + Tailwind CSS + pnpm. Generic UI icons use `@tabler/icons-react`.

## Start here
Claude reads in this order:
1. `CLAUDE.md`
2. `PROJECT_HANDOFF.md`
3. `.webby/CLAUDE_TASK.md`
4. `.webby/HANDOFF.json`
5. `.webby/PROJECT_ENV.json`
6. `.webby/asset-manifest.json`
