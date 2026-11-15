import type { JSX } from "@solidjs/web";
import { Button } from "@workerstack/ui/components/button";

import { Example } from "../section.tsx";

/** A form that cannot submit until its required controls are filled, so their UI-worded errors show. */
export function RequiredForm(props: { children: JSX.Element }): JSX.Element {
  return (
    <Example align="start" label="Required, in the UI's words (press Submit)">
      <form class="flex w-72 flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
        {props.children}
        <Button type="submit">Submit</Button>
      </form>
    </Example>
  );
}
