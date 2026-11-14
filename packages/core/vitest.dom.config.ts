import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vitest/config";

import { chromium } from "./chromium.shared.ts";

export default defineConfig({
  plugins: [solid()],
  test: {
    browser: chromium(),
    exclude: ["src/**/*.browser.test.{ts,tsx}", "src/**/*.server.test.{ts,tsx}", "src/**/*.hydration.test.{ts,tsx}"],
    include: ["src/**/*.test.{ts,tsx}"],
    name: "dom",
  },
});
