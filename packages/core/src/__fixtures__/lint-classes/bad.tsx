import type { JSX } from "@solidjs/web";

/** Four lint failures: an unknown utility, an unknown arbitrary var, an undefined `var()`, and a pieced class. */
export function Bad(props: { x: string }): JSX.Element {
  return (
    <div>
      <span class="bg-ui-nope" />
      <span class="bg-(--ui-nope)" />
      <span style={{ color: "var(--ui-nope)" }} />
      <span class={`bg-${props.x}`} />
    </div>
  );
}
