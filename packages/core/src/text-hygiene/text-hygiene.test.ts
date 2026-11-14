import { expect, it } from "vitest";

import { cleanIdentifier, cleanLine, cleanText, isBlankText, stripInvisible, textLength } from "./text-hygiene.ts";

// What reaches a stored value: invisible characters never do, visible ones always do whole (emoji
// sequences, joined scripts), and IDs keep only what can be typed on a keyboard. Characters are
// built from code points, so the source shows which one each case holds.

function u(...points: number[]): string {
  return String.fromCodePoint(...points);
}

const NUL = u(0x0);
const BEL = u(0x7);
const NEL = u(0x85);
const NBSP = u(0xa0);
const SHY = u(0xad);
const ACUTE = u(0x301);
const ALM = u(0x61c);
const ZWSP = u(0x200b);
const ZWNJ = u(0x200c);
const ZWJ = u(0x200d);
const LRM = u(0x200e);
const RLM = u(0x200f);
const LS = u(0x2028);
const PS = u(0x2029);
const RLO = u(0x202e);
const WJ = u(0x2060);
const LRI = u(0x2066);
const PDI = u(0x2069);
const BRAILLE_BLANK = u(0x2800);
const IDEOGRAPHIC_SPACE = u(0x3000);
const HANGUL_FILLER = u(0x3164);
const VS16 = u(0xfe0f);
const BOM = u(0xfeff);
const REPLACEMENT = u(0xfffd);
const LONE_SURROGATE = String.fromCharCode(0xd800);

function tags(text: string): string {
  return Array.from(text, (char) => u(0xe0000 + char.charCodeAt(0))).join("");
}

const SCOTLAND = `${u(0x1f3f4)}${tags("gbsct")}${u(0xe007f)}`;
const SMUGGLED = `ok${tags("ignore")}`;
const PERSIAN = `${u(0x645, 0x6cc)}${ZWNJ}${u(0x62e, 0x648, 0x627, 0x647, 0x645)}`;
const CODER = `${u(0x1f469)}${ZWJ}${u(0x1f4bb)}`;
const HEART = `${u(0x2764)}${VS16}`;
const WAVE = u(0x1f44b, 0x1f3fd);

it.each([
  ["", true],
  ["   ", true],
  [`${NBSP}${IDEOGRAPHIC_SPACE}\t\n`, true],
  [`${ZWSP}${ZWSP}`, true],
  [BOM, true],
  [`${WJ}${SHY}`, true],
  [BRAILLE_BLANK, true],
  [HANGUL_FILLER, true],
  [ZWJ, true],
  [`${LRM}${RLM}${ALM}`, true],
  [tags("hi"), true],
  [`${NUL}${BEL}`, true],
  ["a", false],
  ["0", false],
  [HEART, false],
  [".", false],
])("isBlankText case %# (%j) is blank: %s", (text, blank) => {
  expect(isBlankText(text)).toStrictEqual(blank);
});

