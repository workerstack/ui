import { createSignal } from "solid-js";

import { Badge, badgeClass } from "../index.ts";

/** Badges in every variant, a link that looks like one, and a count that changes after hydration. */
export function BadgeFixture() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <Badge>Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <a href="/docs" class={badgeClass({ variant: "outline" })}>
        Docs
      </a>
      <button type="button" onClick={() => setCount((n) => n + 1)}>
        <Badge>Count {count()}</Badge>
      </button>
    </div>
  );
}
