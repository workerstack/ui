import { playwright } from "@vitest/browser-playwright";

/** Browser-mode options for headless Chromium driven by Playwright. */
type ChromiumBrowser = {
  enabled: true;
  headless: true;
  instances: [{ browser: "chromium" }];
  provider: ReturnType<typeof playwright>;
};

/**
 * The browser every browser project runs in: popups use the top layer, the Popover API and the Web
 * Animations API, so the DOM is a real browser's.
 */
export function chromium(): ChromiumBrowser {
  return { enabled: true, headless: true, instances: [{ browser: "chromium" }], provider: playwright() };
}
