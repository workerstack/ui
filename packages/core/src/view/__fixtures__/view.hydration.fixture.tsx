import { Field, FieldLabel } from "../../field/index.ts";
import { BooleanView, ChoiceView, View } from "../index.ts";
import { PRIORITY } from "./priority.fixture.ts";

/** A text view, a yes-or-no view and a colored choice, each under a Field label. */
export function ViewFixture() {
  return (
    <div>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <View text="Ada" />
      </Field>
      <Field>
        <FieldLabel>Active</FieldLabel>
        <BooleanView value />
      </Field>
      <Field>
        <FieldLabel>Priority</FieldLabel>
        <ChoiceView items={PRIORITY} value={["urgent", "normal"]} />
      </Field>
    </div>
  );
}

/** Empty views: the empty marker, in a Field and outside one. */
export function EmptyViewFixture() {
  return (
    <div>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <View text="" />
      </Field>
      <View />
    </div>
  );
}
