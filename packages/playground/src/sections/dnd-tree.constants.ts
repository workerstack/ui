/** Pixels each level indents by. */
export const INDENT = 20;

/** Pixels before a top-level row's text. */
export const INSET = 8;

/** The folder that refuses drops, to show a blocked target. */
export const LOCKED = "archive";

/** The row a keyboard reaches first. */
export const FIRST_ROW = "src";

/** The tabindex of a row the keyboard reaches by arrow keys only. */
export const NOT_TABBABLE = -1;

/** The ids that are folders. */
export const FOLDERS: readonly string[] = ["src", "lib", "docs", LOCKED];
