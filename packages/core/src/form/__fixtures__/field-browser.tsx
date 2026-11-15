import { render } from "@solidjs/testing-library";
import { expect, it, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";

import { focusPage } from "../../test/browser.ts";
import { errorTexts } from "./form-testing.ts";
import { ProfileForm } from "./profile-form.fixture.tsx";
import { EMPTY_PROFILE, FILLED_PROFILE, PROFILE_ERRORS, type Profile, type ProfileField } from "./profile.fixture.ts";

// The browser tests every control field keeps, run against its field in the profile form: a person
// fills it with real input and Save sends it, and an empty Save shows its error and focuses its
// control (a single problem goes straight to its control; the Form's tests cover the summary).

/** A control field in the browser: how a person fills it, and which control an empty Save focuses. */
export type BrowserCase = {
  /** The field's name, for the test titles. */
  title: string;
  /** The profile's field under test. */
  field: ProfileField;
  /** The field it binds. */
  name: keyof Profile;
  /** Fills the field as a person does, with the filled profile's value. */
  fill: () => Promise<void>;
  /** The control an empty Save focuses. */
  control: () => Locator;
};

/** Registers the field's fill-and-send and empty-Save tests. */
export function testFieldBrowser(c: BrowserCase): void {
  it(`${c.title} takes a person's input, and Save sends what they entered`, async () => {
    await focusPage();
    const sent = vi.fn<(values: Profile) => void>();
    render(() => <ProfileForm field={c.field} onSubmit={sent} />);
    await c.fill();
    await userEvent.click(page.getByRole("button", { name: "Save" }));
    const filled: Profile = { ...EMPTY_PROFILE, [c.name]: FILLED_PROFILE[c.name] };
    await vi.waitFor(() => expect(sent.mock.calls).toStrictEqual([[filled]]));
  });

  it(`${c.title} shows its error after an empty Save, and the Form focuses its control`, async () => {
    await focusPage();
    const { container } = render(() => <ProfileForm field={c.field} />);
    await userEvent.click(page.getByRole("button", { name: "Save" }));
    await expect.element(c.control()).toHaveFocus();
    expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS[c.name]]);
  });
}

/** Opens the list of the combobox named `box`, typing `typed` first when given, and picks `option`. */
export async function pick(box: string, option: string, typed?: string): Promise<void> {
  const control = page.getByRole("combobox", { name: box });

  if (typed === undefined) await userEvent.click(control);
  else await userEvent.fill(control, typed);
  await userEvent.click(page.getByRole("option", { name: option }));
}
