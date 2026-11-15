import type { JSX } from "@solidjs/web";
import { omit, Show } from "solid-js";

import { callRef } from "../../internal/ref.ts";
import { cn } from "../../utils/cn/index.ts";
import { useUiMessages } from "../provider/index.ts";
import { LIST_CONTEXT, useFilterState } from "./menu-filter-state.ts";
import { wireFilterInput } from "./wire-filter-input.ts";

/** The input's props, minus the ones the filter owns. */
export type MenuFilterProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "class" | "onInput" | "type" | "value"
> & {
  /** Classes added to the input. */
  class?: string;
};

/**
 * The search box at the top of a filterable menu. It takes focus when the menu opens, narrows the
 * items of the MenuList by what is typed, and highlights the first match, so Enter runs it. The
 * arrow keys still move through the items; the menu's own typeahead stays off while typing here.
 * Its accessible name and placeholder default to the provider's `menuFilter` string.
 */
export function MenuFilter(props: MenuFilterProps): JSX.Element {
  const messages = useUiMessages();
  const filter = useFilterState();
  const rest = omit(props, "class", "ref");
  let input: HTMLInputElement | undefined;

  wireFilterInput(() => input, filter.query);

  return (
    <input
      aria-label={messages.menuFilter}
      placeholder={messages.menuFilter}
      {...rest}
      data-slot="menu-filter"
      role="searchbox"
      type="text"
      autocomplete="off"
      value={filter.query()}
      onInput={(event) => filter.setQuery(event.currentTarget.value)}
      ref={(element) => {
        input = element;
        callRef(() => props.ref, element);
      }}
      class={cn(
        "sticky -top-1 z-10 -mx-1 -mt-1 mb-1 h-9 w-[calc(100%+0.5rem)] border-0 border-b bg-popover px-3 text-base",
        "text-popover-foreground outline-none placeholder:text-muted-foreground md:text-sm",
        props.class,
      )}
    />
  );
}

/** The list's props: a div. */
export type MenuListProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  /** Classes added to the element. */
  class?: string;
};

/** The items a filter narrows. Items outside it always show. */
export function MenuList(props: MenuListProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <LIST_CONTEXT value={true}>
      <div {...rest} role="presentation" data-slot="menu-list" class={props.class} />
    </LIST_CONTEXT>
  );
}

/** The empty state's props: a div. */
export type MenuEmptyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  /** Classes added to the element. */
  class?: string;
};

/** Shows while no item matches the filter: its children, or the provider's `noResults` string. */
export function MenuEmpty(props: MenuEmptyProps): JSX.Element {
  const messages = useUiMessages();
  const filter = useFilterState();
  const rest = omit(props, "children", "class");

  return (
    <Show when={filter.items.none()}>
      <div
        {...rest}
        role="status"
        data-slot="menu-empty"
        class={cn("px-2 py-6 text-center text-sm text-muted-foreground", props.class)}
      >
        {props.children ?? messages.noResults}
      </div>
    </Show>
  );
}
