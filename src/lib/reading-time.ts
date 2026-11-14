/**
 * Rough reading-time estimate.
 *
 * Latin text is counted in words (~200 wpm); CJK text is counted in
 * characters (~400 chars/min), which is a much better proxy than counting
 * "words" separated by spaces.
 */
const WORDS_PER_MINUTE = 200;
const CJK_CHARS_PER_MINUTE = 400;

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/g;
const LATIN_WORD = /[A-Za-z0-9][A-Za-z0-9'-]*/g;

export interface ReadingStats {
  minutes: number;
  words: number;
}

export function readingStats(body: string | undefined): ReadingStats {
  const text = body ?? "";
  const cjk = text.match(CJK)?.length ?? 0;
  const latin = text.match(LATIN_WORD)?.length ?? 0;

  const minutes =
    Math.round((cjk / CJK_CHARS_PER_MINUTE + latin / WORDS_PER_MINUTE) * 10) / 10;

  return {
    minutes: Math.max(1, Math.round(minutes)),
    words: cjk + latin,
  };
}
