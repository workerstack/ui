import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { required } from "../../test/required.ts";
import { UI_MESSAGES_EN as M } from "../provider/index.ts";
import { RequiredSwitch } from "./__fixtures__/required.fixture.tsx";

afterEach(cleanup);

function switchInput(container: HTMLElement): HTMLInputElement {
  return required(container.querySelector("input"), "the switch's input");
}

it("an off required switch asks to be turned on, and stops once it is", async () => {
  const view = render(() => <RequiredSwitch />);
  await vi.waitFor(() => expect(switchInput(view.container).validationMessage).toBe(M.requiredTick));
  fireEvent.click(screen.getByRole("switch", { name: "Terms" }));
  await vi.waitFor(() => expect(switchInput(view.container).validationMessage).toBe(""));
});

it("an on required switch asks for nothing", async () => {
  const view = render(() => <RequiredSwitch defaultChecked />);
  await vi.waitFor(() => expect(switchInput(view.container).required).toBe(true));
  expect(switchInput(view.container).validationMessage).toBe("");
});
