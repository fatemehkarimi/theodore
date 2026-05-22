---
name: theodore-e2e
description: Writes and maintains Playwright end-to-end tests for the Theodore editor (theodore-js playground).
---

# Theodore Playwright E2E

## Scope

- **Package**: `theodore-js` workspace package at `theodore/`.
- **Tests**: `theodore/e2e/**/*.spec.ts`; shared helpers in `theodore/e2e/utils.ts` and constants in `theodore/e2e/constant.ts`.
- **Config**: `theodore/playwright.config.ts` — `baseURL` `http://localhost:3000`, `webServer` starts the playground (`rsbuild dev` on port 3000).

## Commands

Run from **`theodore/`** (the package dir):

```bash
pnpm test:e2e           # local: headed Chromium unless CI env
pnpm test:e2e:ci       # CI-style: CI=1, headless, retries
pnpm test:e2e:install  # chromium + deps once
```

## Helpers (`theodore/e2e/utils.ts`)

**`installPageErrorTracking`**: call once at the start (before `page.goto`) and keep the returned array for the whole test.

**`expectNoPageErrors`**: **every test must call this exactly once**, as the **final statement** of the test body (after all interactions and content assertions). Do **not** call it multiple times mid-flow.

```typescript
const pageErrors = installPageErrorTracking(page);
await page.goto('/');
// ... exercise the app, assert preview / UI ...
expectNoPageErrors(pageErrors);
```

- **`undoShortcut()`**: `Meta+Z` on macOS, `Control+Z` elsewhere.
- **`expectExactText(locator, text)`**: Asserts preview DOM text equals the exact **logical** string returned by `convertTreeToText`. Empty editor text is `""`; paragraph breaks appear only between paragraphs, so three `Enter` presses in an empty editor serialize to `"\n\n\n"`.

## Playground selectors

Prefer **`data-testid`** stable hooks (e.g. `editor`, `plain-text-preview`) over fragile CSS/text when available. Placeholder visibility uses shared `PLACEHOLDER` from `./constant.ts` where applicable.

## Stability

- Prefer **`pressSequentially`** with modest `delay` for typing-heavy flows if flakes appear.
- After **Arrow keys** / **selection** flows that rely on React state, use a short **`await delay(ms)`** from `node:timers/promises` if the suite already does so nearby — one pattern is tens of milliseconds to let layout/selection sync.
- For undo flows, assert the plain-text preview after **each** `undoShortcut()` press so every undo step has an explicit expected editor state.

## Lint (e2e only)

Repo ESLint overrides `theodore/e2e/**/*.ts` so `playwright/expect-expect` counts **`expect`**, **`expectNoPageErrors`**, and **`expectExactText`** as assertions. A **single** trailing `expectNoPageErrors(pageErrors)` is enough when combined with primary assertions (`expectExactText`, visibility checks). Use those helpers rather than weakening the rule.
