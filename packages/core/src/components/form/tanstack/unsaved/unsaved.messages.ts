/** The words more than one unsaved-changes part says. */
export type UnsavedMessages = {
  /** The status of a form with unsaved changes. */
  unsavedChanges: string;
  /** The leave confirm's button that stays on the page. */
  unsavedStay: string;
};

/** English for `UnsavedMessages`. */
export const UNSAVED_MESSAGES_EN: UnsavedMessages = {
  unsavedChanges: "Unsaved changes",
  unsavedStay: "Stay",
};
