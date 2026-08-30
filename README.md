# LacVietShop

Lạc Việt Media Agency customer web app rebuild.

## Project authority

- **Production target:** this repository (`th6322750-stack/LacVietShop`).
- **Reference only:** `th6322750-stack/clone-thatim-vn` — use its 20 full-page screenshots / static HTML only to understand feature scope, information architecture and interaction flow. **Do not copy captured credentials, session state, user data or Thatim branding.**
- **Design process:** `th6322750-stack/webbyLucifer` v3.3.
- **User:** final acceptance authority.
- **ChatGPT:** design/UI/asset/state/motion-feel authority.
- **Claude:** implementation/technical-mechanism authority.

## Current state

`VISUAL_DIRECTION_APPROVED`

`IMPLEMENTATION_READY_UI = false` until the asset/spec blockers in `PROJECT_HANDOFF.md` and `.webby/` are resolved.

## Critical asset rule for Claude

When a required image/brand/decorative asset is absent or unmapped, **STOP that visual subtask and return `NEED_ASSET`** with route, section, role, desired ratio/size and intended usage. **Do not search, generate, fabricate, redraw, replace, approximate or substitute any missing visual asset.** ChatGPT will inspect the original reference and prepare/render the required production asset, then update the manifest.

Start with `CLAUDE.md`, then `PROJECT_HANDOFF.md` and `.webby/HANDOFF.json`.
