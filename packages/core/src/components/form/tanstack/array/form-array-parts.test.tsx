import { cleanup, render, screen } from "@solidjs/testing-library";
import { Errored } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { renderInvites } from "./__fixtures__/invites-testing.tsx";
import { formArray } from "./index.ts";

// The parts around the items: the handle, the provider's strings, a read-only Form, and a part
// outside its Root.

afterEach(cleanup);

it("FormArray.Handle is a grip hidden from assistive technology, one per item", async () => {
  const { container } = await renderInvites();
  const handles = [...container.querySelectorAll<HTMLElement>("[data-slot=form-array-handle]")];

  expect(handles.map((handle) => handle.getAttribute("aria-hidden"))).toStrictEqual(["true", "true"]);
  const owners = handles.map((handle) => handle.closest("[data-slot=form-array-item]")?.getAttribute("data-index"));

  expect(owners).toStrictEqual(["0", "1"]);
});

it("FormArray's buttons are named by the provider's strings, by position", async () => {
  await renderInvites();

  const names = screen.getAllByRole("button").map((button) => button.getAttribute("aria-label") ?? button.textContent);

  expect(names).toStrictEqual([
    "Move item 1 up",
    "Move item 1 down",
    "Remove item 1",
    "Move item 2 up",
    "Move item 2 down",
    "Remove item 2",
    "Add invite",
  ]);
});

it("FormArray in a read-only Form shows the items without its handles and buttons", async () => {
  const { container } = await renderInvites({ readOnly: true });

  expect(screen.getAllByRole("group", { name: /^Item / })).toHaveLength(2);
  expect(container.querySelectorAll("[data-slot=form-array-handle], button")).toHaveLength(0);
});

it("FormArray.Add outside formArray.Root throws, naming the part", () => {
  render(() => (
    <Errored fallback={(error) => <p role="alert">{String(error())}</p>}>
      <formArray.Add value="tag">Add tag</formArray.Add>
    </Errored>
  ));

  expect(screen.getByRole("alert").textContent).toBe("Error: formArray.Add must sit inside formArray.Root.");
  expect(screen.queryByText("Add tag")).toBeNull();
});
