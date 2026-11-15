/** A form array's item as a drag speaks of it: its name, and its position (from 1) of a total. */
type ArraySpot = {
  /** The item's name, e.g. “Item 2”. */
  item: string;
  /** Its position, from 1. */
  position: number;
  /** How many items the array holds. */
  total: number;
};

/** The built-in strings of `@workerstack/ui/form`. */
export type FormMessages = {
  /** What a drag says when it is canceled and the form array's item went back to `position`. */
  arrayCanceled: (item: string, position: number) => string;
  /** What a drag says when a form array's item is dropped. */
  arrayDropped: (spot: ArraySpot) => string;
  /** The name of a form array's item group, by its position (from 1). */
  arrayItem: (position: number) => string;
  /** What a drag says when a form array's item is picked up. */
  arrayLifted: (spot: ArraySpot) => string;
  /** The accessible name of the button that moves a form array's item down, by its position (from 1). */
  arrayMoveDown: (position: number) => string;
  /** The accessible name of the button that moves a form array's item up, by its position (from 1). */
  arrayMoveUp: (position: number) => string;
  /** The accessible name of the button that removes a form array's item, by its position (from 1). */
  arrayRemove: (position: number) => string;
  /** The confirm button of a form dialog that throws its changes away. */
  dialogDiscard: string;
  /** What a form dialog's discard confirm says will happen. */
  dialogDiscardDescription: string;
  /** The title of a form dialog's discard confirm. */
  dialogDiscardTitle: string;
  /** The button of a form dialog's discard confirm that goes back to the form. */
  dialogKeepEditing: string;
  /** The button that throws a restored draft away. */
  draftDiscard: string;
  /** The button that throws away the changes kept on this device. */
  draftDiscardChanges: string;
  /** The notice that another tab edits the same form. */
  draftElsewhere: string;
  /** What a draft notice's details say about where the changes are kept. */
  draftInfoDescription: string;
  /** The title of a draft notice's details. */
  draftInfoTitle: string;
  /** The notice after a draft is restored; `time` is when it was saved, already formatted. */
  draftRestored: (time: string) => string;
  /** The status while a draft is kept; `ago` is how long ago it was saved, already formatted. */
  draftSaved: (ago: string) => string;
  /** The title of a form's error summary. */
  errorSummaryTitle: string;
  /** What a field shows while an async check runs. */
  fieldChecking: string;
  /** The button of a form dialog that applies the changes without saving them yet. */
  formApply: string;
  /** The button that closes a form without saving. */
  formCancel: string;
  /** The button that turns a read-only form editable. */
  formEdit: string;
  /** The button that saves a form. */
  formSave: string;
  /** The save bar's button that throws every unsaved change away. */
  saveBarDiscard: string;
  /** What the save bar's discard confirm says will happen. */
  saveBarDiscardDescription: string;
  /** The title of the save bar's discard confirm. */
  saveBarDiscardTitle: string;
  /** The save bar's save button. */
  saveBarSave: string;
  /** The status of a form with unsaved changes. */
  unsavedChanges: string;
  /** The leave confirm's button that leaves and loses the changes. */
  unsavedLeave: string;
  /** What the leave confirm says will be lost; `names` are the forms with changes. */
  unsavedLeaveDescription: (names: readonly string[]) => string;
  /** The title of the leave confirm. */
  unsavedLeaveTitle: string;
  /** The leave confirm's button that stays on the page. */
  unsavedStay: string;
  /** The name of a form that has no name of its own, in the leave confirm. */
  unsavedThisForm: string;
};

/** English for `FormMessages`. */
export const FORM_MESSAGES_EN: FormMessages = {
  arrayCanceled: (item, position) => `Move canceled. ${item} is back at position ${position}.`,
  arrayDropped: (spot) => `Dropped ${spot.item} at position ${spot.position} of ${spot.total}.`,
  arrayItem: (position) => `Item ${position}`,
  arrayLifted: (spot) => `Picked up ${spot.item}. Position ${spot.position} of ${spot.total}.`,
  arrayMoveDown: (position) => `Move item ${position} down`,
  arrayMoveUp: (position) => `Move item ${position} up`,
  arrayRemove: (position) => `Remove item ${position}`,
  dialogDiscard: "Discard",
  dialogDiscardDescription: "Your changes in this form will be lost.",
  dialogDiscardTitle: "Discard changes?",
  dialogKeepEditing: "Keep editing",
  draftDiscard: "Discard",
  draftDiscardChanges: "Discard changes",
  draftElsewhere: "This form is also being edited in another tab. Saving here replaces those changes.",
  draftInfoDescription:
    "These changes are saved in this browser only, until you save the form. " +
    "Other devices and people don't see them yet.",
  draftInfoTitle: "Kept on this device",
  draftRestored: (time) => `Restored your unsaved changes from ${time}.`,
  draftSaved: (ago) => `Saved on this device · ${ago}`,
  errorSummaryTitle: "There's a problem",
  fieldChecking: "Checking…",
  formApply: "Apply",
  formCancel: "Cancel",
  formEdit: "Edit",
  formSave: "Save",
  saveBarDiscard: "Discard",
  saveBarDiscardDescription: "The form goes back to how it was. This can’t be undone.",
  saveBarDiscardTitle: "Discard all unsaved changes?",
  saveBarSave: "Save",
  unsavedChanges: "Unsaved changes",
  unsavedLeave: "Leave",
  unsavedLeaveDescription: (names) =>
    `Your changes to ${new Intl.ListFormat("en", { type: "conjunction" }).format(names)} will be lost.`,
  unsavedLeaveTitle: "Leave with unsaved changes?",
  unsavedStay: "Stay",
  unsavedThisForm: "this form",
};
