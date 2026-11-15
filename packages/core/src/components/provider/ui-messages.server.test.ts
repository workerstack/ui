import { readdirSync } from "node:fs";

import { describe, expect, expectTypeOf, it } from "vitest";

import { CLEAR_MESSAGES_EN } from "../../internal/clear.messages.ts";
import { CLOSE_MESSAGES_EN } from "../../internal/close.messages.ts";
import { NO_RESULTS_MESSAGES_EN } from "../../internal/no-results.messages.ts";
import { VALIDITY_MESSAGES_EN } from "../../internal/validity.messages.ts";
import { SRC } from "../../test/bundle.ts";
import { BUTTON_MESSAGES_EN } from "../button/button.messages.ts";
import { COMBOBOX_CHIPS_MESSAGES_EN } from "../combobox/combobox-chips.messages.ts";
import { COMBOBOX_CREATE_MESSAGES_EN } from "../combobox/combobox-create.messages.ts";
import { FIELD_MARKS_MESSAGES_EN } from "../field/field-marks.messages.ts";
import { ARRAY_MESSAGES_EN } from "../form/tanstack/array/array.messages.ts";
import { FORM_DIALOG_MESSAGES_EN } from "../form/tanstack/dialog/dialog.messages.ts";
import { FIELD_MODULE_ERROR_MESSAGES_EN } from "../form/tanstack/form/field-module-error.messages.ts";
import { FORM_ERROR_SUMMARY_MESSAGES_EN } from "../form/tanstack/form/form-error-summary.messages.ts";
import { FORM_DRAFT_NOTICE_MESSAGES_EN } from "../form/tanstack/unsaved/form-draft-notice.messages.ts";
import { FORM_SAVE_BAR_MESSAGES_EN } from "../form/tanstack/unsaved/form-save-bar.messages.ts";
import { FORM_UNSAVED_STATUS_MESSAGES_EN } from "../form/tanstack/unsaved/form-unsaved-status.messages.ts";
import { FORM_UNSAVED_MESSAGES_EN } from "../form/tanstack/unsaved/form-unsaved.messages.ts";
import { LEAVE_CONFIRM_MESSAGES_EN } from "../form/tanstack/unsaved/leave-confirm.messages.ts";
import { UNSAVED_MESSAGES_EN } from "../form/tanstack/unsaved/unsaved.messages.ts";
import { MENU_FILTER_MESSAGES_EN } from "../menu/menu-filter.messages.ts";
import { BOOLEAN_VIEW_MESSAGES_EN } from "../view/boolean-view.messages.ts";
import { VIEW_MESSAGES_EN } from "../view/view.messages.ts";
import type { UiMessages } from "./ui-messages.ts";

// Each built-in string has one English owner: a `<owner>.messages.ts` beside the part that shows it. Their keys are
// disjoint, and together they are the keys of `UiMessages`, which the type checker holds with the spread below.

/** Every owner's English, in one list; the test below fails when a `*.messages.ts` file is missing from it. */
const SLICES = [
  BUTTON_MESSAGES_EN,
  COMBOBOX_CHIPS_MESSAGES_EN,
  COMBOBOX_CREATE_MESSAGES_EN,
  FIELD_MARKS_MESSAGES_EN,
  ARRAY_MESSAGES_EN,
  FORM_DIALOG_MESSAGES_EN,
  FIELD_MODULE_ERROR_MESSAGES_EN,
  FORM_ERROR_SUMMARY_MESSAGES_EN,
  FORM_DRAFT_NOTICE_MESSAGES_EN,
  FORM_SAVE_BAR_MESSAGES_EN,
  FORM_UNSAVED_STATUS_MESSAGES_EN,
  FORM_UNSAVED_MESSAGES_EN,
  LEAVE_CONFIRM_MESSAGES_EN,
  UNSAVED_MESSAGES_EN,
  MENU_FILTER_MESSAGES_EN,
  BOOLEAN_VIEW_MESSAGES_EN,
  VIEW_MESSAGES_EN,
  CLEAR_MESSAGES_EN,
  CLOSE_MESSAGES_EN,
  NO_RESULTS_MESSAGES_EN,
  VALIDITY_MESSAGES_EN,
];

const ALL = {
  ...BUTTON_MESSAGES_EN,
  ...COMBOBOX_CHIPS_MESSAGES_EN,
  ...COMBOBOX_CREATE_MESSAGES_EN,
  ...FIELD_MARKS_MESSAGES_EN,
  ...ARRAY_MESSAGES_EN,
  ...FORM_DIALOG_MESSAGES_EN,
  ...FIELD_MODULE_ERROR_MESSAGES_EN,
  ...FORM_ERROR_SUMMARY_MESSAGES_EN,
  ...FORM_DRAFT_NOTICE_MESSAGES_EN,
  ...FORM_SAVE_BAR_MESSAGES_EN,
  ...FORM_UNSAVED_STATUS_MESSAGES_EN,
  ...FORM_UNSAVED_MESSAGES_EN,
  ...LEAVE_CONFIRM_MESSAGES_EN,
  ...UNSAVED_MESSAGES_EN,
  ...MENU_FILTER_MESSAGES_EN,
  ...BOOLEAN_VIEW_MESSAGES_EN,
  ...VIEW_MESSAGES_EN,
  ...CLEAR_MESSAGES_EN,
  ...CLOSE_MESSAGES_EN,
  ...NO_RESULTS_MESSAGES_EN,
  ...VALIDITY_MESSAGES_EN,
} satisfies UiMessages;

/** The `*.messages.ts` files under src/, as paths from it. */
function messageFiles(): string[] {
  return readdirSync(SRC, { recursive: true })
    .map(String)
    .filter((file) => file.endsWith(".messages.ts"));
}

describe("the English owners of UiMessages", () => {
  it("cover exactly the keys of the type", () => {
    expectTypeOf(ALL).toExtend<UiMessages>();
    expectTypeOf<UiMessages>().toExtend<typeof ALL>();
  });

  it("hold no key twice", () => {
    const counted = SLICES.reduce((sum, slice) => sum + Object.keys(slice).length, 0);

    expect(Object.keys(ALL)).toHaveLength(counted);
  });

  it("are every messages file under src/, one slice each", () => {
    expect(messageFiles()).toHaveLength(SLICES.length);
  });
});
