import type { ImageMetadata } from 'astro';
import path from 'node:path';

/**
 * Photo asset pipeline.
 *
 * Source files live in `src/assets/photos/` so Astro's image service (sharp)
 * optimizes them at build time. The gallery yaml keeps referencing photos by
 * their stable logical path ("/images/photos/<series>/<file>.jpg") — these
 * helpers map that path to importable metadata / on-disk locations.
 */

// Keys look like "/src/assets/photos/panorama/1.jpg".
const photoModules = import.meta.glob<ImageMetadata>(
  '/src/assets/photos/**/*.{jpg,JPG,jpeg,JPEG,png,PNG}',
  { eager: true, import: 'default' },
);

const PREFIX = '/images/photos/';

function toRelative(src: string): string {
  return src.startsWith(PREFIX) ? src.slice(PREFIX.length) : src;
}

/** ImageMetadata for `<Image>` / `getImage()`. Throws at build time if missing. */
export function getPhoto(src: string): ImageMetadata {
  const meta = photoModules[`/src/assets/photos/${toRelative(src)}`];
  if (!meta) {
    throw new Error(
      `[photos] No asset for "${src}" — expected src/assets/photos/${toRelative(src)}`,
    );
  }
  return meta;
}

/** Absolute fs path to the source file (for color extraction, etc.). */
export function getPhotoFsPath(src: string): string {
  return path.join(process.cwd(), 'src/assets/photos', toRelative(src));
}
