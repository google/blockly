/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * @fileoverview Block rendering debugging functionality.
 */
'use strict';

goog.module('Blockly.blockRendering.debug');


/**
 * Whether or not the debugger is turned on.
 * @type {boolean}
 */
let useDebugger = false;
/**
 * Returns whether the debugger is turned on.
 * @return {boolean} Whether the debugger is turned on.
 */
const isDebuggerEnabled = function() {
  return useDebugger;
};
/** @package */
exports.isDebuggerEnabled = isDebuggerEnabled;

/**
 * Turn on the blocks debugger.
 * @package
 */
const startDebugger = function() {
  useDebugger = true;
};
/** @package */
exports.startDebugger = startDebugger;

/**
 * Turn off the blocks debugger.
 * @package
 */
const stopDebugger = function() {
  useDebugger = false;
};
/** @package */
exports.stopDebugger = stopDebugger;
