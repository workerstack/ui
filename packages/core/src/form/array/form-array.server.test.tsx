import { expect, it } from "vitest";

import { renderServer, slot, slots, tags } from "../../test/server.ts";
import { InvitesForm } from "./__fixtures__/invites.fixture.tsx";

it("formArray on the server renders an item group per value, its handles and buttons", () => {
  const { html, warnings } = renderServer(() => <InvitesForm />);

  expect(warnings).toStrictEqual([]);
  expect(slots(html, "form-array-item").map((item) => item.attrs["aria-label"])).toStrictEqual(["Item 1", "Item 2"]);
  expect(slots(html, "input").map((input) => input.attrs.value)).toStrictEqual(["ada@acme.dev", "grace@acme.dev"]);
  expect(slots(html, "form-array-handle").map((handle) => handle.attrs["aria-hidden"])).toStrictEqual(["true", "true"]);
  expect(
    tags(html)
      .filter((tag) => tag.attrs["data-form-array"] !== undefined)
      .map((tag) => [tag.attrs["data-form-array"], tag.attrs["aria-label"], tag.attrs.disabled]),
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

it("formArray on the server names the group by its legend and shows no error before a submit", () => {
  const { html } = renderServer(() => <InvitesForm />);

  expect(slot(html, "fieldset-legend").name).toBe("legend");
  const group = slots(html, "fieldset").find((tag) => tag.attrs["data-field-name"] === "invites");

  expect(group?.attrs["aria-describedby"]).toBeUndefined();
  expect(slots(html, "form-array-error")).toStrictEqual([]);
});

it("formArray in a read-only Form on the server renders its items without handles or buttons", () => {
  const { html } = renderServer(() => <InvitesForm readOnly />);

  expect(slots(html, "form-array-item")).toHaveLength(2);
  expect(slots(html, "form-array-handle")).toStrictEqual([]);
  expect(tags(html).filter((tag) => tag.name === "button")).toStrictEqual([]);
});
