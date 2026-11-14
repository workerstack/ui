import type { JSX } from "@solidjs/web";
import { matchRanges } from "@ui-sdk/solid/text-match";

import { HIDDEN_ATTRIBUTE, HIDDEN_VALUE } from "./menu.constants.ts";

/**
 * Whether `query` is in one of the texts, ignoring case and accents in the user's language. An
 * empty query matches everything, and its texts are not read.
 */
export function matchesQuery(query: string, texts: () => readonly (string | undefined)[]): boolean {
  const wanted = query.trim();

  if (wanted === "") return true;

  return texts().some((text) => text !== undefined && matchRanges(text, wanted, "contains").length > 0);
}

function nodeText(node: Node): string {
  if (node instanceof Text) return node.data;

  if (!(node instanceof Element) || node.getAttribute(HIDDEN_ATTRIBUTE) === HIDDEN_VALUE) return "";

  return [...node.childNodes].map(nodeText).join("");
}

/**
 * The text a rendered value shows. What screen readers skip stays out: a shortcut's keys and an
 * icon are `aria-hidden`.
 */
export function contentText(value: JSX.Element): string {
  if (Array.isArray(value)) return value.map(contentText).join("");

  if (value instanceof Node) return nodeText(value);

  if (value instanceof Object || value === null || value === undefined || value === true || value === false) return "";

  return `${value}`;
}
