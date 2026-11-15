import { renderServer, tag, tags, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { PlanGroup } from "./__fixtures__/plan-group.fixture.tsx";

// First in the file: Solid warns once per kind of write per process.
it("RadioGroup on the server renders without warnings", () => {
  const { warnings } = renderServer(() => <PlanGroup defaultValue="pro" />);

  expect(warnings).toStrictEqual([]);
});

it("RadioGroup on the server renders a radiogroup named by its label", () => {
  const { html } = renderServer(() => <PlanGroup />);

  const group = tag(html, { "data-slot": "radio-group" });
  expect(group.attrs.role).toBe("radiogroup");
  expect(group.attrs["aria-labelledby"]).toBe(tag(html, { "data-slot": "field-label" }).attrs.id);
  expect(group.attrs.class).toContain("grid gap-3");
  expect(text(html)).toContain("Free");
});

it("RadioGroup on the server renders the selected radio checked, and the others not", () => {
  const { html } = renderServer(() => <PlanGroup defaultValue="pro" />);

  const radios = tags(html, { "data-slot": "radio" });
  expect(radios.map((radio) => radio.attrs["aria-checked"])).toStrictEqual(["false", "true", "false"]);
  expect(radios.map((radio) => radio.attrs.role)).toStrictEqual(["radio", "radio", "radio"]);
  expect(radios.map((radio) => radio.attrs.tabindex)).toStrictEqual(["-1", "0", "-1"]);
  expect(radios[1]?.attrs).toHaveProperty("data-checked");
  expect(radios[0]?.attrs).toHaveProperty("data-unchecked");
});

it("RadioGroup on the server renders the dot only in the selected radio", () => {
  const { html } = renderServer(() => <PlanGroup defaultValue="pro" />);

  expect(tags(html, { "data-slot": "radio-indicator" })).toHaveLength(1);
});

it("RadioGroup on the server renders no radio checked and a first tab stop without a value", () => {
  const { html } = renderServer(() => <PlanGroup />);

  const radios = tags(html, { "data-slot": "radio" });
  expect(radios.map((radio) => radio.attrs["aria-checked"])).toStrictEqual(["false", "false", "false"]);
  expect(radios.map((radio) => radio.attrs.tabindex)).toStrictEqual(["0", "-1", "-1"]);
  expect(tags(html, { "data-slot": "radio-indicator" })).toStrictEqual([]);
});

it("RadioGroup on the server renders a disabled option as disabled", () => {
  const { html } = renderServer(() => <PlanGroup proDisabled />);

  const radios = tags(html, { "data-slot": "radio" });
  expect(radios[1]?.attrs).toHaveProperty("data-disabled");
  expect(radios[0]?.attrs).not.toHaveProperty("data-disabled");
});
