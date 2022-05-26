/**
 * @license
 * Copyright 2022 Google LLC
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
 *
 *     You must use a <script> tag to load prepare.js first, before
 *     importing this module in a <script type=module> to obtain the
 *     loaded value.
 *
 *     See tests/playground.html for example usage.
 */

let Blockly;

if (window.BlocklyLoader) {
  // Uncompiled mode.  Use top-level await
  // (https://v8.dev/features/top-level-await) to block loading of
  // this module until goog.bootstrap()ping of Blockly is finished.
  await window.BlocklyLoader;
  Blockly = globalThis.Blockly;
} else if (window.Blockly) {
  // Compiled mode.  Retrieve the pre-installed Blockly global.
  Blockly = globalThis.Blockly;
} else {
  throw new Error('neither window.Blockly nor window.BlocklyLoader found');
}

export default Blockly;
