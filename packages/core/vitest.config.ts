import { defineConfig } from "vitest/config";

// Every component has four test files side by side:
//   button.test.tsx          dom      the component's contract (roles, ARIA, state, events) in Chromium
//   button.browser.test.tsx  browser  real input, real Tailwind CSS, layout and focus in Chromium
//   button.server.test.tsx   server   server rendering in Node
//   button.hydration.test.tsx  hydration  server HTML from Node hydrated in Chromium
//
// Components a test renders (fixtures) live in the component's __fixtures__/ folder, never inline
// in a test file: __fixtures__/button.hydration.fixture.tsx is what both sides of a hydration test render.
//
// Each project is its own config file: a project only owns its `solid()` plugin when it is alone in
// a config. Several projects declared inline here would compile every module with whichever plugin
// came first.
export default defineConfig({
  test: {
    projects: [
      "./vitest.dom.config.ts",
      "./vitest.browser.config.ts",
      "./vitest.server.config.ts",
      "./vitest.hydration.config.ts",
    ],
  },
});
