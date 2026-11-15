/** The strings of a form's unsaved status and its draft details. */
export type FormUnsavedStatusMessages = {
  /** The button that throws away the changes kept on this device. */
  draftDiscardChanges: string;
  /** What a draft notice's details say about where the changes are kept. */
  draftInfoDescription: string;
  /** The title of a draft notice's details. */
  draftInfoTitle: string;
  /** The status while a draft is kept; `ago` is how long ago it was saved, already formatted. */
  draftSaved: (ago: string) => string;
};

/** English for `FormUnsavedStatusMessages`. */
export const FORM_UNSAVED_STATUS_MESSAGES_EN: FormUnsavedStatusMessages = {
  draftDiscardChanges: "Discard changes",
  draftInfoDescription:
    "These changes are saved in this browser only, until you save the form. " +
    "Other devices and people don't see them yet.",
  draftInfoTitle: "Kept on this device",
  draftSaved: (ago) => `Saved on this device · ${ago}`,
};
