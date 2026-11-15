/** What every sortable and tree in one document shares while it runs. */
export type DragState = {
  /** Pointer presses an item has claimed: the innermost item claims, so outer sortables leave it alone. */
  claimed: WeakSet<Event>;
  /** A list drag runs: one per document, across every sortable. */
  running: boolean;
  /** Whole-item activators holding the window's touchmove blocker. */
  touchHolders: number;
  /** Touch scrolling is blocked while a touch drag runs. */
  touchLocked: boolean;
};

/** The document, holding the drag state it shares. */
type StateHolder = Document & { workerstackDnd?: DragState };

/**
 * The document's drag state, made on first use. It lives on the document, not in a module, so it lasts as long as
 * the page and two copies of the package still agree that only one drag runs.
 */
export function dragState(): DragState {
  const holder = document /* a document only gains the optional key this function writes */ as StateHolder;
  holder.workerstackDnd ??= { claimed: new WeakSet(), running: false, touchHolders: 0, touchLocked: false };

  return holder.workerstackDnd;
}
