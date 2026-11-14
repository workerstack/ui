import type { JSX } from "@solidjs/web";
import { Select as SdkSelect, SelectContent as SdkContent, SelectItem as SdkItem, SelectTrigger as SdkTrigger, SelectValue as SdkValue } from "@ui-sdk/solid/select";
import { For } from "solid-js";

import { Field, FieldError, FieldLabel } from "../../field/index.ts";
import { Select, type SelectProps, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index.ts";

/** The roles the fixtures pick from. */
export const roles: { value: string; label: string }[] = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

/** A single Select's onValueChange: the selected value (or null) and what changed it. */
type OnValueChange = Extract<
  SelectProps<string, false>["onValueChange"],
  (value: string | null, ...rest: never[]) => void
>;

/** What `RoleSelect` takes. */
export type RoleSelectProps = {
  /** The role chosen at first. */
  defaultValue?: string;
  /** Called with the role picked and what changed it. */
  onValueChange?: OnValueChange;
  /** Shows the value and opens nothing. */
  readOnly?: boolean;
  /** The trigger's height. */
  size?: "default" | "sm";
  /** Whether the popup lines the chosen item up with the trigger; on unless `false`. */
  alignItem?: boolean;
};

/** A labelled Select with its items as children, the common way to write one. */
export function RoleSelect(props: RoleSelectProps): JSX.Element {
  return (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <Select
        placeholder="Pick a role"
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        readOnly={props.readOnly}
      >
        <SelectTrigger size={props.size}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={props.alignItem}>
          <For each={roles}>{(role) => <SelectItem value={role.value}>{role.label}</SelectItem>}</For>
        </SelectContent>
      </Select>
    </Field>
  );
}

/** A required Select with nothing chosen, in a form with its error and a submit button. */
export function RequiredRoleForm(): JSX.Element {
  return (
    <form>
      <Field name="role">
        <FieldLabel>Role</FieldLabel>
        <Select placeholder="Pick a role" name="role" required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <For each={roles}>{(role) => <SelectItem value={role.value}>{role.label}</SelectItem>}</For>
          </SelectContent>
        </Select>
        <FieldError />
      </Field>
      <button type="submit">Save</button>
    </form>
  );
}

/** UI SDK's own read-only select, before this package holds it closed. */
export function SdkReadOnlySelect(): JSX.Element {
  return (
    <SdkSelect defaultValue="admin" readOnly>
      <SdkTrigger aria-label="Role">
        <SdkValue />
      </SdkTrigger>
      <SdkContent>
        <SdkItem value="admin">Admin</SdkItem>
      </SdkContent>
    </SdkSelect>
  );
}
