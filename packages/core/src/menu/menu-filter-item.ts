import type { JSX } from "@solidjs/web";
import { children, createEffect, useContext } from "solid-js";

import { isStateFunction } from "../internal/index.ts";
import { FILTER_CONTEXT, GROUP_CONTEXT, LIST_CONTEXT } from "./menu-filter-state.ts";
import { contentText, matchesQuery } from "./menu-filter-text.ts";

type ItemContent<State> = JSX.Element | ((state: State) => JSX.Element);

/** What an item's parts read to take part in filtering. */
export type ItemFilter<State> = {
  /** The item's children, to pass on to its part. */
  content: (state: State) => JSX.Element;
  /** Whether the item shows: no query, or the query is in its text or `label`. */
  visible: () => boolean;
};

/**
 * Makes an item of a `MenuList` follow the filter: it matches by its `label` or its text and
 * registers with the menu and its group, so they can show an empty state and hide. An item outside
 * a list always shows and its children pass through as they are.
 */
export function useItemFilter<State>(props: { children?: ItemContent<State>; label?: string }): ItemFilter<State> {
  const state = useContext(FILTER_CONTEXT);
  const group = useContext(GROUP_CONTEXT);
  const inList = useContext(LIST_CONTEXT);
  // The text has to outlive the rendered item, which a non-match removes, so the nodes are kept.
  // A state function stays a function: `children` only unwraps functions that take no argument.

  const resolved = inList
    ? children(() => props.children /* a state function is left as it is, see above */ as JSX.Element)
    : null;

  const registries = inList ? [state?.items, group].filter((registry) => registry != null) : [];

  function content(part: State): JSX.Element {
    const value: ItemContent<State> = resolved === null ? props.children : resolved();

    return isStateFunction(value) ? value(part) : value;
  }

  function matches(): boolean {
    if (state === null || resolved === null) return true;

    return matchesQuery(state.query(), () => [props.label, contentText(resolved())]);
  }

  createEffect(
    () => 0,
    () => {
      const removers = registries.map((registry) => registry.add(matches));

      return () => {
        for (const remove of removers) remove();
      };
    },
  );

  return { content, visible: matches };
}
