import type { JSX } from "@solidjs/web";
import { Badge, badgeClass, type BadgeVariant } from "@workerstack/ui/badge";
import { For } from "solid-js";

import { Example, Section } from "../section.tsx";

const VARIANTS: BadgeVariant[] = ["primary", "secondary", "destructive", "outline"];

/** A short label. */
export function Badges(): JSX.Element {
  return (
    <Section id="badge" title="Badge" description="A short label, or a link that looks like one.">
      <Example label="Variants">
        <For each={VARIANTS}>{(variant) => <Badge variant={variant}>{variant}</Badge>}</For>
        <a class={badgeClass({ variant: "outline" })} href="#badge">
          As a link
        </a>
      </Example>
    </Section>
  );
}
