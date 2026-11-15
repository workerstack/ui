import type { ClearMessages } from "../../internal/clear.messages.ts";
import type { CloseMessages } from "../../internal/close.messages.ts";
import type { NoResultsMessages } from "../../internal/no-results.messages.ts";
import type { ValidityMessages } from "../../internal/validity.messages.ts";
import type { ButtonMessages } from "../button/button.messages.ts";
import type { ComboboxChipsMessages } from "../combobox/combobox-chips.messages.ts";
import type { ComboboxCreateMessages } from "../combobox/combobox-create.messages.ts";
import type { FieldMarksMessages } from "../field/field-marks.messages.ts";
import type { ArrayMessages } from "../form/tanstack/array/array.messages.ts";
import type { FormDialogMessages } from "../form/tanstack/dialog/dialog.messages.ts";
import type { FieldModuleErrorMessages } from "../form/tanstack/form/field-module-error.messages.ts";
import type { FormErrorSummaryMessages } from "../form/tanstack/form/form-error-summary.messages.ts";
import type { FormDraftNoticeMessages } from "../form/tanstack/unsaved/form-draft-notice.messages.ts";
import type { FormSaveBarMessages } from "../form/tanstack/unsaved/form-save-bar.messages.ts";
import type { FormUnsavedStatusMessages } from "../form/tanstack/unsaved/form-unsaved-status.messages.ts";
import type { FormUnsavedMessages } from "../form/tanstack/unsaved/form-unsaved.messages.ts";
import type { LeaveConfirmMessages } from "../form/tanstack/unsaved/leave-confirm.messages.ts";
import type { UnsavedMessages } from "../form/tanstack/unsaved/unsaved.messages.ts";
import type { MenuFilterMessages } from "../menu/menu-filter.messages.ts";
import type { BooleanViewMessages } from "../view/boolean-view.messages.ts";
import type { ViewMessages } from "../view/view.messages.ts";

/**
 * The built-in strings of `@workerstack/ui`, one per place a component shows text of its own. Each
 * part keeps its English beside it, so an app's bundle holds only the English of the parts it uses.
 */
export type UiMessages = ArrayMessages &
  BooleanViewMessages &
  ButtonMessages &
  ClearMessages &
  CloseMessages &
  ComboboxChipsMessages &
  ComboboxCreateMessages &
  FieldMarksMessages &
  FieldModuleErrorMessages &
  FormDialogMessages &
  FormDraftNoticeMessages &
  FormErrorSummaryMessages &
  FormSaveBarMessages &
  FormUnsavedMessages &
  FormUnsavedStatusMessages &
  LeaveConfirmMessages &
  MenuFilterMessages &
  NoResultsMessages &
  UnsavedMessages &
  ValidityMessages &
  ViewMessages;
