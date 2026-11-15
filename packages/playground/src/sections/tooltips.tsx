import type { JSX } from "@solidjs/web";
import { buttonClass } from "@workerstack/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workerstack/ui/components/tooltip";
import { For } from "solid-js";

import { Example, Section } from "../section.tsx";

const SIDES = ["top", "right", "bottom", "left"] as const;

/** A short hint shown on hover or focus. */
export function Tooltips(): JSX.Element {
  return (
    <Section id="tooltip" title="Tooltip" description="A short hint shown on hover or focus.">
      <Example label="Sides">
        <For each={SIDES}>
          {(side) => (
            <Tooltip>
              <TooltipTrigger class={buttonClass({ variant: "outline" })}>{side}</TooltipTrigger>
              <TooltipContent side={side}>Shown on the {side}</TooltipContent>
            </Tooltip>
          )}
        </For>
      </Example>
    </Section>
  );
}
