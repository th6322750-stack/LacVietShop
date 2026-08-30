# LẠC VIỆT MEDIA AGENCY — ALL-IN-ONE PROJECT HANDOFF

## 1. Project decision

- Task mode: `NEW_REDESIGN`.
- Production repo: `th6322750-stack/LacVietShop`.
- Architecture: rebuild as a NEW web app.
- `th6322750-stack/clone-thatim-vn` is reference-only for UI structure, feature scope and interaction flow.
- Design protocol: `th6322750-stack/webbyLucifer` v3.3.
- Brand: Lạc Việt Media Agency.
- Approved direction: bright white / warm white shell, deep navy typography, gold accent, clean premium SaaS/customer-panel style.
- Current state: `VISUAL_DIRECTION_APPROVED`.
- Current implementation gate: `IMPLEMENTATION_READY_UI = false` until blockers and asset manifest items below are frozen.

## 2. Authority

- USER = final visual acceptance.
- ChatGPT = design/UI/asset/state/motion-feel authority.
- Claude = implementation/technical mechanism authority.
- Raster renders = hierarchy/arrangement reference only.
- This document + `.webby/*` = implementation values and constraints.
- Asset manifest = exact visual asset authority.

Claude must not measure screenshot pixels to invent spacing, width, breakpoints or font sizes.

## 3. Twenty approved target screens

1. `index.html` reference → **Trang chủ**.
2. `services.html` → **Dịch vụ / Tạo đơn**.
3. `products.html` → **Sản phẩm Premium**.
4. `progress.html` → **Tiến độ đơn hàng**.
5. `account.html` → **Thông tin tài khoản**.
6. `history.html` → **Lịch sử hoạt động**.
7. `cashflows.html` → **Dòng tiền & Giao dịch**.
8. `deposit_addfunds.html` → **Nạp tiền**.
9. `affiliate.html` → **Affiliate / Đại lý**.
10. `child_panel.html` → **Panel con / Đại lý con**.
11. `api_docs.html` → **API Documentation**.
12. `product_purchased.html` → **Sản phẩm đã mua**.
13. `product_6.html` → **YouTube Premium**.
14. `product_7.html` → **CapCut Pro**.
15. `product_8.html` → **Canva Pro**.
16. `product_9.html` → **Google Veo 3 AI**.
17. `product_10.html` → **Google Gemini Pro**.
18. `product_11.html` → **ChatGPT Plus + API Codex**.
19. `product_12.html` → **Netflix Ultra 4K**.
20. `product_174.html` → **Combo VPN Quốc Tế**.

### Product-detail architecture
Do not code 8 unrelated page implementations. Build one reusable `ProductDetail` composition driven by product configuration/data. Product variants may change hero artwork, packages, benefit blocks, order-summary options, FAQ, and product-specific theme accents. Netflix may use a dark product hero; the global app shell remains light.

## 4. Coding priority

### P0 — Foundation
Code before feature routes:
- framework/runtime declaration;
- security scrub rules;
- design tokens;
- AppShell;
- Sidebar;
- Topbar;
- navigation model;
- Button/Input/Select/RadioCard/Switch/Tabs/Badge/Modal/Toast/Skeleton;
- StatCard/InfoCard/DataTable/FilterBar/Pagination/StatusBadge/ProgressBar;
- domain models/interfaces;
- auth/session service interface;
- exact asset resolver/manifest reader.

### P1 — Main commercial journey
1. Trang chủ.
2. Dịch vụ / Tạo đơn.
3. Sản phẩm Premium.
4. Shared ProductDetail system.
5. YouTube config as template validation.
6. Remaining seven product configs.

### P2 — Order + money lifecycle
7. Tiến độ đơn hàng.
8. Nạp tiền.
9. Dòng tiền & Giao dịch.
10. Lịch sử hoạt động.
11. Sản phẩm đã mua.

### P3 — Account + growth + integrations
12. Tài khoản.
13. Affiliate / Đại lý.
14. Panel con / Đại lý con.
15. API Documentation.

### P4 — System completion
- mobile/tablet responsive;
- loading/empty/error states;
- validation;
- keyboard/focus;
- accessibility;
- route smoke tests;
- secret scan;
- asset existence check;
- final user visual acceptance.

## 5. Canonical design values

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

Use gold for emphasis and primary CTA, not for all text. Filled gold CTA uses dark navy text where contrast requires it. Semantic danger/success/warning colors stay semantic.

### Typography
Font: Inter.
- H1 desktop 32/40/700.
- H1 mobile 26/34/700.
- H2 24/32/700.
- H3 18/26/700.
- Card title 15/22/600.
- Body 14/20/400.
- Body strong 14/20/600.
- Label 13/18/600.
- Small 12/18/400–600.
- Metric 24/32/700.
- Button 14/20/600.

