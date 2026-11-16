import type { UiConfig } from "./values.ts";

// `defineConfig`, which types the default export of `ui.config.ts`.

/** Types a `ui.config.ts` default export; returns `config` as is. */
export function defineConfig(config: UiConfig): UiConfig {
  return config;
}
