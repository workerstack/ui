import { defineConfig } from "@workerstack/repo";

export default defineConfig({
  packs: ["standards", "docs", "agents"],
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
      {
        dependency: "parse5",
        reason: "the linked @workerstack/testing needs it; its 0.35.0 on npm does not",
      },
    ],
  },
  lint: {
    tailwind: {
      entryPoint: "packages/core/src/test/browser.css",
      vars: ["--anchor-width", "--available-height", "--transform-origin", "--toast-*"],
    },
    skip: [
      {
        files: ["packages/core/src/vite/theme.server.test.ts"],
        rules: ["repo/no-undefined-var"],
        reason: "the test asserts the generated CSS text, whose own color the test's config defines",
      },
      {
        files: [
          "packages/core/scripts/build-classes.ts",
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
