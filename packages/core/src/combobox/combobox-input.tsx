import type { JSX } from "@solidjs/web";
import {
  ComboboxClear as ComboboxClearPart,
  ComboboxInput as ComboboxInputPart,
  ComboboxTrigger as ComboboxTriggerPart,
} from "@ui-sdk/solid/combobox";
import { omit, Show, type ComponentProps } from "solid-js";

import { cn, cnState } from "../cn/index.ts";
import { useUiMessages } from "../provider/index.ts";
import { useComboboxContext } from "./combobox-context.ts";
import { BARE_INPUT, CONTROL, ICON_BUTTON } from "./combobox-styles.ts";

/** UI SDK's combobox clear props. */
export type ComboboxClearProps = ComponentProps<typeof ComboboxClearPart>;

/**
 * Empties the text and the value, and shows while there is something to clear. Shows an ×. Its
 * accessible name defaults to the provider's `clear` string.
 */
export function ComboboxClear(props: ComboboxClearProps): JSX.Element {
  const messages = useUiMessages();
  const rest = omit(props, "class", "aria-label");

  return (
    <ComboboxClearPart
      data-icon="x"
      {...rest}
      aria-label={props["aria-label"] ?? messages.clear}
      class={cnState([ICON_BUTTON, "[--ui-icon-size:0.875rem]"], props.class)}
    />
  );
}

/** UI SDK's combobox trigger props. */
export type ComboboxTriggerProps = ComponentProps<typeof ComboboxTriggerPart>;

/** The chevron button that opens and closes the list. UI SDK draws the chevron. */
export function ComboboxTrigger(props: ComboboxTriggerProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <ComboboxTriggerPart
      aria-hidden="true"
      {...rest}
      class={cnState(
        [
          "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent",
          "p-0 text-muted-foreground shadow-none outline-none hover:bg-transparent hover:text-foreground",
        ],
        props.class,
      )}
    />
  );
}

/** UI SDK's combobox input props. `class` styles the box; the rest go to the input. */
export type ComboboxInputProps = Omit<ComponentProps<typeof ComboboxInputPart>, "class"> & {
  /** Classes for the box. */
  class?: string;
  /**
   * Shows an × that empties the text and the value, while there is something to clear.
   * @default false
   */
  showClear?: boolean;
  /**
   * Shows the chevron that opens the whole list. It is out of the tab order and hidden from screen
   * readers: the arrow keys open the list from the input.
   * @default true
   */
  showTrigger?: boolean;
};

/**
 * The text box. It draws like an Input, with an optional clear button and a chevron inside, and
 * inside a Field it takes the field's label and validation.
 */
export function ComboboxInput(props: ComboboxInputProps): JSX.Element {
  const rest = omit(props, "class", "showClear", "showTrigger");
  const combobox = useComboboxContext();

  return (
    <div data-slot="combobox-group" ref={combobox.setGroup} class={cn(CONTROL, props.class)}>
      <ComboboxInputPart {...rest} class={cn(BARE_INPUT)} />
      <Show when={props.showClear === true}>
        <ComboboxClear />
      </Show>
      <Show when={props.showTrigger !== false}>
        <ComboboxTrigger />
      </Show>
    </div>
  );
}
