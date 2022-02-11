/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Finishes loading Blockly and exports it as this
 *     module's default export.
 *
 *     It is exported as the default export to avoid having to
 *     re-export each property on Blockly individually, because you
 *     can't do:
 *
 *         export * from <dynamically computed source>;  // SYNTAX ERROR
 */

// We don't
//
//   import * as goog from '../../closure/goog/goog.js';
//
// here as that will fail if we're in compiled mode and prepare.js did
// not load base.js.  Just access goog directly from the global scope;
// this is fine because this file is never run through Closure
// Compiler, and only it cares about using the goog.js module instead
// of the goog global.

let Blockly;

if ('goog' in globalThis) {
  // Uncompiled mode.  Use top-level await
  // (https://v8.dev/features/top-level-await) to block loading of
  // this module until goog.bootstrap()ping of Blockly is finished.
  await new Promise((resolve, reject) => {
    goog.bootstrap(
        ['Blockly', 'Blockly.blocks.all', 'Blockly.JavaScript.all'], () => {
          Blockly = goog.module.get('Blockly');
          resolve();
        });
  });
} else {
  // Compiled mode.  Retrieve the pre-installed Blockly global.
  if (!('Blockly' in globalThis)) {
    throw new Error('blockly_compressed.js not loaded');
  }
  Blockly = globalThis.Blockly;
}

export default Blockly;
