import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../../test/dom.ts";
import { ToastDemo } from "./__fixtures__/toast-demo.fixture.tsx";
import { TranslatedToastDemo } from "./__fixtures__/translated-toast-demo.fixture.tsx";

afterEach(cleanup);

/** The text a screen reader hears from UI SDK's live regions. */
function announced(): string {
  return [...document.querySelectorAll("[aria-live]")].map((el) => el.textContent).join(" ");
}

/** Mounts the demo and presses one of its buttons. */
async function press(name: string, element = <ToastDemo />): Promise<void> {
  render(() => element);
  await mounted();
  fireEvent.click(screen.getByRole("button", { name }));
}

it("Toast shows a title and description in a labelled notifications region", async () => {
  render(() => <ToastDemo />);
  await mounted();
  expect(screen.queryByRole("region")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  const region = await screen.findByRole("region", { name: "Notifications" });
  expect(region.textContent).toContain("Saved");
  expect(region.textContent).toContain("Your changes are stored.");
});

it("Toast announces a toast politely and an error assertively", async () => {
  await press("Save");
  await vi.waitFor(() => expect(document.querySelector('[aria-live="polite"]')?.textContent).toContain("Saved"));
  fireEvent.click(screen.getByRole("button", { name: "Fail" }));
  await vi.waitFor(() =>
    expect(document.querySelector('[aria-live="assertive"]')?.textContent).toContain("Upload failed"),
  );
  expect(announced()).toContain("Upload failed");
});

it("Toast runs its action and closes", async () => {
  const onUndo = vi.fn<() => void>();
  await press("Save", <ToastDemo onUndo={onUndo} />);
  fireEvent.click(await screen.findByRole("button", { name: "Undo" }));
  expect(onUndo).toHaveBeenCalledTimes(1);
  await vi.waitFor(() => expect(screen.queryByText("Saved")).toBeNull());
});

it("Toast closes from its × button named Close", async () => {
  await press("Save");
  fireEvent.click(await screen.findByRole("button", { name: "Close" }));
  await vi.waitFor(() => expect(screen.queryByText("Saved")).toBeNull());
});

it("Toast names its × from the provider's close message", async () => {
  await press("Save", <TranslatedToastDemo messages={{ close: "Zatvori" }} />);
  expect(await screen.findByRole("button", { name: "Zatvori" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
});

it("Toast dismisses itself after its duration", async () => {
  await press("Save", <ToastDemo duration={150} />);
  expect(await screen.findByText("Saved")).toBeTruthy();
  await vi.waitFor(() => expect(screen.queryByText("Saved")).toBeNull(), { timeout: 2000 });
});

it("Toast turns a promise into a loading toast that ends as a success toast", async () => {
  await press("Work");
  await vi.waitFor(() => expect(screen.queryByText("Finished")).not.toBeNull());
  expect(screen.queryByText("Working")).toBeNull();
});
