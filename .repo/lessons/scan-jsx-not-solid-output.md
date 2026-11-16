---
name: scan-jsx-not-solid-output
paths: ["packages/core/scripts/build-classes.ts","packages/core/scripts/bundle-jsx.ts","packages/core/src/classes.server.test.ts"]
hits: 1
last-hit: 2026-11-16
evidence: ["plan 2"]
---

# Scan JSX for Tailwind classes, never Solid's compiled output

## Mistake
Solid compiles a static `class="a b"` into an unquoted template attribute, and Tailwind's oxide Scanner skips unquoted attributes. Scanning Solid's output dropped 44 static JSX classes, and a test that scanned Solid's output on both sides passed anyway.

## Fix
Bundle with rolldown and `transform: { jsx: "preserve" }`, then scan with extension "jsx". Check class lists against an independent side: source text of the kept modules, not the same compiled bundle.
