import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, expect, it, vi } from "vitest";

import { mounted, type as typeText } from "../../../../test/dom.ts";
import { required } from "../../../../test/required.ts";
import { collectWarnings } from "../../../../test/warnings.ts";
import { settle } from "../form/__fixtures__/form-testing.ts";
import { ProfileDialog, ProfileDrawer, type Profile } from "./__fixtures__/form-dialog.fixture.tsx";

afterEach(cleanup);

/** The dialog on screen, if one is shown. */
function visibleDialog(): HTMLElement | undefined {
  return screen.queryAllByRole("dialog").find((el) => el.checkVisibility());
}

/** The form dialog's window: the one that holds the form. */
function formWindow(): HTMLElement | undefined {
  return screen.queryAllByRole("dialog").find((el) => el.checkVisibility() && el.querySelector("form") !== null);
}

async function open(): Promise<void> {
  await mounted();
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  await vi.waitFor(() => expect(formWindow()).toBeDefined());
  await mounted();
}

function nameBox(): HTMLInputElement {
  return required(formWindow()?.querySelector("input"), "the name box");
}

/** Edits the name, then asks to close with Cancel, which finds the changes and asks to discard. */
async function cancelChanged(): Promise<void> {
  typeText(nameBox(), "Grace");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await vi.waitFor(() => expect(screen.getByText("Discard changes?")).toBeDefined());
}

/** Chooses Discard in the question and waits until the window is gone. */
async function discard(): Promise<void> {
  await cancelChanged();
  fireEvent.click(screen.getByRole("button", { name: "Discard" }));
  await vi.waitFor(() => expect(visibleDialog()).toBeUndefined());
}

/** A save the server refuses: an HTTP error with a message on the name. */
function refuse(): never {
  throw { body: { fields: { name: [{ message: "Too short." }] } }, status: 422 };
}

async function save(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await settle();
}

it("FormDialog and FormDrawer render their triggers without a Solid warning", () => {
  const { warnings } = collectWarnings(() => {
    render(() => (
      <>
        <ProfileDialog />
        <ProfileDrawer />
      </>
    ));
    flush();
  });

  expect(warnings).toStrictEqual([]);
});

it("FormDialog saves the values, closes, and reports the close", async () => {
  const onSubmit = vi.fn<(values: Profile) => void>();
  const onOpenChange = vi.fn<(open: boolean) => void>();
  render(() => <ProfileDialog onSubmit={onSubmit} onOpenChange={onOpenChange} />);
  await open();
  typeText(nameBox(), "Grace");
  await save();
  await vi.waitFor(() => expect(formWindow()).toBeUndefined());
  expect(onSubmit.mock.calls.map(([values]) => values)).toStrictEqual([{ name: "Grace" }]);
  expect(onOpenChange.mock.calls.map(([isOpen]) => isOpen)).toStrictEqual([true, false]);
});

it("FormDialog keeps open and shows a server error on the field", async () => {
  render(() => <ProfileDialog onSubmit={() => ({ name: ["Name is taken."] })} />);
  await open();
  await save();
  expect(formWindow()).toBeDefined();
  expect(screen.getByText("Name is taken.")).toBeDefined();
});

it("FormDialog keeps open and shows an HTTP error thrown by the save", async () => {
  render(() => <ProfileDialog onSubmit={refuse} />);
  await open();
  await save();
  expect(formWindow()).toBeDefined();
  expect(screen.getByText("Too short.")).toBeDefined();
});

it("FormDialog closes on Cancel without asking when nothing changed", async () => {
  render(() => <ProfileDialog />);
  await open();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await vi.waitFor(() => expect(formWindow()).toBeUndefined());
  expect(screen.queryByText("Discard changes?")).toBeNull();
});

it("FormDialog asks to discard when Cancel finds changes, and Keep editing goes back", async () => {
  render(() => <ProfileDialog />);
  await open();
  await cancelChanged();
  fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
  await vi.waitFor(() => expect(screen.queryByText("Discard changes?")).toBeNull());
  expect(nameBox().value).toBe("Grace");
});

it("FormDialog discards the changes and closes, and the next open starts from its values", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  render(() => <ProfileDialog onOpenChange={onOpenChange} />);
  await open();
  await discard();
  expect(onOpenChange.mock.calls.map(([isOpen]) => isOpen)).toStrictEqual([true, false]);
  await open();
  expect(nameBox().value).toBe("Ada");
});

it("FormDrawer saves and closes like the dialog", async () => {
  const onSubmit = vi.fn<(values: Profile) => void>();
  render(() => <ProfileDrawer onSubmit={onSubmit} />);
  await open();
  typeText(nameBox(), "Grace");
  await save();
  await vi.waitFor(() => expect(formWindow()).toBeUndefined());
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

it("FormDrawer asks to discard when closing with changes", async () => {
  render(() => <ProfileDrawer />);
  await open();
  await cancelChanged();
  expect(screen.getByRole("button", { name: "Keep editing" })).toBeDefined();
});
