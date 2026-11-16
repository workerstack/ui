# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Button, Field, Input, Select, Menu and Dialog on UI SDK, styled with Tailwind through UI SDK's `--ui-*` tokens.
- UiProvider (@workerstack/ui/provider) gives components translated built-in strings and a format locale; Dialog's corner close and InputClear read their names from it
- @workerstack/ui/locale resolves a request's format locale from the saved preference, the region and Accept-Language
- Six controls: text input, textarea, checkbox, switch, radio group and combobox, at the subpaths @workerstack/ui/text-input, /textarea, /checkbox, /switch, /radio-group and /combobox.
- Eight overlay and display parts: popover, tooltip, alert dialog, drawer, tabs, badge, card and toast, at the subpaths @workerstack/ui/popover, /tooltip, /alert-dialog, /drawer, /tabs, /badge, /card and /toast.
- Monorepo features on our controls: Button loading, soft, xs and xl, and a disclosure chevron; Fieldset, FieldGroup and required or optional marks; InputGroup addons, text, buttons and textarea; read-only looks; UI-worded required and too-long errors; Select sm; MenuLabel, MenuLinkItem and a menu filter; Switch sm; Combobox start slot and color dots; and read-only Views at @workerstack/ui/view and on each control.
- A TanStack Form layer at `@workerstack/ui/form`: Form, field modules on our Field, wrappers for text input, textarea, checkbox, checkbox group, switch, radio group, select, combobox and input group, an error summary, server errors, drafts and unsaved-change guards, and FormDialog and FormDrawer.
- Drag and drop under @workerstack/ui/dnd/sortable, dnd/sortable/core, dnd/tree, dnd/file-drop and dnd/keyboard: pointer, touch and keyboard sorting, boards, trees, auto scroll, announcements and file drops.
- formArray (Root, Items, Handle, Add, Remove, MoveUp, MoveDown, Error) sorts a form's array field by drag, by buttons and by keyboard.
- The build writes dist/classes.json, the Tailwind classes each named export ships, so a build tool can give an app only the classes of what it imports.
- The `@workerstack/ui/vite` plugin writes `ui.generated.css` with the classes of exactly the exports your app imports.
- `@workerstack/ui/config` with `defineConfig`: types UI SDK's `--ui-*` tokens by kind, and your own colors, in `ui.config.ts`.
- `@workerstack/ui/base.css`: UI SDK's fixed rules, imported by the generated file.
- `ui()` writes the theme from `ui.config.ts` into `ui.generated.css` and adds `@import "./ui.generated.css";` to your CSS after `@import "tailwindcss";`.
- `--ui-chart-1` to `--ui-chart-6`, `--ui-info`, `--ui-success` and `--ui-warning` are typed tokens in `ui.config.ts` and have defaults in `@workerstack/ui/base.css`, in the theme layer, so any value you set in `:root` wins.

### Changed

- **Breaking:** `UI_MESSAGES_EN` is removed, and `useUiMessages` takes the English of the part that reads it (`useUiMessages(BUTTON_MESSAGES_EN)` in Button). Each part keeps its English beside it in a `<part>.messages.ts` file, so an app's bundle holds only the English of the parts it uses: Button's holds `loading` and nothing else, and no plain entry holds a form string. `UiMessages` is still the one type `UiProvider messages` checks, now the intersection of the parts' types; its keys are the same, except `comboboxCreateNew`, `formApply` and `formEdit`, which no part read and are removed. A test checks that every key has exactly one English owner and that Button's bundle holds none of the others.
- Each form-bound control now sits beside its plain control, at its own subpath: formTextInput, formTextarea, formCheckbox, formCheckboxGroup, formSwitch, formRadioGroup, formSelect, formCombobox, formMultiCombobox and formInputGroup from @workerstack/ui/form are now textInputField from @workerstack/ui/text-input-field, textareaField from /textarea-field, checkboxField and checkboxGroupField from /checkbox-field, switchField from /switch-field, radioGroupField from /radio-group-field, selectField from /select-field, comboboxField and multiComboboxField from /combobox-field, and inputGroupField from /input-field; their prop types follow (FormTextInputControlProps is TextInputFieldControlProps). The plain control subpaths load no TanStack code.
- Import paths now equal folder paths, with no aliases for the old ones. Plain components moved from `./<name>` to `./components/<name>`, for example `./button` to `./components/button` and `./dialog` to `./components/dialog`. `./cn` and `./locale` moved to `./utils/cn` and `./utils/locale`, and `./utils/text-hygiene` is newly exported. `./dnd/*` moved to `./features/dnd/*`. The TanStack layer moved from `./form` to `./components/form/tanstack/form`, and `./components/form/tanstack/array`, `./components/form/tanstack/dialog` and `./components/form/tanstack/unsaved` are now separate entries. Each bound field moved from `./<control>-field` to `./components/form/tanstack/<control>-field`, and `./components/form/tanstack/checkbox-group-field` and `./components/form/tanstack/multi-combobox-field` are now separate entries. No entry re-exports another, and `sideEffects` is `false`, so a bundler keeps only what you import. The export map lists every entry as its own key, with no `*` patterns, and is generated from the folders by `bun run sync:exports`. A test builds an app with Vite and Solid through those keys to check that it tree-shakes.
- **Breaking:** `@workerstack/ui/theme.css` no longer makes Tailwind scan the package, so an app's CSS holds no component classes until it imports them. Each entry has a `styles.css` at `./<entry>/styles.css` (for example `@workerstack/ui/components/button/styles.css`), generated by `build`, that names the built files the entry reaches. Import `theme.css` once, then one `styles.css` per entry you import, and Tailwind builds only those classes. A test compiles an app's CSS from those files to check that it holds a Button class and no Dialog-only class when only Button is imported.
- **Breaking:** the optional `vite` peer dependency is now `>=6.1.0`.
- **Breaking:** `colors.success`, `colors.info`, `colors.warning` and `colors.chart-1` to `colors.chart-6` no longer compile, since those names are now tokens. Move them to `tokens`.

### Removed

- **Breaking:** `@workerstack/ui/theme.css` is replaced by the generated file and `@workerstack/ui/base.css`. Apps drop the `@layer ui-sdk;` line and the `theme.css` import, and set tokens in `ui.config.ts` instead of a hand-written `:root`.
- The per-entry `styles.css` exports and `build:styles` are gone; use the `@workerstack/ui/vite` plugin.

### Fixed

- Button no longer builds a hidden disclosure chevron, which made every Button miss a hydration key
- An open Menu builds its items once, so hydration claims the server's items instead of missing their keys
