import type { JSX } from "@solidjs/web";
import { Field, FieldError, FieldLabel } from "@workerstack/ui/field";
import { Switch } from "@workerstack/ui/switch";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

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

/** A control that turns a setting on or off. */
export function Switches(): JSX.Element {
  return (
    <Section id="switch" title="Switch" description="A control that turns a setting on or off.">
      <Basic />
      <States />
    </Section>
  );
}
