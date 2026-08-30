# CLAUDE — LacVietShop execution contract

Read this file first.

## Mission
Build a NEW Lạc Việt Media Agency web app in this repository. `th6322750-stack/clone-thatim-vn` is reference-only for page scope, information architecture and interaction flow. Do not patch the clone and do not reproduce Thatim branding.

## Authority
- USER = final acceptance authority.
- ChatGPT = design/UI/asset/state/motion-feel authority.
- Claude = implementation/technical-mechanism authority.
- `PROJECT_HANDOFF.md` + `.webby/*` = implementation design authority.
- Approved renders are visual hierarchy/arrangement references only; NEVER measure them to invent geometry.

## Mandatory missing-asset rule
If a required visual asset is absent, ambiguous, unmapped or too low-quality, return exactly this class of blocker:

```text
NEED_ASSET
route: <route>
section: <section>
role: <asset role>
needed: <description>
ratio/size: <required usage>
reference: <clone page/screenshot ChatGPT should inspect>
```

Then stop only that visual subtask. Continue independent safe work if possible.

**FORBIDDEN:** web searching for replacement imagery, generating images, redrawing logos, substituting another brand mark, inventing a similar icon from another library, reusing an unrelated visual, or fabricating a placeholder just to finish the page. ChatGPT will inspect the original reference and create/prepare/render the missing production asset, then update the manifest.

## Security gate
The Thatim clone contains captured auth/session/user-state values. Never copy them. Never expose real secrets in HTML meta tags, public JS variables, client bundles or documentation examples. API tokens must be masked by default.

## Implementation architecture
- Production target: `th6322750-stack/LacVietShop`.
- Architecture decision: NEW web app rebuild.
- `clone-thatim-vn`: reference-only.
- If framework/runtime is still undeclared when implementation starts, report `BLOCKED_SPEC: framework/runtime stack` before broad implementation. Do not silently infer a framework.

## Coding order
P0 shared foundation → P1 commercial journey → P2 order/money lifecycle → P3 user/growth/API → P4 responsive/states/accessibility/QA.

Detailed order and 20-screen mapping are in `PROJECT_HANDOFF.md`.

## Product pages
Implement ONE reusable `ProductDetail` system and data/config variants for: YouTube, CapCut, Canva, Veo3, Gemini, ChatGPT, Netflix, VPN. Do not build eight unrelated page implementations.

## Icons
Use only the approved generic icon source declared in the handoff. Brand/platform/product marks must use exact mapped assets. Missing exact asset = `NEED_ASSET`.

## Motion
Follow the handoff motion FEEL. You own the mechanism. No scroll-jacking, global custom scroll engine or broad wheel/touch/key interception without reporting `TECHNICAL_CONSTRAINT` first.

## Before editing
1. DRIFT CHECK.
2. SCOPE CHECK.
3. SECURITY CHECK.
4. Read only relevant files by default.
5. Verify asset manifest for every visible branded asset.
6. Return `NEED_ASSET`, `BLOCKED_SPEC`, or `TECHNICAL_CONSTRAINT` rather than guessing.

## Reporting
After each scoped implementation task, report 3–5 lines: changed files; implemented scope; checks run/results; blockers/constraints. Do not self-approve visual parity and do not auto-merge PRs.
