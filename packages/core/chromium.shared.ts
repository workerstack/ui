import { playwright } from "@vitest/browser-playwright";
import type { BrowserCommandContext, BrowserConfigOptions } from "vitest/node";

declare module "vitest/browser" {
  interface BrowserCommands {
    /** Moves the real mouse off the test's frame, so nothing stays hovered (src/test/browser.setup.ts). */
    movePointerAway: () => Promise<void>;
  }
}

/** Moves the real mouse to the page's top-left corner, outside the test's frame. */
async function movePointerAway(context: BrowserCommandContext): Promise<void> {
  await context.page.mouse.move(0, 0);
}

/** Node-side commands a browser test calls through `commands` from vitest/browser. */
type Commands = NonNullable<BrowserConfigOptions["commands"]>;

/** Browser-mode options for headless Chromium driven by Playwright. */
type ChromiumBrowser = {
  enabled: true;
  headless: true;
  instances: [{ browser: "chromium" }];
  provider: ReturnType<typeof playwright>;
  commands: Commands;
};

/**
 * The browser every browser project runs in: popups use the top layer, the Popover API and the Web
 * Animations API, so the DOM is a real browser's. `commands` are the project's own, beside the shared ones.
 */
export function chromium(commands: Commands = {}): ChromiumBrowser {
  return {
    commands: { ...commands, movePointerAway },
    enabled: true,
    headless: true,
    instances: [{ browser: "chromium" }],
    provider: playwright(),
  };
}
