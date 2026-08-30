# Claude Task 001 — ALL-IN-ONE BUILD

`TASK_MODE: NEW_REDESIGN`

## Goal
Build the complete Lạc Việt Media Agency web app in `th6322750-stack/LacVietShop` now. Do not wait for final visual assets or real production integrations before completing the 20-screen UI/interaction system.

## Read first
1. `/CLAUDE.md`
2. `/PROJECT_HANDOFF.md`
3. `/.webby/HANDOFF.json`
4. `/.webby/ASSET_COUNT_PLAN.json`
5. `/.webby/asset-manifest.json`
6. `/.webby/PROJECT_ENV.json`
7. `/.webby/MISSING_ASSET_REPORT.md`
8. `/.webby/FINAL_GAPS_REPORT.md`

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
- do not search, generate, redraw, or substitute another brand visual.

Only after all 20 screens are complete, return the consolidated missing-asset report. ChatGPT will inspect the original clone screenshots/UI and render/prepare the missing assets. Then patch them into their exact mapped slots.

## Missing production data — DO NOT STOP VISUAL BUILD
Use typed DEMO config/data for unavailable domain/contact/payment/catalog/auth/backend values. Keep it clearly separated from production adapters and list every unresolved live integration in `.webby/FINAL_GAPS_REPORT.md`.

Never perform real financial/account actions with invented values.

## Reference policy
`clone-thatim-vn` is reference-only. Do not copy Thatim branding, captured credentials, access tokens, CSRF values, user identity, phone, balance or session state.

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
