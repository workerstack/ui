import type { JSX } from "@solidjs/web";
import {
  Combobox as ComboboxPart,
  createComboboxController,
  type ComboboxController,
  type ComboboxProps as ComboboxPartProps,
} from "@ui-sdk/solid/combobox";
import { createSignal } from "solid-js";

import { optionColor, type OptionColor } from "../internal/index.ts";
import {
  COMBOBOX_CONTEXT,
  createLabelMatcher,
  createLabelRegistry,
  createSelect,
  type ComboboxContextValue,
} from "./combobox-context.ts";

/** UI SDK's combobox props: `items`, `multiple`, `value`, `filter`, `onValueChange`, … */
export type ComboboxProps<T = string, Multiple extends boolean | undefined = false> = ComboboxPartProps<T, Multiple> & {
  /**
   * A value's color, when `items` can't tell it. A colored item shows a dot in the list and in its
   * chip; `items` entries may carry their own `color`.
   */
  itemToColor?: (value: T) => OptionColor | undefined;
};

// The state the parts share: the typed text, the box the popup lines up with, and the item labels.
function createContextValue<T, Multiple extends boolean | undefined>(
  props: ComboboxProps<T, Multiple>,
  controller: () => ComboboxController<T, Multiple>,
  typed: () => string,
): ComboboxContextValue<T> {
  const [group, setGroup] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true });
  const registry = createLabelRegistry();

  return {
    colorOf: (value) => props.itemToColor?.(value) ?? optionColor(props.items, value),
    group,
    has: createLabelMatcher(() => props.items, registry.labels),
    readOnly: () => props.readOnly === true,
    register: registry.register,
    select: createSelect(() => props.multiple === true, controller),
    setGroup: (element) => setGroup(element),
    typed,
  };
}

/**
 * Searches a list as you type and picks one value (or several with `multiple`). Holds state;
 * renders no element. Filtering is UI SDK's (`filter`: "contains", "startsWith", a function, or
 * `false` for results a server already filtered); for a server search, feed `items` and `status`
 * from `useAsyncOptions`.
 */
export function Combobox<T = string, Multiple extends boolean | undefined = false>(
  props: ComboboxProps<T, Multiple>,
): JSX.Element {
  const own = createComboboxController<T, Multiple>();

  function controller(): ComboboxController<T, Multiple> {
    return props.controller ?? own;
  }

  const [typed, setTyped] = createSignal("");

  return (
    <COMBOBOX_CONTEXT value={createContextValue(props, controller, typed)}>
      <ComboboxPart<T, Multiple>
        {...props}
        controller={controller()}
        onQueryChange={(query, details) => {
          setTyped(details.reason === "input-change" ? query : "");
          props.onQueryChange?.(query, details);
        }}
      />
    </COMBOBOX_CONTEXT>
  );
}

/** Opens, closes, reads and sets a combobox from outside it. Pass it as the Combobox's `controller`. */
export { createComboboxController };
