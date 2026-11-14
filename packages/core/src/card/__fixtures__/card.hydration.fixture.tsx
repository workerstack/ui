import { createSignal } from "solid-js";

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../index.ts";

/** A full card whose action changes the content after hydration. */
export function CardFixture() {
  const [count, setCount] = createSignal(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>Billed monthly</CardDescription>
        <CardAction>
          <button type="button" onClick={() => setCount((n) => n + 1)}>
            Add
          </button>
        </CardAction>
      </CardHeader>
      <CardContent>Seats {count()}</CardContent>
      <CardFooter>Renews soon</CardFooter>
    </Card>
  );
}
