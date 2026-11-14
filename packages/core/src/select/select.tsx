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
} from "@ui-sdk/solid/select";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";
import { optionRow, popupMotion, withAfter } from "../internal/index.ts";

/** Picks one value (or several with `multiple`) from a list. Holds state; renders no element. */
export { SelectPart as Select };

export type { SelectProps } from "@ui-sdk/solid/select";

/** UI SDK's select trigger props. */
export type SelectTriggerProps = ComponentProps<typeof SelectTriggerPart>;

/** The button that opens the list. Put a SelectValue inside it; UI SDK draws a chevron after it. */
export function SelectTrigger(props: SelectTriggerProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <SelectTriggerPart
      {...rest}
      class={cnState(
        [
          "flex h-9 w-fit min-w-40 cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-md",
          "border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
          "delay-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive",
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

/** The popup with the items. Sized to at least the trigger's width and to the room it has. */
export function SelectContent(props: SelectContentProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <SelectContentPart
      {...rest}
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
