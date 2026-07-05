/**
 * Shared palette utilities for photo gallery backgrounds.
 * Reads colors from src/config/palette.yaml (the single source of truth).
 *
 * Background color = the palette color that maximally contrasts with the
 * photo's hashed "base" color, measured by both luminance and hue distance.
 */
import paletteYaml from '../config/palette.yaml?raw';

// ── Parse palette ──
export const MATS: string[] =
  paletteYaml.match(/#[0-9a-fA-F]{6}/g) || [];

// ── Color helpers ──
function parseRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l]; // achromatic
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h * 360, s, l];
}

function luminance(hex: string): number {
  const [r, g, b] = parseRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b; // 0–255
}

/** Combined contrast score between two colors (0–1, higher = more contrast). */
function contrastScore(a: string, b: string): number {
  // Luminance distance (0–1)
  const lumDiff = Math.abs(luminance(a) - luminance(b)) / 255;

  // Hue distance (0–1, normalized from 0–180°)
  const [h1] = rgbToHsl(...parseRgb(a));
  const [h2] = rgbToHsl(...parseRgb(b));
  const hueDist = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
  const hueDiff = hueDist / 180;

  // Equal weights
  return lumDiff * 0.5 + hueDiff * 0.5;
}

// ── Precompute: contrast partners for each MATS color, sorted best-first ──
const CONTRAST_RANK: Record<string, string[]> = {};
for (const m of MATS) {
  CONTRAST_RANK[m] = MATS
    .filter(c => c !== m)
    .sort((a, b) => contrastScore(m, b) - contrastScore(m, a));
}

// ── Public API ──

/** Simple string hash (deterministic). */
export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Hash a photo path to a palette "base" color,
 * then return its best contrast partner as the background.
 */
export function contrastBg(photoPath: string): string {
  const base = MATS[hashStr(photoPath) % MATS.length];
  return CONTRAST_RANK[base][0];
}

/**
 * Like contrastBg, but skips `avoid` if possible (falls back to best contrast).
 */
export function contrastBgAvoid(photoPath: string, avoid: string): string {
  const base = MATS[hashStr(photoPath) % MATS.length];
  const ranked = CONTRAST_RANK[base];
  // Pick first non-avoided color, or best if all match
  const pick = ranked.find(c => c !== avoid);
  return pick ?? ranked[0];
}
