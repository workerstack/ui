import { defineBench } from "@workerstack/repo/bench";

// Is @workerstack/ui as small and as fast as the monorepo UI it replaces? Each candidate builds the
// same closed app (ui/app.tsx on ui/<name>-kit.tsx: button, checkbox, switch, tabs, dialog, popover,
// tooltip, menu, select, combobox, toast and a text field) with one Vite and Solid compiler in
// production mode. Bare UI SDK is the floor: what our layer costs over the parts it styles.
//
// artifact-bytes  the hydrating client entry, Solid external, minified, gzip level 9
// mount-p50       render() into an empty page in headless Chromium, to a settled, laid-out DOM
// ssr-p50         renderToString in Node, in process, after a warmup
// hydrate-p50     hydrate() over the server's HTML in headless Chromium, to a settled DOM

/** Bytes and mount weigh most: what every page pays, on every load. */
const LOAD_WEIGHT = 0.3;

/** Server render and hydration only cost pages that render on the server. */
const SSR_WEIGHT = 0.2;

/** Enough runs that one slow run does not move a median. */
const RUNS = 20;

export default defineBench({
  candidates: {
    monorepo: { run: ["node", ".repo/bench/ui/monorepo.ts"], setup: ["node", ".repo/bench/ui/monorepo.ts", "build"] },
    ours: { run: ["node", ".repo/bench/ui/ours.ts"], setup: ["node", ".repo/bench/ui/ours.ts", "build"] },
    "ui-sdk": { run: ["node", ".repo/bench/ui/ui-sdk.ts"], setup: ["node", ".repo/bench/ui/ui-sdk.ts", "build"] },
  },
  metrics: {
    "artifact-bytes": { unit: "B", weight: LOAD_WEIGHT },
    "hydrate-p50": { unit: "ms", weight: SSR_WEIGHT },
    "mount-p50": { unit: "ms", weight: LOAD_WEIGHT },
    "ssr-p50": { unit: "ms", weight: SSR_WEIGHT },
  },
  runs: RUNS,
  warmup: 1,
});
