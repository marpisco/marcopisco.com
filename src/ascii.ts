// Characters from dark to light, so a bright pixel prints a dense glyph on the dark page.
const RAMP = ' .:-=+*#%@';
// Glyphs of the scramble. ASCII only, so the grid stays aligned in the monospace font.
export const SCRAMBLE_GLYPHS = '01<>/\\|=+*#%$&@?!';

// `gray` holds one 0-255 brightness value per cell, row by row.
export function toAscii(gray: ArrayLike<number>, cols: number): string {
  const lines: string[] = [];
  for (let start = 0; start < gray.length; start += cols) {
    let line = '';
    for (let index = start; index < start + cols; index++) {
      line += RAMP[Math.min(RAMP.length - 1, Math.floor((gray[index] / 256) * RAMP.length))];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

// Rec. 601 luma of each RGBA pixel, stretched so the darkest pixel is 0 and the brightest 255.
export function toGray(rgba: ArrayLike<number>): number[] {
  const gray: number[] = [];
  for (let index = 0; index < rgba.length; index += 4) {
    gray.push(0.299 * rgba[index] + 0.587 * rgba[index + 1] + 0.114 * rgba[index + 2]);
  }
  const min = Math.min(...gray);
  const range = Math.max(...gray) - min || 1;
  return gray.map((value) => ((value - min) / range) * 255);
}

// Every glyph cycles through random characters in place, like Minecraft's obfuscated (&k) text,
// until its own `vanishAt` time, then clears. Blanks and line breaks stay as they are.
export function scrambleFrame(
  text: string,
  vanishAt: readonly number[],
  elapsedMs: number,
  glyph: () => string,
): string {
  return Array.from(text, (char, index) => {
    if (char === ' ' || char === '\n') {
      return char;
    }
    return elapsedMs >= vanishAt[index] ? ' ' : glyph();
  }).join('');
}
