import type { FormValue, FormValues } from "../form/form-engine.ts";
import { isGroup, isList, leaves } from "./values-changed.ts";

// Which form a draft belongs to, and what a draft may keep: a draft written by a form with other
// fields is never restored, and secret fields are never written.

/** FNV-1a's 32-bit offset basis and prime: a short, stable fingerprint (not a security hash). */
const FNV_OFFSET = 0x81_1c_9d_c5;
const FNV_PRIME = 0x01_00_01_93;
const BASE36 = 36;

/** A list index in a path (`contacts[2]`), read as a key (`contacts.2`). */
const INDEX = /\[([^\]]+)\]/g;

/** The key that stands for every item of a list. */
const EVERY = "*";

function hash(text: string): string {
  let value = FNV_OFFSET;

  for (let index = 0; index < text.length; index += 1) {
    value ^= text.codePointAt(index) ?? 0;
    value = Math.imul(value, FNV_PRIME);
  }

  return (value >>> 0).toString(BASE36);
}

/** Which fields a form's values hold, by path, not what they hold: a draft from other fields is dropped. */
export function draftFingerprint(values: FormValues): string {
  return hash(
    leaves(values)
      .map(([path]) => path)
      .toSorted()
      .join("|"),
  );
}

function pathKeys(path: string): string[] {
  return path.replaceAll(INDEX, ".$1").split(".");
}

function isMatch(key: string, index: number): boolean {
  return key === EVERY || Number(key) === index;
}

function omitKeys(value: FormValue, keys: readonly string[]): FormValue {
  const [key = "", ...rest] = keys;

  if (isList(value)) return value.map((item, index) => (isMatch(key, index) ? omitKeys(item, rest) : item));

  if (!isGroup(value) || !(key in value)) return value;

  const { [key]: inner, ...others } = value;

  return rest.length === 0 ? others : { ...others, [key]: omitKeys(inner, rest) };
}

/** `values` without the `paths` a draft may not keep (`"password"`, `"cards[*].number"`). */
export function omitPaths(values: FormValues, paths: readonly string[]): FormValues {
  let kept: FormValue = values;

  for (const path of paths) kept = omitKeys(kept, pathKeys(path));

  return isGroup(kept) ? kept : {};
}
