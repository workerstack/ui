import { Toaster, createToaster, type ToastQueue } from "../index.ts"

export interface ToastDemoProps {
  /** How long each toast shows, in ms. Defaults to UI SDK's 5000. */
  duration?: number
  /** Runs when the "Undo" action is pressed. */
  onUndo?: () => void
  /** Which edge the region sits on. */
  side?: "top" | "bottom"
}

/** Buttons that show toasts on their own queue, and the region that renders them. */
export function ToastDemo(props: ToastDemoProps) {
  const queue: ToastQueue<string> = createToaster({ duration: props.duration })

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          queue({
            title: "Saved",
            description: "Your changes are stored.",
            action: { label: "Undo", onAction: props.onUndo },
          })
        }
      >
        Save
      </button>
      <button type="button" onClick={() => queue.error({ title: "Upload failed" })}>
        Fail
      </button>
      <button type="button" onClick={() => queue({ title: "Plain", dismissible: false })}>
        Pin
      </button>
      <button type="button" onClick={() => queue.promise(Promise.resolve(1), { loading: "Working", success: "Finished" })}>
        Work
      </button>
      <Toaster toaster={queue} side={props.side} />
    </div>
  )
}
