import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { VALIDITY_MESSAGES_EN as M } from "../../internal/validity.messages.ts";
import { mounted } from "../../test/dom.ts";
import { RequiredRadios } from "./__fixtures__/required.fixture.tsx";

afterEach(cleanup);

async function messages(container: HTMLElement): Promise<string[]> {
  await mounted();
  flush();
  await mounted();

  return [...container.querySelectorAll<HTMLInputElement>("input")].map((input) => input.validationMessage);
}

it("a required radio group asks for a choice on every radio until one is chosen", async () => {
  const view = render(() => <RequiredRadios />);
  expect(await messages(view.container)).toStrictEqual([M.requiredChoice, M.requiredChoice]);
  fireEvent.click(screen.getByRole("radio", { name: "Pro" }));
  expect(await messages(view.container)).toStrictEqual(["", ""]);
});

it("a required radio group with a choice asks for nothing, and the group element never takes `required`", async () => {
  const view = render(() => <RequiredRadios defaultValue="pro" />);
  expect(await messages(view.container)).toStrictEqual(["", ""]);
  expect(screen.getByRole("radiogroup", { name: "Plan" }).hasAttribute("required")).toBe(false);
});
