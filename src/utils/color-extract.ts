/**
 * Extract dominant colors from a photo and pick an art-directed background.
 *
 * Pipeline:
 * 1. Extract top-k dominant colors via k-means on sampled pixels
 * 2. Pick a non-dominant supporting color (not #1)
 * 3. Reduce saturation (matte / gallery-wall feel)
 * 4. Adjust luminance for framing
 * 5. Keep text readable
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

// ── Color helpers ──

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360,
    s = hsl.s,
    l = hsl.l;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): RGB {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// ── k-means clustering ──

function kmeans(
  pixels: RGB[],
  k: number,
  maxIter = 10,
): { centroid: RGB; count: number }[] {
  if (pixels.length === 0) return [];

  // Deterministic init: pick evenly spaced pixels as starting centroids
  const centroids: RGB[] = [];
  const step = Math.max(1, Math.floor(pixels.length / k));
  for (let i = 0; i < k; i++) {
    centroids.push({ ...pixels[Math.min(i * step, pixels.length - 1)] });
  }

  const assignments = new Int32Array(pixels.length);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    // Assign
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      let best = 0,
        bestDist = Infinity;
      for (let j = 0; j < k; j++) {
        const c = centroids[j];
        const dr = p.r - c.r,
          dg = p.g - c.g,
          db = p.b - c.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          best = j;
        }
      }
      if (assignments[i] !== best) changed = true;
      assignments[i] = best;
    }
    if (!changed) break;
    // Update
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, n: 0 }));
    for (let i = 0; i < pixels.length; i++) {
      const c = sums[assignments[i]];
      c.r += pixels[i].r;
      c.g += pixels[i].g;
      c.b += pixels[i].b;
      c.n++;
    }
    for (let j = 0; j < k; j++) {
      const s = sums[j];
      if (s.n > 0) {
        centroids[j] = {
          r: Math.round(s.r / s.n),
          g: Math.round(s.g / s.n),
          b: Math.round(s.b / s.n),
        };
      }
    }
  }

  // Count cluster sizes
  const sizes = new Array(k).fill(0);
  for (let i = 0; i < assignments.length; i++) sizes[assignments[i]]++;

  return centroids
    .map((c, i) => ({ centroid: c, count: sizes[i] }))
    .sort((a, b) => b.count - a.count);
}

// ── Color extraction ──

export async function extractColors(
  imagePath: string,
  k = 6,
): Promise<string[]> {
  // Read image, resize small for fast processing
  const { data, info } = await sharp(imagePath)
    .resize(200, 200, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Sample every 4th pixel, skip near-white (>90% lum) and near-black (<5% lum)
  const pixels: RGB[] = [];
  for (let i = 0; i < data.length; i += info.channels * 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < 12 || lum > 242) continue; // skip extremes
    pixels.push({ r, g, b });
  }

  if (pixels.length < k) {
    // Fallback: return a single mid-gray
    return ['#c4c0ba'];
  }

  const clusters = kmeans(pixels, k);
  return clusters.map((c) => {
    const r = c.centroid.r.toString(16).padStart(2, '0');
    const g = c.centroid.g.toString(16).padStart(2, '0');
    const b = c.centroid.b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  });
}

// ── Art-directed background selection ──

/**
 * Pick the best background color from extracted dominant colors.
 *
 * Strategy:
 * - Skip the #1 most dominant (that's the subject/big area)
 * - From #2–#k, score each based on suitability as a matte/gallery-wall color
 * - Desaturate and adjust luminance for framing
 */
export function pickBgFromColors(
  colors: string[],
): string {
  if (colors.length < 2) {
    // Fallback: process the only color we have
    return processForBg(colors[0] || '#c4c0ba');
  }

  // Skip #1 (most dominant), score the rest
  const candidates = colors.slice(1);
  let best = candidates[0],
    bestScore = -Infinity;

  for (const c of candidates) {
    const hsl = rgbToHsl(hexToRgb(c).r, hexToRgb(c).g, hexToRgb(c).b);
    let score = 0;

    // Prefer naturally low-medium saturation (matte feel)
    if (hsl.s < 0.3) score += 3;
    else if (hsl.s < 0.5) score += 1;
    else score -= 2; // too vivid

    // Prefer mid luminance (gallery wall isn't black or white)
    if (hsl.l > 0.2 && hsl.l < 0.8) score += 2;
    else if (hsl.l > 0.1 && hsl.l < 0.9) score += 0;
    else score -= 1; // extreme dark/bright

    // Relationship to overall palette — prefer colors that have some
    // hue presence (not gray). Gray gets a slight penalty since it
    // doesn't relate to the photo content.
    if (hsl.s > 0.05) score += 1; // has some color character

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return processForBg(best);
}

/** Desaturate and adjust luminance to make a color work as a matte background. */
function processForBg(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);

  // Reduce saturation: keep 25–50% of original (gallery matte feel)
  hsl.s = hsl.s * 0.35;

  // Clamp and nudge luminance toward a comfortable matte range
  // Target: 0.25–0.75 — not glaring white, not pitch black
  if (hsl.l > 0.85) hsl.l = 0.75;
  else if (hsl.l < 0.10) hsl.l = 0.18;
  // Gently push toward mid-range
  hsl.l = hsl.l * 0.7 + 0.15;

  // Ensure enough contrast for text: if too light, darken; if too dark, lighten
  const resultHex = hslToHex(hsl);
  const lum = luminance(resultHex);
  // For light text (#F0EDE7, lum≈238) on bg: need bg lum < ~180 for decent contrast
  // For dark text (#141311, lum≈20) on bg: need bg lum > ~80
  if (lum > 200) {
    hsl.l = Math.max(0.12, hsl.l - 0.25);
  } else if (lum < 40) {
    hsl.l = Math.min(0.85, hsl.l + 0.25);
  }

  return hslToHex(hsl);
}

/** Full pipeline: extract colors from image, then pick art-directed background. */
export async function bgColor(imagePath: string): Promise<string> {
  const colors = await extractColors(imagePath);
  return pickBgFromColors(colors);
}
