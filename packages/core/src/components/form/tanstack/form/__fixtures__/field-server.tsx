import { expect, it } from "vitest";

import { renderServer, slots, text } from "../../../../../test/server.ts";
import { ProfileForm } from "./profile-form.fixture.tsx";
import { FILLED_PROFILE, type ProfileField } from "./profile.fixture.ts";

// The server tests every control field keeps, run against its field in the profile form, filled:
// editable it renders its control with the field's value, read-only its View. Solid warns once per
// kind of warning per process, so the warnings check sits in the first test.

/** A control field on the server: what its control renders, and what its View shows. */
export type ServerCase = {
  /** The field's name, for the test titles. */
  title: string;
  /** The profile's field (or fields) under test. */
  field: ProfileField;
  /** Its content part writes a signal on the server and warns (docs/upstream/ui-sdk.md, UISDK-1). */
  warns?: boolean;
  /** What its control rendered for the filled value, read off the server's HTML. */
  rendered: (html: string) => unknown;
  /** What `rendered` reads. */
  expected: unknown;
  /** The text each of its Views shows, read-only. */
  shown: readonly string[];
};

/** Registers the field's editable and read-only server tests. */
export function testFieldServer(c: ServerCase): void {
  it(`${c.title} on the server renders its control with the field's value`, () => {
    const { html, warnings } = renderServer(() => <ProfileForm field={c.field} defaults={FILLED_PROFILE} />);
    // A field whose content part warns (UISDK-1) is checked for the rest only.
    expect(c.warns === true ? [] : warnings).toStrictEqual([]);
    expect(slots(html, "field-error")).toStrictEqual([]);
    expect(slots(html, "view")).toStrictEqual([]);
    expect(c.rendered(html)).toStrictEqual(c.expected);
  });

  it(`${c.title} on the server renders its View in a read-only form`, () => {
    const { html } = renderServer(() => <ProfileForm field={c.field} readOnly defaults={FILLED_PROFILE} />);
    expect(slots(html, "input")).toStrictEqual([]);
    expect(slots(html, "view")).toHaveLength(c.shown.length);
    expect(c.shown.filter((shown) => !text(html).includes(shown))).toStrictEqual([]);
  });
}
