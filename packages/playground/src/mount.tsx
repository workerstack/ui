import { render } from "@solidjs/web";
import { UiProvider } from "@workerstack/ui/provider";

import { App } from "./app.tsx";

/** Renders the playground into `root`; index.html calls it, so importing this module runs nothing. */
export function mount(root: HTMLElement | null): void {
  if (root === null) throw new Error("playground: index.html has no #root element");
  render(
    () => (
      <UiProvider>
        <App />
      </UiProvider>
    ),
    root,
  );
}
