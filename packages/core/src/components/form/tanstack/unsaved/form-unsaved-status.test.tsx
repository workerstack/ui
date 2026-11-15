import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted } from "../../../../test/dom.ts";
import { settle, typeInto } from "../form/__fixtures__/form-testing.ts";
import { ProfileForm } from "./__fixtures__/profile-form.fixture.tsx";

const DELAY = 500;

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
});

function box(name: string): HTMLInputElement {
  return inputElement(screen.getByRole("textbox", { name }));
}

function status(): string {
  return document.querySelector("[data-slot=form-unsaved-status]")?.textContent ?? "missing";
}

it("FormUnsavedStatus shows Unsaved changes only while its form differs from where it started", async () => {
  render(() => <ProfileForm />);
  await mounted();
  expect(status()).toBe("");
  typeInto(box("Name"), "Ada");
  expect(status()).toBe("Unsaved changes");
  typeInto(box("Name"), "");
  expect(status()).toBe("");
});

it("FormUnsavedStatus shows nothing on a read-only form", async () => {
  render(() => <ProfileForm readOnly defaults={{ name: "Ada" }} />);
  await mounted();
  expect(status()).toBe("");
});

it("FormUnsavedStatus says when a draft was kept; its details say where, and Discard changes drops it", async () => {
  render(() => <ProfileForm draftKey="profile" />);
  await mounted();
  await settle();
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  typeInto(box("Name"), "Ada");
  vi.advanceTimersByTime(DELAY);
  vi.useRealTimers();
  await settle();
  expect(status()).toBe("Saved on this device · now");
  fireEvent.click(screen.getByRole("button", { name: "Saved on this device · now" }));
  await vi.waitFor(() => expect(screen.getByText("Kept on this device")).toBeDefined());
  fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
  await settle();
  expect(box("Name").value).toBe("");
  expect(status()).toBe("");
  expect(localStorage.length).toBe(0);
});
