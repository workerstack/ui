import { expect, it } from "vitest";

import { renderServer, slot, text } from "../test/server.ts";
import { NotifySwitch } from "./__fixtures__/notify-switch.fixture.tsx";

// First in the file: Solid warns once per kind of write per process.
it("Switch on the server renders without warnings", () => {
  const { warnings } = renderServer(() => <NotifySwitch defaultChecked />);

  expect(warnings).toStrictEqual([]);
});

it("Switch on the server renders an off, labelled switch with its thumb", () => {
  const { html } = renderServer(() => <NotifySwitch />);

  const control = slot(html, "switch");
  expect(control.attrs.role).toBe("switch");
  expect(control.attrs["aria-checked"]).toBe("false");
  expect(control.attrs).not.toHaveProperty("data-checked");
  expect(control.attrs["aria-labelledby"]).toBe(slot(html, "field-label").attrs.id);
  expect(slot(html, "switch-thumb").attrs).not.toHaveProperty("data-checked");
  expect(text(html)).toContain("Notifications");
});

it("Switch on the server renders the checked state on the switch, thumb and form input", () => {
  const { html } = renderServer(() => <NotifySwitch defaultChecked />);

  expect(slot(html, "switch").attrs["aria-checked"]).toBe("true");
  expect(slot(html, "switch").attrs).toHaveProperty("data-checked");
  expect(slot(html, "switch-thumb").attrs).toHaveProperty("data-checked");
});

it("Switch on the server renders the disabled state", () => {
  const { html } = renderServer(() => <NotifySwitch disabled />);

  expect(slot(html, "switch").attrs).toHaveProperty("data-disabled");
});
