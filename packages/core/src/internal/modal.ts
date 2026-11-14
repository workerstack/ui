/** The dimmed backdrop behind a centered modal (dialog, alert dialog). */
export const modalBackdrop: string =
  "fixed inset-0 z-50 bg-overlay transition-opacity duration-150 delay-0 data-ending-style:opacity-0 " +
  "data-starting-style:opacity-0 motion-reduce:transition-none";

/** A centered modal window that scales in and out. */
export const modalWindow: string[] = [
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4",
  "rounded-lg border bg-background p-6 text-foreground shadow-popup outline-none",
  "transition-[opacity,scale] duration-150 delay-0 data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none sm:max-w-lg",
];

/** A modal's title text. */
export const modalTitle: string = "text-lg leading-none font-semibold";

/** A modal's description text. */
export const modalDescription: string = "text-sm text-muted-foreground";
