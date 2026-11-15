/** The strings of a form dialog and its discard confirm. */
export type FormDialogMessages = {
  /** The confirm button of a form dialog that throws its changes away. */
  dialogDiscard: string;
  /** What a form dialog's discard confirm says will happen. */
  dialogDiscardDescription: string;
  /** The title of a form dialog's discard confirm. */
  dialogDiscardTitle: string;
  /** The button of a form dialog's discard confirm that goes back to the form. */
  dialogKeepEditing: string;
  /** The button that closes a form without saving. */
  formCancel: string;
  /** The button that saves a form. */
  formSave: string;
};

/** English for `FormDialogMessages`. */
export const FORM_DIALOG_MESSAGES_EN: FormDialogMessages = {
  dialogDiscard: "Discard",
  dialogDiscardDescription: "Your changes in this form will be lost.",
  dialogDiscardTitle: "Discard changes?",
  dialogKeepEditing: "Keep editing",
  formCancel: "Cancel",
  formSave: "Save",
};
