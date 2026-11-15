import { screen } from "@solidjs/testing-library";
import { expect, it } from "vitest";

import { inputElement } from "../../test/dom.ts";
import { settle, typeInto } from "./form-testing.ts";
import { FILLED_PROFILE, type ProfileField } from "./profile.fixture.ts";
import { isBlurred, renderProfile, valueOf, viewText } from "./profile-testing.tsx";

// The behaviors a text field (text input, input group) shares, run against it in the profile form.

/** The text box named `label`: an input, or a textarea. */
export function textbox(label: RegExp): HTMLInputElement | HTMLTextAreaElement {
  const found = screen.getByRole("textbox", { name: label });

  return found instanceof HTMLTextAreaElement ? found : inputElement(found);
}

/** Which control, where it sits in the profile form, and what the person types. */
export type TextCase = {
  /** The control's name, for the test titles. */
  title: string;
  /** The profile's field that holds the control. */
  field: ProfileField;
  /** The control's accessible name. */
  label: RegExp;
  /** The field it binds. */
  name: "bio" | "name" | "note" | "site";
  /** What the person types. */
  typed: string;
  /** What the field holds once the person leaves the box. */
  written: string;
};

/** Registers the control's write-and-blur and read-only tests. */
export function testTextControl(c: TextCase): void {
  it(`${c.title} writes the typed text, cleaned as the person leaves it, and blurs the field`, async () => {
    const { form } = await renderProfile(c.field);
    expect(isBlurred(form, c.name)).toBe(false);
    typeInto(textbox(c.label), c.typed);
    await settle();
    expect(valueOf(form, c.name)).toBe(c.written);
    expect(textbox(c.label).value).toBe(c.written);
    expect(isBlurred(form, c.name)).toBe(true);
  });

  it(`${c.title} renders the text as a View in a read-only form`, async () => {
    const { container } = await renderProfile(c.field, { defaults: FILLED_PROFILE, readOnly: true });
    expect(screen.queryByRole("textbox", { name: c.label })).toBeNull();
    expect(viewText(container, c.name)).toBe(FILLED_PROFILE[c.name]);
  });
}
