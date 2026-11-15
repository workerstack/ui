import { Tooltip, TooltipContent, TooltipTrigger } from "../index.ts"

/** A closed tooltip on a button. */
export function TooltipFixture() {
  return (
    <Tooltip>
      <TooltipTrigger>Save</TooltipTrigger>
      <TooltipContent>Save your changes</TooltipContent>
    </Tooltip>
  )
}
