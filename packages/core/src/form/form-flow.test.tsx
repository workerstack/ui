import { cleanup, render, screen } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { createForm } from "@tanstack/solid-form";
import { createSignal } from "solid-js";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted } from "../test/dom.ts";
import { deferred, errorTexts, settle, submit, typeInto } from "./__fixtures__/form-testing.ts";
import { formText } from "./__fixtures__/form-text.fixture.tsx";
import { type Account, AccountForm, requiredText } from "./__fixtures__/form.fixture.tsx";
import { ERROR_REVEAL_CONTEXT, Form, SubmitButton, useFormReveal, useSubmitGuard } from "./index.ts";

afterEach(cleanup);

function box(name: string): HTMLInputElement {
  return inputElement(screen.getByRole("textbox", { name }));
}

/** Fields kept hidden until a reveal handler shows them, as a closed section does. */
function Hidden(props: { children: JSX.Element }): JSX.Element {
  const [isHidden, setHidden] = createSignal(true, { ownedWrite: true });

  useFormReveal((element) => {
    if (element.closest("[hidden]") === null) return false;
    setHidden(false);

    return true;
  });

  return (
    <div data-testid="hidden" hidden={isHidden()}>
      {props.children}
    </div>
  );
}

/** A submit guard whose answer the test sets. */
function GuardFixture(props: { allows: () => boolean }): JSX.Element {
  useSubmitGuard(() => props.allows());

  return <span hidden data-testid="guard" />;
}

/** An async check that answers "Taken." once `answer` resolves. */
function takenOnceResolved(answer: Promise<void>): () => Promise<string> {
  return async () => {
    await answer;

    return "Taken.";
  };
}

it("Form reveals a hidden invalid field through useFormReveal, then focuses it", async () => {
  const { container } = render(() => {
    const form = createForm(() => ({ defaultValues: { code: "" } }));

    return (
      <Form form={form}>
        <Hidden>
          <formText.Root form={form} name="code" validators={{ onChange: requiredText("Need a code.") }}>
            <formText.Label>Code</formText.Label>
            <formText.Control />
          </formText.Root>
        </Hidden>
      </Form>
    );
  });

  await mounted();
  await submit(container);
  expect(screen.getByTestId("hidden").hidden).toBe(false);
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Code" }));
});

it("Form runs submit guards first; one returning false stops the submit", async () => {
  const sent = vi.fn<(values: Account) => void>();
  const [allows, setAllows] = createSignal(false, { ownedWrite: true });
  const defaults = { email: "ada@example.com", name: "Ada" };

  const { container } = render(() => (
    <AccountForm defaults={defaults} onSubmit={sent}>
      <GuardFixture allows={allows} />
    </AccountForm>
  ));

  await mounted();
  await submit(container);
  expect(sent).not.toHaveBeenCalled();
  setAllows(true);
  await submit(container);
  expect(sent).toHaveBeenCalledTimes(1);
});

it("Form shows the errors of early-revealed fields before any submit, and no others", async () => {
  const { container } = render(() => (
    <ERROR_REVEAL_CONTEXT value={(name: string) => name === "email"}>
      <AccountForm />
    </ERROR_REVEAL_CONTEXT>
  ));

  await mounted();
  typeInto(box("Name"), "x");
  typeInto(box("Email"), "x");
  typeInto(box("Name"), "");
  typeInto(box("Email"), "");
  await settle();
  expect(errorTexts(container)).toStrictEqual(["Enter your email."]);
});

it("formText.Error says it is checking while an async check runs, then shows its result", async () => {
  const check = deferred();
  const taken = takenOnceResolved(check.promise);

  const { container } = render(() => {
    const form = createForm(() => ({ defaultValues: { handle: "ada" } }));

    return (
      <Form form={form}>
        <formText.Root form={form} name="handle" validators={{ onChangeAsync: taken, onSubmitAsync: taken }}>
          <formText.Label>Handle</formText.Label>
          <formText.Control />
          <formText.Error />
        </formText.Root>
        <SubmitButton>Save</SubmitButton>
      </Form>
    );
  });

  await mounted();
  const done = submit(container);
  await settle();
  expect(container.querySelector("[data-slot=field-checking]")?.textContent).toContain("Checking…");
  expect(container.querySelector("[data-slot=button]")?.getAttribute("aria-busy")).toBe("true");
  check.resolve();
  await done;
  await settle();
  expect(errorTexts(container)).toStrictEqual(["Taken."]);
});
