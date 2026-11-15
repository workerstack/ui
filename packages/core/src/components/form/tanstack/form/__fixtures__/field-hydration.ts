import type { JSX } from "@solidjs/web";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { hydrator, mismatch, type MismatchKind } from "../../../../../test/hydration.ts";

// The hydration tests every control field keeps, each over a fixture module of the profile form
// around its field: filled and editable, filled and read-only, and blank for a submit.

/** What a control field's hydration fixture module exports. */
export type FieldHydrationFixtures = {
  /** The field filled and editable. */
  Editable: () => JSX.Element;
  /** The field filled, read-only: its View. */
  ReadOnly: () => JSX.Element;
  /** The field editable and empty, so a submit shows its error. */
  Blank: () => JSX.Element;
};

/** A control field's hydration fixtures, and what its blank submit shows. */
export type HydrationCase = {
  /** The field's name, for the test titles. */
  title: string;
  /** The fixture module's URL: `new URL("./__fixtures__/x-field.hydration.fixture.tsx", import.meta.url)`. */
  fixture: URL;
  /** The fixture module's exports. */
  fixtures: FieldHydrationFixtures;
  /** The error a submit of the blank field shows. */
  error: string;
  /** What the editable field is checked for: a field whose content part warns on the server checks the rest (UISDK-1). */
  kinds?: MismatchKind[];
};

/** Registers the field's editable, read-only and binding hydration tests. */
export function testFieldHydration(c: HydrationCase): void {
  const hydrate = hydrator(c.fixture, c.fixtures);

  it(`hydrating ${c.title} claims the server's nodes and adds none`, async () => {
    expect(mismatch(await hydrate("Editable"), c.kinds)).toStrictEqual({});
  });

  it(`hydrating ${c.title}'s View in a read-only form adds nothing the server didn't render`, async () => {
    expect(mismatch(await hydrate("ReadOnly"))).toStrictEqual({});
  });

  it(`hydrating ${c.title} binds its field: a submit shows its error`, async () => {
    await hydrate("Blank");
    await userEvent.click(page.getByRole("button", { name: "Save" }));
    await expect.element(page.getByText(c.error, { exact: true })).toBeVisible();
  });
}
