import { fireEvent, render, screen } from "@solidjs/testing-library";

import { mounted } from "../../../../../test/dom.ts";
import { required } from "../../../../../test/required.ts";
import { captured, settle, userSteps } from "../../form/__fixtures__/form-testing.ts";
import type { FormFor } from "../../form/form-field.ts";
import { InvitesForm, type Invites, type InvitesFormProps } from "./invites.fixture.tsx";

// Renders the invites form for a test, and reads what its items show.

/** A rendered invites form: its container and its form. */
export type RenderedInvites = {
  /** What the form rendered into. */
  container: HTMLElement;
  /** The form, to read and write its values. */
  form: FormFor<Invites>;
};

/** Renders the invites form and waits for its parts to attach. */
export async function renderInvites(props: Omit<InvitesFormProps, "keep"> = {}): Promise<RenderedInvites> {
  const form = captured<FormFor<Invites>>();
  const { container } = render(() => <InvitesForm {...props} keep={form.set} />);
  await mounted();

  return { container, form: form.get() };
}

/** The emails the items' text boxes show, in page order. */
export function emails(container: Element): string[] {
  const inputs = container.querySelectorAll<HTMLInputElement>("[data-slot=form-array-item] input");

  return [...inputs].map((input) => input.value);
}

/** The button named `name`; throws when it is missing or not a `<button>`. */
export function button(name: string): HTMLButtonElement {
  const found = screen.getByRole("button", { name });

  if (!(found instanceof HTMLButtonElement)) throw new Error(`"${name}" is not a <button>`);

  return found;
}

/** The invites the form holds. */
export function invitesOf(form: FormFor<Invites>): Invites["invites"] {
  return form.state.values["invites"];
}

/** The drawn icon inside the button named `name`. */
export function iconOf(name: string): Element {
  return required(button(name).querySelector("[data-icon]"), `an icon in "${name}"`);
}

/** Clicks the button named `name` as a person does, and lets the change and its focus land. */
export async function press(name: string): Promise<void> {
  userSteps(() => fireEvent.click(button(name)));
  await settle();
}
