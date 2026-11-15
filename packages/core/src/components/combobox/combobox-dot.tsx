import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";

import { OptionDot } from "../view/index.ts";
import { useComboboxContext } from "./combobox-context.ts";

/** What `ComboboxColorDot` takes. */
export type ComboboxColorDotProps<T> = {
  /** The item's value; the Combobox's `itemToColor` or its `items` tell the color. */
  value: T;
};

/** A dot in the item's color, before an item or a chip; nothing for an item with no color. */
export function ComboboxColorDot<T>(props: ComboboxColorDotProps<T>): JSX.Element {
  const combobox = useComboboxContext<T>();

  return <Show when={combobox.colorOf(props.value)}>{(color) => <OptionDot color={color()} />}</Show>;
}
