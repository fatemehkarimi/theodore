---
name: changelog
description: Create GitHub releases from the latest pushed Git tag by comparing commit messages from the prior tag to the latest tag. Use when Codex is asked to draft, generate, or publish a GitHub release changelog for a tagged release, especially for Theodore/npm releases.
---

# Changelog

## Goal

Create a GitHub release for the latest pushed tag using a concise highlights-only changelog.

Use this exact body shape. The heading must always be exactly `## ✨ Highlights`; only bullet emojis vary by change type:

```markdown
## ✨ Highlights

- [relevant emoji] changelog1
- [relevant emoji] changelog2
```

## Workflow

1. Sync tags before choosing the release target.

   - Fetch remote tags first: `git fetch origin --tags --prune-tags`.
   - Select the latest pushed tag from local refs after fetch, preferring tag creation date: `git for-each-ref refs/tags --sort=-creatordate --format='%(refname:short)'`.
   - If dates are ambiguous, inspect recent remote tag refs and choose the tag the user just pushed or the newest semantic version.

2. Find the comparison range.

   - Resolve the latest tag commit with `git rev-list -n 1 <latest-tag>`.
   - Find the prior tag with `git describe --tags --abbrev=0 <latest-tag>^`.
   - If there is no prior tag, compare from the repository root commit.
   - Inspect commits in `<prior-tag>..<latest-tag>` with subjects and, when needed, PR merge bodies.

3. Filter commit messages.

   - Keep user-facing product changes: features, behavior improvements, bug fixes, performance, bundle size, public API, docs that users rely on.
   - Ignore developer experience and release mechanics: dependency bumps, package manager changes, CI/workflow changes, lint/format/test-only edits, tooling config, version bumps, release commits, changelog-only commits, refactors with no user-visible impact.
   - Ignore TypeScript-only changes such as declaration paths, exported types, `tsconfig`, typecheck, or type-generation fixes; do not turn them into changelog bullets.
   - Ignore noisy merge commits unless the merge title/body is the only useful description of a user-facing change.
   - Deduplicate commits that describe the same change.

4. Sort highlights by change type.

   - Features first.
   - Improvements and performance second.
   - Fixes and patches third.
   - Within each group, put broader user impact before narrow edge cases.

5. Write bullets.

   - Convert commit wording into clear user-facing past-tense release notes.
   - Remove conventional-commit prefixes such as `feat:`, `fix(scope):`, `chore:`.
   - Start every bullet with one relevant emoji and one space.
   - Prefer concrete outcomes over implementation details.
   - Do not include TypeScript/type-declaration/package type export notes.
   - Keep each bullet to one line when possible.

6. Create the GitHub release.
   - Use the latest tag as the release tag and release title unless the user requested a different title.
   - Mark the release as prerelease when the tag contains a semantic prerelease suffix such as `-beta.` or `-rc.`.
   - Prefer the GitHub app or `gh release create` if available. If using `gh`, write notes to a temp file and run `gh release create <tag> --title <tag> --notes-file <file>`; add `--prerelease` for prerelease tags.
   - Before creating, check whether a release already exists for the tag. If it exists, ask before replacing or editing it.

## Emoji Guidance

Use `✨` in the `## ✨ Highlights` heading every time. For each bullet, choose a relevant emoji rather than a fixed prefix.

## Example

```markdown
## ✨ Highlights

- 🛠️ Fixed a crash that occurred when calling setContent to clear the editor.
- 😊 Resolved an issue with emoji insertion when selecting emojis from the Windows emoji picker.
- 📱 Fixed a bug on iOS where suggested text was not being inserted into the editor correctly.
```
