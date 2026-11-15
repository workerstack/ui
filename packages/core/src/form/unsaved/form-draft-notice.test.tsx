import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { mounted } from "../../test/dom.ts";
import { settle } from "../__fixtures__/form-testing.ts";
import { ProfileForm } from "./__fixtures__/profile-form.fixture.tsx";
import { draftFingerprint, encodeDraft } from "./index.ts";

const KEY = "ui-draft:anon:profile";
const START = { email: "", name: "", password: "" };
const DAY = 86_400_000;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function storeDraft(savedAt: number): void {
  localStorage.setItem(KEY, encodeDraft({ fingerprint: draftFingerprint(START), savedAt, values: { name: "Ada" } }));
}

function notice(): string {
  return document.querySelector("[data-slot=form-draft-notice]")?.textContent ?? "missing";
}

it("FormDraftNotice says when a draft restored today was saved, by its time", async () => {
  const savedAt = Date.now();
  storeDraft(savedAt);
  render(() => <ProfileForm draftKey="profile" />);
  await mounted();
  await settle();
  const time = new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(savedAt);
  expect(notice()).toBe(`Restored your unsaved changes from ${time}.Discard`);
});

it("FormDraftNotice names the day of a draft saved before today", async () => {
  const savedAt = Date.now() - 2 * DAY;
  storeDraft(savedAt);
  render(() => <ProfileForm draftKey="profile" />);
  await mounted();
  await settle();
  const time = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(savedAt);
  expect(notice()).toBe(`Restored your unsaved changes from ${time}.Discard`);
});

it("FormDraftNotice shows nothing for a form without a draft", async () => {
  render(() => <ProfileForm />);
  await mounted();
  expect(notice()).toBe("");
});
