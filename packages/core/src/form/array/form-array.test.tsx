import { cleanup, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { inputElement } from "../../test/dom.ts";
import { settle, submit, typeInto } from "../__fixtures__/form-testing.ts";
import { button, emails, invitesOf, press, renderInvites } from "./__fixtures__/invites-testing.tsx";
import { START, UNIQUE } from "./__fixtures__/invites.fixture.tsx";

// The array on a real `createForm` form: its items' fields by path, Add, Remove and the move
// buttons with focus following, min and max, the array's own rule after an item's change, its
// error after a submit, and writes from outside.

afterEach(cleanup);

function emailBox(position: number): HTMLInputElement {
  return inputElement(screen.getByRole("textbox", { name: `Email ${position}` }));
}

it("FormArray.Root is a group named by its legend, with an item group per value bound by path", async () => {
  const { container } = await renderInvites();

  expect(screen.getByRole("group", { name: "Invites" }).dataset["fieldName"]).toBe("invites");
  expect(screen.getAllByRole("group", { name: /^Item / }).map((item) => item.getAttribute("aria-label"))).toStrictEqual(
    ["Item 1", "Item 2"],
  );
  expect(emails(container)).toStrictEqual(["ada@acme.dev", "grace@acme.dev"]);
});

it("FormArray.Items writes an item's change to its path", async () => {
  const { form } = await renderInvites();
  typeInto(emailBox(2), "hopper@acme.dev");
  await settle();

  expect(invitesOf(form)).toStrictEqual([{ email: "ada@acme.dev" }, { email: "hopper@acme.dev" }]);
});

it("FormArray.Add appends the new item and focuses its first control", async () => {
  const { container, form } = await renderInvites();
  await press("Add invite");

  expect(invitesOf(form)).toStrictEqual([...START.invites, { email: "" }]);
  expect(emails(container)).toStrictEqual(["ada@acme.dev", "grace@acme.dev", ""]);
  expect(document.activeElement).toBe(emailBox(3));
});

it("FormArray.Remove drops its item and focuses the item now at that position", async () => {
  const { container, form } = await renderInvites();
  await press("Remove item 1");

  expect(invitesOf(form)).toStrictEqual([{ email: "grace@acme.dev" }]);
  expect(emails(container)).toStrictEqual(["grace@acme.dev"]);
  expect(document.activeElement).toBe(emailBox(1));
});

it("FormArray.MoveUp and MoveDown reorder the items, focus follows, and the ends disable", async () => {
  const { container, form } = await renderInvites();

  expect(button("Move item 1 up").disabled).toBe(true);
  expect(button("Move item 2 down").disabled).toBe(true);
  await press("Move item 1 down");

  expect(invitesOf(form)).toStrictEqual([{ email: "grace@acme.dev" }, { email: "ada@acme.dev" }]);
  expect(emails(container)).toStrictEqual(["grace@acme.dev", "ada@acme.dev"]);
  // The same button at the item's new position is disabled at the end: its twin takes focus.
  expect(document.activeElement).toBe(button("Move item 2 up"));
  await press("Move item 2 up");

  expect(emails(container)).toStrictEqual(["ada@acme.dev", "grace@acme.dev"]);
  expect(document.activeElement).toBe(button("Move item 1 down"));
});

it("FormArray.Remove disables at min and formArray.Add at max", async () => {
  await renderInvites({ max: 3, min: 1 });
  await press("Add invite");

  expect(button("Add invite").disabled).toBe(true);
  await press("Remove item 3");
  await press("Remove item 2");

  expect(button("Remove item 1").disabled).toBe(true);
  expect(button("Add invite").disabled).toBe(false);
});

it("FormArray.Error shows the array's own rule, run on an item's change, after a submit", async () => {
  const { container, form } = await renderInvites();
  typeInto(emailBox(2), "ada@acme.dev");
  await settle();
  const group = screen.getByRole("group", { name: "Invites" });

  expect(form.getFieldMeta("invites")?.errors).toStrictEqual([UNIQUE]);
  expect(group.getAttribute("aria-describedby")).toBeNull();
  await submit(container);
  const error = container.querySelector("[data-slot=form-array-error]");

  expect(error?.textContent).toBe(UNIQUE);
  expect(group.getAttribute("aria-describedby")).toBe(error?.id);
  typeInto(emailBox(2), "grace@acme.dev");
  await settle();

  expect(container.querySelector("[data-slot=form-array-error]")).toBeNull();
});

it("FormArray.Items shows items written from outside, and reset restores the start", async () => {
  const { container, form } = await renderInvites();
  form.setFieldValue("invites", [{ email: "linus@acme.dev" }]);
  await settle();

  expect(emails(container)).toStrictEqual(["linus@acme.dev"]);
  form.reset();
  await settle();

  expect(emails(container)).toStrictEqual(["ada@acme.dev", "grace@acme.dev"]);
});
