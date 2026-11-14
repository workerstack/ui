import { For } from "solid-js";

import { Checkbox, CheckboxGroup, type CheckboxGroupProps } from "../index.ts";

/** The toppings a ToppingsGroup offers, as `[value, label]`. */
export const toppings = [
  ["cheese", "Cheese"],
  ["ham", "Ham"],
  ["olive", "Olive"],
] as const;

/** What ToppingsGroup takes: every CheckboxGroup prop except its children. */
export type ToppingsGroupProps = Omit<CheckboxGroupProps, "children"> & {
  /** Adds an "All" checkbox that checks and unchecks the rest. */
  withParent?: boolean;
};

/** A group of labelled topping checkboxes, with an optional "All" parent. */
export function ToppingsGroup(props: ToppingsGroupProps) {
  return (
    <CheckboxGroup {...props} aria-label="Toppings">
      {props.withParent ? (
        <label>
          <Checkbox parent />
          All
        </label>
      ) : null}
      <For each={toppings}>
        {(topping) => (
          <label>
            <Checkbox value={topping[0]} />
            {topping[1]}
          </label>
        )}
      </For>
    </CheckboxGroup>
  );
}
