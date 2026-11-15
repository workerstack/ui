// Every string and number the UI benchmark's harness uses, in one place.

/** The argument that makes a harness build instead of measure. */
export const BUILD_ARG = "build";

/** The origin Chromium loads the bench pages from; Playwright serves it, nothing listens. */
export const ORIGIN = "http://bench.test";

/** The module id every entry imports the candidate's kit from. */
export const KIT_ID = "virtual:bench-kit";

/** The module id the client entry imports the in-page checks from. */
export const PAGE_ID = "virtual:bench-page";

/** The prefix of every virtual module the bench serves. */
export const VIRTUAL_PREFIX = "virtual:bench-";

/** Rolldown's log code for a directive such as "use client", which means nothing in a bundle. */
export const DIRECTIVE_LOG = "MODULE_LEVEL_DIRECTIVE";

/** Solid's packages: one copy each per bundle, and external in the size bundle. */
export const SOLID = ["solid-js", "@solidjs/web", "@solidjs/signals"];
export const SOLID_ID = /^(?:solid-js|@solidjs\/(?:web|signals))(?:\/|$)/v;

/** Server renders thrown away before timing, then timed. */
export const SSR_WARMUP = 10;
export const SSR_RENDERS = 50;

/** Fresh pages thrown away before timing, then timed, per kind. */
export const PAGE_WARMUP = 2;
export const PAGE_SAMPLES = 12;

/** The same compression for every candidate's bytes. */
export const GZIP_LEVEL = 9;

/** Decimals kept in a printed timing. */
export const DECIMALS = 3;

/** How an in-page check waits for a part to react: this many polls, this many ms apart. */
export const POLLS = 200;
export const POLL_MS = 5;

export const NOT_FOUND = 404;

/** The harness argument that picks build or measure. */
export const COMMAND_ARG = 2;

/** An ARIA state attribute's on value. */
export const ARIA_TRUE = "true";

/** Cross-origin isolation gives performance.now() its fine (5 µs) resolution. */
export const ISOLATION = {
  "cross-origin-embedder-policy": "require-corp",
  "cross-origin-opener-policy": "same-origin",
};

export const HTML = "text/html";
export const JS = "text/javascript";
