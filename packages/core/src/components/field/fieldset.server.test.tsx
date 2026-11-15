import { renderServer, tag, tags } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { AddressFieldset } from "./__fixtures__/fieldset.fixture.tsx";
import { MarkedFieldset } from "./__fixtures__/marks.fixture.tsx";
import { MotionField } from "./__fixtures__/motion.fixture.tsx";

it("Fieldset on the server renders the group with its legend and description, and warns about nothing", () => {
  const { html, warnings } = renderServer(() => <AddressFieldset />);

  expect(tag(html, { "data-slot": "fieldset" }).name).toBe("fieldset");
  expect(tag(html, { "data-slot": "fieldset-legend" }).name).toBe("legend");
  expect(tag(html, { "data-slot": "fieldset-description" }).name).toBe("p");
  expect(tags(html, { "data-slot": "field" })).toHaveLength(2);
  expect(html).toContain(">Shipping address</");
  expect(warnings).toStrictEqual([]);
});

// UI SDK 0.1.0-beta.2 adds a FieldSet's aria-describedby (and its legend's aria-labelledby) only after
// mount, so the server HTML does not tie the group to its description. When this starts passing, the
// upstream fix has landed: drop `.fails`.
it.fails("Fieldset on the server describes the group by its description in the HTML", () => {
  const { html } = renderServer(() => <AddressFieldset />);

  expect(tag(html, { "data-slot": "fieldset" }).attrs["aria-describedby"]?.split(" ")).toContain(
    tag(html, { "data-slot": "fieldset-description" }).attrs.id,
  );
});

it("Fieldset on the server marks a legend that says it is required", () => {
  const { html } = renderServer(() => <MarkedFieldset required />);
  const legend = tag(html, { "data-slot": "fieldset-legend" });

  expect(legend.attrs["data-mark"]).toBe("required");
  expect(legend.attrs["data-mark-text"]).toBe("*");
});

it("Field on the server leaves the error out of the HTML while valid", () => {
  const { html } = renderServer(() => <MotionField />);

  expect(tags(html, { "data-slot": "field-error" })).toStrictEqual([]);
  expect(tag(html, { "data-slot": "field-description" }).name).toBe("p");
});
