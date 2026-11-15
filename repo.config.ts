import { defineConfig } from "@workerstack/repo";

export default defineConfig({
  packs: ["standards", "docs", "agents"],
  workflow: "main",
  agents: {
    defaultApproval: "away",
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
        files: ["packages/core/vitest.hydration.commands.ts"],
        rules: ["typescript/consistent-type-definitions"],
        reason:
          "augments vitest/browser's BrowserCommands, which only an interface can merge into " +
          "(docs/upstream/workerstack-repo.md REPO-1)",
      },
      {
        files: [
          "packages/core/scripts/dev.ts",
          "packages/core/scripts/sync-exports.ts",
          "packages/playground/scripts/dev.ts",
        ],
        rules: ["repo/no-module-side-effects"],
        reason: "a script runs its main() when started, as a bin does; the standards pack exempts bins, not scripts",
      },
      {
        files: ["packages/core/src/test/browser.setup.ts"],
        rules: ["repo/no-side-effect-import", "import/no-unassigned-import"],
        reason: "the browser and hydration test projects' setup file exists to load the theme CSS into the test page",
      },
    ],
  },
});
