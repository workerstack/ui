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
      {
        file: ".repo/bench/**",
        reason: "bun repo bench runs the spec and its harnesses as commands; knip sees no importer",
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
        files: ["packages/core/scripts/dev.ts", "packages/playground/scripts/dev.ts"],
        rules: ["repo/no-module-side-effects"],
        reason: "a script runs its main() when started, as a bin does; the standards pack exempts bins, not scripts",
      },
      {
        files: ["packages/core/src/test/browser.setup.ts"],
        rules: ["repo/no-side-effect-import", "import/no-unassigned-import"],
        reason: "the browser and hydration test projects' setup file exists to load the theme CSS into the test page",
      },
      {
        files: [".repo/bench/ui.bench.ts"],
        rules: ["import/no-default-export", "repo/no-module-side-effects"],
        reason: "bun repo bench loads a bench spec's default export, the defineBench() result",
      },
      {
        files: [".repo/bench/ui/monorepo.ts", ".repo/bench/ui/ours.ts", ".repo/bench/ui/ui-sdk.ts"],
        rules: ["repo/no-module-side-effects"],
        reason: "a bench harness runs when bun repo bench starts it, as a script runs its main()",
      },
      {
        files: [".repo/bench/ui/browser.ts", ".repo/bench/ui/build-candidate.ts"],
        rules: ["repo/boundaries"],
        reason:
          "the UI bench loads Vite and Playwright from packages/core with " +
          "createRequire; .repo has no package.json",
      },
      {
        files: [".repo/bench/ui/app.tsx", ".repo/bench/ui/ours-kit.tsx", ".repo/bench/ui/ui-sdk-kit.tsx"],
        rules: ["repo/boundaries", "typescript/no-unsafe-return"],
        reason:
          "the UI bench's app and kits resolve Solid and each library from the candidate's folder at build time, " +
          "so lint sees neither the packages nor their types",
      },
      {
        files: [".repo/bench/ui/ours-kit.tsx", ".repo/bench/ui/ui-sdk-kit.tsx"],
        rules: ["repo/duplicate-code"],
        reason: "each kit fills the same Kit keys with its own library's parts; the list is the contract",
      },
      {
        files: [".repo/bench/ui/monorepo-kit.tsx"],
        rules: [
          "repo/boundaries",
          "typescript/no-unsafe-assignment",
          "typescript/no-unsafe-call",
          "typescript/no-unsafe-member-access",
          "typescript/no-unsafe-return",
        ],
        reason:
          "the monorepo kit imports @repo/frontend-ui, which resolves only from " +
          "the monorepo's folder at build time",
      },
    ],
  },
});
