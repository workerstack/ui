import { createSignal } from "solid-js"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../index.ts"

function DeleteDialog(props: { defaultOpen?: boolean }) {
  const [open, setOpen] = createSignal(props.defaultOpen ?? false)
  return (
    <div>
      <AlertDialog defaultOpen={props.defaultOpen} onOpenChange={setOpen}>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete file?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Keep</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
      <output>{open() ? "open" : "closed"}</output>
    </div>
  )
}

export const AlertDialogFixture = () => <DeleteDialog />
export const AlertDialogOpenFixture = () => <DeleteDialog defaultOpen />
