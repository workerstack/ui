import { defineConfig } from "@workerstack/repo";

export default defineConfig({
  packs: ["standards", "docs", "agents"],
  // Each repo links @workerstack/repo from the sibling checkout, so a push must go while it is linked.
  link: { push: "allow" },
  workflow: "main",
  agents: {
    defaultApproval: "ask",
    defaultEffort: "fast",
    defaultStrategy: "spawn-fast",
    hosts: ["claude", "codex", "antigravity", "grok", "cursor"],
  },
  knip: {
    ignore: [
      {
        file: "packages/playground/src/styles.css",
        reason: "index.html loads it with a <link>; knip reads no HTML",
      },
    ],
  },
  lint: {
    tailwind: { entryPoint: "packages/core/src/test/browser.css" },
    skip: [
      {
        files: [
          "packages/core/scripts/build-styles.ts",
          "packages/core/scripts/dev.ts",
          "packages/core/scripts/sync-exports.ts",
          "packages/playground/scripts/dev.ts",
        ],
        rules: ["repo/no-module-side-effects"],
        reason: "a script runs its main() when started, as a bin does; the standards pack exempts bins, not scripts",
      },
      {
        files: ["packages/core/src/test/browser.setup.ts"],
        rules: ["repo/no-side-effect-import", "import/no-unassigned-import", "repo/no-module-side-effects"],
        reason:
          "the browser and hydration test projects' setup file exists to load the theme CSS into the test page " +
          "and to move the mouse off it before each test",
      },
    ],
  },
});
