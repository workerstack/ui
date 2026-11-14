import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { mounted } from "../test/dom.ts";
import { NotifySwitch, type NotifySwitchProps } from "./__fixtures__/notify-switch.fixture.tsx";

afterEach(cleanup);

it("Switch is a switch named by its Field label", async () => {
  render(() => <NotifySwitch />);
  await mounted();
  const control = screen.getByRole("switch", { name: "Notifications" });
  expect(control.getAttribute("aria-checked")).toBe("false");
  expect(control.getAttribute("data-slot")).toBe("switch");
});

it("Switch toggles when its Field label is clicked", async () => {
  const onCheckedChange = vi.fn<NonNullable<NotifySwitchProps["onCheckedChange"]>>();
  render(() => <NotifySwitch onCheckedChange={onCheckedChange} />);
  await mounted();
  fireEvent.click(screen.getByText("Notifications"));
  await vi.waitFor(() => expect(onCheckedChange).toHaveBeenCalledTimes(1));
  expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true);
  expect(screen.getByRole("switch", { name: "Notifications" }).getAttribute("aria-checked")).toBe("true");
});

it("Switch toggles with Space and reports each change", async () => {
  const onCheckedChange = vi.fn<NonNullable<NotifySwitchProps["onCheckedChange"]>>();
  render(() => <NotifySwitch defaultChecked onCheckedChange={onCheckedChange} />);
  await mounted();
  const control = screen.getByRole("switch", { name: "Notifications" });
  control.focus();
  await userEvent.keyboard(" ");
  await vi.waitFor(() => expect(onCheckedChange).toHaveBeenCalledTimes(1));
  expect(onCheckedChange.mock.calls[0]?.[0]).toBe(false);
  expect(control.getAttribute("aria-checked")).toBe("false");
});

it("Switch starts on with defaultChecked and carries the checked state", async () => {
  render(() => <NotifySwitch defaultChecked />);
  await mounted();
  const control = screen.getByRole("switch", { name: "Notifications" });
  expect(control.getAttribute("aria-checked")).toBe("true");
  expect(control.hasAttribute("data-checked")).toBe(true);
  expect(control.querySelector('[data-slot="switch-thumb"]')?.hasAttribute("data-checked")).toBe(true);
});

it("Switch ignores clicks and keys while disabled", async () => {
  const onCheckedChange = vi.fn<NonNullable<NotifySwitchProps["onCheckedChange"]>>();
  render(() => <NotifySwitch disabled onCheckedChange={onCheckedChange} />);
  await mounted();
  const control = screen.getByRole("switch", { name: "Notifications" });
  expect(control.hasAttribute("data-disabled")).toBe(true);
  fireEvent.click(control);
  fireEvent.click(screen.getByText("Notifications"));
  await userEvent.keyboard(" ");
  await mounted();
  expect(onCheckedChange).not.toHaveBeenCalled();
  expect(control.getAttribute("aria-checked")).toBe("false");
});

it("Switch merges a consumer class after its own", async () => {
  render(() => <NotifySwitch class="w-12" />);
  await mounted();
  const { className } = screen.getByRole("switch", { name: "Notifications" });
  expect(className).toContain("w-12");
  expect(className).not.toContain("w-8");
});
