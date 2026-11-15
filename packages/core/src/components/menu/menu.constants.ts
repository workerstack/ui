/** Padding that lines an item's text up with items that show a check or an icon. */
export const INSET = "pl-8";

/** Every kind of item: a row with a highlight. Its shortcut, UI SDK's or a MenuShortcut, is styled here. */
export const ITEM: string[] = [
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
  "data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent",
  "data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
  "[&_svg:not([class*='size-'])]:size-4",
  "*:data-[slot=menu-shortcut]:ml-auto *:data-[slot=menu-shortcut]:pl-4 *:data-[slot=menu-shortcut]:text-xs",
  "*:data-[slot=menu-shortcut]:tracking-widest *:data-[slot=menu-shortcut]:text-muted-foreground",
  "data-highlighted:*:data-[slot=menu-shortcut]:text-foreground",
];

/** The popup of a menu or a submenu. */
export const CONTENT: string[] = [
  "z-50 max-h-(--available-height) min-w-32 overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1",
  "text-popover-foreground shadow-popup outline-none",
];

/** A heading's box: a label or a group label. */
export const LABEL = "px-2 py-1.5 text-xs font-medium text-muted-foreground";

/** The check or dot of a checkbox or radio item, in the room its padding leaves. */
export const INDICATOR = "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center";

/** The attribute screen readers skip an element by, so its text is not part of an item's name. */
export const HIDDEN_ATTRIBUTE: string = "aria-hidden";

/** The value of `HIDDEN_ATTRIBUTE` that hides an element. */
export const HIDDEN_VALUE: string = "true";
