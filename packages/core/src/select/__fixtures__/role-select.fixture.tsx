import { For } from "solid-js"
import { Field, FieldLabel } from "../../field/index.ts"
import { Select, type SelectProps, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index.ts"

export const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
]

/** A single Select's onValueChange: the selected value (or null) and what changed it. */
type OnValueChange = Extract<SelectProps<string, false>["onValueChange"], (value: string | null, ...rest: never[]) => void>

export interface RoleSelectProps {
  defaultValue?: string
  onValueChange?: OnValueChange
}

/** A labelled Select with its items as children, the common way to write one. */
export function RoleSelect(props: RoleSelectProps) {
  return (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <Select placeholder="Pick a role" defaultValue={props.defaultValue} onValueChange={props.onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <For each={roles}>{(role) => <SelectItem value={role.value}>{role.label}</SelectItem>}</For>
        </SelectContent>
      </Select>
    </Field>
  )
}
