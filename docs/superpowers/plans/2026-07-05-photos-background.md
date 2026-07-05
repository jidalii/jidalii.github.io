# Photo Background Colors — studiokleiner-inspired

> **Reference:** old.studiokleiner.com — each photo sits on a unique mat color that harmonizes with the image.

## Analysis

studiokleiner assigns each photo a **solid background color** that acts as a passe-partout (mat board). The relationship between photo and background follows these principles:

| Principle | How it works |
|-----------|-------------|
| **Tonal harmony** | The background picks up a subdued tone from the photo — a shadow, a sky, a skin tone, a foliage color. Not the dominant color, but a secondary one. |
| **Desaturated bridge** | The background is always muted/grey-mixed (Morandi-like). Even when pulling from a vibrant photo, the mat color is toned down. |
| **Contrast for readability** | Portraits get warmer mats (beige, rose). Landscapes get cooler mats (sage, slate). The mat creates separation so the photo pops. |
| **Grid rhythm** | Adjacent photos have complementary mat colors — warm next to cool creates visual rhythm across the grid. |
| **No pure white, no pure black** | Every mat color has grey mixed in. Consistent with our Morandi palette. |

## Implementation

**Algorithm: filename-hash → preset Morandi palette.** No per-photo config needed. The hash ensures the same photo always gets the same mat color across rebuilds.

**Palette (8 Morandi mat colors):**

```js
const MATS = [
  '#E8DDD4', // warm beige
  '#D5DFD8', // cool sage
  '#E5DCC8', // dusty ochre
  '#D4D9E0', // blue-grey
  '#E8D5CE', // soft terracotta
  '#D9DDCF', // muted olive
  '#E0D8E4', // dusty lavender
  '#D8D4C8', // warm stone
];
```

**Hash function (Astro frontmatter):**

```js
function pickMat(filename) {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = ((hash << 5) - hash) + filename.charCodeAt(i);
    hash |= 0;
  }
  return MATS[Math.abs(hash) % MATS.length];
}
```

**Template:**

```astro
<div class="photo-mat" style={`background:${pickMat(photo.image)}`}>
  <a class="photo-mat-inner" href={photo.image}>
    <img src={photo.image} alt={photo.alt || photo.title || ''} loading="lazy" />
    {photo.title && <span class="photo-caption">{photo.title}</span>}
  </a>
</div>
```

No `bg` field needed in `gallery.yaml`. The palette lives in the component. To change mat colors, edit the `MATS` array.

## Dark mode

The palette colors are light-mode mat tones. In dark mode, these would look too bright against the `#141311` background. Options:
- Accept that mats pop more in dark mode (intentional contrast)
- Use a separate dark-mode palette (muted darker tones)
- Wrap mats in a slightly darker variant via CSS `filter: brightness(0.85)` in dark mode
