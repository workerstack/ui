import type { JSX } from "@solidjs/web";
import {
  ComboboxContent as ComboboxContentPart,
  ComboboxEmpty as ComboboxEmptyPart,
  ComboboxGroup as ComboboxGroupPart,
  ComboboxGroupLabel as ComboboxGroupLabelPart,
  ComboboxItem as ComboboxItemPart,
  ComboboxItemIndicator,
  ComboboxList as ComboboxListPart,
  ComboboxSeparator as ComboboxSeparatorPart,
  ComboboxStatus as ComboboxStatusPart,
  ComboboxValue as ComboboxValuePart,
} from "@ui-sdk/solid/combobox";
import { omit, onSettled, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";
import { optionRow, popupMotion, withAfter } from "../internal/index.ts";
import { useUiMessages } from "../provider/index.ts";
import { isText, useComboboxContext } from "./combobox-context.ts";

/** UI SDK's combobox content props. */
export type ComboboxContentProps = ComponentProps<typeof ComboboxContentPart>;

/** The popup with the list. It opens under the box and is at least as wide as it. */
export function ComboboxContent(props: ComboboxContentProps): JSX.Element {
  const rest = omit(props, "class", "anchor");
  const combobox = useComboboxContext();

  // Lines up with the box unless told otherwise; leaves `anchor` out while there is no box yet.
  function anchor(): Pick<ComboboxContentProps, "anchor"> {
    const target = props.anchor ?? combobox.group();

    return target === undefined ? {} : { anchor: target };
  }

  return (
    <ComboboxContentPart
      {...rest}
      {...anchor()}
      class={cnState(
        [
          "z-50 max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-md border bg-popover p-1",
          "text-popover-foreground shadow-popup",
          popupMotion,
        ],
        props.class,
      )}
    />
  );
}

/** UI SDK's combobox list props. */
export type ComboboxListProps = ComponentProps<typeof ComboboxListPart>;

/**
 * The listbox. With no children it renders the combobox's `items`, filtered; with a function it
 * gets the visible items to render; or put ComboboxItem parts in it.
 */
export function ComboboxList(props: ComboboxListProps): JSX.Element {
  return <ComboboxListPart {...props} />;
}

/** UI SDK's combobox item props: `value`, `label`, `keywords`, `disabled`. */
export type ComboboxItemProps<T = string> = Parameters<typeof ComboboxItemPart<T>>[0];

// The label an item shows: its own `label`, else its children when they are plain text.
function labelOf<T>(props: ComboboxItemProps<T>): string | undefined {
  if (props.label !== undefined) return props.label;

  return isText(props.children) ? props.children : undefined;
}

/**
 * An option. Shows a check while it is selected. Give it a `label` when its content is not plain
 * text: the input shows the label once the item is chosen, and the create row compares it.
 */
export function ComboboxItem<T = string>(props: ComboboxItemProps<T>): JSX.Element {
  const rest = omit(props, "class", "children");
  const combobox = useComboboxContext();

  onSettled(() => {
    const label = labelOf(props);

    return label === undefined ? undefined : combobox.register(label);
  });

  return (
    <ComboboxItemPart<T> {...rest} class={cnState(optionRow, props.class)}>
      {withAfter(
        props.children,
        <ComboboxItemIndicator class="absolute right-2 flex size-4 items-center justify-center" />,
      )}
    </ComboboxItemPart>
  );
}

/** UI SDK's combobox empty props. */
export type ComboboxEmptyProps = ComponentProps<typeof ComboboxEmptyPart>;

/** Shown while no item matches. Says the provider's `noResults` string unless given children. */
export function ComboboxEmpty(props: ComboboxEmptyProps): JSX.Element {
  const rest = omit(props, "class", "children");
  const messages = useUiMessages();

  return (
    <ComboboxEmptyPart {...rest} class={cnState("py-6 text-center text-sm text-muted-foreground", props.class)}>
      {props.children ?? messages.noResults}
    </ComboboxEmptyPart>
  );
}

/** UI SDK's combobox group props. */
export type ComboboxGroupProps = ComponentProps<typeof ComboboxGroupPart>;

/** Groups related items, named by a ComboboxGroupLabel. */
export function ComboboxGroup(props: ComboboxGroupProps): JSX.Element {
  return <ComboboxGroupPart {...props} />;
}

/** UI SDK's combobox group label props. */
export type ComboboxGroupLabelProps = ComponentProps<typeof ComboboxGroupLabelPart>;

/** A muted heading for a ComboboxGroup. */
export function ComboboxGroupLabel(props: ComboboxGroupLabelProps): JSX.Element {
  const rest = omit(props, "class");

  return <ComboboxGroupLabelPart {...rest} class={cnState("px-2 py-1.5 text-xs text-muted-foreground", props.class)} />;
}

/** UI SDK's combobox separator props. */
export type ComboboxSeparatorProps = ComponentProps<typeof ComboboxSeparatorPart>;

/** A line between groups of items. */
export function ComboboxSeparator(props: ComboboxSeparatorProps): JSX.Element {
  const rest = omit(props, "class");

  return <ComboboxSeparatorPart {...rest} class={cnState("-mx-1 my-1 h-px bg-border", props.class)} />;
}

/** UI SDK's combobox status props. */
export type ComboboxStatusProps = ComponentProps<typeof ComboboxStatusPart>;

/** A polite live region for loading and result counts, for example from `useAsyncOptions`. */
export function ComboboxStatus(props: ComboboxStatusProps): JSX.Element {
  const rest = omit(props, "class");

  return <ComboboxStatusPart {...rest} class={cnState("px-2 py-1.5 text-xs text-muted-foreground", props.class)} />;
}

/**
 * The selected value, as a function of its state: render one ComboboxChip per value with `multiple`.
 * Without children it shows the labels joined with commas. Renders no element of its own.
 */
export { ComboboxValuePart as ComboboxValue };
