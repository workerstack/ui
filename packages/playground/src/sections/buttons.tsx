import type { JSX } from "@solidjs/web";
import { Button, type ButtonSize, type ButtonVariant } from "@workerstack/ui/components/button";
import { createSignal, For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "soft", "outline", "ghost", "destructive", "link"];
const SIZES: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
const LOADING_MS = 1500;

function Plus(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Variants(): JSX.Element {
  const log = useLog();

  return (
    <Example label="Variants">
      <For each={VARIANTS}>
        {(variant) => (
          <Button variant={variant} onClick={() => log("Button", variant)}>
            {variant}
          </Button>
        )}
      </For>
    </Example>
  );
}

function Sizes(): JSX.Element {
  return (
    <Example label="Sizes">
      <For each={SIZES}>{(size) => <Button size={size}>Size {size}</Button>}</For>
      <Button size="icon" aria-label="Add">
        <Plus />
      </Button>
      <Button>
        <Plus /> With icon
      </Button>
    </Example>
  );
}

function Disabled(): JSX.Element {
  return (
    <Example label="Disabled">
      <For each={VARIANTS}>
        {(variant) => (
          <Button variant={variant} disabled>
            {variant}
          </Button>
        )}
      </For>
    </Example>
  );
}

function Loading(): JSX.Element {
  const [isLoading, setIsLoading] = createSignal(false);

  function save(): void {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), LOADING_MS);
  }

  return (
    <Example label="Loading (the width stays)">
      <Button loading>Saving</Button>
      <Button variant="outline" loading>
        Saving
      </Button>
      <Button loading={isLoading()} onClick={save}>
        Click to load
      </Button>
    </Example>
  );
}

function Layout(): JSX.Element {
  return (
    <Example label="Inline size and disclosure">
      <div class="flex w-64 flex-col gap-2">
        <Button inlineSize="fill">Fill the row</Button>
        <Button inlineSize="fit-content" variant="outline">
          Fit content
        </Button>
        <Button inlineSize="auto" variant="soft">
          Auto
        </Button>
      </div>
      <Button variant="outline" disclosure>
        Options
      </Button>
      <Button variant="soft" size="sm" disclosure>
        Sort by
      </Button>
    </Example>
  );
}

function Counter(): JSX.Element {
  const [count, setCount] = createSignal(0);

  return (
    <Example label="State">
      <Button onClick={() => setCount((n) => n + 1)}>Clicked {count()} times</Button>
    </Example>
  );
}

/** Every variant and size, loading, disclosure, disabled, and with an icon. */
export function Buttons(): JSX.Element {
  return (
    <Section
      id="button"
      title="Button"
      description="Every variant and size, loading, disclosure, disabled, and with an icon."
    >
      <Variants />
      <Sizes />
      <Disabled />
      <Loading />
      <Layout />
      <Counter />
    </Section>
  );
}
