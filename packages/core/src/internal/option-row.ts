/** An option row in a popup list (select, combobox): highlight, disabled and icon rules. */
export const optionRow: string[] = [
  "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm",
  "outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent",
  "data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
];
