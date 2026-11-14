import { cleanup, render, screen } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { afterEach, expect, it } from "vitest";

import { UiProvider } from "../provider/index.ts";
import { AddonGroup, BlockGroup } from "./__fixtures__/input-group.fixture.tsx";
import { InputGroupView, InputGroupTextareaView, InputView } from "./index.ts";

afterEach(cleanup);

function outputText(code: () => JSX.Element): string | null | undefined {
  return render(() => <UiProvider>{code()}</UiProvider>).container.querySelector("output")?.textContent;
}

it("InputGroup puts addons on their side of the input", () => {
  const view = render(() => <AddonGroup />);
  const addons = [...view.container.querySelectorAll("[data-slot=input-group-addon]")];
  expect(addons.map((addon) => addon.getAttribute("data-align"))).toStrictEqual(["inline-start", "inline-end"]);
  expect(addons[0]?.className).toContain("order-first");
  expect(addons[1]?.className).toContain("order-last");
});

it("InputGroup names its parts and keeps the input a textbox", () => {
  const view = render(() => <BlockGroup />);
  expect(screen.getByRole("textbox", { name: "Notes" }).tagName).toBe("TEXTAREA");
  expect(screen.getByRole("button", { name: "Send" }).className).toContain("h-8");
  expect(view.container.querySelectorAll("[data-align=block-start],[data-align=block-end]")).toHaveLength(2);
});

it("InputGroup views show the input's and the textarea's text", () => {
  expect(outputText(() => <InputGroupView text="acme" />)).toBe("acme");
  expect(outputText(() => <InputGroupTextareaView text="" />)).toBe("—");
});

it("InputView shows its text or the empty marker", () => {
  expect(outputText(() => <InputView text="Ada" />)).toBe("Ada");
  expect(outputText(() => <InputView text={null} />)).toBe("—");
});
