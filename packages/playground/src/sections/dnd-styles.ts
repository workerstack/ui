/** A draggable row or card; the engine sets `data-dnd-dragging` on the lifted one. */
export const ITEM_CLASS: string =
  "flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2 text-sm " +
  "data-dnd-dragging:shadow-lg focus-visible:outline-2 focus-visible:outline-ring";

/** A button that starts a drag by pointer or keyboard. */
export const GRIP_CLASS: string =
  "cursor-grab rounded px-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 " +
  "focus-visible:outline-ring";

/** A list that holds draggable items. */
export const LIST_CLASS: string = "m-0 flex min-h-12 list-none flex-col gap-2 rounded-lg bg-muted p-2";
