import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { mounted } from "../../test/dom.ts";
import { required } from "../../test/required.ts";
import { UI_MESSAGES_EN as M } from "../provider/index.ts";
import { RequiredCheckbox, RequiredGroup } from "./__fixtures__/required.fixture.tsx";

afterEach(cleanup);

/** What the hidden inputs say is wrong, once the rules have run. */
async function problems(container: HTMLElement): Promise<string[]> {
  await mounted();
  flush();
  await mounted();

  return [...container.querySelectorAll<HTMLInputElement>("input")]
    .map((input) => input.validationMessage)
    .filter((message) => message !== "");
}

function form(container: HTMLElement): HTMLFormElement {
  const found = container.querySelector("form");

  return required(found, "the form");
}

it("an unticked required checkbox asks to be ticked", async () => {
  const unticked = render(() => <RequiredCheckbox />);
  expect(await problems(unticked.container)).toStrictEqual([M.requiredTick]);
  cleanup();
  const ticked = render(() => <RequiredCheckbox defaultChecked />);
  expect(await problems(ticked.container)).toStrictEqual([]);
});

it("a required checkbox stops asking once it is ticked", async () => {
  const view = render(() => <RequiredCheckbox />);
  expect(await problems(view.container)).toStrictEqual([M.requiredTick]);
  fireEvent.click(screen.getByRole("checkbox", { name: "Terms" }));
  expect(await problems(view.container)).toStrictEqual([]);
});

it("a required checkbox group asks for a pick until one is checked", async () => {
  const empty = render(() => <RequiredGroup defaultValue={[]} />);
  expect(await problems(empty.container)).toStrictEqual([M.requiredChoice]);
  cleanup();
  const picked = render(() => <RequiredGroup defaultValue={["sms"]} />);
  expect(await problems(picked.container)).toStrictEqual([]);
});

it("a pick in a required group answers it, and the group element never takes `required`", async () => {
  const view = render(() => <RequiredGroup defaultValue={[]} />);
  expect(await problems(view.container)).toStrictEqual([M.requiredChoice]);
  expect(form(view.container).checkValidity()).toBe(false);
  fireEvent.click(screen.getByRole("checkbox", { name: "SMS" }));
  expect(await problems(view.container)).toStrictEqual([]);
  expect(form(view.container).checkValidity()).toBe(true);
  expect(screen.getByRole("group", { name: "Channels" }).hasAttribute("required")).toBe(false);
});
