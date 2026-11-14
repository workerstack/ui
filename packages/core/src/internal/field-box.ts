/** The box that holds an input and buttons: border, focus ring and invalid state, drawn on the box. */
export const fieldBox: string[] = [
  "flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent text-base shadow-xs",
  "transition-[color,box-shadow] md:text-sm has-[input:focus-visible]:border-ring",
  "has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
  "has-[input[aria-invalid=true]]:border-destructive",
];
