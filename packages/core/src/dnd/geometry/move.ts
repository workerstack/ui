/**
 * Moves one entry of `list` from `from` to `to`, where `to` is the entry's index after the move. Returns a copy; the
 * same or an out-of-range index leaves the order unchanged.
 */
export function move<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];

  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return next;
  next.splice(to, 0, ...next.splice(from, 1));

  return next;
}
