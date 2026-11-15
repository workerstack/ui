import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush, Show } from "solid-js";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted } from "../../test/dom.ts";
import { collectWarnings } from "../../test/warnings.ts";
import { settle, typeInto } from "../__fixtures__/form-testing.ts";
import { ProfileForm, UnsavedPage } from "./__fixtures__/profile-form.fixture.tsx";
import { UnsavedChangesProvider } from "./index.ts";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

function nameBox(index: number): HTMLInputElement {
  return inputElement(screen.getAllByRole("textbox", { name: "Name" })[index]);
}

/** Fires `beforeunload` as closing the tab does; whether the page asked to stay. */
function unload(): boolean {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);

  return event.defaultPrevented;
}

function visibleDialog(): HTMLElement | undefined {
  return screen.queryAllByRole("alertdialog").find((element) => element.checkVisibility());
}

async function leave(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Go to settings" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeDefined());
}

function answer(): string {
  return screen.getByTestId("answer").textContent;
}

async function renderPage(billingDraftKey?: string): Promise<void> {
  render(() => <UnsavedPage billingDraftKey={billingDraftKey} />);
  await mounted();
  await settle();
}

it("UnsavedChangesProvider raises the browser's prompt on unload only while a form is changed", async () => {
  const warn = vi.spyOn(console, "warn");
  const error = vi.spyOn(console, "error");
  await renderPage();
  expect(unload()).toBe(false);
  typeInto(nameBox(0), "Ada");
  expect(unload()).toBe(true);
  typeInto(nameBox(0), "");
  expect(unload()).toBe(false);
  expect([...warn.mock.calls, ...error.mock.calls]).toStrictEqual([]);
});

it("useConfirmLeave resolves at once when nothing would be lost", async () => {
  await renderPage();
  fireEvent.click(screen.getByRole("button", { name: "Go to settings" }));
  await vi.waitFor(() => expect(answer()).toBe("left"));
  expect(visibleDialog()).toBeUndefined();
});

it("useConfirmLeave asks, naming the changed forms: Stay keeps the page", async () => {
  await renderPage();
  typeInto(nameBox(0), "Ada");
  typeInto(nameBox(1), "Ada");
  await leave();
  expect(screen.getByText("Leave with unsaved changes?")).toBeDefined();
  expect(screen.getByText("Your changes to Profile and Billing will be lost.")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Stay" }));
  await vi.waitFor(() => expect(answer()).toBe("stayed"));
});

it("useConfirmLeave resolves true on Leave", async () => {
  await renderPage();
  typeInto(nameBox(0), "Ada");
  await leave();
  fireEvent.click(screen.getByRole("button", { name: "Leave" }));
  await vi.waitFor(() => expect(answer()).toBe("left"));
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
});

it("UnsavedChangesProvider never counts a form that keeps a draft, nor one just saved", async () => {
  await renderPage("billing");
  typeInto(nameBox(1), "Ada");
  expect(unload()).toBe(false);
  typeInto(nameBox(0), "Ada");
  expect(unload()).toBe(true);
  fireEvent.submit(screen.getByRole("form", { name: "Profile" }));
  await settle();
  expect(unload()).toBe(false);
});

it("UnsavedChangesProvider forgets a form that unmounts, and FormUnsaved works without a provider", async () => {
  const [isShown, setShown] = createSignal(true, { ownedWrite: true });
  render(() => (
    <>
      <UnsavedChangesProvider>
        <Show when={isShown()}>
          <ProfileForm />
        </Show>
      </UnsavedChangesProvider>
      <ProfileForm name="Alone" />
    </>
  ));
  await mounted();
  typeInto(nameBox(0), "Ada");
  expect(unload()).toBe(true);

  const { warnings } = collectWarnings(() => {
    setShown(false);
    flush();
  });

  expect(warnings).toStrictEqual([]);
  expect(unload()).toBe(false);
  typeInto(nameBox(0), "Ada");
  expect(screen.getByText("Unsaved changes")).toBeDefined();
  expect(unload()).toBe(false);
});
