import type { ComboboxController, ListData } from "@ui-sdk/solid/combobox";
import { createContext, createMemo, createSignal, useContext, type Accessor, type Context } from "solid-js";

import type { OptionColor } from "../internal/index.ts";
import { useUiLocale } from "../provider/index.ts";

export type ComboboxContextValue<T> = {
  // Whether a typed query matches an item's label (ignoring case and accents).
  has: (query: string) => boolean;
  // The text the person typed, until the list closes or an item is chosen; else "".
  typed: Accessor<string>;
  // Whether the combobox refuses changes, so the create hints stay hidden.
  readOnly: Accessor<boolean>;
  // The color of an item's value, for the dot beside it; none for a plain item.
  colorOf: (value: T) => OptionColor | undefined;
  // Selects `value` as if it were picked, adding it to the chosen ones with `multiple`.
  select: (value: T) => void;
  // Tells the combobox an item with this label is rendered; returns the undo.
  register: (label: string) => () => void;
  // The box the input sits in, which the popup lines up with.
  group: Accessor<HTMLElement | undefined>;
  setGroup: (element: HTMLElement | undefined) => void;
};

// `T` only appears in a parameter, so any combobox's value is assignable to the `never` one.
export const COMBOBOX_CONTEXT: Context<ComboboxContextValue<never>> =
  /* @__PURE__ */ createContext<ComboboxContextValue<never>>();

export function useComboboxContext<T = string>(): ComboboxContextValue<T> {
  // The Combobox that provides the context and the parts inside it name the same `T`.
  return useContext(COMBOBOX_CONTEXT) /* the parts share the root's value type */ as ComboboxContextValue<T>;
}

// Whether a value is a plain string: a string item of a list, or text as an item's children.
export function isText(entry: unknown): entry is string {
  return String(entry) === entry;
}

// The labels of an `items` list: its items' labels, in groups too.
function labelsOf(items: ListData<unknown> | undefined): string[] {
  if (items === undefined) return [];

  return items.flatMap((entry) => {
    if (isText(entry)) return [entry];

    if ("type" in entry) return entry.type === "group" ? labelsOf(entry.items) : [];

    return [entry.label];
  });
}

type LabelRegistry = {
  labels: Accessor<readonly string[]>;
  register: (label: string) => () => void;
};

// The labels of the items rendered as children, which `items` does not list.
export function createLabelRegistry(): LabelRegistry {
  const [labels, setLabels] = createSignal<readonly string[]>([], { ownedWrite: true });

  function unregister(label: string): void {
    setLabels((current) => {
      const at = current.indexOf(label);

      return at < 0 ? current : current.toSpliced(at, 1);
    });
  }

  function register(label: string): () => void {
    setLabels((current) => [...current, label]);

    return () => unregister(label);
  }

  return { labels, register };
}

// A check for "is there an item with this label", from `items` and the rendered children.
export function createLabelMatcher(
  items: Accessor<ListData<unknown> | undefined>,
  registered: Accessor<readonly string[]>,
): (query: string) => boolean {
  const locale = useUiLocale();
  const collator = createMemo(() => new Intl.Collator(locale(), { sensitivity: "base", usage: "search" }));

  return (query) => {
    const wanted = query.trim();

    return [...labelsOf(items()), ...registered()].some((label) => collator().compare(label.trim(), wanted) === 0);
  };
}

// Picks a created value through the controller: it replaces the value, or joins the chosen ones.
export function createSelect<T, Multiple extends boolean | undefined>(
  multiple: Accessor<boolean>,
  controller: Accessor<ComboboxController<T, Multiple>>,
): (value: T) => void {
  return (value) => {
    const active = controller();

    if (multiple()) {
      // With `multiple` the controller's value is a list of `T`, and so is what it takes.
      const chosen = active.getValue() /* a multiple combobox holds a list */ as T[];

      active.setValue([...chosen, value] /* the list the controller takes */ as never);
    } else {
      active.setValue(value /* the single value the controller takes */ as never);
    }
  };
}
