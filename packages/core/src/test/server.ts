import { renderToString } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

import { collectWarnings } from "./warnings.ts";

export type ServerRender = {
  html: string;
  /**
   * What Solid and UI SDK warned about while rendering, such as a signal written on the server.
   * Solid warns once per kind of warning per process (each test file is one), so a file checks
   * warnings in its first test.
   */
  warnings: string[];
};

const OPEN_TAG = /<([a-z][a-z0-9-]*)/gi;
const ATTRIBUTE = /\s+([^\s=/>]+)(?:=(?:"([^"]*)"|([^\s"'>]+)))?/y;
const TAG_END = /\s*\/?>/y;
const ANY_TAG = /<[^>]*>/g;

/** Renders on the server, as an SSR app's request handler does, and collects warnings. */
export function renderServer(code: () => JSX.Element): ServerRender {
  const { result, warnings } = collectWarnings(() => renderToString(code));

  return { html: result, warnings };
}

/** One opening tag: its lowercased name and its decoded attributes. */
export type Tag = {
  name: string;
  attrs: Record<string, string>;
};

/** Reads the attributes after a tag name at `at`, up to the tag's end. */
function attributes(html: string, at: number): Tag["attrs"] {
  const pairs: [string, string][] = [];
  let cursor = at;

  for (;;) {
    TAG_END.lastIndex = cursor;

    if (TAG_END.test(html)) break;
    ATTRIBUTE.lastIndex = cursor;
    const pair = ATTRIBUTE.exec(html);

    if (pair === null) break;
    const [, key = "", quoted, bare] = pair;
    pairs.push([key, decode(quoted ?? bare ?? "")]);
    cursor = ATTRIBUTE.lastIndex;
  }

  return Object.fromEntries(pairs);
}

/**
 * Every opening tag in the HTML, in order. Attribute values may hold `>` (`[&>input]:…`), so this
 * reads them one by one.
 */
export function tags(html: string): Tag[] {
  const found: Tag[] = [];
  OPEN_TAG.lastIndex = 0;

  for (let match = OPEN_TAG.exec(html); match !== null; match = OPEN_TAG.exec(html)) {
    const [, name = ""] = match;
    found.push({ attrs: attributes(html, OPEN_TAG.lastIndex), name: name.toLowerCase() });
  }

  return found;
}

/** The tags of one part, by its `data-slot`. */
export function slots(html: string, slotName: string): Tag[] {
  return tags(html).filter((tag) => tag.attrs["data-slot"] === slotName);
}

/** The one tag of a part. Throws if the part is missing or rendered more than once. */
export function slot(html: string, name: string): Tag {
  const [first, ...rest] = slots(html, name);

  const count = rest.length + (first === undefined ? 0 : 1);

  const message = `expected one data-slot="${name}", found ${count} in:\n${html}`;

  if (first === undefined || rest.length > 0) throw new Error(message);

  return first;
}

/** The text of the HTML with tags removed. */
export function text(html: string): string {
  return decode(html.replaceAll(ANY_TAG, ""));
}

function decode(value: string): string {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}
