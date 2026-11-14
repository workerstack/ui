/**
 * The value, or a thrown error naming what was missing: a test's way to reach an element or a match
 * that must be there, without a `!` that would fail later with a vaguer message.
 */
export function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`expected ${what}, found none`);

  return value;
}
