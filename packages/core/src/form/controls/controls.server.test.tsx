import { expect, it } from "vitest";

import { renderServer, slots, text } from "../../test/server.ts";
import { ProfileForm } from "./__fixtures__/profile-form.fixture.tsx";
import { FILLED_PROFILE } from "./__fixtures__/profile.fixture.ts";

// Solid warns once per kind of warning per process, so the warnings test comes first.

/** The number of fields the profile form has: one per wrapper, the input group twice. */
const FIELD_COUNT = 11;

it("form controls on the server render the text and choice wrappers with no Solid warnings", () => {
  const { html, warnings } = renderServer(() => <ProfileForm withoutLists defaults={FILLED_PROFILE} />);
  expect(warnings).toStrictEqual([]);
  expect(slots(html, "field-error")).toStrictEqual([]);
});

it("form controls on the server render each wrapper's control with the field's value", () => {
  const { html } = renderServer(() => <ProfileForm defaults={FILLED_PROFILE} />);
  const inputs = slots(html, "input").map((input) => [input.attrs.name, input.attrs.value]);
  expect(inputs).toStrictEqual([
    ["name", "Ada"],
    ["site", "ada.dev"],
  ]);
  expect(slots(html, "textarea").map((box) => box.attrs.name)).toStrictEqual(["bio", "note"]);
  expect(slots(html, "checkbox")[0]?.attrs["aria-checked"]).toBe("true");
  expect(slots(html, "switch")[0]?.attrs["aria-checked"]).toBe("true");
  expect(slots(html, "radio-group")).toHaveLength(1);
  expect(text(html)).toContain("Admin");
  expect(slots(html, "view")).toStrictEqual([]);
});

it("form controls on the server render every wrapper's View in a read-only form", () => {
  const { html } = renderServer(() => <ProfileForm readOnly defaults={FILLED_PROFILE} />);
  expect(slots(html, "input")).toStrictEqual([]);
  expect(slots(html, "view")).toHaveLength(FIELD_COUNT);
  expect(text(html)).toContain("Bug, Design");
  expect(text(html)).toContain("Banana");
});
