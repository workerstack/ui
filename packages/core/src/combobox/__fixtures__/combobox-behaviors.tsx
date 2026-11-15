import { fireEvent, screen } from "@solidjs/testing-library";
import { expect, it } from "vitest";

import {
  EMPTY_PROFILE,
  errorTexts,
  FILLED_PROFILE,
  isBlurred,
  PROFILE_ERRORS,
  renderProfile,
  settle,
  submit,
  userSteps,
  viewText,
} from "../../form/__fixtures__/field-testing.ts";
import type { ProfileField } from "../../form/__fixtures__/profile.fixture.ts";
import { inputElement } from "../../test/dom.ts";

// The behaviors the combobox fields share, one value or several, run against them in the profile
// form: the text box reports blur, the error waits for a submit, and read-only shows the View.

/** Which combobox field, and where it sits in the profile form. */
export type ComboboxCase = {
  /** The text box's part, for the test titles: `comboboxField.Input`. */
  input: string;
  /** The field's name, for the test titles. */
  title: string;
  /** The profile's field that holds the combobox. */
  field: ProfileField;
  /** The field it binds. */
  name: "fruit" | "tags";
  /** The combobox's accessible name. */
  label: RegExp;
  /** What the View shows for the filled profile. */
  shown: string;
};

/** The text box of the combobox named `label`. */
export function comboboxInput(label: RegExp): HTMLInputElement {
  return inputElement(screen.getByRole("combobox", { name: label }));
}

/** Registers the combobox field's blur, error and read-only View tests. */
export function testComboboxBehaviors(c: ComboboxCase): void {
  it(`${c.input} blurs the field when it loses focus`, async () => {
    const { form } = await renderProfile(c.field);
    userSteps(
      () => fireEvent.focus(comboboxInput(c.label)),
      () => fireEvent.blur(comboboxInput(c.label)),
    );
    await settle();
    expect(isBlurred(form, c.name)).toBe(true);
  });

  it(`${c.title}.Control shows its error only after a submit`, async () => {
    const { container } = await renderProfile(c.field, { defaults: { ...FILLED_PROFILE, [c.name]: EMPTY_PROFILE[c.name] } });
    expect(errorTexts(container)).toStrictEqual([]);
    await submit(container);
    expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS[c.name]]);
    expect(comboboxInput(c.label).getAttribute("aria-invalid")).toBe("true");
  });

  it(`${c.title}.Control renders the chosen labels from the Root's items in a read-only form`, async () => {
    const { container } = await renderProfile(c.field, { defaults: FILLED_PROFILE, readOnly: true });
    expect(screen.queryByRole("combobox", { name: c.label })).toBeNull();
    expect(viewText(container, c.name)).toBe(c.shown);
  });
}
