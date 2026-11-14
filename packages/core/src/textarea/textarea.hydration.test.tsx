import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { mismatch, hydrator } from "../test/hydration.ts";
import { TextareaFixture } from "./__fixtures__/textarea.hydration.fixture.tsx";

const hydrate = hydrator(new URL("./__fixtures__/textarea.hydration.fixture.tsx", import.meta.url), {
  TextareaFixture,
});

const NOTES = { name: "Notes" };

function box(): HTMLTextAreaElement {
  const el = page.getByRole("textbox", NOTES).element();

  if (!(el instanceof HTMLTextAreaElement)) throw new Error("expected a <textarea>");

  return el;
}

it("hydrating Textarea claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("TextareaFixture"), ["added", "serverWarnings", "warnings", "replaced"])).toStrictEqual(
    {},
  );
});

it("hydrating Textarea keeps the server's value and reports typing", async () => {
  await hydrate("TextareaFixture");
  expect(box().value).toBe("first");
  await userEvent.click(page.getByRole("textbox", NOTES));
  await userEvent.keyboard("{End} more");
  await expect.element(page.getByRole("status")).toHaveTextContent("first more");
});
