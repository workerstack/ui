import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { mounted } from "../../test/dom.ts";
import { UI_MESSAGES_EN as M } from "../provider/index.ts";
import {
  RequiredRoleForm,
  RoleSelect,
  SdkReadOnlySelect,
  type RoleSelectProps,
} from "./__fixtures__/role-select.fixture.tsx";

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

it("Select read-only shows its value, says so, and does not open on a click or a key", async () => {
  render(() => <RoleSelect defaultValue="admin" readOnly />);
  await mounted();
  const trigger = screen.getByRole("combobox", { name: "Role" });
  expect(trigger.getAttribute("aria-readonly")).toBe("true");
  expect(trigger.textContent).toContain("Admin");
  fireEvent.click(trigger);

  for (const key of ["ArrowDown", "ArrowUp", "Enter", " "]) fireEvent.keyDown(trigger, { key });
  await mounted();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("Select required and empty shows the UI's message in a FieldError after submit", async () => {
  const view = render(() => <RequiredRoleForm />);
  await mounted();
  expect(view.container.querySelector("[data-slot=field-error]")).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  await vi.waitFor(() =>
    expect(view.container.querySelector("[data-slot=field-error]")?.textContent).toBe(M.requiredField),
  );
});

// UI SDK 0.1.0-beta.2: a read-only select still opens on a click (and on keys), though `readOnly`
// keeps its value from changing. Our Select holds it closed. Drop `.fails` when fixed.
it.fails("UI SDK's read-only Select does not open on a click", async () => {
  render(() => <SdkReadOnlySelect />);
  await mounted();
  const trigger = screen.getByRole("combobox", { name: "Role" });
  fireEvent.click(trigger);
  await mounted();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
