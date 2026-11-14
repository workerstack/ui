import type { JSX } from "@solidjs/web";
import { ComboboxCreate as ComboboxCreatePart } from "@ui-sdk/solid/combobox";
import { omit, Show, type ComponentProps } from "solid-js";

import { cn, cnState } from "../cn/index.ts";
import { useUiMessages, type UiMessages } from "../provider/index.ts";
import { useComboboxContext, type ComboboxContextValue } from "./combobox-context.ts";
import { CREATE_ROW, PLUS_ICON } from "./combobox-styles.ts";

/** UI SDK's combobox create props: `minLength`. `onCreate` takes the typed text. */
export type ComboboxCreateProps<T = string> = Omit<
  ComponentProps<typeof ComboboxCreatePart>,
  "onCreate" | "children"
> & {
  /**
   * Runs with the typed text when the create row is chosen. Return the new item's value, or a
   * promise of it, to select it, or `undefined` to cancel. Add the item to your list first: the
   * combobox shows the label of a value it can find in `items` or `itemToLabel`.
   */
  onCreate?: (label: string) => T | undefined | Promise<T | undefined>;
};

// Selects what `onCreate` made, once it is there; nothing when it cancelled.
function selectCreated<T>(
  created: T | undefined | Promise<T | undefined>,
  combobox: ComboboxContextValue<T>,
): Promise<void> | undefined {
  if (created instanceof Promise) {
    return created.then((value) => {
      if (value !== undefined) combobox.select(value);
    });
  }

  if (created !== undefined) combobox.select(created);

  return undefined;
}

// Why the create row is not offered yet, or nothing when it is or when the combobox is read-only.
function createHint(combobox: ComboboxContextValue<never>, messages: UiMessages): string | undefined {
  if (combobox.readOnly()) return undefined;

  const query = combobox.typed().trim();

  if (query === "") return messages.comboboxCreateEmpty;

  return combobox.has(query) ? messages.comboboxCreateExists(query) : undefined;
}

// The hint rows share the create row's look and say a plus.
function CreateLabel(props: { text: string }): JSX.Element {
  return (
    <>
      <span data-icon="plus" aria-hidden="true" class={PLUS_ICON} />
      <span class="min-w-0 truncate">{props.text}</span>
    </>
  );
}

// The disabled row that says why the create row is not offered.
function CreateHintRow(props: { text: string }): JSX.Element {
  return (
    <div
      data-slot="combobox-create-hint"
      role="option"
      aria-selected="false"
      aria-disabled="true"
      class={cn(CREATE_ROW, "pointer-events-none opacity-50")}
    >
      <CreateLabel text={props.text} />
    </div>
  );
}

/**
 * Ends the list with a row that creates the typed text as a new item. UI SDK shows it once there
 * is text no item's label matches. Until then a disabled row says why: “Type to create an option”
 * with no text, “… already exists” when an item has that label. The row needs at least one
 * character, which is UI SDK's minimum.
 */
export function ComboboxCreate<T = string>(props: ComboboxCreateProps<T>): JSX.Element {
  const rest = omit(props, "class", "onCreate");
  const messages = useUiMessages();
  const combobox = useComboboxContext<T>();

  function hint(): string | undefined {
    return createHint(combobox, messages);
  }

  return (
    <>
      <ComboboxCreatePart
        {...rest}
        onCreate={(label) => selectCreated(props.onCreate?.(label), combobox)}
        class={cnState(CREATE_ROW, props.class)}
      >
        {(state) => <CreateLabel text={messages.comboboxCreate(state.query)} />}
      </ComboboxCreatePart>
      <Show when={hint()}>{(text) => <CreateHintRow text={text()} />}</Show>
    </>
  );
}
