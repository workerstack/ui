import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../../test/dom.ts";
import { ProjectTabs, type ProjectTabsProps } from "./__fixtures__/project-tabs.fixture.tsx";

afterEach(cleanup);

type OnValueChange = NonNullable<ProjectTabsProps["onValueChange"]>;

function tab(name: string): HTMLElement {
  return screen.getByRole("tab", { name });
}

it("Tabs renders a tablist with tabs and the selected tab's panel", async () => {
  render(() => <ProjectTabs />);
  await mounted();
  expect(screen.getByRole("tablist", { name: "Project" })).toBeTruthy();
  expect(screen.getAllByRole("tab").map((el) => el.textContent)).toStrictEqual([
    "Overview",
    "Billing",
    "Archive",
    "Settings",
  ]);
  expect(tab("Overview").getAttribute("aria-selected")).toBe("true");
  expect(tab("Billing").getAttribute("aria-selected")).toBe("false");
  const panel = screen.getByRole("tabpanel");
  expect(panel.textContent).toBe("Overview content");
  expect(panel.getAttribute("aria-labelledby")).toBe(tab("Overview").id);
  expect(tab("Overview").getAttribute("aria-controls")).toBe(panel.id);
});

it("Tabs selects a tab on click and swaps the panel", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <ProjectTabs onValueChange={onValueChange} />);
  await mounted();
  fireEvent.click(tab("Billing"));
  await vi.waitFor(() => expect(screen.getByRole("tabpanel").textContent).toBe("Billing content"));
  expect(tab("Billing").getAttribute("aria-selected")).toBe("true");
  expect(tab("Overview").getAttribute("aria-selected")).toBe("false");
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenLastCalledWith("billing", expect.anything());
});

it("Tabs starts on `defaultValue`", async () => {
  render(() => <ProjectTabs defaultValue="settings" />);
  await mounted();
  expect(tab("Settings").getAttribute("aria-selected")).toBe("true");
  expect(screen.getByRole("tabpanel").textContent).toBe("Settings content");
});

it("Tabs has one tab stop: the selected tab", async () => {
  render(() => <ProjectTabs defaultValue="billing" />);
  await mounted();
  const stops = screen.getAllByRole("tab").filter((el) => el.tabIndex === 0);
  expect(stops).toStrictEqual([tab("Billing")]);
});

it("Tabs arrow keys move focus and select the tab they land on", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <ProjectTabs onValueChange={onValueChange} />);
  await mounted();
  tab("Overview").focus();
  fireEvent.keyDown(tab("Overview"), { key: "ArrowRight" });
  await vi.waitFor(() => expect(tab("Billing").getAttribute("aria-selected")).toBe("true"));
  expect(document.activeElement).toBe(tab("Billing"));
  expect(onValueChange).toHaveBeenLastCalledWith("billing", expect.anything());
});

// UI SDK 0.1.0-beta.2 leaves a disabled tab focusable (it is `aria-disabled`, as the ARIA guide
// allows): an arrow key lands on it without selecting it, and the next arrow moves on.
it("Tabs arrow keys focus a disabled tab without selecting it and move past it", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <ProjectTabs defaultValue="billing" onValueChange={onValueChange} />);
  await mounted();
  tab("Billing").focus();
  fireEvent.keyDown(tab("Billing"), { key: "ArrowRight" });
  await vi.waitFor(() => expect(document.activeElement).toBe(tab("Archive")));
  expect(tab("Billing").getAttribute("aria-selected")).toBe("true");
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.keyDown(tab("Archive"), { key: "ArrowRight" });
  await vi.waitFor(() => expect(tab("Settings").getAttribute("aria-selected")).toBe("true"));
  expect(onValueChange.mock.calls.map((call) => call[0])).toStrictEqual(["settings"]);
});

it("Tabs Home and End select the first and last enabled tab", async () => {
  render(() => <ProjectTabs defaultValue="billing" />);
  await mounted();
  tab("Billing").focus();
  fireEvent.keyDown(tab("Billing"), { key: "End" });
  await vi.waitFor(() => expect(tab("Settings").getAttribute("aria-selected")).toBe("true"));
  fireEvent.keyDown(tab("Settings"), { key: "Home" });
  await vi.waitFor(() => expect(tab("Overview").getAttribute("aria-selected")).toBe("true"));
});

it("Tabs arrow keys wrap around at the ends", async () => {
  render(() => <ProjectTabs />);
  await mounted();
  tab("Overview").focus();
  fireEvent.keyDown(tab("Overview"), { key: "ArrowLeft" });
  await vi.waitFor(() => expect(tab("Settings").getAttribute("aria-selected")).toBe("true"));
});

it("Tabs does not select a disabled tab on click", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <ProjectTabs onValueChange={onValueChange} />);
  await mounted();
  fireEvent.click(tab("Archive"));
  await mounted();
  expect(tab("Archive").hasAttribute("data-disabled")).toBe(true);
  expect(tab("Archive").getAttribute("aria-selected")).toBe("false");
  expect(onValueChange).not.toHaveBeenCalled();
});

it("Tabs with manual activation moves focus on arrows and selects on press", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <ProjectTabs activation="manual" onValueChange={onValueChange} />);
  await mounted();
  tab("Overview").focus();
  fireEvent.keyDown(tab("Overview"), { key: "ArrowRight" });
  await vi.waitFor(() => expect(document.activeElement).toBe(tab("Billing")));
  expect(tab("Overview").getAttribute("aria-selected")).toBe("true");
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.click(tab("Billing"));
  await vi.waitFor(() => expect(tab("Billing").getAttribute("aria-selected")).toBe("true"));
  expect(onValueChange).toHaveBeenLastCalledWith("billing", expect.anything());
});

it("Tabs vertical orientation moves with the up and down arrows", async () => {
  render(() => <ProjectTabs orientation="vertical" />);
  await mounted();
  expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe("vertical");
  tab("Overview").focus();
  fireEvent.keyDown(tab("Overview"), { key: "ArrowRight" });
  await mounted();
  expect(tab("Overview").getAttribute("aria-selected")).toBe("true");
  fireEvent.keyDown(tab("Overview"), { key: "ArrowDown" });
  await vi.waitFor(() => expect(tab("Billing").getAttribute("aria-selected")).toBe("true"));
});
