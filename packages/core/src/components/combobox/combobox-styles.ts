import { fieldBox, optionRow } from "../../internal/index.ts";
import type { ClassValue } from "../../utils/cn/index.ts";

// The text box: the same classes as our Input, drawn on the group that holds the input, the clear
// button and the chevron, so the whole control looks and focuses as one box.
export const CONTROL: ClassValue[] = [
  fieldBox,
  "gap-1 pr-1.5 pl-3 outline-none delay-0 has-[input[aria-invalid=true]]:ring-destructive/20",
  "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
  // Read-only shows the value, not a box to type in: no border or fill, the same size.
  "data-readonly:border-transparent data-readonly:bg-transparent data-readonly:shadow-none",
];

// The input inside the box: bare, so the box draws the border and the focus ring.
export const BARE_INPUT: string[] = [
  "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-base shadow-none outline-none ring-0",
  "placeholder:text-muted-foreground focus-visible:border-0 focus-visible:outline-none",
  "disabled:cursor-not-allowed md:text-sm",
];

// A create row stays in view at the foot of a long list.
export const CREATE_ROW: ClassValue[] = [optionRow, "sticky bottom-0 bg-popover data-pending:opacity-60"];

// UI SDK draws a plus the way it draws its own icons; the theme's `data-icon` rule masks it.
export const PLUS_ICON = "[--ui-icon:var(--ui-icon-plus)] [--ui-icon-size:1rem] text-muted-foreground";

// A small icon button inside the control, like the clear button and the chip remove button.
export const ICON_BUTTON: string[] = [
  "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground",
  "outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
];

// The chips box: the control with room for wrapped chips.
export const CHIPS_BOX: string[] = [
  "flex min-h-9 w-full min-w-0 flex-wrap items-center gap-1 rounded-md border border-input bg-transparent p-1",
  "text-base shadow-xs outline-none transition-[color,box-shadow] delay-0 md:text-sm",
  "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
  "has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20",
  "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
];
