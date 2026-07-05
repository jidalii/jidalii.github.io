# Photo Gallery Layout Rules

## Row Assignment

| Row type | Photos per row | Orientation rule | Layout |
|----------|---------------|------------------|--------|
| Single   | 1             | `width > height` (landscape) | Photo centered, full-width mat |
| Pair     | 2             | `width <= height` (portrait/square) | Two photos side by side, split mat |

## Rhythm

Rows alternate strictly: **single → pair → single → pair → ...**

If a pair row has only 1 photo available (odd count), it falls back to a single row.

## Background Colors

**Algorithm: contrast-aware mat assignment.**

1. Each photo has a `dominant` tone — warm, cool, light, or dark. This can be extracted at build time (sharp average color) or set manually per photo.
2. The mat color is selected from the 64-color palette based on **contrast** with the photo's dominant tone:
   - Warm-dominant photos → cool-toned mats (sage, blue-grey, lavender)
   - Cool-dominant photos → warm-toned mats (beige, ochre, terracotta)
   - Light-dominant photos → slightly darker mats for separation
   - Dark-dominant photos → lighter mats to make the photo pop
3. No two adjacent rows share the same mat color (cycle-through with skip).
4. Pair rows: each photo gets its own contrasting mat color (50/50 split via `linear-gradient`).

**Why contrast matters:** studiokleiner's mats never blend into the photo. A portrait on a warm beige mat still has enough tonal difference that the photo reads as a distinct object. The mat is a frame, not camouflage.

## Build-time implementation (future)

```js
// In astro.config or a build script:
import sharp from 'sharp';
async function getDominant(imagePath) {
  const { dominant } = await sharp(imagePath).stats();
  // dominant.r, dominant.g, dominant.b → classify warm/cool/light/dark
}
```

For now, `dominant` can be an optional field in `gallery.yaml`:
```yaml
photos:
  - image: "/images/photos/PS524083.jpg"
    title: "Portrait series"
    dominant: "warm"
```

## Mat Palette

64 colors generated across 8 hues × 4 lightness levels × 2 saturation variants. All muted, desaturated, grey-mixed — consistent with the Morandi brand palette.

## Photo Sizing

- Single row: photo max-width 980px, max-height 65vh, `object-fit: contain`
- Pair row: each photo max-width 480px, max-height 55vh, `object-fit: contain`
- 12px border-radius on images
- Subtle 1.01× scale on row hover

## Captions

- Centered below each photo
- Monospace, 0.7rem, muted color
- Opacity 0.6, full opacity on row hover

## Responsive

- ≤768px: pair rows stack vertically
- ≤480px: single column
