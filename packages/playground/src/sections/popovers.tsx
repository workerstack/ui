import type { JSX } from "@solidjs/web";
import { buttonClass } from "@workerstack/ui/components/button";
import { Field, FieldLabel } from "@workerstack/ui/components/field";
import { Input } from "@workerstack/ui/components/input";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workerstack/ui/components/popover";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

/** A floating panel opened from a button. */
export function Popovers(): JSX.Element {
  const log = useLog();

  return (
    <Section id="popover" title="Popover" description="A floating panel opened from a button.">
      <Example label="With a form">
        <Popover onOpenChange={(isOpen) => log("Popover", isOpen)}>
          <PopoverTrigger class={buttonClass({ variant: "outline" })}>Dimensions</PopoverTrigger>
          <PopoverContent class="grid gap-4">
            <PopoverHeader>
              <PopoverTitle>Dimensions</PopoverTitle>
              <PopoverDescription>Set the size of the layer.</PopoverDescription>
            </PopoverHeader>
            <Field>
              <FieldLabel>Width</FieldLabel>
              <Input defaultValue="100%" />
            </Field>
            <PopoverClose class={buttonClass()}>Done</PopoverClose>
          </PopoverContent>
        </Popover>
      </Example>
    </Section>
  );
}
