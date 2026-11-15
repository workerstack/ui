import type { JSX } from "@solidjs/web";
import { Field, FieldLabel } from "@workerstack/ui/components/field";
import {
  BooleanView,
  ChoiceView,
  OptionBadge,
  OptionDot,
  type OptionDotProps,
  View,
} from "@workerstack/ui/components/view";
import { For } from "solid-js";

import { Example, Section } from "../section.tsx";

type OptionColor = OptionDotProps["color"];

const COLORS: OptionColor[] = [
  "neutral",
  "accent",
  "info",
  "success",
  "warning",
  "danger",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
];

const STATUSES: { color: OptionColor; label: string; value: string }[] = [
  { color: "neutral", label: "Backlog", value: "backlog" },
  { color: "info", label: "Active", value: "active" },
  { color: "success", label: "Done", value: "done" },
];

const PLAIN = [
  { label: "Red", value: "red" },
  { label: "Green", value: "green" },
];

function Base(): JSX.Element {
  return (
    <Example align="start" label="View: text, empty, in a field and with children">
      <View text="Plain text" />
      <View text="" />
      <View dir="ltr" text="+385 91 234 5678" />
      <View empty={false}>
        <strong>Rich</strong> content
      </View>
      <View empty>
        <span>Hidden</span>
      </View>
      <Field>
        <FieldLabel>In a field</FieldLabel>
        <View text="The label names it" />
      </Field>
    </Example>
  );
}

function Booleans(): JSX.Element {
  return (
    <Example align="start" label="Boolean view">
      <BooleanView value />
      <BooleanView value={false} />
      <BooleanView value={null} />
    </Example>
  );
}

function Choices(): JSX.Element {
  return (
    <Example align="start" label="Choice view: plain, colored, several, with a legend">
      <ChoiceView items={PLAIN} value="green" />
      <ChoiceView items={STATUSES} value="active" />
      <ChoiceView items={STATUSES} value={["backlog", "done"]} />
      <ChoiceView items={PLAIN} value={null} />
      <ChoiceView items={STATUSES} value="done" legend={<span class="text-sm font-medium">Status</span>} />
    </Example>
  );
}

function Options(): JSX.Element {
  return (
    <Example label="Option badge and dot, in every color">
      <For each={COLORS}>
        {(color) => (
          <span class="inline-flex items-center gap-2">
            <OptionDot color={color} />
            <OptionBadge color={color}>{color}</OptionBadge>
          </span>
        )}
      </For>
      <OptionBadge>No color</OptionBadge>
    </Example>
  );
}

/** A form value shown, not edited: text, yes or no, and choices. */
export function Views(): JSX.Element {
  return (
    <Section id="view" title="View" description="A form value shown, not edited: text, yes or no, and choices.">
      <Base />
      <Booleans />
      <Choices />
      <Options />
    </Section>
  );
}
