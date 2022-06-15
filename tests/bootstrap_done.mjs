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
if (!window.bootstrapInfo) {
  throw new Error('window.bootstrapInfo not found.  ' +
      'Make sure to load bootstrap.js before importing bootstrap_done.mjs.');
}

if (window.bootstrapInfo.compressed) {
  // Compiled mode.  Nothing more to do.
} else {
  // Uncompressed mode.  Use top-level await
  // (https://v8.dev/features/top-level-await) to block loading of
  // this module until goog.bootstrap()ping of Blockly is finished.
  await window.bootstrapInfo.done;
  // Note that this module previously did an export default of the
  // value returned by the bootstrapInfo.done promise.  This was
  // changed in PR #5995 because library blocks and generators cannot
  // be accessed via that the core/blockly.js exports object.
}
