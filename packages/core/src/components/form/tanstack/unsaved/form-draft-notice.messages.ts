/** The strings of a restored-draft notice. */
export type FormDraftNoticeMessages = {
  /** The button that throws a restored draft away. */
  draftDiscard: string;
  /** The notice that another tab edits the same form. */
  draftElsewhere: string;
  /** The notice after a draft is restored; `time` is when it was saved, already formatted. */
  draftRestored: (time: string) => string;
};

/** English for `FormDraftNoticeMessages`. */
export const FORM_DRAFT_NOTICE_MESSAGES_EN: FormDraftNoticeMessages = {
  draftDiscard: "Discard",
  draftElsewhere: "This form is also being edited in another tab. Saving here replaces those changes.",
  draftRestored: (time) => `Restored your unsaved changes from ${time}.`,
};
