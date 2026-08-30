# LẠC VIỆT MEDIA AGENCY — ALL-IN-ONE PROJECT HANDOFF

## 1. Project decision
- Task mode: `NEW_REDESIGN`.
- Production repo: `th6322750-stack/LacVietShop`.
- Architecture: rebuild as a NEW web app.
- Reference only: `th6322750-stack/clone-thatim-vn`.
- Design protocol: `th6322750-stack/webbyLucifer` v3.3.
- Brand: Lạc Việt Media Agency.
- Visual direction approved: bright white / warm white shell, deep navy typography, gold accent, premium clean customer-panel UI.
- User override: **BUILD ALL FIRST -> REPORT MISSING ASSETS LAST -> CHATGPT RENDER/PREPARE -> CLAUDE PATCH EXACT SLOTS**.
- Execution status: `BUILD_APPROVED_WITH_PLACEHOLDERS`.

## 2. Authority
- USER = final visual acceptance.
- ChatGPT = design/UI/asset/state/motion-feel authority.
- Claude = implementation/technical mechanism authority.
- Raster renders = hierarchy/arrangement reference only.
- This document + `.webby/*` = implementation values/constraints.
- Asset manifest = exact production asset mapping when assets exist.

Claude must not measure screenshot pixels to invent spacing, widths, breakpoints or typography.

## 3. Locked implementation stack
Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- pnpm
- `@tabler/icons-react` for generic UI icons
- React Hook Form + Zod when useful
- Recharts when useful

Record actual installed versions in `.webby/PROJECT_ENV.json` after initialization. Do not change framework without a genuine `TECHNICAL_CONSTRAINT`.

## 4. Twenty target screens
1. `index.html` reference -> **Trang chủ**
2. `services.html` -> **Dịch vụ / Tạo đơn**
3. `products.html` -> **Sản phẩm Premium**
4. `progress.html` -> **Tiến độ đơn hàng**
5. `account.html` -> **Thông tin tài khoản**
6. `history.html` -> **Lịch sử hoạt động**
7. `cashflows.html` -> **Dòng tiền & Giao dịch**
8. `deposit_addfunds.html` -> **Nạp tiền**
9. `affiliate.html` -> **Affiliate / Đại lý**
10. `child_panel.html` -> **Panel con / Đại lý con**
11. `api_docs.html` -> **API Documentation**
12. `product_purchased.html` -> **Sản phẩm đã mua**
13. `product_6.html` -> **YouTube Premium**
14. `product_7.html` -> **CapCut Pro**
15. `product_8.html` -> **Canva Pro**
16. `product_9.html` -> **Google Veo 3 AI**
17. `product_10.html` -> **Google Gemini Pro**
18. `product_11.html` -> **ChatGPT Plus + API Codex**
19. `product_12.html` -> **Netflix Ultra 4K**
20. `product_174.html` -> **Combo VPN Quốc Tế**

### Shared product architecture
Do not code 8 unrelated product pages. Build ONE reusable `ProductDetail` system driven by config/data variants: `youtube`, `capcut`, `canva`, `veo3`, `gemini`, `chatgpt`, `netflix`, `vpn`.

Product variants may alter hero media, package cards, benefit blocks, order summary, FAQ and accent treatment. Netflix may have a dark product hero only; global app shell remains light.

## 5. Coding order
### P0 — Foundation
- initialize locked stack;
- design tokens;
- AppShell;
- Sidebar;
- Topbar;
- navigation;
- responsive drawer/icon rail;
- Button/Input/Textarea/Select/Checkbox/RadioCard/Switch/Tabs/Badge/Tooltip/Dropdown/Modal/Drawer/Toast/Skeleton;
- StatCard/InfoCard/SupportCard/ProductCard/PackageCard/OrderSummary/StatusBadge/ProgressBar/DataTable/FilterBar/Pagination/ChartCard/QRCard/CodeBlock/EmptyState/ErrorState;
- typed demo-data adapters;
- asset resolver;
- security rules.

### P1 — Commercial journey
Trang chủ -> Dịch vụ -> Products -> shared ProductDetail -> all 8 product configs.

### P2 — Order/money
Progress -> Deposit -> Cashflows -> History -> Purchased products.

### P3 — User/growth/API
Account -> Affiliate -> Child panel -> API docs.

### P4 — Completion
Responsive -> loading/empty/error states -> validation -> accessibility/focus -> route smoke tests -> lint/type/build -> secret scan.

