import { renderServer, tag, text } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { NotifySwitch } from "./__fixtures__/notify-switch.fixture.tsx";

// First in the file: Solid warns once per kind of write per process.
it("Switch on the server renders without warnings", () => {
  const { warnings } = renderServer(() => <NotifySwitch defaultChecked />);

  expect(warnings).toStrictEqual([]);
});

it("Switch on the server renders an off, labelled switch with its thumb", () => {
  const { html } = renderServer(() => <NotifySwitch />);

  const control = tag(html, { "data-slot": "switch" });
  expect(control.attrs.role).toBe("switch");
  expect(control.attrs["aria-checked"]).toBe("false");
  expect(control.attrs).not.toHaveProperty("data-checked");
  expect(control.attrs["aria-labelledby"]).toBe(tag(html, { "data-slot": "field-label" }).attrs.id);
  expect(tag(html, { "data-slot": "switch-thumb" }).attrs).not.toHaveProperty("data-checked");
  expect(text(html)).toContain("Notifications");
});

it("Switch on the server renders the checked state on the switch, thumb and form input", () => {
  const { html } = renderServer(() => <NotifySwitch defaultChecked />);

  expect(tag(html, { "data-slot": "switch" }).attrs["aria-checked"]).toBe("true");
  expect(tag(html, { "data-slot": "switch" }).attrs).toHaveProperty("data-checked");
  expect(tag(html, { "data-slot": "switch-thumb" }).attrs).toHaveProperty("data-checked");
});

it("Switch on the server renders the disabled state", () => {
  const { html } = renderServer(() => <NotifySwitch disabled />);

  expect(tag(html, { "data-slot": "switch" }).attrs).toHaveProperty("data-disabled");
});
