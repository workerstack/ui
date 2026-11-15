import { cleanup, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { drawnIcon, drawsIcon, glyph } from "../../test/browser.ts";
import { centerOf, drag } from "../../test/pointer.ts";
import { required } from "../../test/required.ts";
import { collectWarningsAsync } from "../../test/warnings.ts";
import { button, emails, iconOf, invitesOf, renderInvites } from "./__fixtures__/invites-testing.tsx";

// Real input on the invites form: a row dragged by its grip, the move buttons from the keyboard,
// and the icons the theme draws.

afterEach(cleanup);

function handleOf(container: Element, index: number): HTMLElement {
  const item = required(container.querySelector(`[data-slot=form-array-item][data-index="${index}"]`), "an item");

  return required(item.querySelector<HTMLElement>("[data-slot=form-array-handle]"), "a handle");
}

it("FormArray.Handle drags a row below the next one, values and focus following, with no Solid warning", async () => {
  const { result, warnings } = await collectWarningsAsync(async () => {
    const { container, form } = await renderInvites();
    const second = required(container.querySelector('[data-slot=form-array-item][data-index="1"]'), "the second item");
    await userEvent.click(screen.getByRole("textbox", { name: "Email 1" }));
    await drag(handleOf(container, 0), { x: centerOf(second).x, y: second.getBoundingClientRect().bottom - 1 });
    await expect.poll(() => container.querySelectorAll("[data-dnd-dragging]").length).toBe(0);

    return { emails: emails(container), values: invitesOf(form) };
  });

  expect(result).toStrictEqual({
    emails: ["grace@acme.dev", "ada@acme.dev"],
    values: [{ email: "grace@acme.dev" }, { email: "ada@acme.dev" }],
  });
  // Focus was in the dragged row: it follows the row to its new place.
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Email 2" }));
  expect(warnings).toStrictEqual([]);
});

it("FormArray.Handle draws a grip and the buttons draw the theme's chevron and x", async () => {
  const { container } = await renderInvites();
  const grip = required(handleOf(container, 0).querySelector("[data-icon]"), "a grip");

  expect(drawnIcon(grip, "::before")).toContain("data:image/svg+xml");
  expect(drawsIcon(iconOf("Move item 1 down"), "::before", "--ui-icon-chevron")).toBe(true);
  expect(drawsIcon(iconOf("Remove item 1"), "::before", "--ui-icon-x")).toBe(true);
  expect(glyph("--ui-icon-x")).not.toBe("none");
});

it("FormArray's move buttons move a row from the keyboard, focus following the row", async () => {
  const { container } = await renderInvites();
  await userEvent.click(screen.getByRole("textbox", { name: "Email 1" }));
  // Move item 1 up is disabled on the first row, so Tab lands on Move item 1 down.
  await userEvent.tab();

  expect(document.activeElement).toBe(button("Move item 1 down"));
  await userEvent.keyboard("{Enter}");

  await expect.poll(() => emails(container)).toStrictEqual(["grace@acme.dev", "ada@acme.dev"]);
  await expect.poll(() => document.activeElement).toBe(button("Move item 2 up"));
  await userEvent.keyboard(" ");

  await expect.poll(() => emails(container)).toStrictEqual(["ada@acme.dev", "grace@acme.dev"]);
  await expect.poll(() => document.activeElement).toBe(button("Move item 1 down"));
});
