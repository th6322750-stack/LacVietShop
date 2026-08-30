# Claude Task 001 — ALL-IN-ONE BUILD

`TASK_MODE: NEW_REDESIGN`

## Goal
Build the complete Lạc Việt Media Agency web app in `th6322750-stack/LacVietShop` now. Do not wait for final visual assets or real production integrations before completing the 20-screen UI/interaction system.

## Read first — mandatory
1. `/CLAUDE.md`
2. `/PROJECT_HANDOFF.md`
3. `/references/REFERENCE_MAP.md`
4. The matching image in `/references/ui-approved/` **before implementing each route**
5. `/references/brand/lac-viet-logo-horizontal.webp` for brand identity reference
6. `/.webby/HANDOFF.json`
7. `/.webby/ASSET_COUNT_PLAN.json`
8. `/.webby/asset-manifest.json`
9. `/.webby/PROJECT_ENV.json`
10. `/.webby/MISSING_ASSET_REPORT.md`
11. `/.webby/FINAL_GAPS_REPORT.md`

## Visual-reference authority
- `/references/ui-approved/01-home.webp` through `20-product-vpn.webp` are the **approved Lạc Việt visual targets** created and approved in ChatGPT.
- They are reference copies for hierarchy, page identity, composition, brand direction and relative emphasis.
- **Do not measure pixel geometry from these images.** Exact implementation values come from `PROJECT_HANDOFF.md` and `.webby/*`.
- `th6322750-stack/clone-thatim-vn` remains the original feature/flow reference. Use it only when you need to understand the source page/interaction that corresponds to the target image according to `references/REFERENCE_MAP.md`.
- Do not copy Thatim branding, captured credentials, user state or session data.

## Locked stack
Initialize a new app with:
- Next.js App Router
- TypeScript
- Tailwind CSS
- pnpm
- `@tabler/icons-react`
- React Hook Form + Zod when useful
- Recharts when useful

Record actual installed versions and commands into `PROJECT_ENV.json` after initialization.

## Required implementation
### P0 Foundation
Design tokens, AppShell, Sidebar, Topbar, responsive navigation, primitives, cards, tables, form controls, chart shell, demo-data adapters, asset resolver.

### P1 Commercial
- Trang chủ
- Dịch vụ / Tạo đơn
- Sản phẩm Premium
- ONE shared ProductDetail
- 8 configs: YouTube, CapCut, Canva, Veo3, Gemini, ChatGPT, Netflix, VPN

### P2 Order / Money
- Tiến độ đơn hàng
- Nạp tiền
- Dòng tiền & Giao dịch
- Lịch sử hoạt động
- Sản phẩm đã mua

### P3 User / Growth / API
- Tài khoản
- Affiliate / Đại lý
- Panel con / Đại lý con
- API Documentation

### P4 Finish
Responsive, loading/empty/error states, validation, accessibility/focus, route smoke checks, type/lint/build checks, secret scan.

## Missing assets — DO NOT STOP BUILD
If an exact asset is missing:
- use a neutral layout-preserving placeholder with a stable `TODO_ASSET:<key>` marker;
- append the item to `.webby/MISSING_ASSET_REPORT.md`;
- continue all routes and components;
- do not search, generate, redraw, approximate, or substitute another brand visual.

Only after all 20 screens are complete, return the consolidated missing-asset report. ChatGPT will inspect the corresponding approved target image plus the original clone screenshot/UI and render/prepare the missing asset. Then patch it into the exact mapped slot without redesigning the route.

## Missing production data — DO NOT STOP VISUAL BUILD
Use typed DEMO config/data for unavailable domain/contact/payment/catalog/auth/backend values. Keep it clearly separated from production adapters and list every unresolved live integration in `.webby/FINAL_GAPS_REPORT.md`.

Never perform real financial/account actions with invented values.

## Product architecture
Do not create eight duplicated product pages. One `ProductDetail` system, eight data/config variants.

## Expected final response
Return a concise completion report with:
- project structure/stack;
- confirmation that all 20 screens/routes are implemented;
- checks and results;
- path to `.webby/MISSING_ASSET_REPORT.md`;
- path to `.webby/FINAL_GAPS_REPORT.md`;
- any genuine `TECHNICAL_CONSTRAINT`.

Do not auto-merge and do not self-approve final visual parity.