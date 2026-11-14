import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * The Latin UI font has no CJK glyphs, so Chinese titles would render as
 * tofu boxes in the generated OG images. Load a subset of Noto Sans SC
 * (the 3,755 most common characters) as a fallback.
 *
 * Read from the project root rather than `import.meta.url`: during the
 * prerender step this module lives in `dist/.prerender/`, so a URL relative
 * to the module would point at the build output instead of the source tree.
 */
export async function loadCjkFont(): Promise<ArrayBuffer> {
  const file = path.join(
    process.cwd(),
    "src/assets/fonts/NotoSansSC-Regular.ttf",
  );
  const buffer = await readFile(file);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}