### P5 — Missing asset consolidation
After all 20 screens are built, finalize `.webby/MISSING_ASSET_REPORT.md`.

### P6 — Final asset patch
ChatGPT inspects the original clone/screenshots and renders/prepares missing assets. Claude patches the exact `TODO_ASSET` slots only.

## 6. Design tokens
### Colors
```css
--lv-bg: #F8FAFC;
--lv-surface: #FFFFFF;
--lv-surface-soft: #FFFDF8;
--lv-border: #E6EAF0;
--lv-border-gold: #F0D59B;
--lv-navy-950: #0B1533;
--lv-navy-900: #0F1B3D;
--lv-navy-700: #26375E;
--lv-text: #0F1B3D;
--lv-muted: #667085;
--lv-gold-700: #A65F00;
--lv-gold-600: #C97900;
--lv-gold-500: #D99A16;
--lv-gold-400: #EDB84B;
--lv-gold-100: #FFF1D6;
--lv-gold-050: #FFF9ED;
--lv-success: #16A34A;
--lv-warning: #D97706;
--lv-danger: #DC2626;
--lv-info: #2563EB;
```
Gold is an accent/CTA color, not body text. Semantic success/warning/danger colors stay semantic.

### Typography
Font: Inter.
- H1 desktop 32/40/700
- H1 mobile 26/34/700
- H2 24/32/700
- H3 18/26/700
- Card title 15/22/600
- Body 14/20/400
- Body strong 14/20/600
- Label 13/18/600
- Small 12/18/400–600
- Metric 24/32/700
- Button 14/20/600

Content rules: prices no-wrap; sidebar labels 1 line; product title max 2 lines; product-detail title max 2 desktop / 3 mobile; hero description max 3 lines; table text ellipsis where needed; test realistic long Vietnamese values.

### Radius / spacing
- control 10px
- card 14px
- hero/major panel 16px
- pill 999px
- spacing scale 4/8/12/16/20/24/32/40/48
- desktop page gutter 24px
- mobile gutter 16px
- card padding 16–20px
- major card padding 24px
- section gap 24px
- grid gap 16px

## 7. App shell / responsive
Breakpoints: `576 / 768 / 992 / 1200 / 1400`.

### >=1200
- fixed sidebar 224px
- sticky topbar 72px
- main max-width 1560px
- 24px gutter
- white sidebar
- active nav = warm gold tint + gold indicator

### 992–1199
- 80px icon rail
- compact brand mark/placeholder if asset missing
- tooltips

### <992
- sidebar off-canvas
- topbar menu trigger
- right summary panels stack below main content

### <768
- tables horizontal-scroll within their card
- search may move/expand
- dense rows simplify

### <576
- 16px gutter
- one-column product grid
- full-width primary CTA
- forms stack
- platform tiles may horizontal-scroll

Responsive smoke widths: `390, 576, 768, 992, 1200, 1440`.

## 8. Screen rules
### Home
Hero -> 4 metrics -> platform/service cards -> Lạc Việt intro -> latest notices -> footer. White/ivory hero with brand decoration; no dark dashboard shell.

### Services
VN/Global tabs -> platform selector -> order form + sticky order summary. Desktop approximately 8/4. Flow: platform -> service -> server -> server facts -> legal warning -> link/ID -> reaction when applicable -> quantity -> note -> coupon. Legal warning remains red.

### Products
Premium banner -> filters -> sort -> grid -> reassurance strip. Grid: >=1400 four cols; 992–1399 three; 768–991 two; <768 one.

### Product detail
Desktop main/aside approximately 8/4. Hero -> package grid -> notes -> detail/benefits/tabs -> FAQ; sticky order aside.

### Progress
Filters -> status metrics -> orders table -> selected-order detail -> support. Status colors semantic.

### Account
Desktop profile/VIP/activity 4/12; settings/security/preferences 8/12. Include 2FA. Passwords/tokens never plaintext.

### History
Summary -> type tabs -> date/search/export -> table -> pagination.

### Cashflows
Financial metrics -> balance chart -> spending category chart -> payment methods -> transactions. Charts are data visuals, not decorative AI images.

### Deposit
Stats -> payment methods -> bank/QR -> amount/proof form -> recent deposits -> warnings/support. Until real payment data exists, show a clearly marked non-functional DEMO payment panel and `TODO_ASSET:deposit.realQr`; never invent a live account.