it.each([
  ["  Ada  ", "Ada"],
  [`${NBSP}Ada${IDEOGRAPHIC_SPACE}`, "Ada"],
  ["Ada\tLovelace", "Ada Lovelace"],
  ["Ada\nLovelace", "Ada Lovelace"],
  ["Ada\r\nLovelace", "Ada Lovelace"],
  [`Ada${NEL}Lovelace${LS}x${PS}y`, "Ada Lovelace x y"],
  ["Ada  Lovelace", "Ada  Lovelace"],
  [`Ada${NBSP}Lovelace`, `Ada${NBSP}Lovelace`],
  [`Ada${ZWSP}Lovelace`, "AdaLovelace"],
  [`a${WJ}b`, "ab"],
  [`${BOM}Ada`, "Ada"],
  [`Ad${SHY}a`, "Ada"],
  [`Ada${HANGUL_FILLER}`, "Ada"],
  [`Ada${BRAILLE_BLANK}Lovelace`, "AdaLovelace"],
  [`Ada${NUL}${BEL}`, "Ada"],
  [`Ada${LONE_SURROGATE}`, `Ada${REPLACEMENT}`],
  [`${RLO}txt.exe`, "txt.exe"],
  [`a${LRI}b${PDI}c`, "abc"],
  [`${LRM}Ada${RLM}`, "Ada"],
  [`Ada${RLM}b`, `Ada${RLM}b`],
  [SMUGGLED, "ok"],
  [SCOTLAND, SCOTLAND],
  [`I ${HEART}`, `I ${HEART}`],
  [`${CODER} dev`, `${CODER} dev`],
  [WAVE, WAVE],
  [PERSIAN, PERSIAN],
  [`e${ACUTE}`, u(0xe9)],
  [u(0xff11, 0xff12, 0xff13), u(0xff11, 0xff12, 0xff13)],
  [`${ZWSP} ${BRAILLE_BLANK}`, ""],
])("cleanLine case %# (%j) becomes %j", (text, clean) => {
  expect(cleanLine(text)).toStrictEqual(clean);
});

it.each([
  ["\n\n  Hello\n  world  \n\n", "Hello\n  world"],
  ["a\r\nb\rc", "a\nb\nc"],
  [`a${LS}b${PS}c${NEL}d`, "a\nb\nc\nd"],
  ["a\tb", "a\tb"],
  ["a   b", "a   b"],
  [`a${ZWSP}\nb`, "a\nb"],
  [`a${NUL}b`, "ab"],
  [`${RLO}a`, "a"],
  [SMUGGLED, "ok"],
  [`${CODER}\n${HEART}`, `${CODER}\n${HEART}`],
  [PERSIAN, PERSIAN],
  [`e${ACUTE}`, u(0xe9)],
  [`${ZWSP}\n${BRAILLE_BLANK}\n`, ""],
])("cleanText case %# (%j) becomes %j", (text, clean) => {
  expect(cleanText(text)).toStrictEqual(clean);
});

it.each([
  ["  Hi  ", "  Hi  "],
  [`Hi${ZWSP}there`, "Hithere"],
  [`a${RLO}b`, "ab"],
  [SMUGGLED, "ok"],
  [`${CODER} ${HEART}`, `${CODER} ${HEART}`],
  [`e${ACUTE}`, u(0xe9)],
  [ZWSP, ""],
])("stripInvisible case %# (%j) becomes %j", (text, clean) => {
  expect(stripInvisible(text)).toStrictEqual(clean);
});

it.each([
  [` HR12 3456${ZWSP} `, "HR123456"],
  [u(0xff11, 0xff12, 0xff13), "123"],
  [`${u(0xff21, 0xff22)}-1`, "AB-1"],
  [u(0x661, 0x662, 0x663), "123"],
  [u(0x6f1, 0x6f2, 0x6f3), "123"],
  [u(0x967, 0x968, 0x969), "123"],
  [u(0xe51, 0xe52, 0xe53), "123"],
  [`a${SHY}b${WJ}c${BOM}`, "abc"],
  [`12${NBSP}34`, "1234"],
  [`DE${RLO}123`, "DE123"],
  [SMUGGLED, "ok"],
  [`ab${LONE_SURROGATE}`, `ab${REPLACEMENT}`],
  [BRAILLE_BLANK, ""],
])("cleanIdentifier case %# (%j) becomes %j", (text, clean) => {
  expect(cleanIdentifier(text)).toStrictEqual(clean);
});

it.each([
  ["", 0],
  ["abc", 3],
  [CODER, 1],
  [HEART, 1],
  [WAVE, 1],
  [SCOTLAND, 1],
  [`e${ACUTE}`, 1],
  [PERSIAN, 7],
])("textLength case %# (%j) is %i characters", (text, length) => {
  expect(textLength(text)).toStrictEqual(length);
});
