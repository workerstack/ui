import solid from "@solidjs/vite-plugin";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

import { chromium } from "./chromium.shared.ts";
import { serverRender } from "./vitest.hydration.commands.ts";

// `ssr: true` alone leaves this client non-hydratable in browser mode; `hydratable` is what claims
// the server's nodes.
// Server HTML (rendered in Node by `serverRender`) hydrated in Chromium by the same fixture compiled
// hydratable and without the HMR wrapper, as an SSR app's client bundle is.
export default defineConfig({
  plugins: [solid({ refresh: false, solid: { hydratable: true } }), tailwind()],
  test: {
    browser: chromium({ serverRender }),
    globalSetup: ["./vitest.hydration.commands.ts"],
    include: ["src/**/*.hydration.test.tsx"],
    name: "hydration",
    setupFiles: ["./src/test/browser.setup.ts"],
  },
});
