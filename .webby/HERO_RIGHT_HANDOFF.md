# Homepage Hero Right Visual — Final Handoff

This is a **visual polish only** change. Keep the current homepage/system structure and information architecture unchanged.

## Required asset files

Place exactly these four files under `public/assets/decor/hero/`:

- `hero-bird-main.webp`
- `hero-dongson-bg.webp`
- `hero-wave-gold.webp`
- `hero-sparkles.webp`

The canonical key/path/position rules live in:

`public/assets/decor/hero/hero-assets.manifest.json`

## Layer order

Back to front:

1. CSS hero background
2. CSS soft texture/gradient
3. `hero-dongson-bg.webp`
4. `hero-bird-main.webp`
5. `hero-wave-gold.webp`
6. `hero-sparkles.webp`

## Implementation rules

- Do not redesign the dashboard or move system sections.
- Left side hero content stays HTML: badge, headline, copy, two CTAs, three USP items.
- Only replace/polish the right visual composition.
- Do not generate/search/redraw/substitute assets.
- Preserve transparent backgrounds and aspect ratios.
- Bird = focal point.
- Dong Son pattern = low-opacity background.
- Wave = bottom/right foreground accent and must not overlap the left-side CTA/text.
- Sparkles = subtle final overlay, never flashy.
- Wide desktop: right visual region ~38–42% hero width.
- Responsive: progressively reduce decorative scale/opacity; text readability wins.
- Treat all four images as decorative (`alt=""`, `aria-hidden="true"`).

## Completion check

Before reporting done:

- all four exact files resolve with HTTP 200;
- no stretched/cropped bird silhouette;
- no visual overlap with left hero content at 390/576/768/992/1200/1440;
- no horizontal overflow;
- `pnpm typecheck`, `pnpm lint`, `pnpm build` pass;
- show one desktop screenshot and one mobile screenshot for visual acceptance;
- do not merge unless the user explicitly approves.