Content rules:
- prices no-wrap;
- sidebar labels 1 line;
- product card title max 2 lines;
- product detail title max 2 desktop / 3 mobile;
- hero description max 3 lines;
- tables ellipsis where necessary;
- long Vietnamese values must be tested.

### Shape/spacing
- control radius 10px;
- card 14px;
- hero/major panel 16px;
- pill 999px;
- spacing scale 4/8/12/16/20/24/32/40/48;
- page desktop gutter 24px;
- mobile gutter 16px;
- card padding 16–20px;
- major card 24px;
- section gap 24px;
- grid gap 16px.

## 6. App shell + responsive

Breakpoints: `576 / 768 / 992 / 1200 / 1400`.

Desktop >=1200:
- sidebar fixed 224px;
- topbar 72px;
- topbar sticky;
- main max-width 1560px;
- 24px gutter;
- white sidebar;
- active nav = warm gold tint + gold indicator.

992–1199:
- sidebar 80px icon rail;
- compact brand mark;
- tooltip labels.

<992:
- sidebar off-canvas;
- topbar menu trigger;
- summary asides stack below main content.

<768:
- tables horizontally scroll within their card;
- search may move/expand;
- dense rows simplify.

<576:
- 16px gutter;
- product grid 1 column;
- primary CTA full width;
- forms stack;
- platform tiles may horizontally scroll.

## 7. Shared component inventory

Shell: `AppShell`, `Sidebar`, `SidebarNavItem`, `Topbar`, `GlobalSearch`, `BalanceDisplay`, `NotificationButton`, `UserMenu`, `MobileDrawer`.

