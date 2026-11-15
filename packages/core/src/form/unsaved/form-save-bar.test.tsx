import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted } from "../../test/dom.ts";
import { settle, typeInto } from "../__fixtures__/form-testing.ts";
import { ProfileForm, type Profile } from "./__fixtures__/profile-form.fixture.tsx";

afterEach(cleanup);

function box(name: string): HTMLInputElement {
  return inputElement(screen.getByRole("textbox", { name }));
}

function bar(): HTMLElement | null {
  return screen.queryByRole("region", { name: "Unsaved changes" });
}

function visibleDialog(): HTMLElement | undefined {
  return screen.queryAllByRole("alertdialog").find((element) => element.checkVisibility());
}

it("FormSaveBar shows while its form has unsaved changes", async () => {
  render(() => <ProfileForm saveBar defaults={{ name: "Ada" }} />);
  await mounted();
  expect(bar()).toBeNull();
  typeInto(box("Name"), "Grace");
  expect(bar()).not.toBeNull();
  typeInto(box("Name"), "Ada");
  expect(bar()).toBeNull();
});

/** Renders a changed form with its bar and presses the bar's Discard. */
async function askToDiscard(): Promise<void> {
  render(() => <ProfileForm saveBar defaults={{ name: "Ada" }} />);
  await mounted();
  typeInto(box("Name"), "Grace");
  fireEvent.click(screen.getByRole("button", { name: "Discard" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeDefined());
}

it("FormSaveBar Discard asks first; Stay keeps the changes", async () => {
  await askToDiscard();
  expect(screen.getByText("Discard all unsaved changes?")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Stay" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
  expect(box("Name").value).toBe("Grace");
});

it("FormSaveBar Discard, confirmed, puts the form back and hides the bar", async () => {
  await askToDiscard();
  fireEvent.click(screen.getAllByRole("button", { name: "Discard" }).at(-1) ?? document.body);
  await settle();
  expect(box("Name").value).toBe("Ada");
  expect(bar()).toBeNull();
});

it("FormSaveBar Save submits, and the saved form hides the bar", async () => {
  const onSubmit = vi.fn<(values: Profile) => void>();
  render(() => <ProfileForm saveBar onSubmit={onSubmit} />);
  await mounted();
  typeInto(box("Name"), "Ada");
  const save = screen.getAllByRole("button", { name: "Save" })[0];
  fireEvent.click(save ?? document.body);
  await settle();
  expect(onSubmit.mock.calls).toStrictEqual([[{ email: "", name: "Ada", password: "" }]]);
  expect(bar()).toBeNull();
});
