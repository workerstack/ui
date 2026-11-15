import { renderServer, tag, tags } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { InvitesForm } from "./__fixtures__/invites.fixture.tsx";

it("FormArray on the server renders an item group per value, its handles and buttons", () => {
  const { html, warnings } = renderServer(() => <InvitesForm />);

  expect(warnings).toStrictEqual([]);
  expect(tags(html, { "data-slot": "form-array-item" }).map((item) => item.attrs["aria-label"])).toStrictEqual([
    "Item 1",
    "Item 2",
  ]);
  expect(tags(html, { "data-slot": "input" }).map((input) => input.attrs.value)).toStrictEqual([
    "ada@acme.dev",
    "grace@acme.dev",
  ]);
  expect(tags(html, { "data-slot": "form-array-handle" }).map((handle) => handle.attrs["aria-hidden"])).toStrictEqual([
    "true",
    "true",
  ]);
  expect(
    tags(html)
      .filter((found) => found.attrs["data-form-array"] !== undefined)
      .map((found) => [found.attrs["data-form-array"], found.attrs["aria-label"], found.attrs.disabled]),
  ).toStrictEqual([
    ["move-up", "Move item 1 up", ""],
    ["move-down", "Move item 1 down", undefined],
    ["remove", "Remove item 1", undefined],
    ["move-up", "Move item 2 up", undefined],
    ["move-down", "Move item 2 down", ""],
    ["remove", "Remove item 2", undefined],
    ["add", undefined, undefined],
  ]);
});

it("FormArray on the server names the group by its legend and shows no error before a submit", () => {
  const { html } = renderServer(() => <InvitesForm />);

  expect(tag(html, { "data-slot": "fieldset-legend" }).name).toBe("legend");
  const group = tags(html, { "data-slot": "fieldset" }).find((found) => found.attrs["data-field-name"] === "invites");

  expect(group?.attrs["aria-describedby"]).toBeUndefined();
  expect(tags(html, { "data-slot": "form-array-error" })).toStrictEqual([]);
});

it("FormArray in a read-only Form on the server renders its items without handles or buttons", () => {
  const { html } = renderServer(() => <InvitesForm readOnly />);

  expect(tags(html, { "data-slot": "form-array-item" })).toHaveLength(2);
  expect(tags(html, { "data-slot": "form-array-handle" })).toStrictEqual([]);
  expect(tags(html).filter((found) => found.name === "button")).toStrictEqual([]);
});
