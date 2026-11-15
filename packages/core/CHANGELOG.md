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
