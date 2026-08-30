# LacVietShop — Approved UI Reference Map

These files are lightweight visual reference copies of the 20 Lạc Việt Media Agency screens approved in ChatGPT.

## Authority rules

- `references/ui-approved/*` = approved visual hierarchy, composition, brand direction, relative emphasis and page identity.
- `/PROJECT_HANDOFF.md` + `/.webby/*` = implementation geometry, tokens, responsive/state/motion rules. Claude MUST NOT measure pixels from reference images to invent values.
- `th6322750-stack/clone-thatim-vn` = source reference only for feature scope, original information architecture and interaction flow. Do not copy Thatim branding, credentials, user/session state or production secrets.
- These WebP copies are intentionally lightweight **reference-only** images, not production master assets.

| Approved target image | Target route | Original clone reference |
|---|---|---|
| `ui-approved/01-home.webp` | `/` | `index.html` / `screenshots/index.png` |
| `ui-approved/02-services.webp` | `/services` | `services.html` / `screenshots/services.png` |
| `ui-approved/03-products.webp` | `/products` | `products.html` / `screenshots/products.png` |
| `ui-approved/04-progress.webp` | `/progress` | `progress.html` / `screenshots/progress.png` |
| `ui-approved/05-account.webp` | `/account` | `account.html` / `screenshots/account.png` |
| `ui-approved/06-history.webp` | `/history` | `history.html` / `screenshots/history.png` |
| `ui-approved/07-cashflows.webp` | `/cashflows` | `cashflows.html` / `screenshots/cashflows.png` |
| `ui-approved/08-deposit.webp` | `/deposit` | `deposit_addfunds.html` / `screenshots/deposit_addfunds.png` |
| `ui-approved/09-affiliate.webp` | `/affiliate` | `affiliate.html` / `screenshots/affiliate.png` |
| `ui-approved/10-child-panel.webp` | `/child-panel` | `child_panel.html` / `screenshots/child_panel.png` |
| `ui-approved/11-api-docs.webp` | `/api-docs` | `api_docs.html` / `screenshots/api_docs.png` |
| `ui-approved/12-product-purchased.webp` | `/purchased` | `product_purchased.html` / `screenshots/product_purchased.png` |
| `ui-approved/13-product-youtube.webp` | `/products/youtube` | `product_6.html` / `screenshots/product_6.png` |
| `ui-approved/14-product-capcut.webp` | `/products/capcut` | `product_7.html` / `screenshots/product_7.png` |
| `ui-approved/15-product-canva.webp` | `/products/canva` | `product_8.html` / `screenshots/product_8.png` |
| `ui-approved/16-product-veo3.webp` | `/products/veo3` | `product_9.html` / `screenshots/product_9.png` |
| `ui-approved/17-product-gemini.webp` | `/products/gemini` | `product_10.html` / `screenshots/product_10.png` |
| `ui-approved/18-product-chatgpt.webp` | `/products/chatgpt` | `product_11.html` / `screenshots/product_11.png` |
| `ui-approved/19-product-netflix.webp` | `/products/netflix` | `product_12.html` / `screenshots/product_12.png` |
| `ui-approved/20-product-vpn.webp` | `/products/vpn` | `product_174.html` / `screenshots/product_174.png` |

Brand visual reference:
- `brand/lac-viet-logo-horizontal.webp` — lightweight copy of the official logo supplied by the user in ChatGPT. Use it to identify the correct brand, but production code should use the highest-quality delivered logo asset once available.

## Missing-asset workflow

If a page needs an implementation-visible asset that is missing:

1. Keep the intended layout slot intact with `TODO_ASSET:<key>` / neutral placeholder.
2. Add one consolidated entry to `/.webby/MISSING_ASSET_REPORT.md` containing route, section, role, desired ratio/size and source reference to inspect.
3. Continue building all independent screens/components.
4. Do **not** search, generate, redraw, approximate or substitute a different brand/product/platform visual.
5. After the complete 20-screen build, ChatGPT will inspect the original reference and prepare/render the missing production asset; Claude then patches it into the exact mapped slot without redesigning the page.
