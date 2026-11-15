# @workerstack/playground

Every `@workerstack/ui` component on one page, for checking them by eye: each variant, size and state, light and dark, with an event log that shows what each callback received.

```sh
bun run dev   # from the repo root or this folder, then open http://localhost:5180
```

It consumes the library the way an app does: `workspace:*`, imports through the package exports (`@workerstack/ui/components/button`, …), so it runs the built `dist/` and the published `theme.css` setup, not `src/`. `src/styles.css` imports one `styles.css` per entry the playground imports; a test in `packages/core` fails when that list drifts from the imports. `bun run dev` starts the library's watch build (`packages/core`, `bun run dev`) and then Vite, so saving a component in `packages/core/src` updates the page.

To add a component, add a section in `src/sections/` and a link in `src/app.tsx`. Use `Example` for each case and `log("Name", …)` in its callbacks.

`bun run build` / `bun run preview` serve a production build. Build `packages/core` first.
