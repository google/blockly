# Contributing to BlockThreed

Want to contribute? Great! Start with the orientation docs in this repo:

- [`README.md`](../README.md) — what BlockThreed is and where it's headed.
- [`AGENTS.md`](../AGENTS.md) — repository layout, commands, and conventions.
  Per-package details live in `packages/blockly/AGENTS.md` and
  `packages/plugins/AGENTS.md`.

The short version:

- Keep changes small and focused; one concern per pull request.
- Use [conventional commits](https://www.conventionalcommits.org/) (`feat:`,
  `fix:`, `docs:`, …) — they generate the changelog and drive versioning.
- Run `npm run format` from the repo root and `npm run lint-fix` in the
  package you touched before pushing.
- New block-coding behavior needs unit tests (`packages/blockly/tests/mocha/`).

Since the block editor core is forked from Blockly, the upstream contributor
guides are still useful background reading:

- [Style guide](https://docs.blockly.com/guides/contribute/core/style_guide/)
- [Commit messages](https://docs.blockly.com/guides/contribute/get-started/commits/)
- [Writing a good PR](https://docs.blockly.com/guides/contribute/get-started/write_a_good_pr/)
- [Writing a good issue](https://docs.blockly.com/guides/contribute/get-started/write_a_good_issue/)
