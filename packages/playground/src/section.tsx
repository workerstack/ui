import type { JSX } from "@solidjs/web";

type SectionProps = { id: string; title: string; description?: string; children: JSX.Element };

/** A component's part of the page, with an anchor for the nav. */
export function Section(props: SectionProps): JSX.Element {
  return (
    <section id={props.id} class="scroll-mt-20 space-y-4">
      <header>
        <h2 class="text-lg font-semibold">{props.title}</h2>
        {props.description === undefined ? null : <p class="text-sm text-muted-foreground">{props.description}</p>}
      </header>
      {props.children}
    </section>
  );
}

/** One labelled example inside a section. */
export function Example(props: { label: string; align?: "start" | "center"; children: JSX.Element }): JSX.Element {
  return (
    <div class="rounded-lg border border-border bg-popover p-4 text-popover-foreground">
      <div class="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">{props.label}</div>
      <div class={`flex flex-wrap gap-3 ${props.align === "start" ? "items-start" : "items-center"}`}>
        {props.children}
      </div>
    </div>
  );
}
