# CLAUDE — LacVietShop ALL-IN-ONE execution contract

Read this file first.

## Mission
Build the complete NEW Lạc Việt Media Agency web app in this repository. `th6322750-stack/clone-thatim-vn` is REFERENCE ONLY for the 20-page feature scope, information architecture, interaction flow and original screenshot context. Do not patch the clone and do not reproduce Thatim branding.

## User-approved execution override
The user explicitly approved this workflow:

`BUILD ALL 20 SCREENS FIRST -> COLLECT MISSING ASSETS LAST -> CHATGPT RENDERS/PREPARES THEM -> CLAUDE PATCHES THEM INTO THE EXACT SLOTS`

Missing visual assets DO NOT block the full build.

## Authority
- USER = final acceptance authority.
- ChatGPT = design/UI/asset/state/motion-feel authority.
- Claude = implementation/technical-mechanism authority.
- `PROJECT_HANDOFF.md` + `.webby/*` = implementation design authority.
- Approved renders = hierarchy/arrangement reference only; NEVER measure screenshots to invent geometry.

## Locked implementation stack
Use this stack unless a genuine technical constraint is discovered:
- Next.js App Router
- TypeScript
- Tailwind CSS
- pnpm
- `@tabler/icons-react` for generic UI icons
- React Hook Form + Zod for forms/validation when useful
- Recharts for charts when useful

Do not ask again which frontend framework to use. Record actual installed versions in `.webby/PROJECT_ENV.json` after initialization.

## Build-first missing-asset rule
When a required visual asset is absent, ambiguous, unmapped or too low-quality:
1. DO NOT search the web for a replacement.
2. DO NOT generate/redraw/fabricate it.
3. DO NOT substitute another brand/product/platform mark.
4. Insert a neutral layout-preserving placeholder marked with a stable asset key such as `TODO_ASSET:home.hero.brandVisual`.
5. Continue building every other route/component/state.
6. Append the missing item to `.webby/MISSING_ASSET_REPORT.md`.
7. After the full 20-screen build is complete, return ONE consolidated missing-asset report.

Each report item must contain:
```text
NEED_ASSET
key: <stable asset key>
route: <route>
section: <section>
role: <asset role>
needed: <description>
ratio/size: <required usage>
placeholder: <file/component currently used>
reference: <clone page/screenshot ChatGPT should inspect>
```

After ChatGPT supplies the real asset and updates the manifest, replace only the mapped placeholder slot. Do not redesign the surrounding UI.

## Data/config gaps are also non-blocking for the visual build
If real business/payment/backend data is unavailable:
- use clearly labeled typed DEMO data/config;
- keep it isolated from production integrations;
- never execute a real payment, withdrawal, account mutation or external API call using invented values;
- record unresolved production config in `.webby/FINAL_GAPS_REPORT.md`;
- continue the complete visual/interaction build.

## Security gate
The Thatim clone contains captured auth/session/user-state values. Never copy them. Never expose real secrets in HTML meta tags, public JS variables, client bundles or documentation examples. API tokens must be masked by default.

## Production architecture
- Production repo: `th6322750-stack/LacVietShop`.
- Architecture: NEW web app rebuild.
- Reference repo: `th6322750-stack/clone-thatim-vn` only.
- Shared product architecture: ONE reusable `ProductDetail` + configs for YouTube, CapCut, Canva, Veo3, Gemini, ChatGPT, Netflix and VPN.

## Implementation order
P0 foundation -> P1 commercial journey -> P2 order/money lifecycle -> P3 account/growth/API -> P4 responsive/states/a11y/QA -> P5 consolidate missing assets -> P6 patch ChatGPT assets.

Detailed 20-screen mapping and design values are in `PROJECT_HANDOFF.md`.

## Icons
Generic icons: `@tabler/icons-react` only.
Brand/platform/product marks: exact mapped assets only. If missing, placeholder + report; do not swap in another logo.

## Motion
Follow handoff motion FEEL. Claude owns mechanism. No scroll-jacking, global custom scroll engine or broad wheel/touch/key interception without reporting `TECHNICAL_CONSTRAINT` first.

## Before editing
1. DRIFT CHECK.
2. SCOPE CHECK.
3. SECURITY CHECK.
4. Initialize/verify locked stack.
5. Read only relevant files by default.
6. Build continuously; do not stop the whole project for missing assets or missing production data.

## Completion definition for first pass
The first pass is complete when:
- all 20 target screens/routes are reachable;
- responsive shell works;
- one shared ProductDetail powers all 8 product variants;
- core UI interactions work with typed demo data where production data is unavailable;
- loading/empty/error/form states exist;
- build/lint/type checks pass as applicable;
- `.webby/MISSING_ASSET_REPORT.md` contains every remaining visual asset gap;
- `.webby/FINAL_GAPS_REPORT.md` contains every remaining production integration/config gap.

## Reporting
At the end of the all-in-one build report:
1. changed/created architecture;
2. all 20 routes completed;
3. checks run/results;
4. consolidated `MISSING_ASSET_REPORT`;
5. consolidated production-config gaps.

Do not self-approve final visual parity and do not auto-merge PRs.
