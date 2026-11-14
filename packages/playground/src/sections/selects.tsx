import type { JSX } from "@solidjs/web";
import { Field, FieldLabel } from "@workerstack/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectView,
} from "@workerstack/ui/select";
import { For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

const ROLES = [
  { label: "Viewer", value: "viewer" },
  { label: "Editor", value: "editor" },
  { label: "Admin", value: "admin" },
];

function Children(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Children">
      <div class="w-56">
        <Field>
          <FieldLabel>Role</FieldLabel>
          <Select placeholder="Pick a role" onValueChange={(value) => log("Select", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <For each={ROLES}>{(role) => <SelectItem value={role.value}>{role.label}</SelectItem>}</For>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div class="w-56">
        <Field>
          <FieldLabel>items prop</FieldLabel>
          <Select items={ROLES} defaultValue="editor" onValueChange={(value) => log("Select items", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </Select>
        </Field>
      </div>
    </Example>
  );
}

function RegionItems(): JSX.Element {
  return (
    <SelectContent>
      <SelectGroup>
        <SelectGroupLabel>Europe</SelectGroupLabel>
        <SelectItem value="fra">Frankfurt</SelectItem>
        <SelectItem value="ams">Amsterdam</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectGroupLabel>America</SelectGroupLabel>
        <SelectItem value="iad">Washington</SelectItem>
        <SelectItem value="sfo" disabled>
          San Francisco (full)
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  );
}

function Groups(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Groups, separator, disabled item">
      <div class="w-56">
        <Field>
          <FieldLabel>Region</FieldLabel>
          <Select placeholder="Pick a region" onValueChange={(value) => log("Select region", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <RegionItems />
          </Select>
        </Field>
      </div>
      <div class="w-56">
        <Field disabled>
          <FieldLabel>Disabled</FieldLabel>
          <Select items={ROLES} defaultValue="viewer">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </Select>
        </Field>
      </div>
    </Example>
  );
}

function ReadOnlyAndView(): JSX.Element {
  return (
    <>
      <div class="w-56">
        <Field>
          <FieldLabel>Read-only</FieldLabel>
          <Select items={ROLES} defaultValue="admin" readOnly>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </Select>
        </Field>
      </div>
      <div class="w-56">
        <Field>
          <FieldLabel>View</FieldLabel>
          <SelectView items={ROLES} value="admin" />
        </Field>
      </div>
    </>
  );
}

function SizeAndReadOnly(): JSX.Element {
  return (
    <Example align="start" label="Small, read-only, view">
      <div class="w-56">
        <Field>
          <FieldLabel>Small</FieldLabel>
          <Select items={ROLES} defaultValue="editor">
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
          </Select>
        </Field>
      </div>
      <ReadOnlyAndView />
    </Example>
  );
}

/** Items as children, items as data, groups, sizes, read-only and view. */
export function Selects(): JSX.Element {
  return (
    <Section
      id="select"
      title="Select"
      description="Items as children, items as data, groups, sizes, read-only and view."
    >
      <Children />
      <Groups />
      <SizeAndReadOnly />
    </Section>
  );
}
