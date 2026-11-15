// Props passed on under exactOptionalPropertyTypes: an optional prop the source left out stays out,
// rather than arriving as an explicit undefined the target's type does not take.

/**
 * The `keys` the source has, each a getter that reads the source when the target reads it (so a
 * Solid prop stays live). A key the source lacks is left out, as `Pick` promises for optional keys.
 */
export function presentProps<TSource extends object, TKey extends keyof TSource>(
  source: TSource,
  keys: readonly TKey[],
): Pick<TSource, TKey> {
  const picked = {};

  for (const key of keys) {
    if (!(key in source)) continue;
    Object.defineProperty(picked, key, { enumerable: true, get: () => source[key] });
  }

  return picked /* each key the source has, defined above as a getter for its own value */ as Pick<TSource, TKey>;
}
