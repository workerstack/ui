// What reaches a stored value. Text is read as grapheme clusters (what a person sees as one
// character), so emoji sequences, skin tones, subdivision flags and the joiners Persian and Indic
// scripts need stay whole while invisible characters go:
//
// - An invisible cluster is made only of whitespace, default-ignorable code points (zero-width
//   space, word joiner, BOM, soft hyphen, Hangul fillers, variation selectors on their own), the
//   Braille blank, or control characters. Text of nothing else is blank.
// - `cleanLine` (one line: a name, a title, a tag): NFC; tabs and line breaks become spaces;
//   control characters, bidi embeddings, overrides and isolates, and Unicode tag characters
//   (invisible text an AI reads but a person doesn't) go, except a flag's tags; invisible clusters
//   go, except spaces and the direction marks inside the text; the ends are trimmed.
// - `cleanText` (several lines): the same, keeping tabs and newlines (CRLF, CR and the Unicode
//   line and paragraph separators become LF).
// - `cleanIdentifier` (an ID, a code, a number's text): NFKC, so fullwidth letters and digits
//   fold; every script's decimal digits become ASCII; whitespace, format and default-ignorable
//   characters go.
//
// Passwords are never cleaned. Controls clean on blur and on submit, never per keystroke, so a
// trailing space can be typed and an input method's composition is left alone.

const INVISIBLE = /^[\p{White_Space}\p{Default_Ignorable_Code_Point}\p{Cc}\u{2800}]+$/u;
const SPACE = /^\p{White_Space}+$/u;
const DIRECTION_MARK = /^[\u{200E}\u{200F}\u{061C}]+$/u;
const BIDI_CONTROL = /[\u{202A}-\u{202E}\u{2066}-\u{2069}]/gu;
const TAG = /[\u{E0000}-\u{E007F}]/gu;

// With the `u` flag this matches only unpaired surrogates (what `toWellFormed` replaces).
const LONE_SURROGATE = /[\u{D800}-\u{DFFF}]/gu;

const REPLACEMENT = "\u{FFFD}";
const DIGIT_RUN = 10;
const FLAG_BASE = 0x1f3f4;
const LINE_BREAK_TO_SPACE = /\r\n?|[\t\n\v\f\u{0085}\u{2028}\u{2029}]/gu;
const LINE_BREAK_TO_LF = /\r\n?|[\v\f\u{0085}\u{2028}\u{2029}]/gu;
const CONTROL = /\p{Cc}/gu;
const CONTROL_BUT_TAB_AND_LF = /(?![\t\n])\p{Cc}/gu;
const IDENTIFIER_NOISE = /[\p{White_Space}\p{Default_Ignorable_Code_Point}\p{Cc}\p{Cf}\u{2800}]/gu;
const DECIMAL_DIGIT = /\p{Nd}/u;

/** True for a cluster nobody can see: whitespace, default-ignorables, the Braille blank, controls. */
function isInvisibleCluster(cluster: string): boolean {
  return INVISIBLE.test(cluster);
}

// A segmenter per call: a module-level `new` would run on import.
function segment(text: string): Intl.Segments {
  return new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text);
}

function clusters(text: string): string[] {
  return Array.from(segment(text), (part) => part.segment);
}

/** True when the text holds nothing visible. */
export function isBlankText(text: string | null | undefined): boolean {
  if (text === null || text === undefined || text === "") return true;

  return clusters(text).every(isInvisibleCluster);
}

// Tag characters spell flags (England, Scotland, Wales) after a black flag; anywhere else they
// carry hidden text.
function withoutTags(cluster: string): string {
  return cluster.codePointAt(0) === FLAG_BASE ? cluster : cluster.replaceAll(TAG, "");
}

// Keeps visible clusters, spaces and direction marks inside the text, and trims every invisible
// cluster (marks included) off both ends.
function keepVisible(text: string, options: { kept: (cluster: string) => boolean; trim: boolean }): string {
  const parts = clusters(text)
    .map(withoutTags)
    .filter((cluster) => cluster !== "" && (!isInvisibleCluster(cluster) || options.kept(cluster)));

  if (!options.trim) return parts.join("");

  let start = 0;
  let end = parts.length;

  while (start < end && isInvisibleCluster(parts[start] ?? "")) start += 1;

  while (end > start && isInvisibleCluster(parts[end - 1] ?? "")) end -= 1;

  return parts.slice(start, end).join("");
}

function keptInside(cluster: string): boolean {
  return SPACE.test(cluster) || DIRECTION_MARK.test(cluster);
}

/** One line of text as it should be stored. */
export function cleanLine(text: string): string {
  const line = text
    .replaceAll(LONE_SURROGATE, REPLACEMENT)
    .normalize("NFC")
    .replaceAll(LINE_BREAK_TO_SPACE, " ")
    .replaceAll(CONTROL, "")
    .replaceAll(BIDI_CONTROL, "");

  return keepVisible(line, { kept: keptInside, trim: true });
}

/** Several lines of text as they should be stored. */
export function cleanText(text: string): string {
  const lines = text
    .replaceAll(LONE_SURROGATE, REPLACEMENT)
    .normalize("NFC")
    .replaceAll(LINE_BREAK_TO_LF, "\n")
    .replaceAll(CONTROL_BUT_TAB_AND_LF, "")
    .replaceAll(BIDI_CONTROL, "");

  return keepVisible(lines, { kept: keptInside, trim: true });
}

/** A piece of text inside a larger one (a rich text node): invisible characters go, as in
    `cleanText`, but nothing is trimmed, since its spaces may sit between two marks. */
export function stripInvisible(text: string): string {
  const piece = text
    .replaceAll(LONE_SURROGATE, REPLACEMENT)
    .normalize("NFC")
    .replaceAll(CONTROL_BUT_TAB_AND_LF, "")
    .replaceAll(BIDI_CONTROL, "");

  return keepVisible(piece, { kept: keptInside, trim: false });
}

// A decimal digit's value: Unicode encodes each script's digits as runs of ten from 0 to 9, some
// back to back, so the offset from the start of the contiguous digits counts in tens.
function digitValue(char: string): number {
  const point = char.codePointAt(0) ?? 0;
  let start = point;

  while (DECIMAL_DIGIT.test(String.fromCodePoint(start - 1))) start -= 1;

  return (point - start) % DIGIT_RUN;
}

/** Every script's decimal digits as ASCII (Arabic-Indic, Devanagari, Thai…); the rest as is. */
function foldDigits(text: string): string {
  let result = "";

  for (const char of text) result += char > "9" && DECIMAL_DIGIT.test(char) ? String(digitValue(char)) : char;

  return result;
}

/** An ID, a code or a number's text as typed on any keyboard, reduced to what it means. */
export function cleanIdentifier(text: string): string {
  return foldDigits(text.replaceAll(LONE_SURROGATE, REPLACEMENT).normalize("NFKC").replaceAll(IDENTIFIER_NOISE, ""));
}

/** The number of characters a person sees (grapheme clusters, not UTF-16 units). */
export function textLength(text: string): number {
  return Array.from(segment(text)).length;
}
