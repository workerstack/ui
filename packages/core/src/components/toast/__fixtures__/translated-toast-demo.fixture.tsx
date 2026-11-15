import { UiProvider, type UiMessages } from "../../provider/index.ts"
import { ToastDemo } from "./toast-demo.fixture.tsx"

/** The toast demo under a `UiProvider` with the given translations. */
export function TranslatedToastDemo(props: { messages: Partial<UiMessages> }) {
  return (
    <UiProvider messages={props.messages}>
      <ToastDemo />
    </UiProvider>
  )
}
