import { fireEvent, screen } from "@solidjs/testing-library";
import { expect, it } from "vitest";

import { errorTexts, settle, submit, userSteps } from "../../__fixtures__/form-testing.ts";
import { FILLED_PROFILE, PROFILE_ERRORS, type Profile } from "./profile.fixture.ts";
import { isBlurred, renderProfile, valueOf, viewText } from "./profile-testing.tsx";

// The behaviors a boolean wrapper (checkbox, switch) shares, run against its field in the profile form.

/** Which wrapper, and where it sits in the profile form. */
export type ToggleCase = {
  /** The wrapper's name, for the test titles. */
  title: string;
  /** The control's ARIA role. */
  role: "checkbox" | "switch";
  /** The control's accessible name. */
  label: RegExp;
  /** The field it binds. */
  name: "alerts" | "terms";
};

function control(c: ToggleCase): HTMLElement {
  return screen.getByRole(c.role, { name: c.label });
}

/** Registers the wrapper's write, blur, error and read-only tests. */
export function testToggleControl(c: ToggleCase): void {
  it(`${c.title}.Control writes the tick and blurs the field when it loses focus`, async () => {
    const { form } = await renderProfile();
    userSteps(
      () => fireEvent.click(control(c)),
      () => fireEvent.blur(control(c)),
    );
    await settle();
    expect(valueOf(form, c.name)).toBe(true);
    expect(isBlurred(form, c.name)).toBe(true);
    expect(control(c).getAttribute("aria-checked")).toBe("true");
  });

  it(`${c.title}.Control shows its error only after a submit`, async () => {
    const defaults: Profile = { ...FILLED_PROFILE, [c.name]: false };
    const { container } = await renderProfile({ defaults });
    expect(errorTexts(container)).toStrictEqual([]);
    await submit(container);
    expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS[c.name]]);
    expect(control(c).getAttribute("aria-invalid")).toBe("true");
  });

  it(`${c.title}.Control renders Yes or No as a View in a read-only form`, async () => {
    const { container } = await renderProfile({ defaults: FILLED_PROFILE, readOnly: true });
    expect(screen.queryByRole(c.role, { name: c.label })).toBeNull();
    expect(viewText(container, c.name)).toBe("Yes");
  });
}
