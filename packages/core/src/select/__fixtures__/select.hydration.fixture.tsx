import { createSignal, For } from "solid-js"
import { Field, FieldLabel } from "../../field/index.ts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../index.ts"

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
]

/** Items as children: the common way to write a Select. */
export function SelectFixture() {
  const [value, setValue] = createSignal<string | null>("viewer")
  return (
    <div>
      <Field>
        <FieldLabel>Role</FieldLabel>
        <Select defaultValue="viewer" onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <For each={roles}>{(role) => <SelectItem value={role.value}>{role.label}</SelectItem>}</For>
          </SelectContent>
        </Select>
      </Field>
      <output>{value()}</output>
    </div>
  )
}

/** Items as data, rendered by the default SelectContent. */
export function SelectItemsFixture() {
  return (
    <Select items={roles} defaultValue="editor">
      <SelectTrigger aria-label="Role">
        <SelectValue />
      </SelectTrigger>
    </Select>
  )
}

/** Items as data, with a SelectContent of our own for the styles. */
export function SelectItemsContentFixture() {
  return (
    <Select items={roles} defaultValue="editor">
      <SelectTrigger aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent />
    </Select>
  )
}

export function SelectOpenFixture() {
  return (
    <Select items={roles} defaultValue="editor" defaultOpen>
      <SelectTrigger aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent />
    </Select>
  )
}
