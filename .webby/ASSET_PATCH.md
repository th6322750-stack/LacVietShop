# ASSET PATCH — ChatGPT design authority

Apply this after the 20-route first pass. This is one patch pass, not a new redesign task.

## Rule
- Copy/use only the exact mappings below.
- Do not redesign surrounding UI.
- Do not web-search or generate substitutes.
- If an exact source cannot be obtained, leave its `TODO_ASSET` and report it.
- After patching, regenerate `.webby/MISSING_ASSET_REPORT.md` with `node tools/gen-reports.mjs` and rerun typecheck/lint/build/smoke.

## A. Lạc Việt assets prepared by ChatGPT

| key | runtime src / action |
|---|---|
| `brand.logoHorizontal` | copy `references/brand/lac-viet-logo-horizontal.webp` → `public/assets/brand/lac-viet-logo-horizontal.webp`; src `/assets/brand/lac-viet-logo-horizontal.webp` |
| `brand.markCompact` | `/assets/brand/lac-viet-mark.svg` |
| `brand.favicon` | reuse `/assets/brand/lac-viet-mark.svg` for metadata/favicon unless framework requires a copied icon file |
| `home.hero.brandVisual` | `/assets/decor/home-hero.svg` |
| `decor.dongSonPattern` | `/assets/decor/dong-son-pattern.svg` |
| `products.vipBanner` | `/assets/decor/vip-banner.svg` |
| `product.vpn.hero` | `/assets/decor/vpn-hero.svg` |
| `account.defaultAvatar` | `/assets/placeholders/default-avatar.svg` |

The SVGs above are already committed on `claude/all-in-one-first-pass` by ChatGPT.

## B. Exact platform marks traced from `clone-thatim-vn`

These are AUTHENTIC reference files already used by the cloned interface. Obtain exactly these files from `th6322750-stack/clone-thatim-vn` and copy them into `public/assets/platforms/`.

| key | exact source | destination | src |
|---|---|---|---|
| `platform.facebook` | `uploads/images/X9A-HhS-6Da-s5w-11-06-2025-12.webp` | `public/assets/platforms/facebook.webp` | `/assets/platforms/facebook.webp` |
| `platform.tiktok` | `uploads/images/usm-CZl-fq4-SAD-03-07-2025-13.webp` | `public/assets/platforms/tiktok.webp` | `/assets/platforms/tiktok.webp` |
| `platform.instagram` | `uploads/images/rkH-942-NLU-sXJ-03-07-2025-12.webp` | `public/assets/platforms/instagram.webp` | `/assets/platforms/instagram.webp` |
| `platform.youtube` | `uploads/images/GJu-TUq-e61-niZ-11-06-2025-12.webp` | `public/assets/platforms/youtube.webp` | `/assets/platforms/youtube.webp` |
| `platform.shopee` | `uploads/images/hJy-qsg-E7Z-j25-01-07-2025-20.webp` | `public/assets/platforms/shopee.webp` | `/assets/platforms/shopee.webp` |
| `platform.zalo` | `uploads/images/original/r9r-tEQ-ESC-rSk-07-09-2025-13.webp` | `public/assets/platforms/zalo.webp` | `/assets/platforms/zalo.webp` |
| `platform.threads` | `uploads/images/WT3-npC-12u-E5j-11-06-2025-12.webp` | `public/assets/platforms/threads.webp` | `/assets/platforms/threads.webp` |
| `platform.spotify` | `uploads/images/AB6-nRC-XXs-SI0-11-06-2025-12.webp` | `public/assets/platforms/spotify.webp` | `/assets/platforms/spotify.webp` |
| `platform.telegram` | `uploads/images/6rZ-KpG-ogn-1uW-03-07-2025-12.webp` | `public/assets/platforms/telegram.webp` | `/assets/platforms/telegram.webp` |
| `platform.google` | `uploads/images/original/yAE-u4F-Dzk-xXW-19-07-2025-21.webp` | `public/assets/platforms/google-maps.webp` | `/assets/platforms/google-maps.webp` |

## C. Exact premium product marks traced from `clone-thatim-vn`

| key | exact source | destination | src |
|---|---|---|---|
| `product.youtube` | `uploads/images/original/Z9Q-7Po-hGI-cyx-15-03-2026-01.webp` | `public/assets/products/youtube.webp` | `/assets/products/youtube.webp` |
| `product.capcut` | `uploads/images/original/PS8-eTH-ciW-Dam-15-03-2026-00.webp` | `public/assets/products/capcut.webp` | `/assets/products/capcut.webp` |
| `product.canva` | `uploads/images/original/HiE-KkV-cgG-R8I-15-03-2026-00.webp` | `public/assets/products/canva.webp` | `/assets/products/canva.webp` |
| `product.veo3` | `uploads/images/original/LEo-VEH-INo-swd-15-03-2026-00.webp` | `public/assets/products/veo3.webp` | `/assets/products/veo3.webp` |
| `product.gemini` | `uploads/images/original/yPF-LCK-j1g-bLD-15-03-2026-00.webp` | `public/assets/products/gemini.webp` | `/assets/products/gemini.webp` |
| `product.chatgpt` | `uploads/images/original/0jz-aQL-BEL-Czx-15-03-2026-00.webp` | `public/assets/products/chatgpt.webp` | `/assets/products/chatgpt.webp` |
| `product.netflix` | `uploads/images/original/v2I-WSz-zgY-Dc9-15-03-2026-00.webp` | `public/assets/products/netflix.webp` | `/assets/products/netflix.webp` |
| `product.vpn` | `uploads/images/original/yn1-4MX-tDl-ZlQ-18-06-2026-12.webp` | `public/assets/products/vpn.webp` | `/assets/products/vpn.webp` |

## D. Payment assets — intentionally deferred

Do not present unsupported payment methods as production truth. Keep these TODO until `payment.gateway` / `payment.receivingAccount` are approved:

`payment.vietcombank`, `payment.techcombank`, `payment.mbbank`, `payment.momo`, `payment.zalopay`, `payment.viettelmoney`, `payment.usdt`, `deposit.realQr`.

The UI may retain DEMO labels/placeholders. Do not create a fake real QR.

## E. Reference-file repair — RESOLVED

The three previously corrupt visual-reference WebP files now have valid repaired SVG replacements:
- `/purchased` → `references/ui-approved/12-product-purchased-fixed.svg`
- `/products/canva` → `references/ui-approved/15-product-canva-fixed.svg`
- `/products/gemini` → `references/ui-approved/17-product-gemini-fixed.svg`

Use the repaired SVGs above together with `references/REFERENCE_MAP.md`. Ignore the old corrupt WebP files for those three routes. Reference integrity is no longer a blocker for final visual comparison.

## Expected result after this patch

After applying 8 Lạc Việt/design-owned assets plus the exact 18 clone platform/product marks, remaining `TODO_ASSET` count should drop from 34 to **8**: seven payment marks + `deposit.realQr`.

The 8 remaining items are intentionally tied to unapproved production payment configuration, not missing design work.
