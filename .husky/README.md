# Husky

> Modern native git hooks made easy

Hooks are programs you can place in a hooks directory to trigger actions at certain points in git’s execution.

https://git-scm.com/docs/githooks

## Installation

This will install husky and will change git hooks directory to here (`.husky`).

This should _only_ be used on a developers machine.

```
npm run install
```

## Scripts

### Pre Push

Runs the linter on `server`, `frontend` & `app`.

`npm install` needs to be run on `frontend` and `app` for this to work.

## Removal

This resets the git hooks configuration to the default directory (`.git/hooks`).

```
npm run remove-husky
```
