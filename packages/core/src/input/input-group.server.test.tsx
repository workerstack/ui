import { expect, it } from "vitest";

import { renderServer, slot, slots } from "../test/server.ts";
import { AddonGroup, BlockGroup } from "./__fixtures__/input-group.fixture.tsx";

it("InputGroup on the server renders its addons around the input", () => {
  const { html, warnings } = renderServer(() => <AddonGroup />);

  expect(slots(html, "input-group-addon").map((addon) => addon.attrs["data-align"])).toStrictEqual([
    "inline-start",
    "inline-end",
  ]);
  expect(slot(html, "input").attrs.value).toBe("12");
  expect(html).toContain("Copy");
  expect(warnings).toStrictEqual([]);
});

it("InputGroup on the server renders block addons around a textarea", () => {
  const { html } = renderServer(() => <BlockGroup />);

  expect(slots(html, "input-group-addon").map((addon) => addon.attrs["data-align"])).toStrictEqual([
    "block-start",
    "block-end",
  ]);
  expect(slot(html, "textarea").name).toBe("textarea");
});
