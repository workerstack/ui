import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../test/dom.ts";
import { RoleSelect, type RoleSelectProps } from "./__fixtures__/role-select.fixture.tsx";

afterEach(cleanup);

/** Whether `option` shows its selected check. */
function indicated(option: HTMLElement): boolean {
  return option.querySelector('[data-slot="select-item-indicator"]')?.checkVisibility() ?? false;
}

it("Select shows the placeholder in the trigger", async () => {
  render(() => <RoleSelect />);
  await mounted();
  const trigger = screen.getByRole("combobox", { name: "Role" });
  expect(trigger.textContent).toContain("Pick a role");
  expect(trigger.querySelector("[data-placeholder]")?.className).toContain("text-muted-foreground");
});

it("Select picks an item and shows its label", async () => {
  const onValueChange = vi.fn<NonNullable<RoleSelectProps["onValueChange"]>>();
  render(() => <RoleSelect onValueChange={onValueChange} />);
  await mounted();
  const trigger = screen.getByRole("combobox", { name: "Role" });
  fireEvent.click(trigger);
  fireEvent.click(await screen.findByRole("option", { name: "Editor" }));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("editor", expect.anything()));
  await vi.waitFor(() => expect(trigger.textContent).toContain("Editor"));
});

it("Select marks the selected item and shows its check", async () => {
  render(() => <RoleSelect defaultValue="admin" />);
  await mounted();
  fireEvent.click(screen.getByRole("combobox", { name: "Role" }));
  const admin = await screen.findByRole("option", { name: "Admin" });
  expect(admin.getAttribute("aria-selected")).toBe("true");
  await vi.waitFor(() => expect(indicated(admin)).toBe(true));
  expect(indicated(screen.getByRole("option", { name: "Viewer" }))).toBe(false);
});