Primitives: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioCard`, `Switch`, `Tabs`, `Badge`, `Tooltip`, `Dropdown`, `Modal`, `Drawer`, `Toast`, `Skeleton`.

Data/UI: `StatCard`, `SectionHeader`, `InfoCard`, `SupportCard`, `PlatformTile`, `ProductCard`, `PackageCard`, `OrderSummary`, `PaymentMethodCard`, `StatusBadge`, `ProgressBar`, `DataTable`, `FilterBar`, `Pagination`, `ChartCard`, `QRCard`, `CodeBlock`, `EmptyState`, `ErrorState`.

Product: `ProductDetail`, `ProductHero`, `ProductPackageGrid`, `ProductBenefits`, `ProductTabs`, `ProductFAQ`, `ProductOrderAside`.

## 8. Screen-specific layout rules

### Trang chủ
Hero → 4 metrics → platform/service cards → intro → latest notices → footer. Hero is white/ivory with Lạc Việt decorative brand art. No dark dashboard background.

### Dịch vụ
VN/Global tabs → platform selector → order form + sticky order summary. Desktop main/aside approximately 8/4. Flow: platform → service → server → server facts → legal warning → link/ID → reaction if relevant → quantity → note → coupon. Illegal-use warning remains red.

### Products
Premium banner → filters → sort → responsive grid → reassurance strip. Grid: >=1400 four columns; 992–1399 three; 768–991 two; <768 one.

### Product detail
Desktop main/aside 8/4. Hero → package grid → notes → detail/benefits/tabs → FAQ; order aside sticky. One shared component system.

### Progress
Filters → status metrics → orders table → selected-order detail → support. Status colors stay semantic.

### Account
Desktop profile/VIP/activity 4/12; settings/security/preferences 8/12. Include 2FA. Secrets/passwords never display plaintext.

### History
Summary → type tabs → date/search/export → table → pagination.

### Cashflows
Financial metrics → balance trend → spending category chart → payment methods → transaction table. Charts are real data visuals, not AI art.

### Deposit
Stats → payment methods → bank/QR → amount/proof form → recent deposits → warnings/support. QR must be based on real approved receiving data.

### Affiliate
Metrics → referral link/QR → chart → commission tier → withdrawal form → referred users. Commission logic comes from business config/backend only.

### Child panel
Metrics → create panel → brand/support settings → reseller price table → panel list. Domain/subdomain policy must come from actual architecture.

### API docs
Status/environment/token management → quick examples → endpoints → rate limit → callback/webhook → usage → support. Token masked by default.

### Purchased products
Status tabs → active/expiring stats → product cards → renewal/action → support/warranty.

## 9. State rules
Every data-driven route supports `LOADING`, `EMPTY`, `ERROR`, `PARTIAL_DATA`, `LONG_TEXT`.

Forms support default/hover/focus/filled/disabled/success/warning/invalid.

Tables support loading rows, empty state, selected row, horizontal mobile scrolling.

Order/product supports available/unavailable/out-of-stock/price-updating/submitting/success/failure. Prevent duplicate submit while a request is in-flight.

## 10. Motion FEEL
- button hover 140ms ease-out;
- card hover 160ms ease-out, max translateY -2px;
- dropdown 140ms opacity + y4;
- mobile drawer 220ms cubic-bezier(.2,.8,.2,1);
- modal 180ms opacity + 0.98→1;
- tabs 140ms color/background;
- progress updates 300ms ease-out;
- no parallax;
- no scroll-jacking;
- no global custom scroll engine;
- reduced-motion removes nonessential transforms/animation.

## 11. Mandatory asset escalation

If any visual asset is absent, unmapped, ambiguous or insufficient quality, Claude must return:

```text
NEED_ASSET
route: <route>
section: <section>
role: <asset role>
needed: <description>
ratio/size: <required usage>
reference: <clone page/screenshot ChatGPT should inspect>
```

Claude must NOT:
- search the web for replacement imagery;
- generate images;
- redraw the Lạc Việt logo;
- choose a visually similar product/platform mark;
- substitute another icon family;
- reuse an unrelated image;
- make a fake finished placeholder.

ChatGPT will inspect the original Thatim UI reference, prepare/render the required asset, productionize it, update `.webby/asset-manifest.json`, and then Claude may continue.

## 12. Asset status

Image-like roles currently planned: **34**.

Confirmed available conceptually:
- 1 user-supplied Lạc Việt horizontal logo;
- 10 platform/service marks in the clone;
- 8 premium product marks/covers in the clone.

Need exact path/checksum freeze:
- platform marks;
- product marks;
- payment/bank marks.

Need new Lạc Việt production assets:
- compact Lạc Việt mark;
- favicon/app icon;
- home hero brand visual;
- Đông Sơn watermark/pattern;
- VIP banner art;
- VPN security hero visual;
- default avatar/placeholder if required.

Need real-data asset:
- payment QR after receiving account is approved.

Quality targets:
- hero artwork 4K-class preferred;
- VPN hero FHD minimum, 4K preferred;
- VIP banner FHD minimum;
- Đông Sơn pattern vector preferred;
- logo vector preferred when available; supplied transparent PNG remains usable as delivery fallback;
- do not upscale low-res vendor marks and call them authoritative 4K.

Proposed runtime directories:
`public/assets/brand`, `decor`, `platforms`, `products`, `payments`, `placeholders`.

## 13. Blocking specs before broad implementation

### `BLOCKED_SPEC: framework/runtime stack`
Repo is new and empty. Rebuild architecture is approved, but framework choice must be explicit before broad implementation. Claude must report the proposed stack rather than silently infer it.

### `BLOCKED_SPEC: business/contact config`
Need canonical domain, support email, hotline, Telegram/support handle, legal footer, business hours and social links. Rendered examples are placeholders only.

### `BLOCKED_SPEC: payment config`
Need receiving bank/account/QR policy/payment methods/confirmation/upload-proof rules.

### `BLOCKED_SPEC: commercial data`
Need service catalog, provider/server IDs, price/min/max/refill/cancel/warranty policies, premium packages/prices/availability/renewal.

### `BLOCKED_SPEC: backend/auth`
Need real contract for auth/session, balances, orders, deposits, transactions, affiliate, child panels, API keys, rate limits and webhooks.

## 14. Security gate
The reference clone contains captured authentication/session/user state. Never copy it.

Before implementation:
- do not transfer captured access/CSRF/session values;
- do not transfer captured user balance/profile/phone data;
- no real secrets in HTML meta/global client JS;
- API tokens masked by default;
- secrets belong in appropriate server-side/env storage;
- run a secret scan before release.

## 15. Acceptance checklist
Visual: light shell; gold accent; navy text; consistent shell; sharp correct logo; no Thatim branding; correct product/platform marks; no gibberish.

Functional: service selection; product filter/sort; package summary; progress filters; deposit selection; history/cashflow filters; purchased-product states; account validation; affiliate withdrawal validation; child-panel validation; token masking.

Responsive test widths: 390, 576, 768, 992, 1200, 1440. No page-level horizontal overflow except deliberate table/carousel containers.

Security: no captured token/CSRF/user session; no public secret; payment data only from approved config.

## 16. Claude task template
```text
TASK_MODE: NEW_REDESIGN
TARGET_REPO: th6322750-stack/LacVietShop
REFERENCE_REPO: th6322750-stack/clone-thatim-vn (REFERENCE ONLY)

BEFORE CODE:
DRIFT CHECK → SCOPE CHECK → SECURITY CHECK → ASSET MANIFEST CHECK.

MISSING VISUAL:
return NEED_ASSET to ChatGPT; do not create/search/substitute.

IMPLEMENTATION ORDER:
P0 foundation → P1 index/services/products/ProductDetail → P2 progress/deposit/cashflows/history/purchased → P3 account/affiliate/child/API → P4 responsive/states/a11y/QA.

DO NOT:
redesign, measure screenshots, copy Thatim identity/session data, duplicate product layouts, add another icon family, auto-merge.

REPORT:
changed files; scope; checks/results; blockers.
```