### Affiliate
Metrics -> referral URL/QR -> chart -> commission tier -> withdrawal form -> referred users. Demo commission rules must be isolated from production config.

### Child panel
Metrics -> create panel -> brand/support settings -> reseller price table -> panel list. Demo subdomain rules may be used visually but must not create real DNS/account side effects.

### API docs
Status/environment/token management -> quick examples -> endpoints -> rate limit -> callback/webhook -> usage -> support. Token masked by default; examples use fake clearly documented demo tokens.

### Purchased products
Status tabs -> active/expiring stats -> product cards -> renewal/action -> support/warranty.

## 9. States
Every data-driven route supports `LOADING`, `EMPTY`, `ERROR`, `PARTIAL_DATA`, `LONG_TEXT`.

Forms: default/hover/focus/filled/disabled/success/warning/invalid.

Tables: loading rows, empty, selected row, mobile horizontal scroll.

Order/product: available/unavailable/out-of-stock/price-updating/submitting/success/failure. Prevent duplicate submit while in-flight.

## 10. Motion FEEL
- button hover 140ms ease-out
- card hover 160ms ease-out, max translateY -2px
- dropdown 140ms opacity + y4
- mobile drawer 220ms cubic-bezier(.2,.8,.2,1)
- modal 180ms opacity + 0.98 -> 1
- tabs 140ms color/background
- progress 300ms ease-out
- no parallax
- no scroll-jacking
- no global custom scroll engine
- reduced-motion removes nonessential transforms/animation

## 11. Asset workflow — NON-BLOCKING DURING FIRST BUILD
If asset missing/unmapped/low-quality:
1. create a neutral placeholder only to preserve layout;
2. mark it `TODO_ASSET:<stable-key>`;
3. log to `.webby/MISSING_ASSET_REPORT.md`;
4. continue all 20 screens;
5. do not web-search, generate, redraw or substitute another brand visual.

Report format:
```text
NEED_ASSET
key: <stable key>
route: <route>
section: <section>
role: <role>
needed: <description>
ratio/size: <usage>
placeholder: <component/file>
reference: <clone route/screenshot>
```

After the build, ChatGPT creates/prepares assets using the approved Lạc Việt direction and original reference context, updates the manifest, then Claude patches exact slots.

Known likely missing roles include compact Lạc Việt mark, favicon, home hero art, Đông Sơn pattern, VIP banner, VPN hero, default avatar and real payment QR. This list is not authoritative until Claude finishes all 20 screens; the final report may add/remove items based on actual implementation.

## 12. Production data/config workflow — NON-BLOCKING FOR VISUAL BUILD
If real domain/contact/payment/catalog/auth/backend config is missing:
- use typed DEMO data clearly separated from production adapters;
- keep UI fully functional for visual/testing purposes;
- do not execute real money/account/API side effects with invented values;
- log unresolved live configuration in `.webby/FINAL_GAPS_REPORT.md`;
- continue the build.

Demo values visible in approved renders are not production authority.

## 13. Security gate
The reference clone contains captured auth/session/user state. Never copy it.
- no captured access/CSRF/session values;
- no captured real user balance/profile/phone;
- no real secrets in HTML meta/global client JS;
- API tokens masked by default;
- use server-side/env storage for future real secrets;
- run a secret scan before release.

## 14. Generic icon rule
Use `@tabler/icons-react` for generic interface icons. Do not introduce a second generic icon family. Platform/product/payment logos are brand assets, not generic icons; if unavailable use `TODO_ASSET` + report.

## 15. First-pass completion criteria
First pass is done when:
- all 20 routes/screens are reachable;
- shared shell/navigation is responsive;
- ONE ProductDetail powers all 8 products;
- core interactions run against typed demo data where production data is absent;
- loading/empty/error/form states exist;
- lint/type/build checks pass as applicable;
- secret scan finds no copied reference secrets;
- `.webby/MISSING_ASSET_REPORT.md` is consolidated;
- `.webby/FINAL_GAPS_REPORT.md` is consolidated.

Final visual parity is NOT self-approved by Claude. User reviews after ChatGPT asset patch.

## 16. Claude final report
At the end of the all-in-one build return:
- stack/project structure created;
- all 20 screens/routes completed;
- checks run and results;
- missing asset report path and summary count;
- production config gap report path and summary count;
- genuine technical constraints only.

Do not auto-merge.
