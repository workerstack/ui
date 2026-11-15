import type { FormValue, FormValues } from "../form/form-engine.ts";

// What "unsaved" means: a form's values deep-differ from where it starts (a revert is no change),
// never TanStack's sticky `isDirty`.

/** Whether `value` is a plain object (a group of values), not an array, Date or class instance. */
export function isGroup(value: FormValue): value is FormValues {
  if (typeof value !== "object" || value === null) return false;

  const proto: unknown = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
}

/** Whether `value` is a list of values. */
export function isList(value: FormValue): value is readonly FormValue[] {
  return Array.isArray(value);
}

function datesDiffer(start: FormValue, now: FormValue): boolean {
  return !(start instanceof Date && now instanceof Date && start.getTime() === now.getTime());
}

function listsDiffer(start: FormValue, now: FormValue): boolean {
  if (!isList(start) || !isList(now) || start.length !== now.length) return true;

  return start.some((item, index) => valuesChanged(item, now[index]));
}

function groupsDiffer(start: FormValues, now: FormValues): boolean {
  const keys = new Set([...Object.keys(start), ...Object.keys(now)]);

  return [...keys].some((key) => valuesChanged(start[key], now[key]));
}

/**
 * Whether `now` differs from `start`: Dates by time, arrays by order, groups by their keys (a key
 * holding `undefined` reads as absent).
 */
export function valuesChanged(start: FormValue, now: FormValue): boolean {
  if (Object.is(start, now)) return false;

  if (start instanceof Date || now instanceof Date) return datesDiffer(start, now);

  if (isList(start) || isList(now)) return listsDiffer(start, now);

  if (isGroup(start) && isGroup(now)) return groupsDiffer(start, now);

  return true;
}

/** One path a form's values set, and its value: `["address.city", "Oslo"]`. */
export type Leaf = readonly [path: string, value: FormValue];

/** Each path `values` sets: groups are walked, anything else (lists, Dates) is one value. */
export function leaves(values: FormValue, prefix = ""): Leaf[] {
  if (!isGroup(values)) return prefix === "" ? [] : [[prefix, values]];

  return Object.entries(values).flatMap(([key, value]) => leaves(value, prefix === "" ? key : `${prefix}.${key}`));
}
