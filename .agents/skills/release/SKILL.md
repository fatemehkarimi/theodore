---
name: release
description: Release Theodore by bumping theodore/package.json, pushing and merging the release commit, creating and pushing the release tag, using $changelog for GitHub release notes, waiting for npm publication, then bumping theodore-js consumers in @theodore/landing and examples package.json files. Use when preparing or completing a Theodore npm release.
---

# Theodore Release

## Goal

Publish a new `theodore-js` package release and update repo consumers after npm publication.

## Preconditions

- Ask the user for the new Theodore version if it was not provided.
- Use the exact version string for `theodore/package.json` and `git tag <version>`.
- Work from the repo root. Check `git status --short` before editing, and do not overwrite unrelated user changes.
- Make all version changes on a branch. If currently on `master`, create and switch to a new release branch before editing version files.
- Prefer the GitHub app or `gh` for pull request checks and merges when available. If direct push or merge access is missing, leave the branch pushed and report the manual next step.

## Release Package

1. Update `theodore/package.json` `version` to the requested version.
2. Run focused validation that is already available locally for the changed package, such as `pnpm --filter theodore-js build` or `pnpm --filter theodore-js typecheck` when dependencies are installed.
3. Commit only the version bump with:

   ```bash
   git commit -m "fix(theodore): Bumps to version <version>."
   ```

4. Push the branch.
5. Open or update a pull request if the branch is not already targeting the release base branch.
6. Merge it when all required checks pass and you have access. If checks fail, investigate before merging. If merge access is unavailable, stop and report the PR URL/status.
7. Sync the release base branch after the merge.

## Tag And Changelog

1. Create the release tag on the merged release commit:

   ```bash
   git tag <version>
   git push origin <version>
   ```

2. Use `$changelog` to create the GitHub release for the pushed tag.
3. Wait for the tag pipeline to publish `theodore-js` to npm. Poll with:

   ```bash
   pnpm view theodore-js version
   ```

   Continue only when npm reports the requested version. If polling is blocked by network/auth, report that publication could not be verified.

## Update Consumers

1. Update every repo consumer package that pins `theodore-js` to the new version:

   - `landing/package.json` (`@theodore/landing`)
   - `examples/*/package.json`

2. Run `pnpm install` from the repo root to update `pnpm-lock.yaml`.
3. Run focused validation for touched consumers when practical, such as landing typecheck/build or example build scripts.
4. Commit the consumer updates with:

   ```bash
   git commit -m "chore(theodore/landing): Bumps theodore to version <version>."
   ```

5. Push the branch.
6. Open or update a pull request if needed.
7. Merge it only after the merge request or pull request pipeline passes and you have access. If access is missing or checks fail, report the PR URL/status and the remaining blocker.

## Final Report

Include the released version, package publish status, GitHub release status, consumer bump status, and any PRs or checks that still need manual action.
