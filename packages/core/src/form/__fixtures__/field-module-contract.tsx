import { render, screen } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { createForm } from "@tanstack/solid-form";
import { expect, it } from "vitest";

import { mounted } from "../../test/dom.ts";
import { type FieldModule, Form, type RootProps } from "../index.ts";
import { errorTexts, submit } from "./form-testing.ts";

// The contract every field module keeps, for a control field's own test file:
//
//     testFieldModule({ module: switchField, Control: switchField.Control, empty: false, value: true });
//
// Each test renders the module's Root, Label, Control and Error in a Form of one field.

/** What `testFieldModule` checks a module with. */
export type FieldModuleContract<TValue> = {
  /** The module under test. */
  module: FieldModule<TValue>;
  /** Its Control, rendered with no props. */
  Control: (props: { class?: string }) => JSX.Element;
  /** A value the field starts from; the read-only View shows it. */
  value: TValue;
  /** The text the View shows for `value`. */
  shown: string;
};

/** What a contract Root takes: the contract's one field. */
export type ContractRootProps = RootProps<{ answer: unknown }, "answer">;

/**
 * A module whose Root takes options, or whose value the contract can't name, as the contract takes
 * it: the contract renders a field of `unknown`.
 */
export function asContract<TValue>(module: object): FieldModule<TValue> {
  return module /* rendered against the contract's own field of unknown */ as FieldModule<TValue>;
}

/** The label every contract test gives the field. */
export const CONTRACT_LABEL = "Answer";

/** The error the contract's field always has. */
export const CONTRACT_ERROR = "Never right.";

/** Renders the module's field in a Form, read-only or not, its value always invalid. */
function renderField<TValue>(contract: FieldModuleContract<TValue>, isReadOnly: boolean): HTMLElement {
  const { Control } = contract;
  // The Root's name check is a type over the form's values; here they are the contract's own.
  const module = contract.module /* checked by the wrapper's value, not here */ as FieldModule<unknown>;

  return render(() => {
    const form = createForm(() => ({ defaultValues: { answer: contract.value as unknown } }));

    return (
      <Form form={form} readOnly={isReadOnly}>
        <module.Root form={form} name="answer" validators={{ onSubmit: () => CONTRACT_ERROR }}>
          <module.Label>{CONTRACT_LABEL}</module.Label>
          <Control />
          <module.Error />
        </module.Root>
      </Form>
    );
  }).container;
}

/** Registers the contract's tests for one field module, each titled by the module's name. */
export function testFieldModule<TValue>(contract: FieldModuleContract<TValue>): void {
  const name = contract.module.name;

  it(`${name} shows its error after a submit and marks its field invalid`, async () => {
    const container = renderField(contract, false);
    await mounted();
    expect(errorTexts(container)).toStrictEqual([]);
    await submit(container);
    expect(errorTexts(container)).toStrictEqual([CONTRACT_ERROR]);
    expect(container.querySelector("[data-slot=field]")?.hasAttribute("data-invalid")).toBe(true);
    expect(container.querySelector('[aria-invalid="true"]')).not.toBeNull();
  });

  it(`${name} renders its View in a read-only Form`, async () => {
    const container = renderField(contract, true);
    await mounted();
    expect(container.querySelector("[data-slot=view]")?.textContent).toBe(contract.shown);
  });

  it(`${name}.Label sits outside its Root and throws, naming the module`, () => {
    expect(() => render(() => <contract.module.Label>{CONTRACT_LABEL}</contract.module.Label>)).toThrow(
      `${name}.Label must sit inside ${name}.Root.`,
    );
    expect(screen.queryByText(CONTRACT_LABEL)).toBeNull();
  });
}
