import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted } from "../../test/dom.ts";
import { settle, submit, typeInto } from "../__fixtures__/form-testing.ts";
import { ProfileForm, UnsavedPage } from "./__fixtures__/profile-form.fixture.tsx";
import { draftFingerprint, encodeDraft } from "./index.ts";

const KEY = "ui-draft:anon:profile";
const DELAY = 500;
const DAY = 86_400_000;
const START = { email: "", name: "", password: "" };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

function box(name: string): HTMLInputElement {
  return inputElement(screen.getByRole("textbox", { name }));
}

/** Stores a draft as an earlier visit wrote it. */
function storeDraft(values: Record<string, string>, savedAt = Date.now()): void {
  localStorage.setItem(KEY, encodeDraft({ fingerprint: draftFingerprint(START), savedAt, values }));
}

/** Types into a box, then lets the draft's wait pass on fake timers. */
function typeAndWait(name: string, text: string): void {
  typeInto(box(name), text);
  vi.advanceTimersByTime(DELAY);
  flush();
}

async function renderProfile(props: { draftTtl?: number; draftOmit?: readonly string[] } = {}): Promise<void> {
  render(() => <ProfileForm draftKey="profile" {...props} />);
  await mounted();
  await settle();
}

it("FormUnsaved writes the draft half a second after the last edit", async () => {
  await renderProfile();
  vi.useFakeTimers();
  typeInto(box("Name"), "Ada");
  vi.advanceTimersByTime(DELAY - 1);
  expect(localStorage.getItem(KEY)).toBeNull();
  typeInto(box("Name"), "Ada L");
  vi.advanceTimersByTime(DELAY - 1);
  expect(localStorage.getItem(KEY)).toBeNull();
  vi.advanceTimersByTime(1);
  expect(JSON.parse(localStorage.getItem(KEY) ?? "{}")).toMatchObject({ values: { name: "Ada L" } });
});

/** Renders the page of two forms, Billing keeping a draft, and types into Billing on fake timers. */
async function editBilling(scope?: string): Promise<void> {
  render(() => <UnsavedPage scope={scope} billingDraftKey="billing" />);
  await mounted();
  await settle();
  vi.useFakeTimers();
  typeInto(inputElement(screen.getAllByRole("textbox", { name: "Name" })[1]), "Ada");
  vi.advanceTimersByTime(DELAY);
}

it("FormUnsaved keys a draft by the provider's scope", async () => {
  await editBilling("u1");
  expect(localStorage.getItem("ui-draft:u1:billing")).not.toBeNull();
});

it("FormUnsaved restores a draft on mount, the notice says so, and Discard puts the form back", async () => {
  storeDraft({ ...START, name: "Ada" });
  await renderProfile();
  expect(box("Name").value).toBe("Ada");
  expect(screen.getByText(/^Restored your unsaved changes from /)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Discard" }));
  await settle();
  expect(box("Name").value).toBe("");
  expect(localStorage.getItem(KEY)).toBeNull();
  expect(screen.queryByText(/^Restored/)).toBeNull();
});

it("FormUnsaved deletes the draft when the changes are reverted or saved", async () => {
  await renderProfile();
  vi.useFakeTimers();
  typeAndWait("Name", "Ada");
  typeAndWait("Name", "");
  expect(localStorage.getItem(KEY)).toBeNull();
  typeAndWait("Name", "Ada");
  vi.useRealTimers();
  await submit(document.body);
  expect(localStorage.getItem(KEY)).toBeNull();
});

it("FormUnsaved never writes an omitted path", async () => {
  await renderProfile({ draftOmit: ["password"] });
  vi.useFakeTimers();
  typeInto(box("Password"), "secret");
  typeAndWait("Name", "Ada");
  expect(localStorage.getItem(KEY)).not.toContain("secret");
});

it("FormUnsaved drops a draft written by another form", async () => {
  localStorage.setItem(KEY, encodeDraft({ fingerprint: "other", savedAt: Date.now(), values: { name: "Ada" } }));
  await renderProfile();
  expect(box("Name").value).toBe("");
  expect(localStorage.getItem(KEY)).toBeNull();
});

it("FormUnsaved drops a draft past its time to live", async () => {
  storeDraft({ name: "Ada" }, Date.now() - 2 * DAY - 1);
  await renderProfile({ draftTtl: 2 * DAY });
  expect(box("Name").value).toBe("");
  expect(localStorage.getItem(KEY)).toBeNull();
});

it("FormUnsaved notices another tab writing the same draft, without taking its values", async () => {
  await renderProfile();
  const newValue = encodeDraft({ fingerprint: draftFingerprint(START), savedAt: Date.now(), values: { name: "Bo" } });
  window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue }));
  flush();
  expect(screen.getByText(/also being edited in another tab/)).toBeDefined();
  expect(box("Name").value).toBe("");
  window.dispatchEvent(new StorageEvent("storage", { key: "ui-draft:anon:other", newValue }));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: null }));
  flush();
  expect(screen.queryByText(/also being edited in another tab/)).toBeNull();
});

it("FormUnsaved on a read-only form neither restores nor writes a draft", async () => {
  storeDraft({ ...START, name: "Ada" });
  render(() => <ProfileForm draftKey="profile" readOnly />);
  await mounted();
  await settle();
  expect(screen.queryByText("Ada")).toBeNull();
  expect(localStorage.getItem(KEY)).not.toBeNull();
});

it("FormUnsaved restores a draft and writes the next one with no Solid warning", async () => {
  const warn = vi.spyOn(console, "warn");
  const error = vi.spyOn(console, "error");
  storeDraft({ ...START, name: "Ada" });
  await renderProfile();
  vi.useFakeTimers();
  typeAndWait("Email", "ada@example.com");
  expect([...warn.mock.calls, ...error.mock.calls]).toStrictEqual([]);
  expect(JSON.parse(localStorage.getItem(KEY) ?? "{}")).toMatchObject({ values: { email: "ada@example.com" } });
});

it("FormUnsaved stops keeping a draft when storage refuses it", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("full", "QuotaExceededError");
  });
  await editBilling();
  vi.useRealTimers();
  flush();
  fireEvent.click(screen.getByRole("button", { name: "Go to settings" }));
  await vi.waitFor(() => expect(screen.getByText("Your changes to Billing will be lost.")).toBeDefined());
});
