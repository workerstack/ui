import type { JSX } from "@solidjs/web";
import { Field, FieldError, FieldLabel } from "@workerstack/ui/field";
import { Switch, SwitchView } from "@workerstack/ui/switch";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";
import { RequiredForm } from "./required-form.tsx";

function Basic(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Off and on">
      <Field name="notifications">
        <FieldLabel>Notifications</FieldLabel>
        <Switch onCheckedChange={(isChecked) => log("Switch", String(isChecked))} />
      </Field>
      <Field name="marketing">
        <FieldLabel>On by default</FieldLabel>
        <Switch defaultChecked />
      </Field>
    </Example>
  );
}

function States(): JSX.Element {
  return (
    <Example align="start" label="Disabled, invalid">
      <Field disabled>
        <FieldLabel>Disabled off</FieldLabel>
        <Switch />
      </Field>
      <Field disabled>
        <FieldLabel>Disabled on</FieldLabel>
        <Switch defaultChecked />
      </Field>
      <Field invalid>
        <FieldLabel>Invalid</FieldLabel>
        <Switch />
        <FieldError>This must be on.</FieldError>
      </Field>
    </Example>
  );
}

function Variants(): JSX.Element {
  return (
    <Example align="start" label="Small, read-only, view">
      <Field>
        <FieldLabel>Small</FieldLabel>
        <Switch size="sm" defaultChecked />
      </Field>
      <Field>
        <FieldLabel>Read-only</FieldLabel>
        <Switch readOnly defaultChecked />
      </Field>
      <Field>
        <FieldLabel>View on</FieldLabel>
        <SwitchView value />
      </Field>
      <Field>
        <FieldLabel>View off</FieldLabel>
        <SwitchView value={false} />
      </Field>
    </Example>
  );
}

function Required(): JSX.Element {
  return (
    <RequiredForm>
      <Field name="confirm" required>
        <FieldLabel>Confirm</FieldLabel>
        <Switch required />
        <FieldError />
      </Field>
    </RequiredForm>
  );
}

/** A control that turns a setting on or off. */
export function Switches(): JSX.Element {
  return (
    <Section id="switch" title="Switch" description="A control that turns a setting on or off.">
      <Basic />
      <States />
      <Variants />
      <Required />
    </Section>
  );
}
