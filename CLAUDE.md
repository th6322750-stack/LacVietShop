# CLAUDE — LacVietShop ALL-IN-ONE execution contract

Read this file first, then execute `.webby/ALL_IN_ONE.md` completely from beginning to end.

## Mission
Build the complete NEW Lạc Việt Media Agency web app in this repository. `th6322750-stack/clone-thatim-vn` is REFERENCE ONLY for the 20-page feature scope, information architecture, interaction flow and original screenshot context. Do not patch the clone and do not reproduce Thatim branding.

## Single-execution rule
This project has **ONE continuous execution contract only**.

Do NOT split work into `Task 001`, `Task 002`, separate stages requiring new user prompts, or “stop after P0/P1 and wait”. Internal P0/P1/P2 labels are sequencing hints only. Continue until the complete first-pass app is done unless a genuine destructive/security risk or impossible technical constraint blocks all further work.

User-approved workflow:

`BUILD ALL 20 SCREENS -> CONSOLIDATE MISSING ASSETS + LIVE CONFIG GAPS -> CHATGPT PREPARES ASSETS -> CLAUDE PATCHES EXACT SLOTS`

Missing visual assets and missing production integrations do not block the visual first pass.

## Authority
- USER = final acceptance authority.
- ChatGPT = design/UI/asset/state/motion-feel authority.
- Claude = implementation/technical-mechanism authority.
- `PROJECT_HANDOFF.md` + `.webby/*` = implementation design authority.
- `references/ui-approved/*` = approved target visual hierarchy/composition references.
- Approved renders are not rulers; never measure screenshots to invent geometry.

## Mandatory visual references
Before each route:
1. Read `references/REFERENCE_MAP.md`.
2. Inspect the matching target in `references/ui-approved/`.
3. Use `PROJECT_HANDOFF.md` for exact design values/responsive/state rules.
4. Consult `clone-thatim-vn` only for source feature/flow context when needed.

## Locked stack
Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- pnpm
- `@tabler/icons-react`
- React Hook Form + Zod where useful
- Recharts where useful

Record actual installed versions/commands in `.webby/PROJECT_ENV.json` after initialization.

## Missing assets — keep building
If a required production visual is absent, ambiguous, unmapped or insufficient quality:
- do not search for a replacement;
- do not generate, redraw or fabricate it;
- do not substitute another logo/product/platform visual;
- create a neutral layout-preserving `TODO_ASSET:<key>` slot;
- append the structured gap to `.webby/MISSING_ASSET_REPORT.md`;
- continue all independent routes/components.

Do not ask the user to resolve asset gaps one-by-one during the build. Report them once after all 20 routes are complete.

After ChatGPT provides the real asset and manifest mapping, patch the exact slot only. Do not redesign surrounding UI.

## Missing production data — keep visual build moving
When domain/contact/payment/catalog/auth/backend values are unavailable:
- use typed DEMO config isolated from production adapters;
- never execute real financial/account/external side effects with invented values;
- append unresolved live integration to `.webby/FINAL_GAPS_REPORT.md`;
- continue building the complete UI and safe demo interactions.

## Security
Never copy captured Thatim access tokens, CSRF values, session state, balance, identity, phone numbers or user data. No real secret in public client JS, HTML meta tags or documentation examples. API credentials masked by default.

## Architecture
- Production repo: `th6322750-stack/LacVietShop`.
- Architecture: NEW web app rebuild.
- Reference repo: `th6322750-stack/clone-thatim-vn` only.
- Product pages: ONE reusable `ProductDetail` + 8 configs for YouTube, CapCut, Canva, Veo3, Gemini, ChatGPT, Netflix and VPN.

## Icons
Generic icons: `@tabler/icons-react` only.
Branded marks: exact mapped assets only; otherwise `TODO_ASSET` + consolidated report.

## Motion
Follow handoff motion FEEL. Claude owns mechanism. No scroll-jacking, global custom scroll engine or broad wheel/touch/key interception without reporting `TECHNICAL_CONSTRAINT`.

## Completion definition
Do not call the first pass complete until:
- all 20 target routes are reachable;
- shared shell/responsive navigation works;
- one ProductDetail powers all 8 product variants;
- safe core UI interactions work with typed demo data where production integrations are unavailable;
- loading/empty/error/form states exist;
- accessibility/focus basics are implemented;
- available build/type/lint/smoke checks pass;
- `.webby/MISSING_ASSET_REPORT.md` is consolidated;
- `.webby/FINAL_GAPS_REPORT.md` is consolidated.

## Final report
Only after the complete first pass, report:
1. architecture/created files;
2. status of all 20 routes;
3. checks and results;
4. consolidated missing assets;
5. consolidated live-integration/config gaps;
6. genuine technical constraints, if any.

Do not auto-merge and do not self-approve final visual parity.