# blockly.d.ts

This ``blockly.d.ts`` file describes the TypeScript type definitions for Blockly.
If you consume Blockly through ``npm``, this file is already included in the ``npm`` package.
Otherwise, you can include a copy of this file with your sources and reference it through a [Triple-Slash directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html).


## Generating a new version

To generate a new version of the Typings file, from the Blockly root directory run ``npm run typings``.
You will need to run ``npm install`` for this to work.

Note: In order to check for errors in the typings file, run ``tsc`` in the ``typings/`` directory.
