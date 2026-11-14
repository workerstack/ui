import { Tooltip, TooltipContent, type TooltipContentProps, TooltipTrigger } from "../index.ts"

export type SaveTooltipProps = {
  side?: TooltipContentProps["side"]
  delay?: number
}

/** A Save button with a tooltip that says what it does. */
export function SaveTooltip(props: SaveTooltipProps) {
  return (
    <div style={{ padding: "6rem 8rem" }}>
      <Tooltip delay={props.delay}>
        <TooltipTrigger>Save</TooltipTrigger>
        <TooltipContent side={props.side}>Save your changes</TooltipContent>
      </Tooltip>
    </div>
  )
}
