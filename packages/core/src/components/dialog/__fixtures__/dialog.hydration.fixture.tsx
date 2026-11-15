import { createSignal } from "solid-js"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../index.ts"

function ShareDialog(props: { defaultOpen?: boolean }) {
  const [open, setOpen] = createSignal(props.defaultOpen ?? false)
  return (
    <div>
      <Dialog defaultOpen={props.defaultOpen} onOpenChange={setOpen}>
        <DialogTrigger>Share</DialogTrigger>
        <DialogContent>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>Anyone with the link can view.</DialogDescription>
          <DialogClose>Done</DialogClose>
        </DialogContent>
      </Dialog>
      <output>{open() ? "open" : "closed"}</output>
    </div>
  )
}

export const DialogFixture = () => <ShareDialog />
export const DialogOpenFixture = () => <ShareDialog defaultOpen />
