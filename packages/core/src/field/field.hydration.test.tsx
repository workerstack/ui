import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { inputElement } from "../test/dom.ts";
import { hydrator, mismatch } from "../test/hydration.ts";
import { required } from "../test/required.ts";
import { BareFieldFixture, FieldFixture } from "./__fixtures__/field.hydration.fixture.tsx";

const SERVER_INPUT_ID = /<input[^>]*\sid="([^"]+)"/;

const hydrate = hydrator(new URL("./__fixtures__/field.hydration.fixture.tsx", import.meta.url), {
  BareFieldFixture,
  FieldFixture,
});

function ids(el: Element, attr: string): string[] {
  return (el.getAttribute(attr) ?? "").split(" ").filter((id) => id !== "");
}

function allInPage(list: string[]): boolean {
  return list.every((id) => document.getElementById(id) !== null);
}

it("hydrating Field claims the server's nodes without warnings", async () => {
  expect(mismatch(await hydrate("FieldFixture"))).toStrictEqual({});
});

it("hydrating Field keeps the server's ids, so the label still names the input", async () => {
  const hydrated = await hydrate("FieldFixture");
  const input = inputElement(hydrated.container.querySelector("input"));
  const label = required(hydrated.container.querySelector("label"), "the label");
  expect(input.id).toBe(SERVER_INPUT_ID.exec(hydrated.server.html)?.[1]);
  expect(label.htmlFor).toBe(input.id);
  await expect.element(page.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
});

it("hydrating Field describes the input only by parts in the page", async () => {
  const hydrated = await hydrate("FieldFixture");
  const input = inputElement(hydrated.container.querySelector("input"));
  await expect.poll(() => allInPage(ids(input, "aria-describedby"))).toBe(true);
  const error = page.getByText("That email is taken.").element();
  await expect.poll(() => ids(input, "aria-describedby")).toContain(error.id);
});

it("hydrating Field reports typing into the server's input", async () => {
  await hydrate("FieldFixture");
  await userEvent.type(page.getByRole("textbox", { name: "Email" }), "ada@example.com");
  await expect.element(page.getByRole("status")).toHaveTextContent("ada@example.com");
});

it("hydrating Field with no description or error warns about nothing", async () => {
  expect(mismatch(await hydrate("BareFieldFixture"), ["warnings", "replaced"])).toStrictEqual({});
});
