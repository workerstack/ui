import { createContext, createSignal, useContext, type Accessor, type Context } from "solid-js";

/** The items of a filterable menu, or of one of its groups, and whether any of them matches. */
export type MatchRegistry = {
  /** Registers an item's match check. The result unregisters it. */
  add: (matches: Accessor<boolean>) => () => void;
  /** Whether items are registered and none of them matches. */
  none: Accessor<boolean>;
};

/** Makes an empty registry. */
export function createMatchRegistry(): MatchRegistry {
  const [entries, setEntries] = createSignal<readonly Accessor<boolean>[]>([], { ownedWrite: true });

  return {
    add(matches) {
      setEntries((current) => [...current, matches]);

      return () => setEntries((current) => current.filter((entry) => entry !== matches));
    },
    none: () => entries().length > 0 && !entries().some((matches) => matches()),
  };
}

/** What a menu's filter, list and items share while its popup is on screen. */
export type FilterState = {
  items: MatchRegistry;
  query: Accessor<string>;
  setQuery: (query: string) => void;
};

/** Makes the state of one popup: no query, no items. */
export function createFilterState(): FilterState {
  const [query, setQuery] = createSignal("");

  return { items: createMatchRegistry(), query, setQuery };
}

/** The popup's state. Each popup makes its own, so a reopened menu starts with no query. */
export const FILTER_CONTEXT: Context<FilterState | null> = /* @__PURE__ */ createContext<FilterState | null>(null);

/** Whether the items below are in a `MenuList`, which is what a filter narrows. */
export const LIST_CONTEXT: Context<boolean> = /* @__PURE__ */ createContext(false);

/** The registry of the group around an item. */
export const GROUP_CONTEXT: Context<MatchRegistry | null> = /* @__PURE__ */ createContext<MatchRegistry | null>(null);

/** The state of the popup around a filter part; throws outside a `MenuContent`. */
export function useFilterState(): FilterState {
  const state = useContext(FILTER_CONTEXT);

  if (state === null) throw new Error("A menu filter part must be used inside <MenuContent>.");

  return state;
}
