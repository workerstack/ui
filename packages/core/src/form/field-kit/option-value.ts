// The value type a Select's or Combobox's `items` hold, so a field's Root can check the field
// against them: a plain entry is its own value, an item holds its `value`, a group holds its
// items' values and a separator holds none.

/** The value one entry of `items` holds. */
type EntryValue<TEntry> = TEntry extends { readonly type: "separator" }
  ? never
  : TEntry extends { readonly type: "group"; readonly items: readonly (infer TGrouped)[] }
    ? EntryValue<TGrouped>
    : TEntry extends { readonly value: infer TValue }
      ? TValue
      : TEntry;

/** The values the options of `items` hold (`OptionValue<typeof ROLES>` is `"viewer" | "admin"`). */
export type OptionValue<TItems> = TItems extends readonly (infer TEntry)[] ? EntryValue<TEntry> : never;
