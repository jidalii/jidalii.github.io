# Photos Page Redesign

> **References:** optikarchiv.com (editorial rhythm), old.studiokleiner.com (per-photo mat colors).
> **Sample:** `samples/photos-redesign.html`

**Goal:** Replace the square grid on `/photos` with full-width colored mat bands — each photo sits on its own background color that contrasts with the image.

---

## Layout Rules

| Rule | Detail |
|------|--------|
| Row rhythm | Alternating: **single → pair → single → pair → ...** |
| Single row | 1 photo, `width > height` (landscape). Photo centered, max 980px wide, max 65vh tall. |
| Pair row | 2 photos, `width <= height` (portrait/square). Side by side, each max 480px wide, max 55vh tall. |
| Fallback | If a pair row has only 1 photo available, it becomes a single row. |
| Responsive | ≤768px: pair rows stack vertically. ≤480px: single column. |

## Background Colors

**Contrast-aware mat assignment.** 64 Morandi mat colors split into warm and cool pools.

1. Each photo gets a pseudo-random `dominant` classification via filename hash (warm or cool).
2. Warm-dominant photos → mat from the **cool** pool (sage, blue-grey, lavender).
3. Cool-dominant photos → mat from the **warm** pool (beige, ochre, terracotta).
4. No two adjacent photos/rows share the same mat color (skip-if-same on last used).
5. Single rows: one full-width mat color.
6. Pair rows: left photo gets one color, right photo gets a different color — split via `linear-gradient(to right, colorA 50%, colorB 50%)`.

**Future:** replace filename-hash with actual dominant color extraction at build time via `sharp`.

## Palette

64 colors generated across 8 hues × 4 lightness levels × 2 saturation variants. All muted, desaturated, grey-mixed — Morandi-consistent.

```
['#e5e9e1','#acc2b2','#e9e1e1','#e5e7e3','#d0d3dc','#acc2c2','#c6cfbe','#cfbecb',
 '#e3e4e7','#c2bcac','#b1b4bd','#c6cbc2','#c2c4cb','#e1e9e3','#b7bdb1','#d6dcd0',
 '#d2d9d9','#acb2c2','#d0dcd3','#d6d9d2','#cfcbbe','#c6c2cb','#e1e9e9','#b7b1bd',
 '#cfbebe','#e3e7e4','#b1bdb4','#e5e1e9','#d9d2d2','#c2acbc','#e5e3e7','#b7acc2',
 ... 64 total]
```

## Photo Sizing

- Images: `object-fit: contain`, 4px border-radius, native aspect ratios
- Row hover: 1.01× scale on images
- Mat padding: 60px vertical, 28px horizontal (32px/16px on mobile)

## Captions

- Below each photo, centered
- Monospace, 0.7rem, muted color, 0.6 opacity
- Full opacity on row hover

## Implementation

**File:** `src/pages/photos/index.astro`

The existing Astro page already implements the core logic (masonry → full-width rows, hash-based mats). Update to incorporate:

1. Orientation-based sorting (landscapes → singles, portraits → pairs)
2. Contrast-aware mat picking (warm/cool pool split)
3. Alternating row rhythm

**Data source:** `src/content/photos/gallery.yaml` — add optional `dominant` field for manual contrast control.

## Comparison

| Before | After |
|--------|-------|
| 3-column square grid | Full-width mat bands |
| All photos forced 1:1 | Native aspect ratios |
| Single uniform bg | Per-photo contrasting mats |
| No row rhythm | Alternating single/pair |
| 4px radius | 12px radius (mats), 4px (images) |
