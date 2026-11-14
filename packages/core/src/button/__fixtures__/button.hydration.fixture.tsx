import { createSignal } from "solid-js"
import { Button } from "../index.ts"

/** A counter: proves the hydrated button's handler and reactive text are the server node's. */
export function ButtonFixture() {
  const [count, setCount] = createSignal(0)
  return (
    <div>
      <Button variant="outline" onClick={() => setCount((n) => n + 1)}>
        Clicked {count()}
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}
