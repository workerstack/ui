import solid from "@solidjs/vite-plugin";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

import { chromium } from "./chromium.shared.ts";
import { DESKTOP_VIEWPORT } from "./desktop-viewport.shared.ts";

// The page loads the shipped theme through Tailwind (src/test/browser.css), so styles and layout are the real ones.
export default defineConfig({
  plugins: [solid(), tailwind()],
  test: {
    browser: { ...chromium(), viewport: DESKTOP_VIEWPORT },
    include: ["src/**/*.browser.test.{ts,tsx}"],
    name: "browser",
    setupFiles: ["./src/test/browser.setup.ts"],
  },
});
