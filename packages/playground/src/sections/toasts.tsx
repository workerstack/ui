import type { JSX } from "@solidjs/web";
import { Button } from "@workerstack/ui/components/button";
import { toast } from "@workerstack/ui/components/toast";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

const PROMISE_MS = 1500;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function SavedButton(): JSX.Element {
  const log = useLog();

  function showSaved(): void {
    toast({
      action: { label: "Undo", onAction: () => log("Toast", "undo") },
      description: "Your changes are stored.",
      title: "Saved",
    });
  }

  return (
    <Button variant="outline" onClick={showSaved}>
      Default with action
    </Button>
  );
}

/** Short messages that stack in the corner. The app's one Toaster sits in `app.tsx`. */
export function Toasts(): JSX.Element {
  return (
    <Section id="toast" title="Toast" description="Short messages that stack in the corner.">
      <Example label="Types">
        <SavedButton />
        <Button variant="outline" onClick={() => toast.success({ title: "Uploaded" })}>
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.error({ title: "Upload failed" })}>
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.promise(wait(PROMISE_MS), { loading: "Working", success: "Done" })}
        >
          Promise
        </Button>
      </Example>
    </Section>
  );
}
