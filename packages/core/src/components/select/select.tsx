import type { JSX } from "@solidjs/web";
import {
  Select as SelectPart,
  SelectContent as SelectContentPart,
  SelectGroup as SelectGroupPart,
  SelectGroupLabel as SelectGroupLabelPart,
  SelectItem as SelectItemPart,
  SelectItemIndicator,
  SelectSeparator as SelectSeparatorPart,
  SelectTrigger as SelectTriggerPart,
  SelectValue as SelectValuePart,
  type SelectProps as SelectPartProps,
} from "@ui-sdk/solid/select";
import { omit, type ComponentProps } from "solid-js";

import { optionRow, popupMotion, withAfter } from "../../internal/index.ts";
import { cnState } from "../../utils/cn/index.ts";

/** UI SDK's select props: `items`, `multiple`, `value`, `readOnly`, `onValueChange`, … */
export type SelectProps<T = string, Multiple extends boolean | undefined = false> = SelectPartProps<T, Multiple>;

/**
 * Picks one value (or several with `multiple`) from a list. Holds state; renders no element. A
 * `readOnly` select keeps its value and submits it, but never opens: UI SDK's read-only select
 * still opens on a click or a key, so the list is held closed here.
 */
export function Select<T = string, Multiple extends boolean | undefined = false>(
  props: SelectProps<T, Multiple>,
): JSX.Element {
  return <SelectPart<T, Multiple> {...props} open={props.readOnly === true ? false : props.open} />;
}

/** UI SDK's select trigger props, and the trigger's `size`. */
export type SelectTriggerProps = ComponentProps<typeof SelectTriggerPart> & {
  /** The trigger's height: `default` or the compact `sm`. */
  size?: "default" | "sm";
};

/**
 * The button that opens the list. Put a SelectValue inside it; UI SDK draws a chevron after it. A
 * read-only select (`readOnly` on the Select) shows its value bare: no border, no chevron.
 */
export function SelectTrigger(props: SelectTriggerProps): JSX.Element {
  const rest = omit(props, "class", "size");

  return (
    <SelectTriggerPart
      {...rest}
      data-size={props.size ?? "default"}
      class={cnState(
        [
          "flex h-9 w-fit min-w-40 cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-md",
          "data-[size=sm]:h-8",
          "border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
          "delay-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive",
          "aria-readonly:cursor-default aria-readonly:border-transparent aria-readonly:shadow-none",
          "aria-readonly:after:hidden",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        ],
        props.class,
      )}
    />
  );
}

/** UI SDK's select value props. */
export type SelectValueProps = ComponentProps<typeof SelectValuePart>;

/** The chosen item's label, or the Select's `placeholder` while nothing is chosen. */
export function SelectValue(props: SelectValueProps): JSX.Element {
  const rest = omit(props, "class");

  return <SelectValuePart {...rest} class={cnState("truncate data-placeholder:text-muted-foreground", props.class)} />;
}

/** UI SDK's select content props. */
export type SelectContentProps = ComponentProps<typeof SelectContentPart>;

/**
 * The popup with the items. Sized to at least the trigger's width and to the room it has. It opens
 * over the trigger with the chosen item on it (`alignItemWithTrigger`, on unless set `false`), or
 * below it when that can't fit.
 */
export function SelectContent(props: SelectContentProps): JSX.Element {
  const rest = omit(props, "class", "alignItemWithTrigger");

  return (
    <SelectContentPart
      {...rest}
      alignItemWithTrigger={props.alignItemWithTrigger ?? true}
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

/** UI SDK's select item props: `value`, `disabled`. */
export type SelectItemProps = ComponentProps<typeof SelectItemPart>;

/** An option. Shows a check while it's selected. */
export function SelectItem(props: SelectItemProps): JSX.Element {
  const rest = omit(props, "class", "children");

  return (
    <SelectItemPart {...rest} class={cnState(optionRow, props.class)}>
      {withAfter(
        props.children,
        <SelectItemIndicator class="absolute right-2 flex size-4 items-center justify-center" />,
      )}
    </SelectItemPart>
  );
}

/** UI SDK's select group props. */
export type SelectGroupProps = ComponentProps<typeof SelectGroupPart>;

/** Groups related items, named by a SelectGroupLabel. */
export function SelectGroup(props: SelectGroupProps): JSX.Element {
  return <SelectGroupPart {...props} />;
}

/** UI SDK's select group label props. */
export type SelectGroupLabelProps = ComponentProps<typeof SelectGroupLabelPart>;

/** A muted heading for a SelectGroup. */
export function SelectGroupLabel(props: SelectGroupLabelProps): JSX.Element {
  const rest = omit(props, "class");

  return <SelectGroupLabelPart {...rest} class={cnState("px-2 py-1.5 text-xs text-muted-foreground", props.class)} />;
}

/** UI SDK's select separator props. */
export type SelectSeparatorProps = ComponentProps<typeof SelectSeparatorPart>;

/** A line between groups of items. */
export function SelectSeparator(props: SelectSeparatorProps): JSX.Element {
  const rest = omit(props, "class");

  return <SelectSeparatorPart {...rest} class={cnState("-mx-1 my-1 h-px bg-border", props.class)} />;
}
