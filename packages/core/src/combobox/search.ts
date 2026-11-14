/** Finds the label of a chosen value that the last search did not return. */
export type LabelCache<Item> = {
  /** The item for `key`, once a search or `ensure` has seen it. */
  get: (key: string) => Item | undefined;
  /** Keeps the items a search returned. */
  remember: (items: readonly Item[]) => void;
  /** Resolves the keys not seen yet, with one `resolve` call for all of them. */
  ensure: (keys: readonly string[]) => Promise<void>;
};

/**
 * A cache of the items a server search has returned, so a chosen value keeps its label after a new
 * search drops it. Pass `cache.get` to the combobox's `itemToLabel`. It does not debounce or cancel
 * searches: UI SDK's `useAsyncOptions` (`@ui-sdk/solid/async-options`) already does, with loading
 * and error status the combobox understands.
 */
export function createLabelCache<Item>(
  resolve: (keys: readonly string[]) => Promise<readonly Item[]>,
  itemToKey: (item: Item) => string,
): LabelCache<Item> {
  const known = new Map<string, Item>();

  function remember(items: readonly Item[]): void {
    for (const item of items) known.set(itemToKey(item), item);
  }

  async function ensure(keys: readonly string[]): Promise<void> {
    const missing = keys.filter((key) => !known.has(key));

    if (missing.length > 0) remember(await resolve(missing));
  }

  return { ensure, get: (key) => known.get(key), remember };
}
