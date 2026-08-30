# LACVIETSHOP — SINGLE ALL-IN-ONE EXECUTION

`TASK_MODE: NEW_REDESIGN`

This is ONE continuous execution contract. Do not split the project into Task 001 / Task 002 / later phases that require separate user prompts. Work through the full project continuously until the complete first-pass app is done, then report the remaining asset/integration gaps once.

## Mission
Build the complete NEW Lạc Việt Media Agency web app in `th6322750-stack/LacVietShop` using the approved Lạc Việt UI references in this repo and `th6322750-stack/clone-thatim-vn` only as the original feature/flow reference.

## Mandatory references
Read before implementation:
1. `/CLAUDE.md`
2. `/PROJECT_HANDOFF.md`
3. `/references/REFERENCE_MAP.md`
4. `/references/ui-approved/01-home.webp` through `/references/ui-approved/20-product-vpn.webp`
5. `/references/brand/lac-viet-logo-horizontal.webp`
6. `/.webby/HANDOFF.json`
7. `/.webby/ASSET_COUNT_PLAN.json`
8. `/.webby/asset-manifest.json`
9. `/.webby/PROJECT_ENV.json`
10. `/.webby/MISSING_ASSET_REPORT.md`
11. `/.webby/FINAL_GAPS_REPORT.md`

Before implementing each route, inspect its matching approved target image from `references/REFERENCE_MAP.md`.

## Visual authority
- Approved Lạc Việt images in `references/ui-approved/` = target hierarchy, composition, route identity, brand direction and relative emphasis.
- `PROJECT_HANDOFF.md` + `.webby/*` = geometry, tokens, responsive rules, states and behavior.
- Never measure screenshot pixels to invent CSS values.
- `clone-thatim-vn` = reference only for original page scope/flow; never copy Thatim branding, captured credentials, user/session data or secret values.

## Locked stack
Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- pnpm
- `@tabler/icons-react`
- React Hook Form + Zod where useful
- Recharts where useful

Initialize the project and record actual installed versions/commands in `.webby/PROJECT_ENV.json`.

## Complete implementation scope — do all of it in this single execution

### Shared foundation
Build design tokens, AppShell, Sidebar, Topbar, mobile navigation, route model, buttons, inputs, selects, radio cards, switches, tabs, badges, modals, drawers, toasts, skeletons, stat/info/support cards, platform tiles, product cards, package cards, order summary, payment method cards, status badges, progress bars, tables, filters, pagination, chart containers, QR/code blocks, empty/error states, typed demo-data adapters and asset resolver.

### All 20 screens
1. Trang chủ
2. Dịch vụ / Tạo đơn
3. Sản phẩm Premium
4. Tiến độ đơn hàng
5. Tài khoản
6. Lịch sử hoạt động
7. Dòng tiền & Giao dịch
8. Nạp tiền
9. Affiliate / Đại lý
10. Panel con / Đại lý con
11. API Documentation
12. Sản phẩm đã mua
13. YouTube Premium
14. CapCut Pro
15. Canva Pro
16. Google Veo 3 AI
17. Google Gemini Pro
18. ChatGPT Plus + API Codex
19. Netflix Ultra 4K
20. Combo VPN Quốc Tế

### Product system
Implement ONE reusable `ProductDetail` architecture with 8 product configs: YouTube, CapCut, Canva, Veo3, Gemini, ChatGPT, Netflix, VPN. Do not duplicate eight unrelated page implementations.

### Finish in the same execution
Complete responsive behavior, loading/empty/error/partial-data states, validation, keyboard/focus accessibility, route smoke tests, type/lint/build checks, secret scan and basic responsive checks at the declared widths.

## Missing asset policy — continue, do not stop
If an exact production visual asset is missing, ambiguous, unmapped or insufficient quality:
1. Do not search the web.
2. Do not generate or redraw it.
3. Do not substitute another logo/product/platform visual.
4. Insert a neutral layout-preserving placeholder with a stable key: `TODO_ASSET:<key>`.
5. Append one structured entry to `.webby/MISSING_ASSET_REPORT.md`.
6. Continue building the entire app.

Each entry must contain:
```text
NEED_ASSET
key: <stable key>
route: <route>
section: <section>
role: <role>
needed: <what ChatGPT must prepare/render>
ratio/size: <required usage>
placeholder: <component/file/slot>
reference_target: <approved Lạc Việt image>
reference_original: <Thatim page/screenshot when useful>
```

Do not ask the user to resolve each asset one-by-one during the build. Collect them all and report once after the complete first pass. ChatGPT will then render/prepare the missing assets and update the manifest; Claude will patch those exact slots afterward without redesigning surrounding UI.

## Missing production data policy — continue visual build
For unavailable domain/contact/payment/catalog/auth/backend values:
- use typed, clearly separated DEMO data/config;
- never trigger real money/account/external side effects using invented data;
- record unresolved live integration in `.webby/FINAL_GAPS_REPORT.md`;
- continue all UI/interaction work.

## Security
Never copy access tokens, CSRF values, balances, phone numbers, account identity or session state captured in `clone-thatim-vn`. No real secret may appear in public client JS, HTML meta tags or docs examples. API credentials are masked by default.

## Do not split execution
Do not stop after “foundation”, “P1”, “P2”, or any numbered internal phase to wait for another user message. Those labels are only implementation order. Continue through all scopes autonomously unless there is a genuine destructive/security risk or a technical constraint that makes further work impossible.

## Final first-pass completion criteria
The single execution is complete only when:
- all 20 target routes are reachable;
- shared AppShell is consistent;
- responsive behavior is implemented;
- all 8 product variants use one shared ProductDetail system;
- core UI interactions run with safe typed demo data where needed;
- states/validation/accessibility basics are present;
- available checks pass;
- `.webby/MISSING_ASSET_REPORT.md` is consolidated;
- `.webby/FINAL_GAPS_REPORT.md` is consolidated.

## Final response only after the complete first pass
Report:
1. app structure and stack;
2. confirmation/status of all 20 routes;
3. checks run and results;
4. consolidated missing asset report path;
5. consolidated production integration gaps path;
6. genuine technical constraints, if any.

Do not auto-merge and do not self-approve final visual parity.