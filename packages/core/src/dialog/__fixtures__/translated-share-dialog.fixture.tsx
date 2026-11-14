import { UiProvider, type UiMessages } from "../../provider/index.ts"
import { ShareDialog } from "./share-dialog.fixture.tsx"

/** The share dialog under a `UiProvider` with the given translations. */
export function TranslatedShareDialog(props: { messages: Partial<UiMessages> }) {
  return (
    <UiProvider messages={props.messages}>
      <ShareDialog />
    </UiProvider>
  )
}
