import { renderServer, tag, tags } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { AddonGroup, BlockGroup } from "./__fixtures__/input-group.fixture.tsx";

it("InputGroup on the server renders its addons around the input", () => {
  const { html, warnings } = renderServer(() => <AddonGroup />);

  expect(tags(html, { "data-slot": "input-group-addon" }).map((addon) => addon.attrs["data-align"])).toStrictEqual([
    "inline-start",
    "inline-end",
  ]);
  expect(tag(html, { "data-slot": "input" }).attrs.value).toBe("12");
  expect(html).toContain("Copy");
  expect(warnings).toStrictEqual([]);
});

it("InputGroup on the server renders block addons around a textarea", () => {
  const { html } = renderServer(() => <BlockGroup />);

  expect(tags(html, { "data-slot": "input-group-addon" }).map((addon) => addon.attrs["data-align"])).toStrictEqual([
    "block-start",
    "block-end",
  ]);
  expect(tag(html, { "data-slot": "textarea" }).name).toBe("textarea");
});
