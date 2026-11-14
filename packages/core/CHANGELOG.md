# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Button, Field, Input, Select, Menu and Dialog on UI SDK, styled with Tailwind through UI SDK's `--ui-*` tokens.
- UiProvider (@workerstack/ui/provider) gives components translated built-in strings and a format locale; Dialog's corner close and InputClear read their names from it
- @workerstack/ui/locale resolves a request's format locale from the saved preference, the region and Accept-Language
