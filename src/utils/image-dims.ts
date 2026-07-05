import { open } from 'node:fs/promises';

/**
 * Read image dimensions (width, height) from a JPEG or PNG file header.
 * Zero dependencies — parses only the file header, not the full image.
 */
export async function getImageDims(
  filePath: string,
): Promise<{ width: number; height: number }> {
  const fd = await open(filePath, 'r');
  try {
    const buf = Buffer.alloc(64 * 1024);
    const { bytesRead } = await fd.read(buf, 0, buf.length, 0);
    const data = buf.subarray(0, bytesRead);

    if (data.length < 24) throw new Error('File too small to be an image');

    // ── PNG ──
    if (
      data[0] === 0x89 &&
      data[1] === 0x50 &&
      data[2] === 0x4e &&
      data[3] === 0x47
    ) {
      // IHDR starts at byte 16: width(4) + height(4)
      const width = data.readUInt32BE(16);
      const height = data.readUInt32BE(20);
      return { width, height };
    }

    // ── JPEG ──
    if (data[0] === 0xff && data[1] === 0xd8) {
      let pos = 2;
      while (pos < data.length - 9) {
        if (data[pos] !== 0xff) throw new Error('Corrupt JPEG marker');
        const marker = data[pos + 1];
        // SOF0–SOF3 markers carry dimensions
        if (marker >= 0xc0 && marker <= 0xc3) {
          const height = data.readUInt16BE(pos + 5);
          const width = data.readUInt16BE(pos + 7);
          return { width, height };
        }
        // Skip other markers
        pos += 2 + data.readUInt16BE(pos + 2);
      }
      throw new Error('JPEG dimensions not found');
    }

    throw new Error('Unsupported image format (need JPEG or PNG)');
  } finally {
    await fd.close();
  }
}
