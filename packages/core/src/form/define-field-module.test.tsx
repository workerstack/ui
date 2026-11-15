import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { createForm, useStore } from "@tanstack/solid-form";
import { Errored } from "solid-js";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted } from "../test/dom.ts";
import { testFieldModule } from "./__fixtures__/field-module-contract.tsx";
import { settle, userSteps } from "./__fixtures__/form-testing.ts";
import { formText } from "./__fixtures__/form-text.fixture.tsx";
import { defineFieldModule, Form } from "./index.ts";

afterEach(cleanup);

testFieldModule({ Control: formText.Control, module: formText, shown: "Ada", value: "Ada" });

const other = defineFieldModule<string>({ empty: "", name: "FormOther" });

/** A FormOther part inside a FormText Root. */
function MixedParts(): JSX.Element {
  const form = createForm(() => ({ defaultValues: { name: "" } }));

  return (
    <formText.Root form={form} name="name">
      <other.Label>Name</other.Label>
    </formText.Root>
  );
}

it("defineFieldModule throws when a part sits inside another module's Root, naming both", async () => {
  // The part renders inside the Field, after the render call returns; a boundary catches its error.
  render(() => <Errored fallback={(error) => <p role="alert">{String(error())}</p>}>{<MixedParts />}</Errored>);
  await mounted();
  expect(screen.getByRole("alert").textContent).toContain("FormOther.Label sits inside FormText.Root");
});

it("formText.Control feeds the field's value, writes it, and still calls its own onBlur", async () => {
  const onBlur = vi.fn<() => void>();
  render(() => {
    const form = createForm(() => ({ defaultValues: { name: "Ada" } }));
    const stored = useStore(form.store, (state) => state.values.name);

    return (
      <Form form={form}>
        <formText.Root form={form} name="name">
          <formText.Label>Name</formText.Label>
          <formText.Control onBlur={onBlur} />
          <span data-testid="stored">{stored()}</span>
        </formText.Root>
      </Form>
    );
  });
  await mounted();
  const box = inputElement(screen.getByRole("textbox", { name: "Name" }));
  expect(box.value).toBe("Ada");
  userSteps(
    () => fireEvent.input(box, { target: { value: " Grace " } }),
    () => fireEvent.blur(box),
  );
  await settle();
  expect(screen.getByTestId("stored").textContent).toBe("Grace");
  expect(onBlur).toHaveBeenCalledTimes(1);
});

it("formText.Root read-only on its own renders the View while the form stays editable", async () => {
  const { container } = render(() => {
    const form = createForm(() => ({ defaultValues: { name: "Ada" } }));

    return (
      <Form form={form}>
        <formText.Root form={form} name="name" readOnly>
          <formText.Label>Name</formText.Label>
          <formText.Control />
        </formText.Root>
      </Form>
    );
  });

  await mounted();
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(container.querySelector("[data-slot=view]")?.textContent).toBe("Ada");
});
