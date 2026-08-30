# MISSING ASSET REPORT

This file is completed by Claude **after the full 20-screen first-pass build**.

Missing assets do not block the first-pass build. Use neutral layout-preserving placeholders marked `TODO_ASSET:<stable-key>`, then consolidate every remaining gap here.

## Rules
- Do not web-search for replacements.
- Do not generate/redraw/fabricate missing visuals.
- Do not substitute another brand/product/platform mark.
- ChatGPT will inspect the original `clone-thatim-vn` reference/screenshots, render/prepare the missing production assets, update `.webby/asset-manifest.json`, then Claude patches the exact slots.

## Report format

```text
NEED_ASSET
key: <stable asset key>
route: <route>
section: <section>
role: <asset role>
needed: <description>
ratio/size: <required usage>
placeholder: <component/file currently used>
reference: <clone page/screenshot ChatGPT should inspect>
status: OPEN
```

## Open items

Claude: replace this section with the consolidated list after all 20 screens are implemented.
