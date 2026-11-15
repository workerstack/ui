import type { JSX } from "@solidjs/web";
import { Tabs as TabsRoot, TabsList, TabsPanel, TabsTab, type TabsVariant } from "@workerstack/ui/components/tabs";
import { For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

const PAGES = ["Account", "Password", "Billing"] as const;

function Demo(props: { variant: TabsVariant }): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label={props.variant}>
      <TabsRoot class="w-full max-w-md" defaultValue="Account" onValueChange={(value) => log("Tabs", value)}>
        <TabsList aria-label="Settings" variant={props.variant}>
          <For each={PAGES}>{(page) => <TabsTab value={page}>{page}</TabsTab>}</For>
          <TabsTab value="Archive" disabled>
            Archive
          </TabsTab>
        </TabsList>
        <For each={PAGES}>
          {(page) => (
            <TabsPanel class="pt-3 text-sm text-muted-foreground" value={page}>
              {page} settings go here.
            </TabsPanel>
          )}
        </For>
      </TabsRoot>
    </Example>
  );
}

/** Panels switched by a row of tabs. */
export function Tabs(): JSX.Element {
  return (
    <Section id="tabs" title="Tabs" description="Panels switched by a row of tabs.">
      <Demo variant="default" />
      <Demo variant="line" />
    </Section>
  );
}
