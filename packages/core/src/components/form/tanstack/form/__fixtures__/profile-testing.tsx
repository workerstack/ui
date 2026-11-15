import { render } from "@solidjs/testing-library";

import { mounted } from "../../../../../test/dom.ts";
import type { FormFor } from "../index.ts";
import { captured } from "./form-testing.ts";
import { ProfileForm, type ProfileFormProps } from "./profile-form.fixture.tsx";
import type { Profile, ProfileField } from "./profile.fixture.ts";

// Renders the profile form for a control field's test, and reads what the form holds.

/** A rendered profile form: its container and its form. */
export type RenderedProfile = {
  /** What the form rendered into. */
  container: HTMLElement;
  /** The form, to read its values and fields. */
  form: FormFor<Profile>;
};

/** How the profile form starts: its values, and whether it is read-only. */
export type ProfileStart = Omit<ProfileFormProps, "field" | "keep">;

/** Renders the profile form around `field` and waits for its parts to attach. */
export async function renderProfile(field: ProfileField, start: ProfileStart = {}): Promise<RenderedProfile> {
  const form = captured<FormFor<Profile>>();
  const { container } = render(() => <ProfileForm {...start} field={field} keep={form.set} />);
  await mounted();

  return { container, form: form.get() };
}

/** The value the form holds for `name`. */
export function valueOf<TName extends keyof Profile>(form: FormFor<Profile>, name: TName): Profile[TName] {
  return form.state.values[name];
}

/** Whether the field `name` was blurred (TanStack marks it touched on a change already). */
export function isBlurred(form: FormFor<Profile>, name: keyof Profile): boolean {
  return form.state.fieldMeta[name]?.isBlurred === true;
}

/** The text of the View of the field `name`, in a read-only form. */
export function viewText(container: Element, name: keyof Profile): string | undefined {
  return container.querySelector(`[data-field-name="${name}"] [data-slot=view]`)?.textContent ?? undefined;
}
