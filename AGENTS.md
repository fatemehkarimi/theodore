# Project Rules

## Package Roles

- `@theodore/playground` is used for development and for writing end-to-end tests.
- `@theodore/landing` is deployed at https://theodore-js.dev.

## Commit Messages

When making a commit in this project, use this format:

```text
<verb>(<project>): <Change sentence>
```

- Allowed verbs: `fix`, `chore`, `ref`, `feat`.
- The project in parentheses is based on the changed directory and must be one of:
  - `theodore` for changes under `theodore/`
  - `theodore/playground` for changes under `playground/`
  - `theodore/landing` for changes under `landing/`
- The change sentence must be brief, clear, and as short as possible.
- Start the change sentence with a capital letter.
- Write the change sentence in third person because commit messages are later used for changelog generation.

Examples:

```text
chore(theodore): Bumps pnpm to version 11
fix(theodore/landing): Fixes docs navigation
feat(theodore): Adds emoji insertion shortcut
```
