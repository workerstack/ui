import type { JSX } from "@solidjs/web";
import {
  ComboboxChip as ComboboxChipPart,
  ComboboxChipRemove,
  ComboboxChips as ComboboxChipsPart,
  ComboboxInput as ComboboxInputPart,
} from "@ui-sdk/solid/combobox";
import { omit, type ComponentProps } from "solid-js";

import { withAfter, withBefore } from "../../internal/index.ts";
import { cn, cnState } from "../../utils/cn/index.ts";
import { useUiMessages } from "../provider/index.ts";
import { ComboboxColorDot } from "./combobox-dot.tsx";
import { BARE_INPUT, CHIPS_BOX, ICON_BUTTON } from "./combobox-styles.ts";

/** UI SDK's combobox chips props. */
export type ComboboxChipsProps = ComponentProps<typeof ComboboxChipsPart>;

/** The box for a multiple combobox: the chosen values as chips, then a ComboboxChipsInput. */
export function ComboboxChips(props: ComboboxChipsProps): JSX.Element {
  const rest = omit(props, "class");

  return <ComboboxChipsPart {...rest} class={cnState(CHIPS_BOX, props.class)} />;
}

/** UI SDK's combobox chip props: `value`. */
export type ComboboxChipProps<T = string> = Parameters<typeof ComboboxChipPart<T>>[0];

/**
 * One chosen value, with a button that removes it. Give it the value's label as children (the
 * labels of ComboboxValue's state), or none to show UI SDK's label for the value. A value with a
 * color shows a dot first.
 */
export function ComboboxChip<T = string>(props: ComboboxChipProps<T>): JSX.Element {
  const rest = omit(props, "class", "children");
  const messages = useUiMessages();

  return (
    <ComboboxChipPart<T>
      {...rest}
      class={cnState(
        [
          "flex h-7 items-center gap-1 rounded-sm bg-accent pr-1 pl-2 text-sm text-accent-foreground outline-none",
          "data-highlighted:ring-2 data-highlighted:ring-ring/50",
        ],
        props.class,
      )}
    >
      {withBefore(
        <ComboboxColorDot value={props.value} />,
        withAfter(
          props.children,
          <ComboboxChipRemove
            data-icon="x"
            aria-label={messages.remove}
            class={cn(ICON_BUTTON, "[--ui-icon-size:0.75rem]")}
          />,
        ),
      )}
    </ComboboxChipPart>
  );
}

/** UI SDK's combobox input props, for the input inside the chips. */
export type ComboboxChipsInputProps = ComponentProps<typeof ComboboxInputPart>;

/** The input that follows the chips, inside ComboboxChips. */
export function ComboboxChipsInput(props: ComboboxChipsInputProps): JSX.Element {
  const rest = omit(props, "class");

  return <ComboboxInputPart {...rest} class={cnState(["h-7 min-w-16 flex-1 px-1", BARE_INPUT], props.class)} />;
}
