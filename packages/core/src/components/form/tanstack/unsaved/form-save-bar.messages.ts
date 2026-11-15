/** The strings of the save bar and its discard confirm. */
export type FormSaveBarMessages = {
  /** The save bar's button that throws every unsaved change away. */
  saveBarDiscard: string;
  /** What the save bar's discard confirm says will happen. */
  saveBarDiscardDescription: string;
  /** The title of the save bar's discard confirm. */
  saveBarDiscardTitle: string;
  /** The save bar's save button. */
  saveBarSave: string;
};

/** English for `FormSaveBarMessages`. */
export const FORM_SAVE_BAR_MESSAGES_EN: FormSaveBarMessages = {
  saveBarDiscard: "Discard",
  saveBarDiscardDescription: "The form goes back to how it was. This can’t be undone.",
  saveBarDiscardTitle: "Discard all unsaved changes?",
  saveBarSave: "Save",
};
